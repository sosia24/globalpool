import { ethers, toNumber } from "ethers";
import usdtAbi from "./abis/usdt.abi.json";
import mpoolAbi from "./abis/mpool.abi.json";
import feecollectorAbi from "./abis/feecollector.abi.json";
import adminsAbi from "./abis/adminspool.abi.json";
import devpoolAbi from "./abis/devpool.abi.json";
import marketingAbi from "./abis/marketing.abi.json";
import routerAbi from "./abis/router.abi.json";
import airdropAbi from "./abis/airdrop.abi.json";
import { BigNumberish } from "ethers";
import mpoolcashAbi from "./abis/mpoolcash.abi.json";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS;
const MPOOL_ADDRESS = process.env.NEXT_PUBLIC_MPOOL_ADDRESS;
const FEECOLLECTOR_ADDRESS = process.env.NEXT_PUBLIC_FEECOLLECTOR_ADDRESS;
const ADMINS_ADDRESS = process.env.NEXT_PUBLIC_ADMINSPOOL_ADDRESS;
const DEVS_ADDRESS = process.env.NEXT_PUBLIC_DEVPOOL_ADDRESS;
const MARKETING_ADDRESS = process.env.NEXT_PUBLIC_MARKETING_ADDRESS;
const AIRDROP_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_ADDRESS;
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS;

const RPC_PADRAO_EXTRATOS = "https://api.zan.top/polygon-mainnet";

const MPOOLCASH_ADDRESS = process.env.NEXT_PUBLIC_MPOOLCASH_ADDRESS;

/*------------ CONNECT WALLET --------------*/

function getProvider() {
  if (!window.ethereum) throw new Error("No MetaMask found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function doLogin() {
  try {
    const provider = await getProvider();
    const account = await provider.send("eth_requestAccounts", []);
    if (!account || !account.length)
      throw new Error("Wallet not found/allowed.");
    await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);
    return account[0];
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

/*------------ FUNÇÃO DE APPROVE USDT --------------*/

export async function allowance(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

export async function allowanceUsdc(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

export async function approve(value: number, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDT_ADDRESS || "", usdtAbi, signer);

  const tx = await usdt.approve(spender, ethers.parseUnits(String(value), 6));
  await tx.wait();

  return tx;
}

export async function approveUSDT(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDT_ADDRESS || "", usdtAbi, signer);

  const amount = ethers.parseUnits(String(value), 6); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTOR_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function approveMpool(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(MPOOL_ADDRESS || "", mpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTOR_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function approveToken(value: string | number, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(MPOOL_ADDRESS || "", mpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18);

  const tx = await usdt.approve(spender, amount);
  await tx.wait();

  return tx;
}

export async function allowanceToken(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(MPOOL_ADDRESS || "", mpoolAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

/*------------ FUNÇÃO DE BUY FEE COLLECTOR POSITION --------------*/

export async function buyFeeCollector(index: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    FEECOLLECTOR_ADDRESS || "",
    feecollectorAbi,
    signer
  );

  const tx = await fee.addFeeCollectorPosition(index);
  await tx.wait();

  return tx;
}

/*------------ GET POOL PRICES TOKEN --------------*/

export async function getPoolValuesPrice() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const pool1 = await contract.viewDepositQuantityToken(1);
    const pool2 = await contract.viewDepositQuantityToken(2);
    const pool5 = await contract.viewDepositQuantityToken(5);

    const formatted1 = ethers.formatUnits(pool1, 18);
    const formatted2 = ethers.formatUnits(pool2, 18);
    const formatted5 = ethers.formatUnits(pool5, 18);

    return [formatted1, formatted2, "0", "0", formatted5]; // ← retorna como array
  } catch (error) {
    console.error("Erro ao buscar valores das pools:", error);
    throw error;
  }
}

/*------------ GET POOL PRICES TOKEN --------------*/

export async function getActualSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const tx = await contract.actualSession();

    return tx;
  } catch (error) {
    console.error("Erro ao buscar sessao atual", error);
    throw error;
  }
}

/*------------ GET BALANCE DAS SESSION --------------*/

export async function getBalanceSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 6));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4, 5, 6].map((p) => contract.balancePerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.balancePerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET PEOPLE ON SESSION --------------*/

export async function getWalletsOnSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4, 5, 6].map((p) =>
          contract.totalQuantityPerSession(p, session)
        )
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.totalQuantityPerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET TIME SESSION --------------*/

export async function getTime() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const balance = await contract.viewTimeLeft();
    return Number(balance); // agora também retorna um array de number
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET CLAIMS USER --------------*/

