'use client'

import Image from "next/image"
import { useWallet } from "@/services/walletContext"
import { doLogin, isRegistered } from "@/services/Web3Services"
import { useState, useEffect } from "react"
import AnimatedBackground from "@/components/AnimatedBackground"
import RegisterModal from "@/components/RegisterModal"
import { FaFilePdf } from "react-icons/fa"
import { Loader2, Zap, LogIn, CheckCircle } from "lucide-react" // Novos ícones
import { motion } from "framer-motion";

export default function Home() {
    const { address, setAddress } = useWallet()
    const [loading, setLoading] = useState(false)
    const [isRegisteredUser, setIsRegisteredUser] = useState<boolean | null>(null)

    // Efeitos de Cores Neon
    const neonPurpleButton = "bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(216,60,255,0.4)]";
    const neonGreenButton = "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,120,0.4)]";
    const disabledStyle = "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none";

    // Quando conectar a wallet → checar registro
    useEffect(() => {
        if (address) {
            isRegistered(address).then((result) => {
                setIsRegisteredUser(result)
            })
        }
    }, [address])

    const handleLogin = async () => {
        try {
            setLoading(true)
            const newAddress = await doLogin()
            setAddress(newAddress)
            const registered = await isRegistered(newAddress)
            setIsRegisteredUser(registered)
        } catch (err) {
            console.error("Login failed:", err)
        } finally {
            setLoading(false)
        }
    }

    const canAccessGame = address && isRegisteredUser === true

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center p-4">

            {/* FUNDO ANIMADO */}
            <AnimatedBackground />

            {/* RegisterModal só aparece se endereço conectado + usuário NÃO registrado */}
            {address && isRegisteredUser === false && <RegisterModal />}

            {/* Conteúdo principal - Envolto em um painel futurista */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 p-8 sm:p-12 max-w-lg w-full bg-gray-900/60 
                           rounded-3xl border-2 border-fuchsia-700/50 backdrop-blur-md 
                           shadow-[0_0_50px_rgba(216,60,255,0.2)] flex flex-col items-center text-center"
            >

                {/* LOGO */}
                <div className="mb-6">
                    <Image
                        src="/Global-Pool.svg"
                        width={120}
                        height={120}
                        alt="GlobalPool Logo"
                        className="drop-shadow-[0_0_25px_#d83cff]"
                    />
                </div>


                <p className="mt-4 max-w-[400px] text-gray-300 text-lg">
                    Connect your wallet to enter the system and manage your liquidity positions.
                </p>

                {/* STATUS BAR */}
                <div className="mt-8 w-full p-3 bg-gray-800/70 rounded-lg border border-fuchsia-800/50">
                    {address ? (
                        <>
                            <p className="text-sm text-gray-400">Wallet Connected:</p>
                            <p className="text-fuchsia-400 font-mono text-md break-words">
                                {address.slice(0, 10)}...{address.slice(-6)}
                            </p>
                        </>
                    ) : (
                        <p className="text-yellow-400 font-semibold flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" /> Awaiting Connection...
                        </p>
                    )}
                </div>


                {/* ACTION BUTTON */}
                <div className="mt-8 w-full">
                    {!address ? (
                        <motion.button
                            onClick={handleLogin}
                            disabled={loading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full py-4 text-white font-bold text-xl rounded-xl transition-all ${loading ? disabledStyle : neonPurpleButton}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6 inline mr-2" /> : <><LogIn className="w-5 h-5 inline mr-2" /> Connect Wallet</>}
                        </motion.button>
                    ) : isRegisteredUser === null ? (
                        <button className={`w-full py-4 text-white font-bold text-xl rounded-xl transition-all ${disabledStyle}`}>
                            <Loader2 className="animate-spin w-6 h-6 inline mr-2" /> Checking Registration...
                        </button>
                    ) : canAccessGame ? (
                        <a
                            href="/poolGame"
                            className={`flex items-center justify-center w-full py-4 text-black font-bold text-xl rounded-xl transition-all ${neonGreenButton}`}
                        >
                            <CheckCircle className="w-6 h-6 inline mr-3" /> Enter GlobalPool
                        </a>
                    ) : (
                        <button className={`w-full py-4 text-white font-bold text-xl rounded-xl transition-all ${disabledStyle}`}>
                            Complete the Registration
                        </button>
                    )}
                </div>

                
                {/* SEÇÃO DE DOWNLOADS DOS PDFs */}
                
                <div className="mt-10 pt-6 border-t border-gray-700/50 w-full">
                    <h3 className="text-lg font-extrabold text-fuchsia-400 uppercase tracking-widest mb-4">
                        Presentations
                    </h3>
                    <div className="flex flex-col space-y-3 w-full mb-[50px]">
                        
                        <a
                            href="/Global Pool English.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                English (EN)
                            </span>
                            <FaFilePdf className="text-yellow-400 text-2xl drop-shadow-[0_0_5px_#ffeb3b]" />
                        </a>

                         <a
                            href="/Global Pool Hindi.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-green-700 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                 Hindi (HI)
                            </span>
                            <FaFilePdf className="text-green-700 text-2xl drop-shadow-[0_0_5px_#047857]" />
                        </a>

                         <a
                            href="/Global Pool Malayalam.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-white hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                 Malayalam (MY)
                            </span>
                            <FaFilePdf className="text-white text-2xl drop-shadow-[0_0_5px_#ffffff]" />
                        </a>

                         <a
                            href="/Global Pool Chinese.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-orange-700 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                 Chinese (ZH)
                            </span>
                            <FaFilePdf className="text-orange-700 text-2xl drop-shadow-[0_0_5px_#ea580c]" />
                        </a>


                        <a
                            href="/Global Pool Portuguese.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-fuchsia-400 hover:shadow-[0_0_15px_rgba(216,60,255,0.4)]"
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                Portuguese (PT)
                            </span>
                            <FaFilePdf className="text-fuchsia-400 text-2xl drop-shadow-[0_0_5px_#d83cff]" />
                        </a>

                        <a
                            href="/Global Pool Polish.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-red-400 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                Polish (PL)
                            </span>
                            <FaFilePdf className="text-red-400 text-2xl drop-shadow-[0_0_5px_#ff3b3b]" />
                        </a>

                        <a
                            href="/Global Pool Russian.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-blue-400 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                 Russian (RU)
                            </span>
                            <FaFilePdf className="text-blue-400 text-2xl drop-shadow-[0_0_5px_#3b82f6]" />
                        </a>

                         <a
                            href="/Global Pool  Spanish.pdf"
                            download
                            className="flex items-center justify-between p-4 bg-gray-800/70 rounded-xl cursor-pointer
                                       transition-all duration-300 border border-gray-700/50
                                       hover:border-green-400 hover:shadow-[0_0_15px_rgba(0,255,120,0.4)]" 
                        >
                            <span className="text-lg font-semibold text-gray-100">
                                Spanish (ES)
                            </span>
                            <FaFilePdf className="text-green-400 text-2xl drop-shadow-[0_0_5px_#00ff75]" />
                        </a>

                    </div>
                    
                </div>
               
            </motion.div>
        </div>
    )
}