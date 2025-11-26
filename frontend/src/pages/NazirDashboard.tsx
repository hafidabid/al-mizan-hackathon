import React, { useState, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { wakafcontract } from "../abi/wakaf";
import { mockStableCoin } from "../abi/mockStableCoin";
import {
  projectsData,
  MAQASID,
  AVAILABLE_SDGS,
  SDG_DETAILS,
} from "../data/mockData";
import { MaqasidIcon, SdgBadge } from "../components/ui/Badges";
import {
  Search,
  MapPin,
  CheckCircle,
  Filter,
  Globe,
  Send,
  AlertCircle,
  Wallet,
  X,
} from "lucide-react";
import { rupiahFormatter } from "../utils/rupiahFormatter";

const WAKAF_CONTRACT_ADDRESS = import.meta.env
  .VITE_WAKAF_CONTRACT_ADDRESS as `0x${string}`;
const IDR_CONTRACT_ADDRESS = import.meta.env
  .VITE_IDR_CONTRACT_ADDRESS as `0x${string}`;

// Recipient addresses for random selection
const RECIPIENT_ADDRESSES: `0x${string}`[] = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0xc1e631a115efc8b7033801341ab3a0280fb643a4",
  "0xb09df76f03d4cefe6544645cb58830d707ad6503",
];

// Random selection function
const getRandomRecipient = (): `0x${string}` => {
  const randomIndex = Math.floor(Math.random() * RECIPIENT_ADDRESSES.length);
  return RECIPIENT_ADDRESSES[randomIndex];
};

