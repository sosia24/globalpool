"use client";

import { useWallet } from "@/services/walletContext";
import { isRegistered, registerUser } from "@/services/Web3Services";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageManager";

export default function RegisterModal() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const referralAddressFromUrl = searchParams.get("ref");
  const { address: walletAddress } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [isRegisteredUser, setIsRegisteredUser] = useState(false);
  const [referralAddress, setReferralAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");

  useEffect(() => {
    if (walletAddress) {
      isRegistered(walletAddress).then((result) => {
        setIsRegisteredUser(result);
        if (!result) setIsOpen(true);
      });
    }
  }, [walletAddress]);

  useEffect(() => {
    if (referralAddressFromUrl) {
      setReferralAddress(referralAddressFromUrl);
    }
  }, [referralAddressFromUrl]);

  const handleRegisterSponsor = async () => {
    if (!referralAddress.trim()) {
      setError(t.networkRegisterModal.errorEmpty);
      return;
    }

    setLoading(true);
    setError("");
    setAlert("");

    try {
      await registerUser(referralAddress);

      setAlert(t.networkRegisterModal.success);

      if (walletAddress) {
        const check = await isRegistered(walletAddress);

        if (check) {
          setIsRegisteredUser(true);
          setTimeout(() => setIsOpen(false), 600);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t.networkRegisterModal.errorFail);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress || isRegisteredUser) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* MODAL */}
          <motion.div
            className="fixed inset-0 z-[350] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className="
                relative w-[90%] max-w-md p-7 rounded-3xl 
                bg-[#0a0018]/60 backdrop-blur-2xl 
                border border-pink-500/40
                shadow-[0_0_35px_#ff2df7] 
                overflow-hidden
              "
            >
              {/* GLOW TOP */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-60 h-60 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />

              {/* TITLE */}
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_#ff2df7]">
                Register
              </h2>

              <p className="text-gray-300 text-center mt-1 tracking-wide">
                 Enter the referral address to continue.
              </p>

              {/* INPUT LABEL */}
              <label className="block text-sm text-gray-300 mt-6 mb-1 tracking-wide">
                Referral Address
              </label>

              {/* INPUT */}
              <input
                type="text"
                className="
                  w-full px-4 py-2 rounded-xl text-white
                  bg-white/5 backdrop-blur-xl
                  border border-pink-500/40 
                  focus:ring-2 focus:ring-pink-400 
                  outline-none placeholder-gray-400
                  shadow-[0_0_12px_#ff2df755]
                "
                placeholder="0x..."
                value={referralAddress}
                onChange={(e) => setReferralAddress(e.target.value)}
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {alert && <p className="text-green-400 text-sm mt-2">{alert}</p>}

              {/* BUTTON */}
              <button
                onClick={handleRegisterSponsor}
                disabled={loading}
                className="
                  mt-6 w-full py-3 rounded-xl font-semibold cursor-pointer
                  bg-gradient-to-r from-pink-500 via-purple-500 to-pink-400
                  shadow-[0_0_25px_#ff2df7]
                  hover:shadow-[0_0_40px_#ff2df7]
                  transition-all
                  text-white tracking-wide
                "
              >
                {loading ? "Registering..." : "Register Referral"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