export async function getClaimableSessionsFromFeeCollector(
  address: string,
  actualSession: number
) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      sessionId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 6; poolId++) {
      for (let sessionId = 1; sessionId < actualSession; sessionId++) {
        try {
          const value = await contract.valueToClaim(address, poolId, sessionId);
          const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
          if (valueNumber > 0) {
            claimableSessions.push({ poolId, sessionId, value: valueNumber });
          }
        } catch (err) {
          console.warn(
            `Erro ao verificar pool ${poolId}, sessão ${sessionId}:`,
            err
          );
          continue;
        }
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

/*------------ ADVANCE SESSION  --------------*/

export async function advanceSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const tx = await contract.advanceSession(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

/*------------ GET USER ON SESSION --------------*/

export async function getUserPositionsSession(
  address: string,
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4, 5, 6].map((p) =>
          contract.quantityUserPosition(address, p, session)
        )
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.quantityUserPosition(
        address,
        pool,
        session
      );
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET VALUE TO CLAIMS USER --------------*/

export async function getValueUserToClaim(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 6; poolId++) {
      try {
        const value = await contract.viewValueToClaim(address, poolId);
        if (value > 0) {
          const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
          claimableSessions.push({ poolId, value: valueNumber });
        }
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function getValueUserToReceive(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 6; poolId++) {
      try {
        const value = await contract.viewValueReceived(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function getValueUserReceived(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 6; poolId++) {
      try {
        const value = await contract.lastValueRemainingToClaim(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

/*------------ CLAIM POOL  --------------*/

export async function claimPool(index: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    const tx = await contract.claimSession(index); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

/*------------ VERIFY IS RECIPIENT  --------------*/

export async function isReceipientAdmins(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      ADMINS_ADDRESS || "",
      adminsAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function adminsBalance(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      ADMINS_ADDRESS || "",
      adminsAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    // Garante que há pelo menos uma tupla no array
    if (response.length === 0) return 0;

    const lastTuple = response[response.length - 1]; // pega a última tupla
    const amount = lastTuple[2]; // índice 2: valor

    return Number(amount) / 1e18; // ajusta casas decimais
  } catch (error) {
    console.error("Erro ao buscar saldo do admin:", error);
    throw error;
  }
}

export async function claimAdmins() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      ADMINS_ADDRESS || "",
      adminsAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

/*------------ VERIFY IS RECIPIENT DEVS --------------*/

export async function isReceipientDev(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      DEVS_ADDRESS || "",
      devpoolAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function devsBalance(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      DEVS_ADDRESS || "",
      devpoolAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    // Garante que há pelo menos uma tupla no array
    if (response.length === 0) return 0;

    const lastTuple = response[response.length - 1]; // pega a última tupla
    const amount = lastTuple[2]; // índice 2: valor

    return Number(amount) / 1e18; // ajusta casas decimais
  } catch (error) {
    console.error("Erro ao buscar saldo do admin:", error);
    throw error;
  }
}

export async function claimDevs() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      DEVS_ADDRESS || "",
      devpoolAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

/*------------ VERIFY IS RECIPIENT MKT --------------*/

export async function isReceipientMkt(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      MARKETING_ADDRESS || "",
      marketingAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function mktBalance(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      MARKETING_ADDRESS || "",
      marketingAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    // Garante que há pelo menos uma tupla no array
    if (response.length === 0) return 0;

    const lastTuple = response[response.length - 1]; // pega a última tupla
    const amount = lastTuple[2]; // índice 2: valor

    return Number(amount) / 1e18; // ajusta casas decimais
  } catch (error) {
    console.error("Erro ao buscar saldo do admin:", error);
    throw error;
  }
}

export async function claimMkt() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      MARKETING_ADDRESS || "",
      marketingAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

/*------------ VERIFY IF NEED CLAIM --------------*/

export async function verifyNeedClaim(
  address: string,
  pool: number
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTOR_ADDRESS || "",
      feecollectorAbi,
      signer
    );

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4, 5, 6].map((p) => contract.hasClaim(address, p))
      );
      return balancesRaw;
    } else {
      return [false, false, false, false, false, false];
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function viewWalletQuantity(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTER_ADDRESS || "",
      routerAbi,
      signer
    );

    const quantity = await contract.viewWalletQuantity(
      ethers.parseUnits(String(amount), 6)
    );
    return quantity;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function buyTokens(amount: number, wallets: string[]) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTER_ADDRESS || "",
      routerAbi,
      signer
    );

    const tx = await contract.buyTokens(
      ethers.parseUnits(String(amount), 6),
      wallets
    );
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function sellTokens(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTER_ADDRESS || "",
      routerAbi,
      signer
    );

    const tx = await contract.sellTokens(ethers.parseUnits(String(amount)));
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function feeQuantity(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTER_ADDRESS || "",
      routerAbi,
      signer
    );

    const fee = await contract.viewSellFee.staticCall(
      ethers.parseEther(String(amount))
    );
    return Number(fee);
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function getTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);
    const contract = new ethers.Contract(
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      usdtAbi,
      provider
    );
    const from = "0x34DD96C317DBE4a820420Fe3114B9A2f1ca6c48B";
    const to = owner;
    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    const result = events.map((event) => ({
      transactionHash: event.transactionHash,
      value: ethers.formatUnits(event.data, 6),
    }));

    return result;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

/* WBTC POOL FUNCTIONS */

import feecollectorwbtcAbi from "./abis/feecollectorwbtc.abi.json";
import wusdtAbi from "./abis/wusdt.abi.json";
import wbtcpoolAbi from "./abis/wbtcpool.abi.json";
import wbtcAbi from "./abis/wbtc.abi.json";
import linkcollectorAbi from "./abis/linkcollector.abi.json";
import wadminsAbi from "./abis/wadminspool.abi.json";
import wmarketingAbi from "./abis/wmarketing.abi.json";
import wdevsAbi from "./abis/wdevpool.abi.json";
import routerwbtcAbi from "./abis/routerwbtc.abi.json";

const FEECOLLECTORWBTC_ADDRESS =
  process.env.NEXT_PUBLIC_FEECOLLECTORWBTC_ADDRESS;
const WUSDT_ADDRESS = process.env.NEXT_PUBLIC_WUSDT_ADDRESS;
const WBTCPOOL_ADDRESS = process.env.NEXT_PUBLIC_WBTCPOOL_ADDRESS;
const WBTC_ADDRESS = process.env.NEXT_PUBLIC_WBTC_ADDRESS;
const LINKCOLLECTOR_ADDRESS = process.env.NEXT_PUBLIC_LINKCOLLECTOR_ADDRESS;
const WADMINS_ADDRESS = process.env.NEXT_PUBLIC_ADMINSPOOLWBTC_ADDRESS;
const WMARKETING_ADDRESS = process.env.NEXT_PUBLIC_MARKETINGWBTC_ADDRESS;
const WDEVSPOOL_ADDRESS = process.env.NEXT_PUBLIC_DEVPOOLWBTC_ADDRESS;
export const ROUTERWBTC_ADDRESS = process.env.NEXT_PUBLIC_ROUTERWBTC_ADDRESS;

/*------------ FUNÇÃO DE APPROVE USDT --------------*/

export async function wallowance(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WUSDT_ADDRESS || "", wusdtAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

export async function wapprove(value: number, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WUSDT_ADDRESS || "", wusdtAbi, signer);

  const tx = await usdt.approve(spender, ethers.parseUnits(String(value), 6));
  await tx.wait();

  return tx;
}

export async function wapproveUSDT(value: string | number, id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTC_ADDRESS || "", wbtcAbi, signer);

  if (id == 1) {
    const amount = ethers.parseUnits(String(value), 0);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORWBTC_ADDRESS, total);
    await tx.wait();

    return tx;
  } else {
    const amount = ethers.parseUnits(String(value), 8);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORWBTC_ADDRESS, total);
    await tx.wait();

    return tx;
  }
}

export async function wapproveMpool(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTCPOOL_ADDRESS || "", wbtcpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTORWBTC_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function wapproveToken(value: string | number, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTCPOOL_ADDRESS || "", wbtcpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18);

  const tx = await usdt.approve(spender, amount);
  await tx.wait();

  return tx;
}

export async function wallowanceToken(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTCPOOL_ADDRESS || "", wbtcpoolAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

/*------------ FUNÇÃO DE BUY FEE COLLECTOR POSITION --------------*/

export async function wbuyFeeCollector(index: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    FEECOLLECTORWBTC_ADDRESS || "",
    feecollectorwbtcAbi,
    signer
  );

  const tx = await fee.addFeeCollectorPosition(index);
  await tx.wait();

  return tx;
}

/*------------ GET POOL PRICES TOKEN --------------*/

export async function wgetPoolValuesPrice() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const pool1 = await contract.viewDepositQuantityToken(1);
    const pool2 = await contract.viewDepositQuantityToken(2);
    const pool3 = await contract.viewDepositQuantityToken(3);
    const pool4 = await contract.viewDepositQuantityToken(4);

    const formatted1 = ethers.formatUnits(pool1, 18);
    const formatted2 = ethers.formatUnits(pool2, 8);
    const formatted3 = ethers.formatUnits(pool3, 8);
    const formatted4 = ethers.formatUnits(pool4, 8);

    return [formatted1, formatted2, formatted3, formatted4]; // ← retorna como array
  } catch (error) {
    console.error("Erro ao buscar valores das pools:", error);
    throw error;
  }
}

/*------------ GET POOL PRICES TOKEN --------------*/

export async function wgetActualSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const tx = await contract.actualSession();

    return tx;
  } catch (error) {
    console.error("Erro ao buscar sessao atual", error);
    throw error;
  }
}

/*------------ GET BALANCE DAS SESSION --------------*/

export async function wgetBalanceSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 8));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4].map((p) => contract.balancePerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.balancePerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET PEOPLE ON SESSION --------------*/

export async function wgetWalletsOnSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4, 5, 6].map((p) =>
          contract.totalQuantityPerSession(p, session)
        )
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.totalQuantityPerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET TIME SESSION --------------*/

