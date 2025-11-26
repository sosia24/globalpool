"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  FileText,
  BarChart,
  Globe,
  Users,
  Youtube,
  BookOpen,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingActionMenu() {
  const [open, setOpen] = useState(false);

  const links = [
    {
      category: "📜 Contracts",
      color: "text-yellow-400",
      icon: <FileText size={16} className="mr-2" />,
      items: [
        {
          label: "MPool Contract",
          href: "https://polygonscan.com/token/0x2d34a748427801e5d3da862bf474e2b28e501624",
        },
        {
          label: "WBTCPool Contract",
          href: "https://polygonscan.com/token/0x4cde52fb5046064e602ee39f7557f2fa7ce0084c",
        },
        {
          label: "Liquidity Lock",
          href: "https://app.uncx.network/lockers/univ3/chain/137/address/0xbe38e855c8f4a8e119ca39aa97208af17e8f1e22",
        },
        {
          label: "MultPool Burn",
          href: "https://polygonscan.com/token/0x2d34a748427801e5d3da862bf474e2b28e501624?a=0x0000000000000000000000000000000000000000",
        },
      ],
    },
    {
      category: "📊 Charts",
      color: "text-green-400",
      icon: <BarChart size={16} className="mr-2" />,
      items: [
        {
          label: "MPool Chart",
          href: "https://www.geckoterminal.com/pt/polygon_pos/pools/0xbe38e855c8f4a8e119ca39aa97208af17e8f1e22",
        },
        {
          label: "WBTCPool Chart",
          href: "https://www.geckoterminal.com/pt/polygon_pos/pools/0x4cfc6652348904b32c9e1737af8a67a7036d1714",
        },
      ],
    },
    {
      category: "🌐 Official Sites",
      color: "text-blue-400",
      icon: <Globe size={16} className="mr-2" />,
      items: [
        { label: "MultPool Website", href: "https://multpool.io/" },
        { label: "MultPoolDEX Website", href: "https://multpoodex.io/" },
        {
          label: "White Paper",
          href: "https://multpooldex.gitbook.io/multpooldex",
          icon: <BookOpen size={16} className="mr-2" />,
        },
      ],
    },
    {
      category: "💬 Comunity",
      color: "text-pink-400",
      icon: <Users size={16} className="mr-2" />,
      items: [
        {
          label: "WhatsApp Group",
          href: "https://chat.whatsapp.com/Jl4keZslketGqOo74LU5N1",
          icon: <FaWhatsapp size={16} color="#00000" className="mr-2" />,
        },
        {
          label: "MultPool Cash Group",
          href: "https://chat.whatsapp.com/FkyDhWGF8Js4RlURyChptv?mode=wwt",
          icon: <FaWhatsapp size={16} color="#00000" className="mr-2" />,
        },
        {
          label: "Telegram Group",
          href: "https://t.me/+IpRxEgcm9oVmMzIx",
        },
        {
          label: "Telegram MultPool Cash Group",
          href: "https://t.me/cryptoPool2025n",
        },
        {
          label: "YouTube Channel",
          href: "https://www.youtube.com/@MULTPOOL-GLOBAL",
          icon: <Youtube size={16} className="mr-2" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Floating Button com Logo Token */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full cursor-pointer shadow-xl flex items-center justify-center transition overflow-hidden"
      >
        <Image
          src="/MpoolF.png"
          alt="Token Logo"
          width={70}
          height={70}
          className="object-contain shadow-2xl"
        />
      </button>

      {/* Slide Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm cursor-pointer"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-72 h-full bg-zinc-900 text-white shadow-lg z-50 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-700">
                <span className="text-lg font-semibold">Important Links</span>
                <button onClick={() => setOpen(false)}>
                  <X className="w-6 h-6 text-yellow-400 cursor-pointer" />
                </button>
              </div>

              {/* Links com Categorias */}
              <nav className="flex flex-col space-y-6 px-4 py-6">
                {links.map((section) => (
                  <div key={section.category}>
                    <p
                      className={`font-semibold uppercase text-xs mb-2 ${section.color} tracking-wide`}
                    >
                      {section.category}
                    </p>
                    <div className="flex flex-col space-y-2">
                      {section.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className="flex items-center text-sm hover:bg-yellow-400 hover:text-black px-3 py-2 rounded transition"
                        >
                          {item.icon ? item.icon : section.icon}
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