const NazirDashboard = () => {
  const { address, isConnected } = useAccount();
  const [selectedMaqasid, setSelectedMaqasid] = useState<string[]>(
    Object.keys(MAQASID)
  );
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>(AVAILABLE_SDGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const toggleMaqasid = (id: string) => {
    setSelectedMaqasid((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSdg = (num: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(num) ? prev.filter((p) => p !== num) : [...prev, num]
    );
  };

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const hasMaqasid = project.maqasid.some((m) =>
        selectedMaqasid.includes(m)
      );
      const hasSdg = project.sdgs.some((s) => selectedSdgs.includes(s));
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase());
      return hasMaqasid && hasSdg && matchesSearch;
    });
  }, [selectedMaqasid, selectedSdgs, searchQuery]);

  // Read Wakaf contract balance
  const { data: contractBalance } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "balanceOf",
    args: [WAKAF_CONTRACT_ADDRESS],
  });

  const { data: decimals } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "decimals",
  });

  // Write contract for moneyOut
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleOpenModal = (projectId: number) => {
    setSelectedProject(projectId);
    setModalOpen(true);
    setAmount("");
    setReason("");
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    setAmount("");
    setReason("");
  };

  const handleTransfer = async () => {
    if (!selectedProject || !amount || !reason.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (reason.length > 30) {
      alert("Reason must be 30 characters or less");
      return;
    }

    if (!decimals) {
      alert("Loading token decimals...");
      return;
    }

    const amountInWei = parseUnits(amount, decimals);
    const recipient = getRandomRecipient();

    try {
      writeContract({
        address: WAKAF_CONTRACT_ADDRESS,
        abi: wakafcontract,
        functionName: "moneyOut",
        args: [IDR_CONTRACT_ADDRESS, amountInWei, recipient, reason],
      });
    } catch (err) {
      console.error("Transfer error:", err);
    }
  };

  const selectedProjectData = useMemo(() => {
    return selectedProject
      ? projectsData.find((p) => p.id === selectedProject)
      : null;
  }, [selectedProject]);

  const formattedBalance =
    contractBalance && decimals
      ? rupiahFormatter(Number(formatUnits(contractBalance, decimals)))
      : "0";

  // Close modal on success
  React.useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    }
  }, [isSuccess]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nazir Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Manage and distribute funds from the Wakaf contract
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Contract Balance */}
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Contract Balance
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formattedBalance} IDR
              </div>
            </div>
            <div className="relative flex-1 md:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Filter size={12} className="mr-1" /> Maqasid Filter
              </h3>
              <div className="space-y-3">
                {Object.entries(MAQASID).map(([key, m]) => (
                  <label
                    key={key}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4 border-gray-300"
                      checked={selectedMaqasid.includes(key)}
                      onChange={() => toggleMaqasid(key)}
                    />
                    <span className="flex-1">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Globe size={12} className="mr-1" /> SDG Goals
              </h3>
              <div className="space-y-3">
                {AVAILABLE_SDGS.map((sdg) => (
                  <label
                    key={sdg}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4 border-gray-300"
                      checked={selectedSdgs.includes(sdg)}
                      onChange={() => toggleSdg(sdg)}
                    />
                    <div className="flex items-center flex-1">
                      <SdgBadge number={sdg} />
                      <span className="ml-2 text-xs text-gray-500 truncate">
                        {SDG_DETAILS[sdg]?.title || `SDG ${sdg}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="flex-1">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  No projects match the selected filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedMaqasid(Object.keys(MAQASID));
                    setSelectedSdgs(AVAILABLE_SDGS);
                    setSearchQuery("");
                  }}
                  className="mt-2 text-green-600 text-sm hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Project Info */}
                      <div className="p-6 md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            {project.verified && (
                              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-fit mb-2">
                                <CheckCircle size={14} />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {project.title}
                          </h2>
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin size={14} className="mr-1" />{" "}
                            {project.location}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.maqasid.map((m) => (
                              <MaqasidIcon key={m} type={m} />
                            ))}
                          </div>
                          <div className="flex space-x-1">
                            {project.sdgs.map((s) => (
                              <SdgBadge key={s} number={s} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Metrics */}
                      <div className="p-6 md:w-4/12 bg-gray-50 flex flex-col justify-center space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Target
                            </div>
                            <div className="font-bold text-gray-900 text-lg">
                              $ {project.quickMetrics.needed.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Impact
                            </div>
                            <div className="font-bold text-gray-900 text-lg">
                              {project.quickMetrics.beneficiaries.toLocaleString()}{" "}
                              ppl
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: "45%" }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>$ 67,500 raised</span>
                              <span>45%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <div className="p-6 md:w-3/12 flex items-center justify-center bg-white">
                        <button
                          onClick={() => handleOpenModal(project.id)}
                          disabled={!isConnected}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center"
                        >
                          Transfer Funds
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {modalOpen && selectedProjectData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Transfer Funds
                </h2>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" />{" "}
                    {selectedProjectData.location}
                  </span>
                  {selectedProjectData.verified && (
                    <span className="flex items-center text-green-600">
                      <CheckCircle size={14} className="mr-1" /> Verified
                      Project
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Project Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {selectedProjectData.title}
                </h3>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  {selectedProjectData.type}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Target:</span> ${" "}
                  {selectedProjectData.quickMetrics.needed.toLocaleString()}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {contractBalance && decimals && (
                  <div className="mt-2 text-sm text-gray-500">
                    Available: {formattedBalance} IDR
                  </div>
                )}
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Max 30 characters)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setReason(e.target.value);
                    }
                  }}
                  placeholder="Enter withdrawal reason..."
                  maxLength={30}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {reason.length}/30 characters
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="text-red-600 mr-2 mt-0.5" size={20} />
                  <div>
                    <div className="font-bold text-red-800">Error</div>
                    <div className="text-sm text-red-600 mt-1">
                      {error.message || "Transaction failed"}
                    </div>
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <CheckCircle
                    className="text-green-600 mr-2 mt-0.5"
                    size={20}
                  />
                  <div>
                    <div className="font-bold text-green-800">Success!</div>
                    <div className="text-sm text-green-600 mt-1">
                      Funds transferred successfully
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle
                    className="text-blue-600 mr-2 mt-0.5"
                    size={20}
                  />
                  <div className="text-sm text-blue-800">
                    <div className="font-bold mb-1">Note:</div>
                    <div>
                      Funds will be randomly distributed to one of the
                      authorized recipient addresses.
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleTransfer}
                disabled={
                  isPending ||
                  isConfirming ||
                  !isConnected ||
                  !amount ||
                  !reason.trim()
                }
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center"
              >
                {isPending || isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Transfer Funds
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NazirDashboard;
