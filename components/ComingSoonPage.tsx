// src/components/ComingSoonPage.tsx
import React from 'react';
import { motion } from 'framer-motion';


const ComingSoonPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-6 text-center"
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-6 drop-shadow-lg"
      >
        Coming Soon
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-xl md:text-2xl text-zinc-300 max-w-2xl mb-8"
      >
        We are working hard to bring you an incredible experience. Stay tuned for exciting updates!
      </motion.p>


      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="text-md text-zinc-500 mt-12"
      >
        &copy; {new Date().getFullYear()} Mult Pool. All rights reserved.
      </motion.p>
    </motion.div>
  );
};

export default ComingSoonPage;