export async function wgetTime() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const balance = await contract.viewTimeLeft();
    return Number(balance); // agora também retorna um array de number
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET CLAIMS USER --------------*/

export async function wgetClaimableSessionsFromFeeCollector(
  address: string,
  actualSession: number
) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      sessionId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      for (let sessionId = 1; sessionId < actualSession; sessionId++) {
        try {
          const value = await contract.valueToClaim(address, poolId, sessionId);
          const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
          if (valueNumber > 0) {
            claimableSessions.push({ poolId, sessionId, value: valueNumber });
          }
        } catch (err) {
          console.warn(
            `Erro ao verificar pool ${poolId}, sessão ${sessionId}:`,
            err
          );
          continue;
        }
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

/*------------ ADVANCE SESSION  --------------*/

export async function wadvanceSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const tx = await contract.advanceSession(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

/*------------ GET USER ON SESSION --------------*/

export async function wgetUserPositionsSession(
  address: string,
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4].map((p) =>
          contract.quantityUserPosition(address, p, session)
        )
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.quantityUserPosition(
        address,
        pool,
        session
      );
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

/*------------ GET VALUE TO CLAIMS USER --------------*/

export async function wgetValueUserToClaim(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      try {
        const value = await contract.viewValueToClaim(address, poolId);
        if (value > 0) {
          console.log("claimable: ", claimableSessions);
          const valueNumber = Number(value) / 1e8; // reduz 6 casas decimais
          claimableSessions.push({ poolId, value: valueNumber });
        }
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wgetValueUserToReceive(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      try {
        const value = await contract.viewValueReceived(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wgetValueUserReceived(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 6; poolId++) {
      try {
        const value = await contract.lastValueRemainingToClaim(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

/*------------ CLAIM POOL  --------------*/

export async function wclaimPool(index: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const tx = await contract.claimSession(index); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function verifyHasFeeCollector(
  address: string
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const balancesRaw = await Promise.all(
      [2, 3, 4].map((p) => contract.hasFeeCollectorPosition(address, p))
    );

    return balancesRaw; // retorna array de numbers
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wgetTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);
    const contract = new ethers.Contract(
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      wbtcAbi,
      provider
    );
    const from = "0x9Af8e3Bc8312F568909aD4Ef4495126776eeeEb1";
    const to = owner;
    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    const result = events.map((event) => ({
      transactionHash: event.transactionHash,
      value: ethers.formatUnits(event.data, 8),
    }));

    return result;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

/*------------ VERIFY IS RECIPIENT  --------------*/

export async function wisReceipientAdmins(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      ADMINS_ADDRESS || "",
      adminsAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}
export type TokenBalance = {
  token: string; // endereço do token
  symbol: string; // nome/símbolo (vem da tupla)
  raw: string; // valor bruto em string (BigNumber.toString)
};

export async function wadminsBalance(address: string): Promise<TokenBalance[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WADMINS_ADDRESS || "",
      wadminsAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    if (!response || response.length === 0) return [];

    // response deve ser algo como:
    // [[tokenAddress, "USDT", BigInt], [tokenAddress, "USDC", BigInt], ...]
    const balances: TokenBalance[] = response.map(
      (tuple: [string, string, bigint]) => ({
        token: tuple[0], // endereço do token
        symbol: tuple[1], // ex: USDT, USDC
        raw: tuple[2].toString(), // valor em string
      })
    );

    return balances;
  } catch (error) {
    console.error("Erro ao buscar balances do admin:", error);
    throw error;
  }
}
export async function wclaimAdmins() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WADMINS_ADDRESS || "",
      wadminsAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

/*------------ VERIFY IS RECIPIENT MKT --------------*/

export async function wisReceipientMkt(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WMARKETING_ADDRESS || "",
      wmarketingAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function wmktBalance(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WMARKETING_ADDRESS || "",
      wmarketingAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    // Garante que há pelo menos uma tupla no array
    if (response.length === 0) return 0;

    const firstTuple = response[0];
    const lastField = firstTuple[firstTuple.length - 1];

    return Number(lastField) / 1e8;
  } catch (error) {
    console.error("Erro ao buscar saldo do admin:", error);
    throw error;
  }
}

export async function wclaimMkt() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WMARKETING_ADDRESS || "",
      wmarketingAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

/*------------ VERIFY IS RECIPIENT DEVS --------------*/

export async function wisReceipientDev(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WDEVSPOOL_ADDRESS || "",
      wdevsAbi,
      signer
    );

    const tx = await contract.isRecipient(address);

    return tx;
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function wdevsBalance(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WDEVSPOOL_ADDRESS || "",
      wdevsAbi,
      signer
    );

    const response = await contract.getUserBalance(address);

    if (response.length === 0) return 0;

    const firstTuple = response[0];
    const lastField = firstTuple[firstTuple.length - 1];

    return Number(lastField) / 1e8;
  } catch (error) {
    console.error("Erro ao buscar saldo do admin:", error);
    throw error;
  }
}

export async function wclaimDevs() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WDEVSPOOL_ADDRESS || "",
      wdevsAbi,
      signer
    );

    const tx = await contract.claim(); // Envia a transação
    const receipt = await tx.wait(); // Espera ser minerada

    return receipt; // Agora retorna o recibo
  } catch (error) {
    console.error("Erro ao realizar claim", error);
    throw error;
  }
}

export async function wverifyNeedClaim(
  address: string,
  pool: number
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2, 3, 4].map((p) => contract.hasClaim(address, p))
      );
      console.log(balancesRaw);
      return balancesRaw;
    } else {
      return [false, false, false, false];
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wgetValueUserTotal(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWBTC_ADDRESS || "",
      feecollectorwbtcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      try {
        const value = await contract.viewValueTotal(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function approveWbtcToken(
  value: string | number,
  spender: string
) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTCPOOL_ADDRESS || "", wbtcpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18);

  const tx = await usdt.approve(spender, amount);
  await tx.wait();

  return tx;
}

export async function allowanceWbtcToken(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WBTCPOOL_ADDRESS || "", wbtcpoolAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

export async function feeWbtcQuantity(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTERWBTC_ADDRESS || "",
      routerwbtcAbi,
      signer
    );

    const fee = await contract.viewSellFee.staticCall(
      ethers.parseEther(String(amount))
    );
    return Number(fee);
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function sellWbtcTokens(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTERWBTC_ADDRESS || "",
      routerwbtcAbi,
      signer
    );

    const tx = await contract.sellTokens(ethers.parseUnits(String(amount)));
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function approveUSDTSell(value: string | number, address: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDT_ADDRESS || "", usdtAbi, signer);

  const amount = ethers.parseUnits(String(value), 6); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(address, total);
  await tx.wait();

  return tx;
}

export async function approveUSDCSell(value: string | number, address: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  const amount = ethers.parseUnits(String(value), 0); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(address, total);
  await tx.wait();

  return tx;
}

export async function isRegistered(owner: string) {
  //const provider = new ethers.JsonRpcProvider(RPC_ADDRESS);
  const provider = await getProvider();

  const user = new ethers.Contract(
    MPOOLCASH_ADDRESS ? MPOOLCASH_ADDRESS : "",
    mpoolcashAbi,
    provider
  );

  const userData: any = await user.getUser(owner);

  return userData.registered;
}

export async function registerUser(newUser: string) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const user = new ethers.Contract(
    MPOOLCASH_ADDRESS ? MPOOLCASH_ADDRESS : "",
    mpoolcashAbi,
    signer
  );
  const feeData = await provider.getFeeData();
  if (!feeData.maxFeePerGas) {
    throw new Error("Unable to get gas price");
  }

  const maxFeePerGas = feeData.maxFeePerGas * 3n;

  const tx = await user.createUser(newUser);
  const receipet = await tx.wait();

  return receipet;
}

interface ReferralNode {
  address: string; // Use "string" (em minúsculas), não "String" (em maiúsculas).
  children: ReferralNode[]; // Um array de nós recursivos.
}

// Novo serviço para buscar os filhos de um nó individualmente
export async function fetchReferralNode(
  userAddress: string
): Promise<ReferralNode> {
  const referrals = await fetchReferrals(userAddress);
  return {
    address: userAddress,
    children: referrals.map((addr: string) => ({ address: addr })),
  };
}

export async function fetchReferralTree(
  userAddress: string,
  currentLevel = 0,
  maxLevel = 20
): Promise<[ReferralNode | null, number]> {
  // Interrompe a recursão se o nível máximo for atingido
  if (currentLevel >= maxLevel) return [null, 0];

  // Obtenha os referenciados diretos do contrato
  const referrals = await fetchReferrals(userAddress);

  // Crie o nó do usuário atual
  const node: ReferralNode = {
    address: userAddress,
    children: [],
  };

  // Inicialmente conta o próprio usuário
  let totalCount = 1;

  // Para cada referenciado, chame a função recursivamente
  for (const referral of referrals) {
    const [childNode, count] = await fetchReferralTree(
      referral,
      currentLevel + 1,
      maxLevel
    );
    if (childNode) {
      node.children.push(childNode);
      totalCount += count; // Soma os contadores dos filhos
    }
  }

  return [node, totalCount]; // Retorna o nó atual e a contagem total de referências na árvore
}

// Função auxiliar para buscar apenas as referências diretas
export async function fetchReferrals(userAddress: String) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const queue = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const [, , referral] = await queue.getUser(userAddress);
  return referral;
}

export async function fetchSponsor(userAddress: String) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const queue = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const [, referral] = await queue.getUser(userAddress);

  console.log("Referrals for", userAddress, ":", referral);
  return referral[0];
}

export async function getTimeToreactivation(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      LINKCOLLECTOR_ADDRESS || "",
      linkcollectorAbi,
      signer
    );

    const balance = await contract.timeToNextReactivation(address);
    return Number(balance);
  } catch (error) {
    console.warn("Usuário pode não ter sessão ativa, retornando 0.");
    return 0;
  }
}

