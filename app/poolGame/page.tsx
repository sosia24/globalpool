"use client"; 

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBarChart2 } from 'react-icons/fi';
import { EligibilityTable } from "@/components/EligibilityTable";
import {
    getUserTickIds,
    getTickDatas,
    buyMpoolCash,
    approveUSDTCash,
    getActualPoints,
    claimMPoolCash,
    reinvestMPoolCash,
    hasPositionClaimed,
    fetchSponsor,
        fetchUserTable,
} from "@/services/Web3Services";
import { useWallet } from "@/services/walletContext";
const contractAddress = process.env.NEXT_PUBLIC_MPOOLCASH_ADDRESS || ""; 
import AnimatedBackground from "@/components/AnimatedBackground"; // Mantido
import { ExternalLink, Loader2, DollarSign, Zap, TrendingUp, Users, ShoppingCart, Rocket, Star, Hash, ArrowRight, RefreshCcw, HandCoins } from "lucide-react"; // Ícones atualizados
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageManager";
import Decimal from "decimal.js";
import Image from "next/image";
import ReferralTree from "@/components/networkModal";
Decimal.set({ precision: 10 });

// === FUNÇÕES AUXILIARES (Mantidas) ===
function tickToPrice(tick: number): Decimal {
    const base = new Decimal(1.0001);
    return base.pow(tick);
}

// === TIPOS (Interfaces) ===
type ModalState = {
    isOpen: boolean;
    step: "approve" | "buy" | "success" | "error";
    status: "idle" | "pending" | "success" | "error";
    message: string;
};

interface TickData {
    currentTick: number;
    upperTick: number;
    startTick: number;
}

interface UserPosition {
    id: number;
    data: TickData | null;
    amountInvested: number;
    unrealizedProfit: number;
    currentValue: number;
}

interface PoolMetrics {
    totalValueLocked: number;
    dailyVolumeUSD: number;
    apy: number;
}

interface Table {
    isEligible: boolean[];
    directsRequirement: number[];
    valueInvestedRequirement: bigint[]; 
}

interface UserTable {
    table: Table;
    directsQuantity: number;
    valueInvested: bigint;
}
// === COMPONENTE PRINCIPAL ===

