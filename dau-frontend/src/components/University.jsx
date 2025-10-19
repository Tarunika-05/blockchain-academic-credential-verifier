import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

export default function University({ signer }) {
  const [contract, setContract] = useState(null);
  const [myProposals, setMyProposals] = useState([]);
  const [otherProposals, setOtherProposals] = useState([]);
  const [threshold, setThreshold] = useState(2);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("propose");

  // Form fields
  const [studentAddr, setStudentAddr] = useState("");
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [university, setUniversity] = useState("");

  const [error, setError] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [notification, setNotification] = useState("");

  // Track which proposals the current user has voted on
  const [votedProposals, setVotedProposals] = useState(new Set());

  // Helper function to fetch metadata
  const fetchMetadata = async (ipfsUri) => {
    const hash = ipfsUri.replace("ipfs://", "");
    try {
      const response = await axios.get(
        `http://localhost:5000/fetch-metadata/${hash}`
      );
      return response.data;
    } catch (err) {
      console.error("Proxy fetch failed:", err.message);
      throw new Error("Metadata fetch failed");
    }
  };

  const parseMetadata = (data) => {
    const metadata = {
      name:
        data.attributes?.find((a) => a.trait_type === "Issued To")?.value || "",
      degree:
        data.attributes?.find((a) => a.trait_type === "Degree")?.value || "",
      year: data.attributes?.find((a) => a.trait_type === "Year")?.value || "",
      cgpa: data.attributes?.find((a) => a.trait_type === "CGPA")?.value || "",
      university:
        data.issuedBy ||
        data.attributes?.find((a) => a.trait_type === "University")?.value ||
        "",
      student:
        data.attributes?.find((a) => a.trait_type === "Student Address")
          ?.value || "",
      description: data.description || "",
      image: data.image || "",
    };
    return metadata;
  };

  useEffect(() => {
    if (!signer) return;

    const initContract = async () => {
      const res = await axios.get("http://localhost:5000/contract-info");
      const { address, abi } = res.data;
      const contractInstance = new ethers.Contract(address, abi, signer);
      setContract(contractInstance);

      const addr = await signer.getAddress();
      setSignerAddress(addr);
    };

    initContract();
  }, [signer]);

  // Load all proposals + event listener
  useEffect(() => {
    if (!contract || !signerAddress) return;

    const loadAllProposals = async () => {
      try {
        setLoading(true);

        const countBN = await contract.proposalCount();
        const count = Number(countBN);

        const my = [];
        const others = [];
        const voted = new Set();

        for (let i = 1; i <= count; i++) {
          const p = await contract.getProposalInfo(i);

          try {
            const hasVoted = await contract.hasVoted(i, signerAddress);
            if (hasVoted) voted.add(i);
          } catch (err) {
            console.warn(`Could not check vote status for proposal ${i}`);
          }

          let metadata = {
            name: "N/A",
            degree: "N/A",
            year: "N/A",
            cgpa: "N/A",
            university: "N/A",
            student: "N/A",
          };
          try {
            const rawMetadata = await fetchMetadata(p.metadataURI);
            metadata = parseMetadata(rawMetadata);
          } catch (err) {
            console.error(
              `Failed to fetch metadata for proposal ${p.id}:`,
              err
            );
          }

          const proposalObj = {
            id: Number(p.id),
            proposer: p.proposer,
            student: p.student,
            approvals: Number(p.approvals),
            rejections: Number(p.rejections),
            minted: p.minted,
            metadata,
          };

          if (p.proposer.toLowerCase() === signerAddress.toLowerCase())
            my.push(proposalObj);
          else if (!p.minted) others.push(proposalObj);
        }

        setMyProposals(my);
        setOtherProposals(others);
        setVotedProposals(voted);
      } catch (err) {
        console.error("Failed to load proposals:", err);
        setError("Failed to load proposals.");
      } finally {
        setLoading(false);
      }
    };

    loadAllProposals();

    // Incremental update via event listener
    const handleVote = (proposalId, voter, approved) => {
      const id = Number(proposalId);

      const updateProposal = (arr) =>
        arr.map((p) =>
          p.id === id
            ? {
                ...p,
                approvals: approved ? p.approvals + 1 : p.approvals,
                rejections: !approved ? p.rejections + 1 : p.rejections,
              }
            : p
        );

      setMyProposals((prev) => updateProposal(prev));
      setOtherProposals((prev) => updateProposal(prev));
      setVotedProposals((prev) => new Set([...prev, id]));
    };

    contract.on("CredentialVoted", handleVote);

    return () => {
      contract.off("CredentialVoted", handleVote);
    };
  }, [contract, signerAddress]);

  const handlePropose = async () => {
    if (!studentAddr || !name || !degree || !year || !cgpa || !university) {
      alert("Fill all fields before submitting!");
      return;
    }

    try {
      setLoading(true);

      const metadata = {
        name,
        degree,
        year,
        cgpa,
        student: studentAddr,
        university,
      };

      const res = await axios.post(
        "http://localhost:5000/upload-metadata",
        metadata
      );
      const metadataURI = `ipfs://${res.data.ipfsHash}`;

      try {
        await fetchMetadata(metadataURI);
      } catch {
        console.warn("Could not immediately verify metadata, continuing...");
      }

      const tx = await contract.proposeCredential(studentAddr, metadataURI);
      await tx.wait();

      setNotification("Proposal successfully submitted!");
      setTimeout(() => setNotification(""), 3000);

      // Clear form
      setStudentAddr("");
      setName("");
      setDegree("");
      setYear("");
      setCgpa("");
      setUniversity("");
    } catch (err) {
      console.error("Error submitting proposal:", err);
      alert("Failed to submit proposal. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const vote = async (proposalId, approve) => {
    try {
      setLoading(true);
      const tx = await contract.voteOnCredential(proposalId, approve);
      await tx.wait();

      // Incremental update handled by event listener
      setVotedProposals((prev) => new Set([...prev, proposalId]));
    } catch (err) {
      console.error("Error voting:", err);
      alert("Failed to vote. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const mint = async (proposalId) => {
    try {
      setLoading(true);
      const tx = await contract.mintCredential(proposalId);
      await tx.wait();

      // Update state to mark this proposal as minted
      setMyProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, minted: true } // mark minted
            : p
        )
      );

      setNotification("Credential minted successfully!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error("Error minting:", err);
      alert("Failed to mint credential. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "propose", label: "Propose Credential", icon: "📝" },
    { id: "myProposals", label: "My Proposals", icon: "📋" },
    { id: "review", label: "Review Proposals", icon: "⚖️" },
  ];

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-emerald-400/20">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✓</span>
              <span className="font-semibold">{notification}</span>
            </div>
          </div>
        </div>
      )}

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
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full w-20 h-20 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-400 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl shadow-2xl border border-white/10">
              🏛️
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
            Institution Dashboard
          </h1>

          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-6 tracking-wide">
              Academic Credential Management
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          </div>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mt-8 font-light">
            Propose, Review, and Issue Blockchain-Verified Academic Credentials
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl shadow-blue-500/25"
                    : "bg-black/50 text-gray-300 hover:bg-black/70 border border-white/10"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === "propose" && (
            <div className="group relative animate-fade-in-up">
              <div className="absolute -inset-px bg-gradient-to-r from-blue-400/50 to-indigo-400/50 rounded-2xl opacity-60 blur-sm"></div>

              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400 to-indigo-400 opacity-60"></div>

                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent text-center">
                  Propose New Credential
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Student Wallet Address
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={studentAddr}
                        onChange={(e) => setStudentAddr(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Student Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Degree/Certificate
                      </label>
                      <input
                        type="text"
                        placeholder="Bachelor of Computer Science"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Grade/GPA
                      </label>
                      <input
                        type="text"
                        placeholder="A+ / 3.8"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        University Name
                      </label>
                      <input
                        type="text"
                        placeholder="My University"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handlePropose}
                      disabled={loading}
                      className="relative bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? "Submitting..." : "Submit Proposal"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "myProposals" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  My Proposals
                </h3>
                <p className="text-gray-400 mt-2">
                  Track your credential proposals
                </p>
              </div>

              {loading && myProposals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading proposals...</p>
                </div>
              ) : myProposals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-400 text-lg">No proposals yet</p>
                  <button
                    onClick={() => setActiveTab("propose")}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-xl hover:from-blue-400 hover:to-indigo-400 transition-all duration-300"
                  >
                    Create First Proposal
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {myProposals.map((p) => (
                    <div key={p.id} className="group relative">
                      <div className="absolute -inset-px bg-gradient-to-r from-emerald-400/50 to-teal-400/50 rounded-2xl opacity-40 group-hover:opacity-60 blur-sm transition-opacity duration-300"></div>

                      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                              #{p.id}
                            </div>
                            <span className="text-white font-semibold">
                              Proposal ID: {p.id}
                            </span>
                          </div>
                          {p.minted && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                              ✓ Minted
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Student
                            </label>
                            <p className="text-white text-sm font-mono break-all">
                              {p.student}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Name
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.name?.split(" - ").pop() || "N/A"}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Degree
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.degree || "N/A"}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Year & Grade
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.year || "N/A"} -{" "}
                              {p.metadata?.cgpa || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <div className="text-center">
                              <div className="text-emerald-400 text-xl font-bold">
                                {p.approvals}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Approvals
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-400 text-xl font-bold">
                                {p.rejections}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Rejections
                              </div>
                            </div>
                          </div>

                          {!p.minted &&
                          p.approvals >= threshold &&
                          p.approvals > p.rejections ? (
                            <button
                              onClick={() => mint(p.id)}
                              disabled={loading}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? "Minting..." : "Mint Credential"}
                            </button>
                          ) : !p.minted ? (
                            <span className="text-gray-400 text-sm">
                              Waiting for votes...
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Review Proposals
                </h3>
                <p className="text-gray-400 mt-2">
                  Vote on other institutions' proposals
                </p>
              </div>

              {loading && otherProposals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading proposals...</p>
                </div>
              ) : otherProposals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚖️</div>
                  <p className="text-gray-400 text-lg">
                    No proposals to review
                  </p>
                </div>
              ) : (
                otherProposals.map((p) => {
                  const hasVoted = votedProposals.has(p.id);

                  return (
                    <div key={p.id} className="group relative">
                      <div className="absolute -inset-px bg-gradient-to-r from-violet-400/50 to-purple-400/50 rounded-2xl opacity-40 group-hover:opacity-60 blur-sm transition-opacity duration-300"></div>

                      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-violet-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                              #{p.id}
                            </div>
                            <span className="text-white font-semibold">
                              Proposal ID: {p.id}
                            </span>
                          </div>
                          {hasVoted && (
                            <span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full text-sm font-medium">
                              ✓ Voted
                            </span>
                          )}
                        </div>

                        <div className="mb-4 bg-black/30 rounded-xl p-3 border border-white/5">
                          <label className="text-gray-400 text-xs">
                            Proposed By
                          </label>
                          <p className="text-white text-sm font-mono break-all">
                            {p.proposer}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Student
                            </label>
                            <p className="text-white text-sm font-mono break-all">
                              {p.student}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Name
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.name || "N/A"}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Degree
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.degree || "N/A"}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <label className="text-gray-400 text-xs">
                              Year & GPA
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.year || "N/A"} -{" "}
                              {p.metadata?.cgpa || "N/A"}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 border border-white/5 md:col-span-2">
                            <label className="text-gray-400 text-xs">
                              University
                            </label>
                            <p className="text-white font-medium">
                              {p.metadata?.university || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => vote(p.id, true)}
                            disabled={hasVoted || loading}
                            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <span className="mr-1">✓</span>{" "}
                            {hasVoted ? "Approved" : "Approve"}
                          </button>
                          <button
                            onClick={() => vote(p.id, false)}
                            disabled={hasVoted || loading}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <span className="mr-1">✗</span>{" "}
                            {hasVoted ? "Rejected" : "Reject"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="mt-16 text-center animate-fade-in-delay">
          <div className="flex items-center justify-center space-x-6 mb-4">
            {[
              "Decentralized Governance",
              "Peer Review System",
              "Blockchain Secured",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-400"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Collaborative credential verification by academic institutions
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