export async function reactiveNetwork() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      LINKCOLLECTOR_ADDRESS || "",
      linkcollectorAbi,
      signer
    );

    const tx = await contract.reactive(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Error", error);
    return false;
  }
}

export async function approveUSDT2(value: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WUSDT_ADDRESS || "", wusdtAbi, signer);

  const tx = await usdt.approve(
    LINKCOLLECTOR_ADDRESS,
    ethers.parseUnits(String(value), 6)
  );
  await tx.wait();

  return tx;
}

export async function userEarned(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      LINKCOLLECTOR_ADDRESS || "",
      linkcollectorAbi,
      signer
    );

    const tx = await contract.userTotalEarned(address); // envia a transação

    return tx; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 100,
  delayMs = 2000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      console.warn(`Tentativa ${attempt} falhou:`, err);

      if (attempt >= maxRetries) {
        throw new Error(`Falhou após ${maxRetries} tentativas`);
      }

      // Espera antes de tentar de novo (exponencial opcional)
      await new Promise((res) => setTimeout(res, delayMs * attempt));
    }
  }
}

export async function wbtcgetTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  const from = "0x634352904C1b4F69DD93596BeAdF8a8b2c3A5A18";
  const to = owner;

  return retry(async () => {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);

    const contract = new ethers.Contract(
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      wbtcAbi,
      provider
    );

    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    return events
      .filter((event) => Number(event.data) !== 0)
      .map((event) => ({
        transactionHash: event.transactionHash,
        value: ethers.formatUnits(event.data, 8),
      }));
  });
}

export async function tokenApprove(
  tokenAddress: string,
  abi: any,
  value: number
) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const tokenContract = new ethers.Contract(tokenAddress, abi, signer);

  const tx = await tokenContract.approve(
    AIRDROP_ADDRESS,
    ethers.parseUnits(String(value), 18)
  );
  await tx.wait();

  return tx;
}

export async function tokenClaim(
  tokenAddress: string,
  tokenAbi: any,
  amount: number
) {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();

    const airdropContract = new ethers.Contract(
      AIRDROP_ADDRESS ? AIRDROP_ADDRESS : " ",
      airdropAbi,
      signer
    );

    console.log(
      "claim datas: ",
      tokenAddress,
      ethers.parseUnits(String(amount), 18),
      { value: ethers.parseEther("5") }
    );
    const tx = await airdropContract.claim(
      tokenAddress,
      ethers.parseUnits(String(amount), 18),
      { value: ethers.parseEther("5") }
    );

    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Erro ao executar claim:", error);
    throw error;
  }
}

import feecollectorwethAbi from "./abis/feecollectorweth.abi.json";
import linkcollectorwethAbi from "./abis/linkcollecctorweth.abi.json";
import usdcAbi from "./abis/usdc.abi.json";
import wethpoolAbi from "./abis/wethpool.abi.json";
import wethAbi from "./abis/weth.abi.json";
import routerwethAbi from "./abis/routerweth.abi.json";
import feecollectorusdcAbi from "./abis/feecollectorusdc.abi.json";

