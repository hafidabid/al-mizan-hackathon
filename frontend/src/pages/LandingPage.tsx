import React, { useState } from "react";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Globe,
  Coins,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { mockStableCoin } from "../abi/mockStableCoin";
import { wakafcontract } from "../abi/wakaf";
import { rupiahFormatter } from "../utils/rupiahFormatter";

const IDR_CONTRACT_ADDRESS = import.meta.env
  .VITE_IDR_CONTRACT_ADDRESS as `0x${string}`;
const WAKAF_CONTRACT_ADDRESS = import.meta.env
  .VITE_WAKAF_CONTRACT_ADDRESS as `0x${string}`;

const LandingPage = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");

  // Contract Reads
  // 1. User Balance
  const { data: balance } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "decimals",
  });

  // 2. Wakaf Contract Balance (Total funds currently in contract)
  const { data: wakafBalance } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "balanceOf",
    args: [WAKAF_CONTRACT_ADDRESS],
  });

  // 3. Money Out Count (Funds already distributed)
  const { data: moneyOutCount } = useReadContract({
    address: WAKAF_CONTRACT_ADDRESS,
    abi: wakafcontract,
    functionName: "totalMoneyOut",
    args: [IDR_CONTRACT_ADDRESS],
  });

  console.log(moneyOutCount, wakafBalance);

  // Calculate Total Donations (Current Balance + Distributed Funds)
  const currentBalance = wakafBalance
    ? formatUnits(wakafBalance, decimals || 18)
    : "0";
  const distributedFunds = moneyOutCount
    ? formatUnits(moneyOutCount, decimals || 18)
    : "0";
  const totalDonation = Number(currentBalance) + Number(distributedFunds);

  // Contract Writes
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleDonate = async () => {
    if (!amount || !IDR_CONTRACT_ADDRESS || !WAKAF_CONTRACT_ADDRESS) return;

    try {
      // Direct transfer of ERC20 to Wakaf Contract
      writeContract({
        address: IDR_CONTRACT_ADDRESS,
        abi: mockStableCoin,
        functionName: "transfer",
        args: [WAKAF_CONTRACT_ADDRESS, parseUnits(amount, decimals || 18)],
      });
    } catch (err) {
      console.error("Donation failed", err);
    }
  };

  const formattedBalance = balance ? formatUnits(balance, decimals || 18) : "0";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-green-700 text-white py-24 overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center">
          <div className="max-w-3xl md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Rooted by Islamic Finance Value <br />
              <span className="text-green-300">Powered by AI & Blockchain</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-10 font-light">
              Al Mizan+ transforms idle Islamic assets into productive and
              bankable infrastructure projects with the sustainable sharia-based
              principles
            </p>

            {/* Total Donation Stat */}
            <div className="mb-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm inline-block">
              <div className="text-sm text-green-200 uppercase tracking-wider font-bold mb-1">
                Accumulated Funds
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {rupiahFormatter(totalDonation)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/projects"
                className="px-8 py-4 bg-white text-green-800 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center"
              >
                Explore Projects <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Donate Widget */}
          <div className="mt-12 md:mt-0 md:w-1/2 md:pl-12 w-full">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-green-100">
              <h3 className="text-xl font-bold mb-4 flex items-center text-green-700">
                <Coins className="mr-2 text-green-600" /> Start Your Impact
              </h3>

              {!isConnected ? (
                <div className="text-center py-6">
                  <p className="text-red-600 font-semibold mb-4 bg-red-50 p-2 rounded">
                    Connect your wallet to start donating securely with smart
                    akad.
                  </p>
                  {/* We rely on Navbar connect button */}
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    Please connect your wallet in the top right corner.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center border border-green-100">
                    <span className="text-sm text-green-800 font-semibold">
                      Your Balance
                    </span>
                    <span className="text-xl font-bold font-mono text-green-900">
                      {rupiahFormatter(Number(formattedBalance))}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 font-bold mb-1">
                      Amount to Donate (IDR Token)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 font-bold focus:ring-2 focus:ring-green-500 outline-none placeholder-gray-400"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={isPending || isConfirming || !amount}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center"
                  >
                    {isPending || isConfirming ? "Processing..." : "Waqf Now"}
                  </button>

                  {hash && (
                    <div className="text-xs text-gray-600 truncate mt-2 font-mono bg-gray-100 p-2 rounded">
                      Tx: {hash}
                    </div>
                  )}
                  {isConfirmed && (
                    <div className="text-sm text-green-800 font-bold text-center bg-green-100 p-3 rounded shadow-sm border border-green-200">
                      Successful! Jazakumullah Khair.
                    </div>
                  )}
                  {writeError && (
                    <div className="text-sm text-red-800 font-bold text-center bg-red-100 p-3 rounded shadow-sm border border-red-200">
                      Error: {writeError.message.split(".")[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Al-Mizan+?</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              We are bridging classic Islamic finance values with the
              state-of-art technology to ensure trust, transparency, and
              compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Leaf size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                A Sustainable Sharia-based Principles
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All projects are vetted for alignment with Maqasid Sharia (Hifz
                al-Bi'ah) and Sustainable Development Goals (SDGs).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI & Satellite Verification
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We use satellite imagery and AI to verify project progress and
                impact in real-time, preventing greenwashing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-amber-50 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Blockchain Transparency
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every donation is recorded on-chain. Track your funds from
                wallet to impact with immutable records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Join thousands of Wakif who are building a sustainable future for
            the Ummah.
          </p>
          <Link
            to="/projects"
            className="inline-block px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg shadow-xl transition-transform transform hover:-translate-y-1"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
