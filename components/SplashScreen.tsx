// src/components/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onAnimationEnd: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationEnd, duration = 1500 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.play().catch(err => console.error("Erro ao tocar vídeo:", err));

      const forceEndTimer = setTimeout(() => {
        if (videoRef.current) videoRef.current.pause();
        onAnimationEnd();
      }, duration);

      video.onended = () => {
        clearTimeout(forceEndTimer);
        onAnimationEnd();
      };

      return () => {
        clearTimeout(forceEndTimer);
        if (videoRef.current) videoRef.current.onended = null;
      };
    } else {
      const timer = setTimeout(onAnimationEnd, duration);
      return () => clearTimeout(timer);
    }
  }, [onAnimationEnd, duration]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* 🔥 GRADIENTE ANIMADO DE FUNDO */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black animate-pulse opacity-70"></div>

      {/* 🔥 PARTÍCULAS LUZES */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 🔥 BORDA GLOW AO REDOR DO VÍDEO */}
      <div className="
        absolute w-[92vw] h-[92vh]
        rounded-3xl
        bg-gradient-to-r from-cyan-400/40 to-blue-600/40
        blur-3xl opacity-30 animate-pulse
      "></div>

      {/* 🔥 CONTAINER DO VÍDEO COM DESIGN NOVO */}
      <div className="
        relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,132,255,0.4)]
        border border-white/10 backdrop-blur-xl
      ">
        <video
          ref={videoRef}
          src="/weth_intro.mp4"
          className="w-[92vw] h-[92vh] object-cover"
          muted
          playsInline
          preload="auto"
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