const FEECOLLECTORWETH_ADDRESS =
  process.env.NEXT_PUBLIC_FEECOLLECTORWETH_ADDRESS;
const LINKCOLLECTORWETH_ADDRESS =
  process.env.NEXT_PUBLIC_LINKCOLLECTORWETH_ADDRESS;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const WETHPOOL_ADDRESS = process.env.NEXT_PUBLIC_WETHPOOL_ADDRESS;
const FEECOLLECTORUSDC_ADDRESS =
  process.env.NEXT_PUBLIC_FEECOLLECTORUSDC_ADDRESS;
export const ROUTERWETH_ADDRESS = process.env.NEXT_PUBLIC_ROUTERWETH_ADDRESS;

export async function wethapproveUSDT(value: string | number, id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  if (id == 1) {
    const amount = ethers.parseUnits(String(value), 0);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORWETH_ADDRESS, total);
    await tx.wait();

    return tx;
  } else {
    const amount = ethers.parseUnits(String(value), 6);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORWETH_ADDRESS, total);
    await tx.wait();

    return tx;
  }
}

export async function wethbuyFeeCollector(index: number, quantity: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    FEECOLLECTORWETH_ADDRESS || "",
    feecollectorwethAbi,
    signer
  );

  const tx = await fee.addFeeCollectorPosition(index, quantity, {
    value: ethers.parseEther("1"),
  });
  await tx.wait();

  return tx;
}

export async function wethgetPoolValuesPrice() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const pool1 = await contract.viewDepositQuantityToken(1);
    const pool2 = 100000000;

    const formatted1 = ethers.formatUnits(pool1, 18);
    const formatted2 = ethers.formatUnits(pool2, 6);

    return [formatted1, formatted2]; // ← retorna como array
  } catch (error) {
    console.error("Erro ao buscar valores das pools:", error);
    throw error;
  }
}

export async function wethapproveMpool(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WETHPOOL_ADDRESS || "", wethpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTORWETH_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function wethgetActualSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const tx = await contract.actualSession();

    return tx;
  } catch (error) {
    console.error("Erro ao buscar sessao atual", error);
    throw error;
  }
}

export async function wethgetBalanceSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 6));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2].map((p) => contract.balancePerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.balancePerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wethgetWalletsOnSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2].map((p) => contract.totalQuantityPerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.totalQuantityPerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wethgetTime() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const balance = await contract.viewTimeLeft();
    return Number(balance); // agora também retorna um array de number
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wethgetTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  const from = "0xA4D8c89f0c20efbe54cBa9e7e7a7E509056228D9";
  const to = owner;

  return retry(async () => {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);

    const contract = new ethers.Contract(
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      wethAbi,
      provider
    );

    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    return events
      .filter((event) => Number(event.data) !== 0)
      .map((event) => ({
        transactionHash: event.transactionHash,
        value: ethers.formatUnits(event.data, 18),
      }));
  });
}

