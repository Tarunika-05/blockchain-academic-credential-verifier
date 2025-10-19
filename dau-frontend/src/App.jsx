import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import WalletConnect from "./components/WalletConnect";
import Landing from "./components/Landing";
import Admin from "./components/Admin";
import University from "./components/University";
import Student from "./components/Student";
import Verifier from "./components/Verifier";

export default function App() {
  const [route, setRoute] = useState(() => {
    return window.location.hash.slice(1) || "/";
  });
  const [role, setRole] = useState(
    () => sessionStorage.getItem("role") || null
  );
  const [signer, setSigner] = useState(null);
  const [isRestoringWallet, setIsRestoringWallet] = useState(false);

  const requiresWallet =
    role === "admin" || role === "uni" || role === "student";

  // Restore wallet connection on page load
  useEffect(() => {
    const restoreWallet = async () => {
      const savedAddress = sessionStorage.getItem("walletAddress");
      if (requiresWallet && !signer && savedAddress) {
        setIsRestoringWallet(true);
        try {
          if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
              // Compare addresses
              if (
                accounts[0].address.toLowerCase() === savedAddress.toLowerCase()
              ) {
                const restoredSigner = await provider.getSigner();
                setSigner(restoredSigner);
                console.log("Wallet restored successfully");
              } else {
                console.warn(
                  "Saved wallet address does not match connected wallet"
                );
              }
            } else {
              // No accounts connected yet — don't clear storage
              console.log("No wallet connected, please connect manually");
            }
          }
        } catch (error) {
          console.error("Failed to restore wallet:", error);
        } finally {
          setIsRestoringWallet(false);
        }
      }
    };

    restoreWallet();
  }, [role, requiresWallet, signer]);

  // Save wallet address when signer changes
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (signer) {
        try {
          const address = await signer.getAddress();
          sessionStorage.setItem("walletAddress", address);
        } catch (error) {
          console.error("Failed to save wallet address:", error);
        }
      }
    };

    saveWalletAddress();
  }, [signer]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Persist role in session storage
  useEffect(() => {
    if (role) {
      sessionStorage.setItem("role", role);
    } else {
      sessionStorage.removeItem("role");
    }
  }, [role]);

  // Navigate based on role changes
  useEffect(() => {
    if (role) {
      navigate(`/${role}`);
    } else {
      navigate("/");
    }
  }, [role]);

  // Custom navigate function
  const navigate = (path) => {
    window.location.hash = path;
    setRoute(path);
  };

  // Reset role and wallet - DISCONNECTS WALLET
  const resetRole = () => {
    setRole(null);
    setSigner(null);
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("walletAddress"); // Clear saved wallet
    navigate("/");
  };

  // Protected route logic
  const renderRoute = () => {
    // Landing page
    if (route === "/") {
      return <Landing setRole={setRole} />;
    }

    // Admin route
    if (route === "/admin") {
      if (!role || role !== "admin") {
        navigate("/");
        return null;
      }
      if (!signer) {
        if (isRestoringWallet) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Restoring wallet connection...</p>
              </div>
            </div>
          );
        }
        return <WalletConnect setSigner={setSigner} />;
      }
      return <Admin signer={signer} />;
    }

    // University route
    if (route === "/uni") {
      if (!role || role !== "uni") {
        navigate("/");
        return null;
      }
      if (!signer) {
        if (isRestoringWallet) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Restoring wallet connection...</p>
              </div>
            </div>
          );
        }
        return <WalletConnect setSigner={setSigner} />;
      }
      return <University signer={signer} />;
    }

    // Student route
    if (route === "/student") {
      if (!role || role !== "student") {
        navigate("/");
        return null;
      }
      if (!signer) {
        if (isRestoringWallet) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Restoring wallet connection...</p>
              </div>
            </div>
          );
        }
        return <WalletConnect setSigner={setSigner} />;
      }
      return <Student signer={signer} />;
    }

    // Verifier route
    if (route === "/verifier") {
      if (!role || role !== "verifier") {
        navigate("/");
        return null;
      }
      return <Verifier />;
    }

    // 404 - redirect to home
    navigate("/");
    return null;
  };

  // Logout function - DISCONNECTS WALLET
  const logout = () => {
    setSigner(null);
    setRole(null);
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("walletAddress"); // Clear saved wallet
    navigate("/");
  };

  // Check if we're on landing page
  const isLandingPage = route === "/";

  // Role-specific gradient styles
  const roleStyles = {
    admin:
      "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    uni: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
    student:
      "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
    verifier:
      "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600",
  };

  return (
    <div
      className={
        isLandingPage
          ? ""
          : "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"
      }
    >
      {/* Navigation Buttons - Only show when NOT on landing page */}
      {role && !isLandingPage && (
        <div className="p-4 flex gap-3 bg-black/50 backdrop-blur-sm border-b border-white/5">
          <button
            onClick={resetRole}
            className="px-5 py-2.5 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium border border-white/10 hover:border-white/20"
          >
            ← Change Role
          </button>

          {signer && (
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium border border-red-500/20 hover:border-red-400/30"
            >
              Disconnect Wallet
            </button>
          )}

          {/* Role Badge */}
          <div
            className={`ml-auto px-4 py-2.5 ${roleStyles[role]} rounded-lg font-semibold text-white shadow-lg flex items-center gap-2`}
          >
            {role === "admin" && "⚡"}
            {role === "uni" && "🏛️"}
            {role === "student" && "🚀"}
            {role === "verifier" && "💎"}
            <span className="capitalize">
              {role === "uni" ? "Institution" : role}
            </span>
          </div>
        </div>
      )}

      <div className={isLandingPage ? "" : "p-4"}>{renderRoute()}</div>
    </div>
  );
}
