'use client';

import { useState, useEffect } from 'react';
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
import { parseEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Wallet, Crown, LogOut, Sparkles, Zap, Hand } from 'lucide-react';

// --- 1. CONFIGURATION ---
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [injected()],
  ssr: true,
});

const queryClient = new QueryClient();

// ⚠️ PASTE YOUR ADDRESSES HERE ⚠️
const COUNTER_CONTRACT_ADDRESS = '0x313161Cbd9373d84648c5CC831811aF5BcF557e1';
const VIP_PASS_ADDRESS = '0x19De432E6454c78f96d20afc641264A91fCFE46b';
const SOCIAL_CONTRACT_ADDRESS = '0xdB21A0bA90906B76d96b26783caF04e9BB0623e4';

// ABI for the Counter
const COUNTER_ABI = [
  {"inputs":[],"name":"tap","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"Tapped","type":"event"},
  {"inputs":[],"name":"totalTaps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
] as const;

export default function Page() {
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- NEW: STATE FOR AUTO-HIDING CELEBRATION ---
  const [showCelebration, setShowCelebration] = useState(false);

  // --- READ TOTAL TAPS ---
  const { data: totalTapsData, refetch: refetchTaps } = useReadContract({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: COUNTER_ABI,
    functionName: 'totalTaps',
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // --- FIXED: AUTO-HIDE LOGIC ---
  useEffect(() => {
    if (isConfirmed) {
      refetchTaps();          // 1. Update the number
      setShowCelebration(true); // 2. Show the "BASED" popup
      
      // 3. Start a timer to hide it after 2.5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetchTaps]);

  // --- ACTIONS ---
  const handleTap = () => {
    writeContract({
      address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: 'tap',
    });
  };

  const handleSocial = (action: string) => {
    writeContract({
      address: SOCIAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: [{"name": "saySomething", "inputs": [{"type":"string"},{"type":"string"}], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'saySomething',
      args: [action, `Based ${action}!`],
      value: parseEther('0.000001'),
    });
  };

  const handleMintVIP = () => {
    writeContract({
      address: VIP_PASS_ADDRESS as `0x${string}`,
      abi: [{"name": "mint", "inputs": [], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'mint',
      value: parseEther('0.00001'),
    });
  };

  const cardBase = "w-full bg-blue-950/30 backdrop-blur-xl border border-blue-400/20 rounded-[30px] shadow-[0_0_50px_rgba(0,100,255,0.1)] overflow-hidden relative group";

  return (
    <div className="min-h-screen bg-[#000212] text-white font-sans overflow-x-hidden relative">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 h-20 flex items-center bg-[#000212]/80 backdrop-blur-md border-b border-blue-500/10">
        <div className="max-w-5xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap fill="white" size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-blue-300 text-transparent bg-clip-text hidden sm:block">
              BASE<span className="text-blue-500">STATION</span>
            </span>
          </div>
          {mounted && !isConnected ? (
             <button onClick={() => connect({ connector: connectors[0] })} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
             <Wallet size={18} /> Connect
           </button>
          ) : mounted && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 border border-blue-400/30 rounded-full text-blue-300 font-mono text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {address?.slice(0,6)}...{address?.slice(-4)}
                </div>
                <button onClick={() => disconnect()} className="p-2 bg-blue-950/50 border border-blue-400/30 text-blue-300 hover:text-red-400 hover:border-red-400/30 rounded-full"><LogOut size={16} /></button>
              </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8 pb-32">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-b from-white via-blue-100 to-blue-400 text-transparent bg-clip-text">
            Tap The Base.
          </h1>
          <p className="text-blue-200/60 text-lg">Leave your mark on-chain. Cheap & Instant.</p>
        </div>

        {/* 1. VIP PASS */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className={`${cardBase} border-yellow-500/30`}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-40"></div>
            <div className="p-6 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-yellow-400/50 overflow-hidden bg-black flex-shrink-0 relative">
                       <img src="/vip-logo.png" alt="VIP" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                       <div className="absolute inset-0 flex items-center justify-center -z-10"><Crown size={24} className="text-yellow-400"/></div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">VIP Pass <Sparkles size={16} className="text-yellow-400" /></h3>
                        <p className="text-xs text-yellow-200/70 font-mono mt-1">0.00001 ETH • 100k Supply</p>
                    </div>
                </div>
                <button onClick={handleMintVIP} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform">Mint</button>
            </div>
        </motion.div>

        {/* 2. THE BIG TAPPER */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className={cardBase}>
            <div className="p-10 flex flex-col items-center text-center gap-8 relative">
                
                {/* Global Counter */}
                <div className="flex flex-col items-center">
                  <span className="text-blue-300 uppercase tracking-widest text-xs font-bold mb-2">Global Onchain Taps</span>
                  <div className="text-6xl md:text-7xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-400 drop-shadow-[0_0_30px_rgba(0,100,255,0.4)]">
                    {totalTapsData ? totalTapsData.toString() : "0"}
                  </div>
                </div>

                {/* THE BUTTON */}
                <button 
                  onClick={handleTap}
                  disabled={isPending || isConfirming}
                  className="group relative w-48 h-48 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 shadow-[0_0_60px_rgba(0,100,255,0.4)] border-4 border-blue-400/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  {isPending || isConfirming ? (
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Hand size={64} className="text-white drop-shadow-lg" />
                  )}
                  <span className="absolute bottom-8 text-sm font-bold text-blue-100">
                    {isPending ? "WAIT..." : "TAP ME"}
                  </span>
                </button>
                
                <p className="text-sm text-blue-200/50">Cost: ~0.00002 ETH (Basically Free)</p>
            </div>
        </motion.div>

        {/* 3. SOCIAL */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={cardBase}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <MessageCircle size={20} className="text-orange-400" />
                    <h2 className="text-lg font-bold">Say Hello</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleSocial("GM")} className="h-16 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">☀️</span> <span className="font-bold">GM</span>
                    </button>
                    <button onClick={() => handleSocial("GN")} className="h-16 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🌙</span> <span className="font-bold">GN</span>
                    </button>
                </div>
            </div>
        </motion.div>

      </main>

      {/* AUTO-HIDING CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="relative text-center">
              <div className="absolute inset-0 bg-blue-500 blur-[120px] opacity-40 rounded-full" />
              <motion.div 
                initial={{ y: 20 }} animate={{ y: 0 }}
                className="relative z-10"
              >
                 <h1 className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] tracking-tighter italic">
                  BASED!
                </h1>
                <p className="text-2xl md:text-3xl text-blue-300 font-bold mt-2">
                  Transaction Confirmed
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Status Toast */}
      <AnimatePresence>
        {(isPending || error) && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-0 right-0 mx-auto z-50 max-w-sm w-full px-4">
             <div className="bg-[#000212] border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
                {isPending && <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> <span className="font-bold text-sm">Processing...</span></>}
                {error && <><LogOut size={20} className="text-red-500 rotate-45"/> <span className="font-bold text-sm text-red-500">Error</span></>}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}