export async function wethadvanceSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const tx = await contract.advanceSession(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function wethgetUserPositionsSession(
  address: string,
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2].map((p) => contract.quantityUserPosition(address, p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.quantityUserPosition(
        address,
        pool,
        session
      );
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wethgetValueUserToClaim(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      try {
        const value = await contract.viewValueToClaim(address, poolId);
        if (value > 0) {
          console.log("claimable: ", claimableSessions);
          const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
          claimableSessions.push({ poolId, value: valueNumber });
        }
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wethgetValueUserToReceive(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 4; poolId++) {
      try {
        const value = await contract.viewValueReceived(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wethclaimPool(index: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const tx = await contract.claimSession(index); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function wethgetValueUserReceived(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 2; poolId++) {
      try {
        const value = await contract.lastValueRemainingToClaim(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wethverifyNeedClaim(
  address: string,
  pool: number
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1, 2].map((p) => contract.hasClaim(address, p))
      );
      console.log(balancesRaw);
      return balancesRaw;
    } else {
      return [false, false, false, false];
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function wethgetValueUserTotal(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORWETH_ADDRESS || "",
      feecollectorwethAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 2; poolId++) {
      try {
        const value = await contract.viewValueTotal(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function wethgetTransactionsReceivedGas(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  console.log("chamou aqui");
  try {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);
    const contract = new ethers.Contract(
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", /* TOKEN QUE QUERO MONITORAR (USDT)*/
      usdtAbi,
      provider
    );

    const from = "0xC1894BC0e11a332F6217BC199ab3871C53712e1e"; /* CONTRRATO DE ONDE RECEBE (MPOOL CASH) */
    const to = owner;

    const filter = contract.filters.Transfer(from, to);
    console.log(fromBlock, toBlock);

    // Fetch the events.
    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    // Sort the events by block number in descending order (newest to oldest).
    events.sort((a, b) => b.blockNumber - a.blockNumber);

    const result = events
      .filter((event) => Number(event.data) !== 0)
      .map((event) => ({
        transactionHash: event.transactionHash,
        value: ethers.formatUnits(event.data, 6),
      }));
      console.log("retornouy isso:", result);
    return result;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function wgetGasBalance(userAddress: string): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "MetaMask não está instalado ou não está disponível no navegador."
    );
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_PADRAO_EXTRATOS);
    const yourContract = new ethers.Contract(
      LINKCOLLECTORWETH_ADDRESS || "",
      linkcollectorwethAbi,
      provider
    );

    const userTuple = await yourContract.getUser(userAddress);

    // Captura o último elemento da tupla (presumido como 'availableGas')
    const gasAsBigInt = userTuple[userTuple.length - 1] as BigNumberish;

    // Ajuste aqui conforme o tipo de valor:
    const decimals = 0; // Altere para 6 se for USDC, ou 9 se for GWEI, etc.
    const formattedGas = ethers.formatUnits(gasAsBigInt, decimals);

    return formattedGas;
  } catch (error) {
    console.error("Erro ao buscar saldo de gás do usuário:", error);
    throw new Error(
      "Falha ao obter saldo de gás. Verifique se o contrato e o endereço estão corretos."
    );
  }
}

export async function wethbuyGasWithUSDC(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    LINKCOLLECTORWETH_ADDRESS || "",
    linkcollectorwethAbi,
    signer
  );

  const amount = ethers.parseUnits(String(value), 6); // assumindo 18 casas decimais

  const tx = await usdt.increaseGas(value, { value: ethers.parseEther("1") });
  await tx.wait();

  return tx;
}

export async function wethapproveUSDTGas(value: string) {
  // Recebe 'value' como string
  const provider = getProvider(); // Garanta que getProvider() esteja acessível
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer); // Garanta que USDC_ADDRESS e usdcAbi estejam definidos

  // Converte o valor para BigInt com 6 decimais (USDC)
  const amount = ethers.parseUnits(value, 6);

  // Calcula 10% do valor. '10n' representa BigInt 10
  const tenPercent = amount / 10n;

  // Soma o valor original com 10%
  const total = amount + tenPercent;

  // Exibe o valor total que será aprovado para debug
  console.log(
    "Valor total para aprovação (com 10% e decimais):",
    total.toString()
  );
  console.log(
    "Valor total para aprovação (human-readable):",
    ethers.formatUnits(total, 6)
  );

  const tx = await usdt.approve(LINKCOLLECTORWETH_ADDRESS, total); // FEECOLLECTORWETH_ADDRESS deve estar definido
  await tx.wait();

  return tx;
}

export async function approveWethToken(
  value: string | number,
  spender: string
) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WETHPOOL_ADDRESS || "", wethpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18);

  const tx = await usdt.approve(spender, amount);
  await tx.wait();

  return tx;
}

export async function allowanceWethToken(owner: string, spender: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(WETHPOOL_ADDRESS || "", wethpoolAbi, signer);

  const allowance = await usdt.allowance(owner, spender);

  return allowance;
}

export async function feeWethQuantity(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTERWETH_ADDRESS || "",
      routerwethAbi,
      signer
    );

    console.log("Quantity,", ethers.parseEther(String(amount)));
    const fee = await contract.viewSellFee.staticCall(
      ethers.parseEther(String(amount))
    );
    return Number(fee);
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function sellWethTokens(amount: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      ROUTERWETH_ADDRESS || "",
      routerwethAbi,
      signer
    );

    const tx = await contract.sellTokens(ethers.parseUnits(String(amount)));
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

export async function usdcapproveUSDT(value: string | number, id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  if (id == 1) {
    const amount = ethers.parseUnits(String(value), 0);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORUSDC_ADDRESS, total);
    await tx.wait();

    return tx;
  } else {
    const amount = ethers.parseUnits(String(value), 6);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORUSDC_ADDRESS, total);
    await tx.wait();

    return tx;
  }
}

export async function usdcbuyFeeCollector(index: number, quantity: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    FEECOLLECTORUSDC_ADDRESS || "",
    feecollectorusdcAbi,
    signer
  );

  const tx = await fee.addFeeCollectorPosition(index, quantity, {
    value: ethers.parseEther("1"),
  });
  await tx.wait();

  return tx;
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
/**
 * Busca e processa a tabela de elegibilidade do contrato, lidando com a string de valores concatenados.
 * @param userAddress O endereço do usuário.
 * @returns Os dados no formato UserTable.
 */
export async function fetchUserTable(userAddress: string): Promise<UserTable> {
    const provider = await getProvider();
    const signer = await provider.getSigner();

    const queueContract = new ethers.Contract(
        MPOOLCASH_ADDRESS || "",
        mpoolcashAbi,
        signer
    );

    // 1. CHAMA O CONTRATO (o resultado é uma tupla de 3 elementos)
    const result = await queueContract.viewUserElegibleTable(userAddress);

    // 2. EXTRAÇÃO DOS DADOS GLOBAIS
    // (A correção anterior para garantir que result[0] é a string)
    const rawTableString: string = result[0].toString();
    const directsQuantity = Number(result.directsQuantity.toString());
    const valueInvested = BigInt(result.valueInPool.toString());

    // 3. PROCESSAMENTO DA STRING CONCATENADA (45 valores)
    const values = rawTableString.split(',').map(v => v.trim());
    
    if (values.length !== 45) {
        throw new Error(`Esperado 45 valores, mas encontrado ${values.length}. Verifique o retorno do contrato.`);
    }
    
    // --- CONVERSÃO PARA BOOLEANOS ---
    // Mesmo que o contrato retorne strings "true"/"false",
    // esta linha CONVERTE as strings em tipos booleanos nativos do JavaScript.
    const isEligible: boolean[] = values.slice(0, 15).map(v => v.toLowerCase() === 'true');
    
    // b) directsRequirement (uints - Itens 15 a 29)
    const directsRequirement = values.slice(15, 30).map(v => Number(v)); 
    
    // c) valueInvestedRequirement (uint256 - Itens 30 a 44)
    const valueInvestedRequirement = values.slice(30, 45).map(v => BigInt(v));
    
    // 4. RETORNA A ESTRUTURA FINAL
    return {
        directsQuantity,
        valueInvested,
        table: {
            isEligible, // Array de booleanos nativos (Correto!)
            directsRequirement,
            valueInvestedRequirement,
        }
    };
}




export async function usdcgetPoolValuesPrice() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const pool1 = 1000000000;

    const formatted1 = ethers.formatUnits(pool1, 6);

    return [formatted1]; // ← retorna como array
  } catch (error) {
    console.error("Erro ao buscar valores das pools:", error);
    throw error;
  }
}

export async function usdcapproveMpool(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDC_ADDRESS || "", usdcAbi, signer);

  const amount = ethers.parseUnits(String(value), 6); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTORUSDC_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function usdcgetActualSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const tx = await contract.actualSession();

    return tx;
  } catch (error) {
    console.error("Erro ao buscar sessao atual", error);
    throw error;
  }
}

export async function usdcgetBalanceSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 6));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.balancePerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.balancePerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function usdcgetWalletsOnSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.totalQuantityPerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.totalQuantityPerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function usdcgetTime() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const balance = await contract.viewTimeLeft();
    return Number(balance); // agora também retorna um array de number
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function usdcgetTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  const from = "0xD718565a788896872625D3B3A5F705C441d3E89d";
  const to = owner;

  return retry(async () => {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

    const contract = new ethers.Contract(
      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      usdcAbi,
      provider
    );

    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    console.log("Esses sao os events", events);
    return events
      .filter((event) => Number(event.data) !== 0)
      .map((event) => ({
        transactionHash: event.transactionHash,
        value: ethers.formatUnits(event.data, 6),
      }));
  });
}

