import { useState, useEffect } from "react";
import { ethers } from "ethers"; // ✅ make sure ethers is imported

import axios from "axios"; // Make sure this is at top
export default function Verifier() {
  const [tokenId, setTokenId] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  function formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1") // add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
  }

  // ✅ Load contract from backend (no wallet needed)
  useEffect(() => {
    async function loadContract() {
      const res = await fetch("http://localhost:5000/contract-info");
      const data = await res.json();
      console.log("Contract info from backend:", data);

      try {
        const res = await fetch("http://localhost:5000/contract-info");
        const { address, abi } = await res.json();

        // Use plain JsonRpcProvider (no MetaMask popup for recruiters)
        const rpcUrl = "http://127.0.0.1:7545";
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const realContract = new ethers.Contract(address, abi, provider);
        setContract(realContract);
      } catch (err) {
        console.error(err);
        setError("❌ Failed to load contract info");
      }
    }
    loadContract();
  }, []);

  async function verify() {
    if (!contract) return setError("❌ Contract not loaded");
    if (!tokenId) return setError("❌ Please enter a Token ID");

    setLoading(true);
    setError(null);

    try {
      const owner = await contract.ownerOf(tokenId);
      let uri = await contract.tokenURI(tokenId);
      uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");

      let data;
      try {
        const res = await axios.get(uri);
        data = res.data;
      } catch {
        data = {
          name: "Unknown",
          degree: "Unknown",
          issuedBy: "Unknown",
          timestamp: "Unknown",
        };
      }

      const parsed = {
        name: data.name || "N/A",
        degree: "N/A",
        year: "N/A",
        cgpa: "N/A",
        university: data.issuedBy || "N/A",
        student: "N/A",
        timestamp: data.timestamp || "N/A",
      };

      if (Array.isArray(data.attributes)) {
        data.attributes.forEach((attr) => {
          switch (attr.trait_type) {
            case "Degree":
              parsed.degree = attr.value;
              break;
            case "Year":
              parsed.year = attr.value;
              break;
            case "CGPA":
              parsed.cgpa = attr.value;
              break;
            case "Issued To":
              parsed.name = attr.value;
              break;
            case "Student Address":
              parsed.student = attr.value;
              break;
            case "University":
              parsed.university = attr.value;
              break;
          }
        });
      }

      setInfo({ owner, data: parsed });
    } catch (err) {
      console.error(err);
      setError("❌ " + (err?.message || "Verification failed"));
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-cyan-900/10"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
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

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full w-20 h-20 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-violet-500 to-cyan-400 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl shadow-2xl border border-white/10">
              💎
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            Verifier Dashboard
          </h1>

          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-6 tracking-wide">
              Credential Verification System
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
          </div>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mt-8 font-light">
            Verify Academic Credentials with Blockchain Security
          </p>
        </div>

        {/* Main Verification Card */}
        <div className="w-full max-w-4xl">
          <div className="group relative mb-8">
            {/* Glowing border effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-violet-400/50 to-purple-400/50 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>

            {/* Main verification card */}
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 transition-all duration-500 hover:border-white/10">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 opacity-60"></div>

              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-center">
                Enter Token ID for Verification
              </h3>

              {/* Input Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <input
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 transition-all duration-300"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter Token ID (e.g., 12345)"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-purple-400/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                <button
                  onClick={verify}
                  disabled={loading || !contract}
                  className="relative bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Credential"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Card */}
          {error && (
            <div className="group relative animate-fade-in-up">
              {/* Glowing red border effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-red-400/50 to-orange-400/50 rounded-2xl opacity-60 blur-sm"></div>

              {/* Error content */}
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-red-400 to-orange-400 opacity-60"></div>

                <div className="flex items-center mb-4">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full w-12 h-12 blur-lg opacity-60"></div>
                    <div className="relative bg-gradient-to-r from-red-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black">
                      ✕
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Verification Failed
                  </h3>
                </div>

                <div className="bg-black/30 rounded-xl p-6 border border-red-400/20">
                  <p className="text-gray-400 text-sm mt-3">
                    Please check the Token ID and try again.
                  </p>
                </div>

                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 opacity-60 rounded-b-2xl"></div>
              </div>
            </div>
          )}

          {/* Results Card */}
          {info && (
            <div className="group relative animate-fade-in-up">
              {/* Glowing border effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-400/50 to-teal-400/50 rounded-2xl opacity-60 blur-sm"></div>

              {/* Results content */}
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60"></div>

                <div className="flex items-center mb-6">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-12 h-12 blur-lg opacity-60"></div>
                    <div className="relative bg-gradient-to-r from-emerald-400 to-teal-400 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black">
                      ✓
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Verification Successful
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(info.data).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-black/30 rounded-xl p-4 border border-white/5"
                    >
                      <label className="text-gray-400 text-sm font-medium">
                        {formatKey(key)}
                      </label>
                      <p className="text-white font-semibold text-lg mt-1">
                        {value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60 rounded-b-2xl"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in-delay">
          <div className="flex items-center justify-center space-x-6 mb-4">
            {["Blockchain Verified", "Tamper Proof", "Instant Results"].map(
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
            Secure credential verification powered by blockchain technology
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
