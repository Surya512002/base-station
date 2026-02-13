'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useAccount, 
  useConnect, 
  useDisconnect,
  WagmiProvider, 
  createConfig, 
  http 
} from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { parseEther, stringToHex, concatHex } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Wallet, Crown, LogOut, Sparkles, Zap, Hand } from 'lucide-react';

// --- 1. CONFIGURATION ---
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [injected()],
  ssr: true,
});

// --- 2. CONSTANTS & BUILDER CODE ---
const BUILDER_ID = process.env.NEXT_PUBLIC_BUILDER_ID || 'bc_z19c7gsg';

/** * ERC-8021 Suffix Builder 
 * This is what makes your transactions "Verified" on the checker.
 */
const get8021Suffix = (id: string) => {
  const codeHex = stringToHex(id);
  const lengthHex = `0x${id.length.toString(16).padStart(2, '0')}` as `0x${string}`;
  const schemaId = '0x00'; 
  const marker = '0x80218021802180218021802180218021';
  return concatHex([codeHex, lengthHex, schemaId as `0x${string}`, marker]);
};

const ADDR = {
  COUNTER: '0x313161Cbd9373d84648c5CC831811aF5BcF557e1' as `0x${string}`,
  VIP: '0x19De432E6454c78f96d20afc641264A91fCFE46b' as `0x${string}`,
  SOCIAL: '0xdB21A0bA90906B76d96b26783caF04e9BB0623e4' as `0x${string}`,
};

const COUNTER_ABI = [
  {"inputs":[],"name":"tap","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"totalTaps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
] as const;

export default function Page() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BaseStationUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function BaseStationUI() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showCelebration, setShowCelebration] = useState(false);
  const builderSuffix = useMemo(() => get8021Suffix(BUILDER_ID), []);

  const { data: totalTapsData, refetch: refetchTaps } = useReadContract({
    address: ADDR.COUNTER,
    abi: COUNTER_ABI,
    functionName: 'totalTaps',
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetchTaps();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
  }, [isConfirmed, refetchTaps]);

  const handleTap = () => writeContract({ 
    address: ADDR.COUNTER, abi: COUNTER_ABI, functionName: 'tap', dataSuffix: builderSuffix 
  });

  const handleSocial = (action: string) => writeContract({
    address: ADDR.SOCIAL,
    abi: [{"name": "saySomething", "inputs": [{"type":"string"},{"type":"string"}], "outputs": [], "stateMutability": "payable", "type": "function"}] as const,
    functionName: 'saySomething',
    args: [action, `Based ${action}!`],
    value: parseEther('0.000001'),
    dataSuffix: builderSuffix,
  });

  const handleMintVIP = () => writeContract({
    address: ADDR.VIP,
    abi: [{"name": "mint", "inputs": [], "outputs": [], "stateMutability": "payable", "type": "function"}] as const,
    functionName: 'mint',
    value: parseEther('0.00001'),
    dataSuffix: builderSuffix,
  });

  const cardBase = "w-full bg-blue-950/30 backdrop-blur-xl border border-blue-400/20 rounded-[30px] shadow-[0_0_50px_rgba(0,100,255,0.1)] overflow-hidden relative group";

  return (
    <div className="min-h-screen bg-[#000212] text-white font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-blue-600/20 rounded-full blur-[150px] opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-cyan-600/20 rounded-full blur-[150px] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 h-20 flex items-center bg-[#000212]/80 backdrop-blur-md border-b border-blue-500/10">
        <div className="max-w-5xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-500" fill="currentColor" size={24} />
            <span className="text-xl font-extrabold tracking-tight">BASE STATION</span>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-blue-950/50 border border-blue-400/30 rounded-full text-blue-300 font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button onClick={() => disconnect()} className="p-2 hover:text-red-400"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: connectors[0] })} className="bg-blue-600 px-6 py-2 rounded-full font-bold">Connect Wallet</button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8 pb-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-b from-white via-blue-100 to-blue-400 text-transparent bg-clip-text">Tap The Base.</h1>
          <p className="text-blue-200/60">Leave your mark on-chain. Cheap & Instant.</p>
        </div>

        {/* 1. VIP PASS SECTION */}
        <div className={`${cardBase} border-yellow-500/30`}>
          <div className="absolute inset-0 bg-linear-to-r from-yellow-500/10 to-transparent opacity-40" />
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                <Crown className="text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">VIP Pass</h3>
                <p className="text-xs text-yellow-200/50 font-mono">0.00001 ETH</p>
              </div>
            </div>
            <button onClick={handleMintVIP} className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl active:scale-95 transition-transform">Mint</button>
          </div>
        </div>

        {/* 2. THE BIG TAPPER */}
        <div className={cardBase}>
          <div className="p-10 flex flex-col items-center gap-8">
            <div className="text-center">
              <span className="text-blue-300 uppercase text-xs font-bold tracking-widest">Global Taps</span>
              <div className="text-7xl font-black text-blue-400">{totalTapsData?.toString() || "0"}</div>
            </div>
            <button onClick={handleTap} disabled={isPending || isConfirming} className="w-44 h-44 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all">
              {isConfirming ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Hand size={56} />}
            </button>
          </div>
        </div>

        {/* 3. SOCIAL SECTION */}
        <div className={cardBase}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="text-orange-400" />
              <h2 className="font-bold text-lg">On-chain Social</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSocial("GM")} className="h-20 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-2xl">☀️</span>
                <span className="font-bold">GM</span>
              </button>
              <button onClick={() => handleSocial("GN")} className="h-20 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-2xl">🌙</span>
                <span className="font-bold">GN</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center opacity-20">
          <p className="text-[10px] font-mono">BUILDER ID: {BUILDER_ID}</p>
        </footer>
      </main>

      {/* OVERLAYS */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <h1 className="text-8xl font-black italic text-white drop-shadow-2xl">BASED!</h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {(isPending || isConfirming || error) && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <div className="max-w-xs mx-auto bg-blue-900 border border-blue-400/30 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            {isPending || isConfirming ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="text-sm font-bold">Transaction Processing...</span></>
            ) : error ? (
              <span className="text-sm font-bold text-red-400">Error Sending.</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
} 