export async function usdcadvanceSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const tx = await contract.advanceSession(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function usdcgetUserPositionsSession(
  address: string,
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.quantityUserPosition(address, p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.quantityUserPosition(
        address,
        pool,
        session
      );
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function usdcgetValueUserToClaim(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueToClaim(address, poolId);
        if (value > 0) {
          console.log("claimable: ", claimableSessions);
          const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
          claimableSessions.push({ poolId, value: valueNumber });
        }
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function usdcgetValueUserToReceive(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueReceived(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function usdcclaimPool(index: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const tx = await contract.claimSession(index); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function usdcgetValueUserReceived(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.lastValueRemainingToClaim(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function usdcverifyNeedClaim(
  address: string,
  pool: number
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.hasClaim(address, p))
      );
      console.log(balancesRaw);
      return balancesRaw;
    } else {
      return [false, false, false, false];
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function usdcgetValueUserTotal(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORUSDC_ADDRESS || "",
      feecollectorusdcAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueTotal(address, poolId);
        const valueNumber = Number(value) / 1e6; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

import gameAbi from "./abis/game.abi.json";
import receiptAbi from "./abis/receipt.abi.json";
import daiAbi from "./abis/dai.abi.json";
import feecollectordaiAbi from "./abis/feecollectordai.abi.json";

const GAME_ADDRESS = process.env.NEXT_PUBLIC_GAME_ADDRESS;
const RECEIPT_ADDRESS = process.env.NEXT_PUBLIC_RECEIPT_ADDRESS;
const DAI_ADDRESS = process.env.NEXT_PUBLIC_DAI_ADDRESS;
const FEECOLLECTORDAI_ADDRESS = process.env.NEXT_PUBLIC_FEECOLLECTORDAI_ADDRESS;

export async function approveDai(value: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(DAI_ADDRESS || "", daiAbi, signer);

  const tx = await usdt.approve(
    RECEIPT_ADDRESS,
    ethers.parseUnits(String(value), 18)
  );
  await tx.wait();

  return tx;
}

export async function mintTiket(games: number[][], gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(RECEIPT_ADDRESS || "", receiptAbi, signer);

  console.log(games, gameType);
  const tx = await usdt.safeMint(games, gameType);
  await tx.wait();

  return tx;
}

export async function getSessionLotery(gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);
  console.log("gameType:", gameType);

  // Adiciona { blockTag: 'latest' } para forçar a leitura do último bloco
  const tx = await usdt.getCurrentSession(gameType, { blockTag: "latest" });

  console.log("buscou a sessao: ", tx);

  return tx;
}

export async function lottoDatas(session: number, gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);

  const tx = await usdt.getGameById(session, gameType);

  return tx;
}

export async function startNewGame(gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);

  const tx = await usdt.advanceSession(gameType);

  return tx;
}

export async function getLottoTime(gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);
  const tx = await usdt.getRemainingTime(BigInt(gameType));
  return tx;
}

export async function getUserLottoId(
  address: string,
  session: number,
  gameType: number
) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(RECEIPT_ADDRESS || "", receiptAbi, signer);
  const tx = await usdt.getUserTokenIds(address, session, gameType);
  console.log("tickets", tx);
  return tx;
}

export async function getUserTickets(id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(RECEIPT_ADDRESS || "", receiptAbi, signer);
  console.log("id bilhete", id);
  const tx = await usdt.getReceiptAttributes(id);
  return tx;
}

export async function generateNumbers(gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);
  const tx = await usdt.generate(gameType);
  return tx;
}

export async function getUserWinner(
  address: string,
  sessionId: number,
  gameType: number
) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(RECEIPT_ADDRESS || "", receiptAbi, signer);
  const tx = await usdt.getUserTokenIdsWinner(address, sessionId, gameType);
  return tx;
}

export async function getMinttedTicket(sessionId: number, gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(RECEIPT_ADDRESS || "", receiptAbi, signer);
  const tx = await usdt.getMintedInSession(gameType, sessionId);
  return tx;
}

export async function getDaiLotto(sessionId: number, gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);

  const tx = await usdt.daiLotto(gameType, sessionId - 1);
  console.log("winner ticket", tx[4]);
  return {
    balance: tx[2],
    winningNumbers: tx[4],
    winnersQuantity: tx[5],
    requiredMatches: tx[6],
  };
}

export async function claimTicket(id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);
  const tx = await usdt.verifyReceipt(id);
  return tx;
}

export async function viewLotteryResult(sessionId: number, gameType: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(GAME_ADDRESS || "", gameAbi, signer);
  const tx = await usdt.viewResult(sessionId, gameType);
  return tx[1];
}

export async function daiapproveUSDT(value: string | number, id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(DAI_ADDRESS || "", daiAbi, signer);

  if (id == 1) {
    const amount = ethers.parseUnits(String(value), 0);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORDAI_ADDRESS, total);
    await tx.wait();

    return tx;
  } else {
    const amount = ethers.parseUnits(String(value), 18);
    const tenPercent = amount / 10n;
    const total = amount + tenPercent;
    const tx = await usdt.approve(FEECOLLECTORDAI_ADDRESS, total);
    await tx.wait();

    return tx;
  }
}

export async function daibuyFeeCollector(index: number, quantity: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    FEECOLLECTORDAI_ADDRESS || "",
    feecollectordaiAbi,
    signer
  );

  const tx = await fee.addFeeCollectorPosition(index, quantity);
  await tx.wait();

  return tx;
}

export async function daigetPoolValuesPrice() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const pool1 = 5000000000000000000000n;

    const formatted1 = ethers.formatUnits(pool1, 18);

    return [formatted1]; // ← retorna como array
  } catch (error) {
    console.error("Erro ao buscar valores das pools:", error);
    throw error;
  }
}

export async function daiapproveMpool(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(DAI_ADDRESS || "", daiAbi, signer);

  const amount = ethers.parseUnits(String(value), 18); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(FEECOLLECTORDAI_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function daigetActualSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const tx = await contract.actualSession();

    return tx;
  } catch (error) {
    console.error("Erro ao buscar sessao atual", error);
    throw error;
  }
}

export async function daigetBalanceSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 18));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.balancePerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.balancePerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function daigetWalletsOnSession(
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.totalQuantityPerSession(p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.totalQuantityPerSession(pool, session);
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function daigetTime() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const balance = await contract.viewTimeLeft();
    return Number(balance); // agora também retorna um array de number
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function daigetTransactionsReceived(
  owner: string,
  fromBlock: number,
  toBlock: number
) {
  const from = "0x3FBdeb4494dd477d136F125576102E8b98C06c9E";
  const to = owner;

  return retry(async () => {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

    const contract = new ethers.Contract(
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      daiAbi,
      provider
    );

    const filter = contract.filters.Transfer(from, to);
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    console.log("Esses sao os events", events);
    return events
      .filter((event) => Number(event.data) !== 0)
      .map((event) => ({
        transactionHash: event.transactionHash,
        value: ethers.formatUnits(event.data, 18),
      }));
  });
}

export async function daiadvanceSession() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const tx = await contract.advanceSession(); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function daigetUserPositionsSession(
  address: string,
  pool: number,
  session: number
): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const formatValue = (value: bigint) => {
      return parseFloat(ethers.formatUnits(value, 0));
    };

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.quantityUserPosition(address, p, session))
      );
      const balancesFormatted = balancesRaw.map(formatValue);
      return balancesFormatted; // retorna array de numbers
    } else {
      const balance = await contract.quantityUserPosition(
        address,
        pool,
        session
      );
      return [formatValue(balance)]; // agora também retorna um array de number
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function daigetValueUserToClaim(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueToClaim(address, poolId);
        if (value > 0) {
          console.log("claimable: ", claimableSessions);
          const valueNumber = Number(value) / 1e18; // reduz 6 casas decimais
          claimableSessions.push({ poolId, value: valueNumber });
        }
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function daigetValueUserToReceive(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueReceived(address, poolId);
        const valueNumber = Number(value) / 1e18; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function daiclaimPool(index: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const tx = await contract.claimSession(index); // envia a transação
    await tx.wait(); // espera ser minerada

    return; // ou return true, se quiser indicar sucesso
  } catch (error) {
    console.error("Erro ao avançar sessão", error);
    throw error;
  }
}

export async function daigetValueUserReceived(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.lastValueRemainingToClaim(address, poolId);
        const valueNumber = Number(value) / 1e18; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function daiverifyNeedClaim(
  address: string,
  pool: number
): Promise<boolean[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    if (pool === 0) {
      const balancesRaw = await Promise.all(
        [1].map((p) => contract.hasClaim(address, p))
      );
      console.log(balancesRaw);
      return balancesRaw;
    } else {
      return [false, false, false, false];
    }
  } catch (error) {
    console.error("Erro ao buscar sessão atual", error);
    throw error;
  }
}

export async function daigetValueUserTotal(address: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      FEECOLLECTORDAI_ADDRESS || "",
      feecollectordaiAbi,
      signer
    );

    const claimableSessions: {
      poolId: number;
      value: number;
    }[] = [];

    for (let poolId = 1; poolId <= 1; poolId++) {
      try {
        const value = await contract.viewValueTotal(address, poolId);
        const valueNumber = Number(value) / 1e18; // reduz 6 casas decimais
        claimableSessions.push({ poolId, value: valueNumber });
      } catch (err) {
        console.warn(`Erro ao verificar pool ${poolId}:`, err);
        continue;
      }
    }

    return claimableSessions;
  } catch (error) {
    console.error("Erro ao buscar sessões resgatáveis:", error);
    throw error;
  }
}

