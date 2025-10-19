import { useState } from "react";
import { connectWallet } from "../utils/contract";

export default function WalletConnect({ setSigner }) {
  const [address, setAddress] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    try {
      setConnecting(true);
      const { signer, accounts } = await connectWallet();
      setAllAccounts(accounts);
      setAddress(accounts[0]);
      setSigner(signer);
    } catch (err) {
      alert(err.message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setAllAccounts([]);
    setSigner(null);
  }

  if (address) {
    // Connected State - Full Dashboard Experience
    return (
      <div className="h-full w-full bg-black relative overflow-hidden">
        {/* Dynamic animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20"></div>
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 min-h-screen px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-400 rounded-full w-24 h-24 mx-auto blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-400 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl shadow-2xl border border-white/10">
                🔗
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">
              Connected
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Wallet successfully linked to DAU ecosystem
            </p>
          </div>

          {/* Main Connection Card */}
          <div className="max-w-lg mx-auto mb-12">
            <div
              className="group relative animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute -inset-px bg-gradient-to-r from-green-400/50 to-emerald-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>

              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-400 to-emerald-400 opacity-60"></div>

                {/* Connection Status */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-60"></div>
                  </div>
                  <span className="ml-3 text-green-400 font-semibold">
                    Active Connection
                  </span>
                </div>

                {/* Wallet Info */}
                <div className="text-center mb-8">
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-gray-400 text-sm mb-1">
                          Wallet Address
                        </p>
                        <p className="text-white font-mono text-lg">
                          {address.slice(0, 8)}...{address.slice(-6)}
                        </p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(address)}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors duration-200 border border-white/10"
                        title="Copy full address"
                      >
                        <span className="text-xl">📋</span>
                      </button>
                    </div>
                  </div>

                  {/* Multiple Accounts */}
                  {allAccounts.length > 1 && (
                    <div className="mb-6">
                      <label className="text-gray-400 text-sm mb-2 block">
                        Switch Account
                      </label>
                      <select
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      >
                        {allAccounts.map((acc, i) => (
                          <option key={i} value={acc} className="bg-gray-800">
                            Account {i + 1}: {acc.slice(0, 8)}...{acc.slice(-6)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-400 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/25"
                >
                  Disconnect Wallet
                </button>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "🛡️", title: "Secure", desc: "End-to-end encryption" },
              { icon: "⚡", title: "Fast", desc: "Instant transactions" },
              { icon: "🌐", title: "Global", desc: "Worldwide access" },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{
                  animation: `slideInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${
                    0.4 + index * 0.1
                  }s both`,
                }}
              >
                <div className="absolute -inset-px bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all duration-300 text-center">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Connection State - Full Immersive Experience
  return (
    <div className="h-full w-full bg-black relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-cyan-900/10"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 border border-violet-400/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/3 right-1/5 w-24 h-24 border border-cyan-400/20 rotate-45 animate-pulse"></div>
        <div className="absolute top-2/3 left-2/3 w-20 h-20 border border-pink-400/20 rounded-lg animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          {/* Glowing logo container */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full w-32 h-32 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-violet-500 to-cyan-400 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl shadow-2xl border border-white/10">
              🔗
            </div>
          </div>

          <h1 className="text-8xl md:text-9xl font-black mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            Connect
          </h1>

          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-bold text-white/90 mb-6 tracking-wide">
              Web3 Wallet Integration
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-8 font-light">
            Securely connect your wallet to access the decentralized university
            ecosystem
          </p>
        </div>

        {/* Main Connection Card */}
        <div className="w-full max-w-md mb-16">
          <div
            className="group relative animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-violet-400/50 to-cyan-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-500 hover:scale-[1.02]">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-400 to-cyan-400 opacity-60"></div>

              <div className="text-center mb-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold text-black transform group-hover:rotate-12 transition-transform duration-500">
                    🚀
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Ready to Launch
                </h3>
                <p className="text-gray-300 text-sm">
                  Connect your MetaMask or compatible Web3 wallet to begin
                </p>
              </div>

              {/* Connection Button */}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full relative bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {connecting && (
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={connecting ? "ml-8" : ""}>
                  {connecting ? "Connecting Wallet..." : "Connect Wallet"}
                </span>
              </button>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: "🔒", label: "Secure" },
                    { icon: "⚡", label: "Fast" },
                    { icon: "🌐", label: "Global" },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center animate-fade-in-delay">
          <div className="flex items-center justify-center space-x-8 mb-4">
            {["Blockchain Secured", "Privacy First", "Decentralized"].map(
              (feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-gray-400"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              )
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Your gateway to decentralized education awaits
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fade-in-delay {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
