'use client';

import { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useAccount, 
  useConnect, 
  useDisconnect, // Added Disconnect Hook
  WagmiProvider, 
  createConfig, 
  http 
} from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, MessageCircle, Wallet, Layers, Link as LinkIcon, CheckCircle2, LogOut } from 'lucide-react';

// --- 1. CONFIGURATION ---
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [injected()],
  ssr: true,
});

const queryClient = new QueryClient();

// REPLACE WITH YOUR REDEPLOYED CONTRACT ADDRESSES
const SOCIAL_CONTRACT_ADDRESS = '0xdB21A0bA90906B76d96b26783caF04e9BB0623e4';
const TOKEN_DEPLOYER_ADDRESS = '0xf6845183045a542100E52d45C82b1637B9A4182A';
const NFT_DEPLOYER_ADDRESS = '0xA3f4DfD56904a4f97183D46a2f84CC5b76224D9f';
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
  const { disconnect } = useDisconnect(); // Get the disconnect function
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeTab, setActiveTab] = useState('social'); 

  // Form States
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('1000000');
  const [collectionName, setCollectionName] = useState('');
  const [collectionUri, setCollectionUri] = useState('');

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
    if (!tokenName || !tokenSymbol) return;
    writeContract({
      address: TOKEN_DEPLOYER_ADDRESS as `0x${string}`,
      abi: [{"name": "deployToken", "inputs": [{"type":"string"},{"type":"string"},{"type":"uint256"}], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'deployToken',
      args: [tokenName, tokenSymbol, BigInt(tokenSupply)],
      value: parseEther('0.000001'),
    });
  };

  const handleDeployNFT = () => {
    if (!collectionName || !collectionUri) return;
    writeContract({
      address: NFT_DEPLOYER_ADDRESS as `0x${string}`,
      abi: [{"name": "deployCollection", "inputs": [{"type":"string"},{"type":"string"}], "outputs": [], "stateMutability": "payable", "type": "function"}],
      functionName: 'deployCollection',
      args: [collectionUri, collectionName],
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

  // --- ANIMATIONS ---
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-[#000510] text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight">Base <span className="text-blue-500">Station</span></span>
          </div>

          {/* CONNECT / DISCONNECT LOGIC */}
          {mounted && !isConnected ? (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          ) : (
            mounted && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 font-mono text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {address?.slice(0,6)}...{address?.slice(-4)}
                </div>
                {/* DISCONNECT BUTTON */}
                <button 
                  onClick={() => disconnect()}
                  className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-full transition-all border border-white/5 hover:border-red-500/30"
                  title="Disconnect"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeIn}
          className="text-center mb-12"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Base Network Utility 🔵
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 text-transparent bg-clip-text">
            Build. Post. Mint.
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* LEFT: Tools Panel */}
          <div className="md:col-span-8">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
              {['social', 'token', 'nft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'social' && '💬 Social'}
                  {tab === 'token' && '🚀 Token'}
                  {tab === 'nft' && '🎨 NFT'}
                </button>
              ))}
            </div>

            {/* Active Tool Area */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[420px]"
            >
              
              {/* --- SOCIAL TAB --- */}
              {activeTab === 'social' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                      <MessageCircle size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Onchain Social</h2>
                      <p className="text-gray-400">Interact with the Base blockchain directly.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSocial("GM")}
                      className="h-40 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/20 transition-all group flex flex-col items-center justify-center gap-3"
                    >
                      <span className="text-5xl group-hover:scale-110 transition-transform">☀️</span>
                      <div className="text-center">
                        <span className="block font-bold text-orange-200 text-lg">Say GM</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleSocial("GN")}
                      className="h-40 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500 hover:bg-indigo-500/20 transition-all group flex flex-col items-center justify-center gap-3"
                    >
                      <span className="text-5xl group-hover:scale-110 transition-transform">🌙</span>
                      <div className="text-center">
                        <span className="block font-bold text-indigo-200 text-lg">Say GN</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* --- TOKEN TAB --- */}
              {activeTab === 'token' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                      <Rocket size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Token Launcher</h2>
                      <p className="text-gray-400">Deploy ERC-20 standard tokens.</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Name</label>
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-1 focus:border-blue-500 outline-none transition-colors text-lg"
                        placeholder="e.g. BaseCat"
                        onChange={(e) => setTokenName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Symbol</label>
                        <input 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-1 focus:border-blue-500 outline-none text-lg"
                          placeholder="BCAT"
                          onChange={(e) => setTokenSymbol(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Supply</label>
                        <input 
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-1 focus:border-blue-500 outline-none text-lg"
                          placeholder="1M"
                          onChange={(e) => setTokenSupply(e.target.value)}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleDeployToken}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-green-900/20 active:scale-98 transition-all"
                    >
                      🚀 Deploy Token
                    </button>
                  </div>
                </div>
              )}

              {/* --- NFT TAB --- */}
              {activeTab === 'nft' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                      <Layers size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">NFT Collection</h2>
                      <p className="text-gray-400">Deploy ERC-1155 collections.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1 flex items-center gap-2">
                           <LinkIcon size={12} /> Metadata URI (IPFS)
                        </label>
                        <input 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-1 focus:border-blue-500 outline-none font-mono text-sm text-blue-300"
                          placeholder="ipfs://QmYourMetadataCID..."
                          onChange={(e) => setCollectionUri(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Collection Name</label>
                        <input 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-1 focus:border-blue-500 outline-none text-lg"
                          placeholder="e.g. Base Art"
                          onChange={(e) => setCollectionName(e.target.value)}
                        />
                      </div>

                      <button 
                        onClick={handleDeployNFT}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-purple-900/20 active:scale-98 transition-all"
                      >
                        🎨 Create Collection
                      </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

          {/* RIGHT: VIP Pass */}
          <div className="md:col-span-4">
            <div className="sticky top-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-gray-900 ring-1 ring-white/10 rounded-3xl p-8 overflow-hidden">
                  
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                    LIMITED
                  </div>

                  <div className="flex flex-col items-center text-center">
                    
                    {/* VIP Image - FIXED (Using standard img tag) */}
                    <div className="w-32 h-32 rounded-full mb-6 overflow-hidden border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-black relative">
                       <img 
                          src="/vip-logo.png" 
                          alt="VIP"
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                             e.currentTarget.style.display = 'none'; 
                             // Show fallback if this fails
                             const sibling = e.currentTarget.nextElementSibling;
                             if(sibling) (sibling as HTMLElement).style.display = 'flex';
                          }}
                       />
                       {/* Fallback Icon */}
                       <div className="absolute inset-0 hidden items-center justify-center -z-10 text-4xl bg-black w-full h-full">👑</div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Base VIP Pass</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                      Mint the exclusive VIP badge to prove you were here early. Only 100,000 exist.
                    </p>

                    <div className="w-full bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Price</span>
                        <span className="text-white font-mono font-bold">0.00001 ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network</span>
                        <span className="text-blue-400">Base Mainnet</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleMintVIP}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-900/20"
                    >
                      Mint VIP Pass ✨
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {(isPending || isConfirmed || error) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 right-6 z-50 max-w-md w-full"
          >
            {isPending && (
              <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <div className="font-medium">Confirming transaction...</div>
              </div>
            )}
            {isConfirmed && (
              <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-400">
                <CheckCircle2 size={24} />
                <div className="font-medium">Transaction Successful!</div>
              </div>
            )}
            {error && (
              <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400">
                <div className="font-bold mb-1">Error</div>
                <div className="text-sm opacity-90">{(error as any).shortMessage || error.message.slice(0, 100)}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}