export async function buyMpoolCash(quantity: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await fee.addPosition(quantity);
  await tx.wait();

  return tx;
}

export async function claimMPoolCash(tokenId: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await fee.removeLiquidity(tokenId);
  await tx.wait();

  return tx;
}

export async function reinvestMPoolCash(tokenId: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const fee = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await fee.reinvest(tokenId);
  await tx.wait();

  return tx;
}

export async function approveUSDTCash(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(USDT_ADDRESS || "", usdtAbi, signer);

  const amount = ethers.parseUnits(String(value), 6); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;
  console.log("approve:", total);
  const tx = await usdt.approve(MPOOLCASH_ADDRESS, total);
  await tx.wait();

  return tx;
}

export async function getActualPoints() {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await usdt.actualPoint();
  const scaledPoints = ethers.formatUnits(tx, 6);

  return Number(scaledPoints);
}

export async function getTickDatas(id: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );
  const [currentTick, upperTick, startTick] = await usdt.returnTickById(id);

  return {
    currentTick: Number(currentTick),
    upperTick: Number(upperTick),
    startTick: Number(startTick),
  };
}

export async function hasPositionClaimed(tokenId: number) {
  const provider = getProvider();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    provider
  );
  const flag = await usdt.isTokenIdRemoved(tokenId);

  return flag;
}

export async function getUserTickIds(address: string): Promise<number[]> {
  if (!MPOOLCASH_ADDRESS) {
    throw new Error("MPOOLCASH_ADDRESS não está definido.");
  }

  try {
    const provider = getProvider();

    // Para chamadas de leitura (read-only), o signer não é necessário.
    // Usar apenas o provider é mais eficiente e seguro.
    const usdt = new ethers.Contract(MPOOLCASH_ADDRESS, mpoolcashAbi, provider);

    // Chama a função do contrato. Ela retorna um objeto com uma propriedade 'tx'.
    console.log("chamou", address);
    const result = await usdt.getUserTokenIds(address);

    // O objeto retornado pelo ethers v6 (ou versões anteriores com um wrapper)
    // pode não ser diretamente um array. A propriedade 'tx' contém o valor.
    // Verificamos se é um array antes de mapear.
    const userTokenIds = Array.isArray(result) ? result : result.tx;

    // Converte cada BigInt (ou BigNumber) em um número JavaScript e retorna o array.
    if (userTokenIds && Array.isArray(userTokenIds)) {
      return userTokenIds.map((id) => Number(id));
    } else {
      // Retorna um array vazio se os dados não forem os esperados,
      // garantindo que a função sempre retorne um array.
      return [];
    }
  } catch (error) {
    console.error(
      `Falha ao buscar IDs de tick para o endereço ${address}:`,
      error
    );
    // Relança o erro para que a parte da aplicação que chamou a função possa tratá-lo.
    throw error;
  }
}





export async function getSellTeto() {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await usdt.maxSellRoof();
  const scaledPoints = ethers.formatUnits(tx, 6);

  return Number(scaledPoints);
}

export async function getSellActual() {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await usdt.sellQuantity();
  const scaledPoints = ethers.formatUnits(tx, 6);

  return Number(scaledPoints);
}





// Exemplo em Web3Services.js
export async function viewPriceTick(tickValue: number) {
    const provider = getProvider();
    const signer = await provider.getSigner();

    const usdt = new ethers.Contract(
        MPOOLCASH_ADDRESS || "",
        mpoolcashAbi,
        signer
    );

    const tx = await usdt.viewPriceByTickQuantity(tickValue);

    // --- CORREÇÃO APLICADA AQUI ---
    // Converte o BigInt/BigNumber retornado para um número decimal usando 6 casas decimais (ou o número correto para sua moeda)
    const priceMinFormatted = ethers.formatUnits(tx.priceMin, 6);
    const priceMaxFormatted = ethers.formatUnits(tx.priceMax, 6);
    // ------------------------------

    return { 
        priceMin: Number(priceMinFormatted), 
        priceMax: Number(priceMaxFormatted) 
    };
}



export async function positionOrder(amount: number, tick: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  // 1. CONVERTE O 'amount' PARA BIGINT COM 18 DECIMAIS
  // O valor de 'amount' será transformado em BigInt (ex: 1.5 Mpool vira 1500000000000000000n)
  const amountWithDecimals = ethers.parseUnits(amount.toString(), 18);

  console.log("Amount (JavaScript):", amount);
  console.log("Amount (18 Decimals):", amountWithDecimals.toString());
  console.log("Tick:", tick);

  // 2. Chama a função do contrato usando o valor BigInt formatado
  const tx = await usdt.positionSellOrder(amountWithDecimals, tick);

  return tx;
}




export async function approveMpoolSellOrder(value: string | number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(MPOOL_ADDRESS || "", mpoolAbi, signer);

  const amount = ethers.parseUnits(String(value), 18); // assumindo 18 casas decimais

  const tenPercent = amount / 10n;
  const total = amount + tenPercent;

  const tx = await usdt.approve(MPOOLCASH_ADDRESS, total);
  await tx.wait();

  return tx;
}


export async function getUserOpenTicks(address:string) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await usdt.getUserTokenIdsSellOrder(address);

  return tx;
}



export async function claimSellOrderFront(tickId:number) {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const usdt = new ethers.Contract(
    MPOOLCASH_ADDRESS || "",
    mpoolcashAbi,
    signer
  );

  const tx = await usdt.claimSellOrder(tickId);

  return tx;
}

