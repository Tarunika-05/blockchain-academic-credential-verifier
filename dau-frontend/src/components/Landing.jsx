export default function Landing({ setRole }) {
  return (
    <div className="h-full w-full bg-black">
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
        {Array.from({ length: 20 }).map((_, i) => (
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          {/* Glowing logo container */}
          <div className="relative mb-8 mt-10">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full w-32 h-32 mx-auto blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-violet-500 to-cyan-400 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl shadow-2xl border border-white/10">
              🎓
            </div>
          </div>

          <h1 className="text-8xl md:text-9xl font-black mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            DAU
          </h1>

          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-bold text-white/90 mb-6 tracking-wide">
              Decentralized Autonomous University
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-8 font-light">
            NFT - Based Academic Credential System
          </p>
        </div>

        {/* Enhanced Role Selection */}
        <div className="w-full max-w-7xl">
          <h3 className="text-2xl font-semibold text-center text-white/80 mb-8">
            Choose Your Path
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              {
                role: "admin",
                title: "Platform Admin",
                description:
                  "Orchestrate the ecosystem with full administrative control and governance oversight",
                icon: "⚡",
                gradient: "from-emerald-400 via-teal-400 to-green-400",
                shadowColor: "shadow-emerald-500/25",
                borderGradient: "from-emerald-400/50 to-teal-400/50",
              },
              {
                role: "uni",
                title: "Institution",
                description:
                  "Build world-class curricula and issue blockchain-verified academic credentials",
                icon: "🏛️",
                gradient: "from-blue-400 via-indigo-400 to-purple-400",
                shadowColor: "shadow-blue-500/25",
                borderGradient: "from-blue-400/50 to-purple-400/50",
              },
              {
                role: "student",
                title: "Student",
                description:
                  "Access premium education and earn tamper-proof certificates recognized globally",
                icon: "🚀",
                gradient: "from-orange-400 via-pink-400 to-red-400",
                shadowColor: "shadow-orange-500/25",
                borderGradient: "from-orange-400/50 to-pink-400/50",
              },
              {
                role: "verifier",
                title: "Recruiter",
                description:
                  "Ensure academic integrity through advanced credential verification protocols",
                icon: "💎",
                gradient: "from-violet-400 via-purple-400 to-indigo-400",
                shadowColor: "shadow-violet-500/25",
                borderGradient: "from-violet-400/50 to-purple-400/50",
              },
            ].map((item, index) => (
              <div
                key={item.role}
                className="group relative"
                style={{
                  animation: `slideInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${
                    index * 0.15
                  }s both`,
                }}
              >
                {/* Glowing border effect */}
                <div
                  className={`absolute -inset-px bg-gradient-to-r ${item.borderGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm`}
                ></div>

                {/* Main card */}
                <button
                  onClick={() => setRole(item.role)}
                  className={`relative w-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] ${item.shadowColor} hover:shadow-2xl group-hover:border-white/10`}
                >
                  {/* Top accent line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${item.gradient} opacity-60`}
                  ></div>

                  {/* Icon with glow */}
                  <div className="relative mb-6">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-full w-16 h-16 mx-auto blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                    ></div>
                    <div
                      className={`relative bg-gradient-to-r ${item.gradient} w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-black transform group-hover:rotate-12 transition-transform duration-500`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <h3
                    className={`text-2xl font-bold mb-4 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {item.description}
                  </p>

                  {/* Bottom highlight */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl`}
                  ></div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-white/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modern footer */}
        <div className="mt-20 text-center animate-fade-in-delay">
          <div className="flex items-center justify-center space-x-8 mb-6">
            {[
              "Blockchain Secured",
              "Globally Recognized",
              "AI Powered",
              "Web3 Native",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-400"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Built with cutting-edge technology for the future of education
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
