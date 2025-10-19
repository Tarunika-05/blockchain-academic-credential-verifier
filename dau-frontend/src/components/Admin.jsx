import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Admin({ signer }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [uniAddr, setUniAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [stats, setStats] = useState({ totalUnis: 0, totalCerts: 0 });

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("http://localhost:5000/contract-info");
        const { address, abi } = await res.json();
        const ctr = new ethers.Contract(address, abi, signer);
        setContract(ctr);

        const addr = await signer.getAddress();
        let adminStatus = false;

        try {
          // Try calling owner(), fallback if it doesn't exist
          const ownerAddr = await ctr.owner();
          adminStatus = addr.toLowerCase() === ownerAddr.toLowerCase();
        } catch (err) {
          console.warn("owner() not available, skipping admin check", err);
          adminStatus = false; // fallback to false
        }

        setIsAdmin(adminStatus);

        // Optionally load other stats here if needed
      } catch (err) {
        alert("❌ Failed to load contract or check role: " + err.message);
      }
    }

    if (signer) init();
  }, [signer]);

  if (!isAdmin) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        {/* Dynamic animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-900/20 via-black to-orange-900/20"></div>
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-400 rounded-full w-24 h-24 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-orange-400 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl shadow-2xl border border-white/10">
              🚫
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
            Access Denied
          </h2>
          <p className="text-gray-300 text-lg">
            You are not authorized as Admin
          </p>
        </div>
      </div>
    );
  }

  async function addUniversity() {
    if (!contract || !uniAddr) return;

    if (!ethers.isAddress(uniAddr)) {
      alert("❌ Invalid Ethereum address!");
      return;
    }

    try {
      const exists = await contract.isUniversity(uniAddr);
      if (exists) {
        alert("❌ University already added!");
        return;
      }

      setLoading(true);
      const tx = await contract.addUniversity(uniAddr);
      await tx.wait();
      alert("✅ University added successfully!");
      setUniAddr("");
      // Refresh stats or university list here if needed
    } catch (err) {
      alert("❌ " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full bg-black relative overflow-hidden">
      {/* Dynamic animated background matching landing */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/20 via-black to-teal-900/20"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-green-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-transparent to-teal-900/10"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
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
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full w-24 h-24 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-400 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl shadow-2xl border border-white/10">
              ⚡
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent tracking-tighter">
            Admin
          </h1>

          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-4 tracking-wide">
              Platform Control Center
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
          </div>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mt-6 font-light">
            Orchestrate the ecosystem with full administrative control
          </p>
        </div>

        {/* Main Action Card */}
        <div className="max-w-2xl mx-auto">
          <div
            className="group relative animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-emerald-400/50 to-teal-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-500">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60"></div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Add University
                </h3>
                <p className="text-gray-300">
                  Authorize new institutions to issue blockchain-verified
                  credentials
                </p>
              </div>

              <div className="space-y-6">
                {/* Input field with modern styling */}
                <div className="relative">
                  <input
                    type="text"
                    value={uniAddr}
                    onChange={(e) => setUniAddr(e.target.value)}
                    placeholder="Enter University Ethereum Address (0x...)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all duration-300 text-lg"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                </div>

                {/* Action button */}
                <button
                  onClick={addUniversity}
                  disabled={loading || !uniAddr}
                  className="w-full relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading && (
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className={loading ? "ml-8" : ""}>
                    {loading ? "Adding University..." : "Add University"}
                  </span>
                </button>
              </div>

              {/* Bottom highlight */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center animate-fade-in-delay">
          <div className="flex items-center justify-center space-x-8 mb-4">
            {[
              "Secure Governance",
              "Blockchain Verified",
              "Decentralized Control",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-400"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Administrative powers for the future of decentralized education
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

        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fade-in-delay {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }
      `}</style>
    </div>
  );
}
