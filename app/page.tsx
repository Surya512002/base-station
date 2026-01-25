'use client';

import { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
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
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Added Variants type import
import { Rocket, MessageCircle, Wallet, Layers, Crown, LogOut, Sparkles, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

// --- 1. CONFIGURATION ---
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [injected()],
  ssr: true,
});

const queryClient = new QueryClient();

// ⚠️ PASTE YOUR ADDRESSES HERE ⚠️
const SOCIAL_CONTRACT_ADDRESS = '0xdB21A0bA90906B76d96b26783caF04e9BB0623e4';
const TOKEN_DEPLOYER_ADDRESS = '0x6Bb7037FdD89d29585991535Ce07212744C808F4';
const NFT_DEPLOYER_ADDRESS = '0x77FfC8Ef3F5964E46BCb86441A286F136815ab6a';
const VIP_PASS_ADDRESS = '0x19De432E6454c78f96d20afc641264A91fCFE46b';

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

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // --- ACTIONS ---
  const handleSocial = (action: string) => {
    writeContract({
      address: SOCIAL_CONTRACT_ADDRESS as `0x${string}`,
      abi: [{"name": "saySomething", "inputs": [{"type":"string"},{"type":"string"}], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'saySomething',
      args: [action, `Based ${action}!`],
      value: parseEther('0.000001'),
    });
  };

  const handleDeployToken = () => {
    writeContract({
      address: TOKEN_DEPLOYER_ADDRESS as `0x${string}`,
      abi: [{"name": "deployToken", "inputs": [], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'deployToken',
      args: [], // Zero arguments = Lowest Gas
      value: parseEther('0.000001'),
    });
  };

  const handleDeployNFT = () => {
    writeContract({
      address: NFT_DEPLOYER_ADDRESS as `0x${string}`,
      abi: [{"name": "deployCollection", "inputs": [], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'deployCollection',
      args: [], // Zero arguments = Lowest Gas
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

  // --- STYLES & VARIANTS (FIXED TYPE ERROR) ---
  const floatingVariant: Variants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: { 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut" // Now correctly typed
      }
    }
  };

  const cardBase = "w-full bg-blue-950/30 backdrop-blur-xl border border-blue-400/20 rounded-[30px] shadow-[0_0_50px_rgba(0,100,255,0.1)] overflow-hidden relative group";
  const glowButton = "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-98 shadow-[0_0_30px_rgba(0,150,255,0.3)] flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen bg-[#000212] text-white font-sans overflow-x-hidden relative">
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingVariant} animate="animate" className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] opacity-40" />
        <motion.div variants={floatingVariant} animate="animate" transition={{ delay: 2 }} className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] opacity-40" />
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-30 h-20 flex items-center transition-all ${mounted ? 'bg-[#000212]/80 backdrop-blur-md border-b border-blue-500/10' : ''}`}>
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
             <button onClick={() => connect({ connector: connectors[0] })} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
             <Wallet size={18} /> Connect
           </button>
          ) : (
            mounted && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 border border-blue-400/30 rounded-full text-blue-300 font-mono font-medium text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {address?.slice(0,6)}...{address?.slice(-4)}
                </div>
                <button onClick={() => disconnect()} className="p-2 bg-blue-950/50 border border-blue-400/30 text-blue-300 hover:text-red-400 hover:border-red-400/30 rounded-full transition-all"><LogOut size={16} /></button>
              </div>
            )
          )}
        </div>
      </nav>

      {/* Main Content - LINEAR LAYOUT */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8 pb-32">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-b from-white via-blue-100 to-blue-400 text-transparent bg-clip-text">
            Build On Base.
          </h1>
          <p className="text-blue-200/60 text-lg">
            Deploy contracts instantly. No code required.
          </p>
        </div>

        {/* 1. VIP PASS (Premium Banner) */}
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
                <button onClick={handleMintVIP} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl text-sm transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
                    Mint
                </button>
            </div>
        </motion.div>

        {/* 2. SOCIAL (Grid) */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className={cardBase}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><MessageCircle size={20} /></div>
                    <h2 className="text-xl font-bold">Onchain Social</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleSocial("GM")} className="h-24 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">☀️</span>
                        <span className="font-bold">GM</span>
                    </button>
                    <button onClick={() => handleSocial("GN")} className="h-24 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">🌙</span>
                        <span className="font-bold">GN</span>
                    </button>
                </div>
            </div>
        </motion.div>

        {/* 3. TOKEN DEPLOY (Linear Card) */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={cardBase}>
            <div className="p-6 md:p-8 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                   <Rocket size={32} className="text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Deploy Token</h2>
                    <p className="text-blue-200/60 text-sm max-w-sm">
                        Launch a standard ERC-20 token instantly. <br/>Fixed supply of 1,000,000.
                    </p>
                </div>
                <button onClick={handleDeployToken} className={`${glowButton} w-full from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]`}>
                  Deploy Now <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>

        {/* 4. NFT DEPLOY (Linear Card) */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className={cardBase}>
            <div className="p-6 md:p-8 flex flex-col items-center text-center gap-6">
                 <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                   <Layers size={32} className="text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Deploy NFT Collection</h2>
                    <p className="text-blue-200/60 text-sm max-w-sm">
                        Launch a new ERC-1155 Collection. <br/>"Blank Slate" contract for lowest gas fees.
                    </p>
                </div>
                <button onClick={handleDeployNFT} className={`${glowButton} w-full from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]`}>
                  Deploy Now <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>

      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {(isPending || isConfirmed || error) && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-0 right-0 mx-auto z-50 max-w-sm w-full px-4">
             <div className="bg-[#000212] border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden">
                {isPending && <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> <span className="font-bold text-sm">Processing...</span></>}
                {isConfirmed && <><CheckCircle2 size={20} className="text-green-500"/> <span className="font-bold text-sm">Success!</span></>}
                {error && <><LogOut size={20} className="text-red-500 rotate-45"/> <span className="font-bold text-sm text-red-500">Error</span></>}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}