export default function App() {
    const shareValue = 10;
    const { address, setAddress } = useWallet();
    const { t } = useLanguage();
            const ARRAY_15_BOOLEAN = Array(15).fill(false);
        const ARRAY_15_NUMBER = Array(15).fill(0);
        const ARRAY_15_BIGINT = Array(15).fill(0n);
    const router = useRouter();
      const referralLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/?ref=${address}`;
    const [copied, setCopied] = useState(false);
    const [sharesBought, setSharesBought] = useState(0);
    const [inputQuantity, setInputQuantity] = useState(1);
    const [inputValue, setInputValue] = useState(String(1));
    const [loading, setLoading] = useState(false);
    const [loadingClaim, setLoadingClaim] = useState(false);
    const [loadingReinvest, setLoadingReinvest] = useState(false);
    const [message, setMessage] = useState("");

    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        step: "approve",
        status: "idle",
        message: "",
    });
const [sponsor, setSponsor] = useState<string | null>(null);
    const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
    const [isPositionsLoading, setIsPositionsLoading] = useState(true);
    const [positionsClaimedMap, setPositionsClaimedMap] = useState<{
        [id: number]: boolean;
    }>({});

    const [userTable, setUserTable] = useState<UserTable>({
        // Dados do Usuário (inicia com zero)
        directsQuantity: 0,
        valueInvested: 0n, // Inicializa como BigInt

        // Estrutura Table (inicia com arrays vazios/padrão de 15)
        table: {
            isEligible: ARRAY_15_BOOLEAN,
            directsRequirement: ARRAY_15_NUMBER,
            valueInvestedRequirement: ARRAY_15_BIGINT, 
        }
    });

    
    // Estado para as métricas da Pool
    const [poolMetrics, setPoolMetrics] = useState<PoolMetrics>({
        totalValueLocked: 0,
        dailyVolumeUSD: 0, 
        apy: 0, 
    });

        async function getUserSponsor(){
        try{
            if(address){
                const result = await fetchSponsor(address);
                setSponsor(result)
                }
        }catch(error){
            console.error("Failed to fetch sponsor:", error);   
        }
    }
    // --- Funções de Busca Web3 (useCallback) ---

    useEffect(() => {
        if (!address) return;

        const loadData = async () => {
            try {
                const data = await fetchUserTable(address);
                // 2. Atualiza o estado com os dados recebidos do contrato
                setUserTable({
                    // Assumindo que fetchEligibilityData já retorna no formato { table: { isEligible: [...], ... }, directsQuantity, valueInvested }
                    ...data 
                });
            } catch (error) {
                console.error("Falha ao carregar dados:", error);
            } finally {
                console.log("finis")
            }
        };

        loadData();
    }, [address]);


    const fetchPoolData = useCallback(async () => {
        try {
            const newShares = (await getActualPoints()); 
            setPoolMetrics(prevMetrics => ({
                ...prevMetrics,
                totalValueLocked : newShares,
            }))
            setSharesBought(newShares/10);
            

        } catch (error) {
            console.error("Failed to fetch pool data:", error);
        }
    }, []);

    const switchAccount = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }],
                });

                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                
                setAddress(accounts[0]);
                fetchPoolData();
                if (accounts[0]) fetchUserPositions(accounts[0]);

            } catch (error) {
                console.error("Erro ao trocar de conta:", error);
            }
        }
    };

    const fetchUserPositions = useCallback(async (address: string) => {
        if (!address) return;
        setIsPositionsLoading(true);
        try {
            const ids = await getUserTickIds(address);

            const positionPromises = ids.map(async (id) => {
                const data = await getTickDatas(id);
                return {
                    id,
                    data,
                } as UserPosition;
            });

            const results = await Promise.allSettled(positionPromises);

            const positions = results
                .filter((result) => result.status === "fulfilled")
                .map((result) => (result as PromiseFulfilledResult<UserPosition>).value)
                .reverse();

            setUserPositions(positions);
        } catch (err) {
            console.error("Failed to load your positions.", err);
        } finally {
            setIsPositionsLoading(false);
        }
    }, []);

    // --- Efeitos (Autoplay, Busca de Dados, Claims) ---

    useEffect(() => {
        fetchPoolData();
        if (address) fetchUserPositions(address);

        const interval = setInterval(() => {
            fetchPoolData();
            if (address) fetchUserPositions(address);
        }, 15000);

        return () => clearInterval(interval);
    }, [address, fetchPoolData, fetchUserPositions]);
    
    useEffect(() => {
        if (!userPositions || userPositions.length === 0) return;

        const fetchClaims = async () => {
            const newMap: { [id: number]: boolean } = {};
            
            for (const pos of userPositions) {
                try {
                    const claimed = await hasPositionClaimed(pos.id);
                    newMap[pos.id] = claimed;
                } catch (err) {
                    console.error(`Erro ao verificar claim para ID ${pos.id}:`, err);
                    newMap[pos.id] = false;
                }
            }
            setPositionsClaimedMap(newMap);
        };

        fetchClaims();
    }, [userPositions]);

          const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // volta para "Copy" após 2 segundos
  };

    // --- Funções de Ação (Aprovar/Comprar) ---

    const handleApprove = async () => {
        const valueToApprove = inputQuantity * shareValue;
        setLoading(true);
        
        setModal({
            isOpen: true,
            step: "approve",
            status: "pending",
            message: `Waiting for transaction approval for ${valueToApprove} USDT in your wallet...`,
        });

        try {
            const tx = await approveUSDTCash(valueToApprove);
            await tx.wait(); 
            setModal({
                isOpen: true,
                step: "approve",
                status: "success",
                message: `USDT approved successfully (${valueToApprove} USDT). You can proceed with the purchase.`,
            });
        } catch (err) {
            console.error("Error approving USDT:", err);
            setModal({
                isOpen: true,
                step: "approve",
                status: "error",
                message: "Failed to approve USDT. Check console or try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async () => {
        setLoading(true);
        
        setModal((prev) => ({
            ...prev,
            step: "buy",
            status: "pending",
            message: "Processing your purchase...",
        }));
        try {
            const tx = await buyMpoolCash(inputQuantity);
            await tx.wait();

            await fetchPoolData();
            if (address) await fetchUserPositions(address);

            setModal({
                isOpen: true,
                step: "success",
                status: "success",
                message: "Purchase confirmed! Position added successfully.",
            });
        } catch (err) {
            console.error("Error during purchase:", err);
            setModal((prev) => ({
                ...prev,
                status: "error",
                message: "Error during purchase. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => setModal({ ...modal, isOpen: false });
    
    // --- Lógica de Renderização do Input ---
    
    const handleInputBlur = () => {
        let parsed = parseInt(inputValue || "0", 10);
        if (isNaN(parsed) || parsed < 1) parsed = 1;
        
        setInputQuantity(parsed);
        setInputValue(String(parsed));
    };
    
    // Estilos de Neon para botões
    const neonPurpleButton = "bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(216,60,255,0.4)]";
    const neonGreenButton = "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,120,0.4)]";
    const neonYellowButton = "bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.4)]";
    const neonCyanButton = "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(0,255,255,0.4)]";
    const disabledStyle = "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none";
    const totalCost = ((parseInt(inputValue || "0", 10) || 0) * shareValue).toFixed(2);

 const COINGECKO_URL = "https://www.coingecko.com/en/coins/mpool?utm_source=geckoterminal&utm_medium=referral&utm_campaign=badge&asset_platform_api_symbol=polygon-pos";
    // === COMPONENTE PRINCIPAL DO LAYOUT ===
    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans">
            {/* Animated background (particles) */}
            <div className="absolute inset-0 z-0">
                <AnimatedBackground />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
            </div>

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4 max-w-[1400px] mx-auto border-b border-gray-800/50">
                {/* LOGO E TÍTULO */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-2 bg-gradient-to-br from-fuchsia-600/40 to-green-600/40 flex items-center justify-center ring-2 ring-fuchsia-400/40 shadow-[0_0_20px_#d83cff]">
                        <Image src="/Global-Pool.svg" className="mt-[4px]" alt="logo" width={44} height={44} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-white">
                            GLOBAL<span className="text-purple-600">POOL</span>
                        </h1>
                        <p className="text-xs text-gray-400 hidden sm:block">THE FUTURE IS HERE</p>
                    </div>
                </div>

 {/* 📈 LINK PARA COINGECKO (NOVO) */}
            <a
                href={COINGECKO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 px-3 py-2 
                           bg-gray-800 rounded-lg border border-green-700/50 
                           text-green-400 font-semibold text-sm 
                           hover:bg-green-600 hover:text-black hover:border-green-600 
                           transition-all duration-300 shadow-md hover:shadow-green-500/30"
            >
                <FiBarChart2 className="w-4 h-4" />
                MPool (CoinGecko)
            </a>
            {/* Fim do Link CoinGecko */}
                {/* CONEXÃO / HOME */}
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/")} className="text-sm cursor-pointer text-gray-400 hover:text-fuchsia-400 transition-colors hidden sm:block">
                        Home
                    </button>
                    {address ? (
                        <div className="px-3 py-2 rounded-lg bg-gray-800/70 border border-fuchsia-700/30 transition-shadow hover:shadow-[0_0_10px_rgba(216,60,255,0.3)] cursor-pointer" onClick={switchAccount}>
                            <div className="text-xs text-gray-400 hidden sm:block">Connected as</div>
                            <div className="text-sm text-fuchsia-400 font-mono">
                                {address.slice(0, 4)}...{address.slice(-4)}
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { /* Lógica de Conexão */ }} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${neonPurpleButton}`}>
                            Connect Wallet
                        </button>
                    )}
                </div>
            </header>
            
            {/* Hero Section - Dashboard Overview & Buy Action */}
            <section className="relative z-10 py-12 sm:py-16 max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="bg-gray-900/50 border border-fuchsia-700/50 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(216,60,255,0.15)] flex flex-col lg:flex-row items-center justify-between gap-10">
                    
                    {/* Pool Metrics - Left Side */}
                    <div className="flex-1 w-full text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-fuchsia-400 leading-tight mb-4">
                            Deep Dive into <br className="hidden sm:inline"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-300">GlobalPool</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                            Explore the future of decentralized finance. Secure your position and earn rewards.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-5 bg-gray-800/70 rounded-xl border border-fuchsia-800/50 flex items-center justify-center sm:justify-start gap-4 shadow-inner">
                                <Users className="w-8 h-8 text-fuchsia-400" />
                                <div>
                                    <div className="text-sm text-gray-400">Total Value Locked</div>
                                    <div className="text-2xl font-bold text-yellow-300">${poolMetrics.totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                            <div className="p-5 bg-gray-800/70 rounded-xl border border-green-800/50 flex items-center justify-center sm:justify-start gap-4 shadow-inner">
                                <DollarSign className="w-8 h-8 text-green-400" />
                                <div>
                                    <div className="text-sm text-gray-400">Your Shares</div>
                                    <div className="text-2xl font-bold text-green-400">{sharesBought}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buy Action Card - Right Side */}
                    <div className="w-full lg:w-[400px] p-6 bg-gray-800/80 rounded-2xl border border-green-700/50 shadow-[0_0_30px_rgba(0,255,120,0.1)] flex-shrink-0">
                        <h3 className="text-xl font-bold text-green-400 mb-5 border-b border-gray-700/50 pb-3 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> Acquire Your Shares
                        </h3>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="quantity" className="text-sm text-gray-400 block mb-2">Shares Quantity (1 Share = ${shareValue}.00 USDT)</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={(e) => {
                                        const cleaned = e.target.value.replace(/[^\d]/g, "");
                                        setInputValue(cleaned);
                                    }}
                                    onBlur={handleInputBlur}
                                    min="1"
                                    className="w-full py-3 px-4 rounded-lg bg-black/60 border border-green-600/50 text-green-300 text-xl font-mono focus:ring-2 focus:ring-green-400 transition-all text-center"
                                />
                            </div>

                            <div className="text-center">
                                <p className="text-md text-gray-300 mb-4">
                                    Total Cost: <span className="text-yellow-300 font-bold text-2xl">${totalCost}</span> USDT
                                </p>
                                
                                <button
                                    onClick={handleApprove}
                                    disabled={loading || parseInt(inputValue || "0", 10) < 1 || !address}
                                    className={`w-full py-4 rounded-lg font-extrabold text-lg transition-all duration-300 ${loading || parseInt(inputValue || "0", 10) < 1 || !address ? disabledStyle : neonGreenButton}`}
                                >
                                    {address ? (loading ? <Loader2 className="animate-spin w-5 h-5 inline mr-2" /> : "Approve & Buy Shares") : "Connect Wallet"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content - Your Positions */}
            <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
                
                <div className="p-6 rounded-3xl bg-gray-900/50 border border-fuchsia-700/50 shadow-[0_0_60px_rgba(216,60,255,0.15)]">
                    
                    <div className="flex items-center justify-between mb-8 border-b border-fuchsia-700/50 pb-4">
                        <h2 className="text-3xl font-extrabold text-fuchsia-400 flex items-center gap-3">
                            <Rocket className="w-7 h-7 text-purple-400"/> Your Active Positions ({userPositions.length})
                        </h2>
                        <a href={`https://revert.finance/#/account/${contractAddress}`} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1">
                            View All on Explorer <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {isPositionsLoading ? (
                        <div className="text-gray-400 flex items-center gap-3 justify-center h-48">
                            <Loader2 className="animate-spin w-8 h-8 text-fuchsia-400" /> Loading your positions from the blockchain...
                        </div>
                    ) : userPositions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"> {/* Layout de grade ajustado */}
                            {userPositions.map((position) => {
                                const isDisabled = positionsClaimedMap[position.id] === true;

                                let progressPercentage = 0;
                                if (position.data) {
                                    const start = position.data.startTick;
                                    const current = position.data.currentTick;
                                    const upper = position.data.upperTick;

                                    if (upper === start) {
                                        progressPercentage = current >= upper ? 100 : 0;
                                    } else {
                                        const raw = ((current - start) / (upper - start)) * 100;
                                        progressPercentage = Math.max(0, Math.min(100, raw));
                                    }
                                }
                                
                                const isReadyForAction = position.data && position.data.currentTick >= position.data.upperTick;

                                const startPrice = position.data ? tickToPrice(position.data.startTick).mul(new Decimal(10).pow(12)).toFixed(6) : "N/A";
                                const targetPrice = position.data ? tickToPrice(position.data.upperTick).mul(new Decimal(10).pow(12)).toFixed(6) : "N/A";
                                
                                return (
                                    <div key={position.id} className="p-6 rounded-xl bg-gray-800/60 border border-fuchsia-900/50 hover:border-fuchsia-700/70 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(216,60,255,0.1)]">
                                        
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/40">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-5 h-5 text-fuchsia-400"/>
                                                <div className="text-xl font-bold text-fuchsia-300">ID {position.id}</div>
                                            </div>
                                            <a href={`https://app.uniswap.org/positions/v3/polygon/${position.id}`} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                                                Uniswap <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>

                                        {position.data ? (
                                            <>
                                                <div className="text-xs text-gray-500 my-3 font-mono grid grid-cols-2 gap-2">
                                                    <div>START: <span className="text-green-300 font-semibold">{startPrice}</span></div>
                                                    <div className="text-right">TARGET: <span className="text-yellow-300 font-semibold">{targetPrice}</span></div>
                                                </div>

                                                <div className="mb-4">
                                                    {/* Barra de Progresso com estilo mais integrado */}
                                                    <div className="w-full bg-black/50 rounded-full h-2">
                                                        <div 
                                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" 
                                                            style={{ width: `${progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-400 mt-1">{progressPercentage.toFixed(2)}% Achieved</div>
                                                </div>
                                                
                                                {isReadyForAction && (
                                                    <div className={`mt-5 p-4 rounded-lg border ${isDisabled ? "bg-gray-700 border-gray-600" : "bg-green-900/40 border-green-700/50 shadow-[0_0_15px_rgba(0,255,120,0.1)]"}`}>
                                                        <p className={`text-base font-semibold mb-3 ${isDisabled ? "text-gray-400" : "text-green-300"}`}>
                                                            {isDisabled ? "Rewards Already Claimed." : "Position Ready for Action!"}
                                                        </p>
                                                        
                                                        <div className="flex flex-wrap justify-center gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                                                                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                                                onClick={async () => {
                                                                    setLoadingClaim(true);
                                                                    setMessage("");
                                                                    try {
                                                                        const tx = await claimMPoolCash(position.id);
                                                                        setMessage("✅ Reward claimed successfully! Waiting for TX confirmation...");
                                                                        await tx.wait();
                                                                        setMessage("✅ Reward claimed successfully!");
                                                                        if(address) await fetchUserPositions(address);
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                        setMessage("❌ Error claiming reward. See console.");
                                                                    } finally {
                                                                        setLoadingClaim(false);
                                                                    }
                                                                }}
                                                                disabled={loadingClaim || loadingReinvest || isDisabled}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-black transition-all ${loadingClaim || loadingReinvest || isDisabled ? disabledStyle : neonYellowButton}`}
                                                            >
                                                                {loadingClaim ? <Loader2 className="animate-spin w-4 h-4" /> : <HandCoins className="w-4 h-4"/>} Claim
                                                            </motion.button>

                                                            <motion.button
                                                                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                                                                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                                                onClick={async () => {
                                                                    setLoadingReinvest(true);
                                                                    setMessage("");
                                                                    try {
                                                                        const tx = await reinvestMPoolCash(position.id);
                                                                        setMessage("🔁 Reinvestment initiated! Waiting for TX confirmation...");
                                                                        await tx.wait();
                                                                        setMessage("🔁 Reinvestment completed successfully!");
                                                                        if(address) await fetchUserPositions(address);
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                        setMessage("❌ Error reinvesting. See console.");
                                                                    } finally {
                                                                        setLoadingReinvest(false);
                                                                    }
                                                                }}
                                                                disabled={loadingClaim || loadingReinvest || isDisabled}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${loadingClaim || loadingReinvest || isDisabled ? disabledStyle : neonCyanButton}`}
                                                            >
                                                                {loadingReinvest ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCcw className="w-4 h-4"/>} Reinvest
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                )}
                                                {message && (
                                                    <div className="mt-4 text-sm text-green-300 font-mono break-words p-3 bg-gray-800 rounded-lg border border-green-700/50">
                                                        {message}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 mt-2">Tick data not available. Position might be closed or invalid.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-6 text-center text-lg h-48 flex items-center justify-center">You have no active positions. Buy shares in the section above to get started!</p>
                    )}
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {modal.isOpen && (
                    <motion.div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="relative bg-gray-900 border border-fuchsia-700/50 rounded-xl p-8 w-full max-w-md text-center shadow-[0_0_40px_rgba(216,60,255,0.4)]" initial={{ scale: 0.8, rotateX: 90 }} animate={{ scale: 1, rotateX: 0 }} exit={{ scale: 0.8, rotateX: 90 }} transition={{ type: "spring", damping: 15, stiffness: 100 }}>
                            {/* Close button */}
                            <button onClick={closeModal} aria-label="Close modal" className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-fuchsia-400 cursor-pointer transition-colors">
                                ✕
                            </button>
                            <h3 className={`text-3xl font-extrabold mb-4 ${modal.status === "error" ? "text-red-500" : "text-fuchsia-400"}`}>
                                {modal.status === "pending" ? "Processing..." : modal.status === "success" ? "TRANSACTION SUCCESS" : "ERROR"}
                            </h3>
                            <p className="text-gray-300 mb-8 text-md">{modal.message}</p>

                            {modal.status === "success" && modal.step === "approve" && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleBuy}
                                    disabled={loading || inputQuantity < 1}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${loading || inputQuantity < 1 ? disabledStyle : neonGreenButton}`}
                                >
                                    BUY {inputQuantity} SHARE(S)
                                </motion.button>
                            )}

                            {modal.status === "success" && (modal.step === "success" || modal.step === "buy") && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal} className={`w-full py-3 rounded-lg font-bold transition-all ${neonPurpleButton}`}>
                                    DONE
                                </motion.button>
                            )}

                            {modal.status === "error" && (
                                <button onClick={closeModal} className="w-full py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-500 transition cursor-pointer">
                                    CLOSE
                                </button>
                            )}
                        </motion.div>
                    </motion.div>

                )}
        <div className="p-4 relative z-200">
            {/* 3. Renderiza o componente da tabela */}
            <EligibilityTable userData={userTable} />
        </div>

<div 
    // Fundo escuro com leve transparência e borda roxa neon
    className="bg-black/40 relative z-20 border-2 max-w-[600px] mt-[100px] m-auto border-purple-700 text-gray-100 rounded-xl p-4 mb-6
               shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 hover:border-purple-400"
>
    <h2 className="text-xl font-extrabold mb-4 text-purple-400 text-center uppercase tracking-wider drop-shadow-[0_0_5px_#a855f7]">
        🔗 Your Referral Link
    </h2>

    <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-purple-300 uppercase tracking-wide">
            👤 Your Sponsor
        </h3>
        <div className="flex items-center bg-gray-900 px-2 py-2 rounded-lg border border-gray-700">
            
            {/* Campo de input para o Sponsor */}
            <input
                type="text"
                readOnly
                value={sponsor ? sponsor.slice(0,6)+"..."+sponsor.slice(-4) : "No sponsor assigned"}
                className="bg-transparent text-white text-[12px] font-mono w-full focus:outline-none"
            />
        </div>
    </div>

    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
        
        {/* Campo de input para o link */}
        <input
            type="text"
            readOnly
            value={referralLink}
            className="bg-transparent text-purple-300 text-base font-mono truncate w-full sm:w-[50%] focus:outline-none"
        />

        {/* Botão de Copy com gradiente roxo */}
        <button
            onClick={handleCopy}
            className={`
                ${copied 
                    ? "bg-purple-600 hover:bg-purple-700 shadow-none" // Copiado
                    : "bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-600 shadow-[0_0_10px_#a855f7]" // Normal
                } 
                text-black cursor-pointer font-bold px-4 py-2 rounded-lg transition duration-200 text-sm sm:text-base w-full sm:w-auto
            `}
        >
            {copied ? "✅ Copied!" : "Copy Link"}
        </button>
    </div>
</div>

                        <div className="w-full m-auto max-w-[1200px] mt-[100px] border mb-[100px] relative z-200 
                            bg-gray-900 border-purple-600 rounded-2xl 
                            shadow-2xl shadow-purple-900/50 p-4 sm:p-8">
                            
    <h1 className="text-3xl font-extrabold text-purple-400 mb-6 text-center 
        tracking-wider border-b border-purple-700/50 pb-2">
        Network Status
    </h1>

    {address ? <ReferralTree address={address} /> : (
        <p className="text-center text-gray-500">
            {t.networkEarningsPage.connectWalletPrompt}
        </p>
    )}
</div>

            </AnimatePresence>
        </div>
    );
}