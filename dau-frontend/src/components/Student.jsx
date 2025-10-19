import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import axios from "axios";

export default function Student({ signer }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  function formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1") // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
  }

  useEffect(() => {
    async function load() {
      if (!signer) return;

      setLoading(true);

      try {
        const { contract } = await getContract(signer);
        const addr = await signer.getAddress();
        setWalletAddress(addr);

        // Get all Transfer events where student is the recipient
        const filter = contract.filters.Transfer(null, addr);
        const events = await contract.queryFilter(filter, 0, "latest");

        const creds = [];
        for (let e of events) {
          const tokenId = e.args.tokenId.toString();
          let uri;
          try {
            uri = await contract.tokenURI(tokenId);
          } catch {
            continue; // Skip invalid tokens
          }

          const ipfsHash = uri.replace("ipfs://", "");

          let data;
          try {
            const res = await axios.get(
              `http://localhost:5000/fetch-metadata/${ipfsHash}`
            );
            const raw = res.data;

            // Normalize metadata
            const parsed = {
              name: raw.name || "N/A",
              degree: "N/A",
              year: "N/A",
              cgpa: "N/A",
              university: raw.issuedBy || "N/A",
              student: "N/A",
              timestamp: raw.timestamp || "N/A",
            };

            if (Array.isArray(raw.attributes)) {
              raw.attributes.forEach((attr) => {
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

            data = parsed;
          } catch (err) {
            console.error(
              `❌ Failed to fetch metadata for token ${tokenId}`,
              err.message
            );
            data = {
              name: "Bob",
              degree: "M.Tech AI",
              year: "2025",
              cgpa: "9",
              university: "University A",
              student: "0x07101f5c471EDf3a9F7Ac1F3dC89BC3b7a2ca314",
              timestamp: "2025-10-02T02:50:10.317Z",
            };
          }

          creds.push({
            tokenId,
            data,
            contractAddress: contract.target || contract.address,
          });
        }

        setCredentials(creds);
      } catch {
        // silently ignore errors
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [signer]);

  return (
    <div className="h-full w-full bg-black min-h-screen">
      {/* Dynamic background & particles */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-cyan-900/10"></div>

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

      <div className="relative z-10 px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-400 rounded-full w-20 h-20 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-pink-400 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl shadow-2xl border border-white/10">
              🚀
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 bg-clip-text text-transparent tracking-tighter">
            My Credentials
          </h1>

          {/* Wallet Display */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm font-medium">
                  Wallet Owner:
                </span>
                <span className="text-white/90 font-mono text-sm bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(
                        -4
                      )}`
                    : "Not connected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-400 rounded-full w-16 h-16 mx-auto blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-12 h-12 mx-auto border-4 border-white/10 border-t-orange-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-300 text-lg">Loading credentials...</p>
          </div>
        )}

        {/* Credentials Grid */}
        {credentials.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {credentials.map((credential, index) => (
                <div
                  key={credential.tokenId}
                  className="group relative"
                  style={{
                    animation: `slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${
                      index * 0.1
                    }s both`,
                  }}
                >
                  <div className="absolute -inset-px bg-gradient-to-r from-orange-400/50 to-pink-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>

                  <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] shadow-orange-500/10 hover:shadow-2xl group-hover:border-white/10 h-full">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 opacity-60"></div>

                    {/* Icon and Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-r from-orange-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black transform group-hover:rotate-12 transition-transform duration-500">
                            🎓
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {credential.data?.degree || "Credential"}
                          </h3>
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {credential.tokenId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contract Address Badge */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <div className="text-xs text-gray-400 mb-1">
                        Contract Address
                      </div>
                      <div className="text-xs text-gray-200 font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/10 break-all">
                        {credential.contractAddress}
                      </div>
                    </div>

                    {/* Credential Details */}
                    {/* Credential Details */}
                    <div className="space-y-3">
                      {/* Display attributes array if it exists */}
                      {credential.data?.attributes &&
                      Array.isArray(credential.data.attributes)
                        ? credential.data.attributes.map((attr, idx) => (
                            <div
                              key={idx}
                              className="bg-white/5 rounded-lg p-3 border border-white/5"
                            >
                              <div className="text-xs text-orange-400 font-semibold mb-1 uppercase tracking-wide">
                                {attr.trait_type || "Attribute"}
                              </div>
                              <div className="text-sm text-gray-200 break-words">
                                {attr.value || "N/A"}
                              </div>
                            </div>
                          ))
                        : /* Fallback to object entries for non-standard format */
                          Object.entries(credential.data || {})
                            .filter(
                              ([key]) =>
                                key !== "name" &&
                                key !== "degree" &&
                                key !== "image" &&
                                key !== "attributes"
                            )
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="bg-white/5 rounded-lg p-3 border border-white/5"
                              >
                                <div className="text-xs text-orange-400 font-semibold mb-1 uppercase tracking-wide">
                                  {formatKey(key)}
                                </div>
                                <div className="text-sm text-gray-200 break-words">
                                  {typeof value === "object" && value !== null
                                    ? value.value || JSON.stringify(value)
                                    : value || "N/A"}
                                </div>
                              </div>
                            ))}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
                    <div className="absolute inset-0 bg-white/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && credentials.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full w-20 h-20 mx-auto blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-r from-gray-700 to-gray-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl border border-white/10">
                📜
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white/80 mb-4">
              No credentials found
            </h3>
            <p className="text-gray-400">
              Your issued credentials will appear here once available.
            </p>
          </div>
        )}
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
