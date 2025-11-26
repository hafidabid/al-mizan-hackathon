import React, { useState } from "react";
import {
  Leaf,
  Globe,
  Activity,
  Zap,
  CheckCircle,
  MapPin,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Lock,
} from "lucide-react";
import { MAQASID, SDG_DETAILS, type Project } from "../../../data/mockData";

import { SdgBadge } from "../../ui/Badges";

interface CalculatorModalProps {
  project: Project;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  isLoading?: boolean;
}

// --- LOGIKA AKAD SYARIAH ---
const getAkadDetails = (type: string, amount: number) => {
  if (type === "waqf") {
    return {
      title: "Akad Wakaf Tunai (Cash Waqf)",
      desc: "Perpetual Endowment Contract",
      content: `I hereby declare the amount of IDR ${amount.toLocaleString()} as Cash Waqf. The principal amount shall be preserved and invested in the specified project assets (Solar Panels/Infrastructure). Only the yields/usufruct shall be utilized for the beneficiaries.`,
      parties: "Wakif (Donor) - Nazir (Manager) - Mauquf 'Alaih (Beneficiary)",
    };
  } else if (type === "zakat") {
    return {
      title: "Akad Taukil (Agency for Zakat)",
      desc: "Direct Distribution Mandate",
      content: `I authorize Al-Mizan as my agent (Wakil) to distribute the amount of IDR ${amount.toLocaleString()} as Zakat Maal to the eligible Asnaf (Fakir/Miskin) located in the project area for immediate consumption or operational needs.`,
      parties: "Muzakki (Donor) - Amil (Manager) - Mustahik (Beneficiary)",
    };
  } else {
    return {
      title: "Hybrid Blended Structure",
      desc: "Musyarakah (Asset) + Hibah (Ops)",
      content: `Structured as a hybrid portfolio:
1. Waqf Portion: Designated for purchasing fixed assets (CAPEX) under Waqf retention rules.
2. Zakat Portion: Designated for operational expenditure (OPEX) and capacity building.
This structure ensures asset sustainability while adhering to Sharia distribution rules.`,
      parties: "Multi-party Structural Agreement",
    };
  }
};

const CalculatorModal: React.FC<CalculatorModalProps> = ({
  project,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [amount, setAmount] = useState(10000000); // Default 10jt IDR
  const [fundingType, setFundingType] = useState("blended");
  const [duration, setDuration] = useState(5); // Years
  const [activeTab, setActiveTab] = useState("predictive"); // predictive, economic, compare, akad
  const [reason, setReason] = useState("");

  // Derived Calculations - Adjusted for IDR scale (roughly 1/15000 of USD scale if we want similar output numbers, or just direct math)
  // Let's assume input metrics are per 10jt IDR for simplicity or scale appropriately.
  // The original used $1000 base. 10jt IDR is roughly $650. Let's say metrics are per 10jt IDR unit.
  const factor = amount / 10000000;

  const co2Total = (project.metrics.co2Yearly * factor * duration).toFixed(1);
  const energyTotal = (project.metrics.energyMWh * factor).toFixed(1); // Per year capacity
  const households = Math.floor(Number(energyTotal) * 25); // rough assumption
  const trees = Math.floor(project.metrics.trees * factor);

  const jobsConstr = Math.floor(project.metrics.jobs.construction * factor);
  const jobsOps = Math.floor(project.metrics.jobs.ops * factor);

  // Economic
  // Assuming leverage ratio relative to amount
  const leverageRatio = (5000000000 / amount).toFixed(1); // Mock total project cost 5B IDR
  const localGdp = (amount * project.metrics.multiplier).toLocaleString();
  const taxRev = (amount * 0.15).toLocaleString(); // Mock 15%
  const sroi = project.metrics.sroi;

  // Akad
  const akad = getAkadDetails(fundingType, amount);

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the transfer.");
      return;
    }
    onConfirm(amount, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {project.title}
            </h2>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" /> {project.location}
              </span>
              <span className="flex items-center text-green-600">
                <CheckCircle size={14} className="mr-1" /> Verified Project
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: EDUCATIONAL CONTENT & INPUTS */}
          <div className="w-1/3 p-6 border-r border-gray-100 overflow-y-auto bg-gray-50 scrollbar-thin">
            {/* 1. Maqasid Syariah Alignment */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center">
                <BookOpen size={12} className="mr-1" /> Maqasid Syariah
                Alignment
              </h3>
              <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                {project.maqasid.map((mKey) => {
                  const m = MAQASID[mKey];
                  return (
                    <div key={mKey} className="flex items-start">
                      {/* Icon placeholder if null */}
                      <div className="mt-0.5 text-green-600 min-w-[16px]">
                        <CheckCircle size={14} />
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-bold text-gray-800">
                          {m?.label}
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                          {m?.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SDGs */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center">
                <Globe size={12} className="mr-1" /> Sustainable Development
                Goals (SDGs)
              </h3>
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                {project.sdgs.map((sdg) => (
                  <div key={sdg} className="flex items-start">
                    <SdgBadge number={sdg} />
                    <div className="ml-2">
                      <div className="text-xs font-bold text-gray-800">
                        {SDG_DETAILS[sdg]?.title}
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight">
                        {SDG_DETAILS[sdg]?.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* 3. Investment Parameters */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
              Investment Parameters
            </h3>

            <div className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-bold"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Initial funding tranche"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  maxLength={30}
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {reason.length}/30
                </div>
              </div>

              {/* Funding Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Type
                </label>
                <div className="space-y-3">
                  {[
                    "Waqf (Productive Endowment)",
                    "Zakat (Direct Distribution)",
                    "Blended (Waqf + Zakat)",
                  ].map((type) => {
                    const val = type.split(" ")[0].toLowerCase();
                    return (
                      <label
                        key={val}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          fundingType === val
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="ftype"
                          checked={fundingType === val}
                          onChange={() => setFundingType(val)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {type}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {[1, 3, 5, 10].map((y) => (
                    <option key={y} value={y}>
                      {y} Years
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Summary Box */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-8">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">
                  Simulation Summary
                </h4>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Selected:</span>
                  <span className="font-bold">
                    {fundingType.charAt(0).toUpperCase() + fundingType.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-bold">{duration} Years</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: OUTPUTS (Cleaned up, header removed) */}
          <div className="w-2/3 flex flex-col bg-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 pt-4">
              {[
                {
                  id: "predictive",
                  label: "Predictive Impact",
                  icon: <Leaf size={16} />,
                },
                {
                  id: "economic",
                  label: "Economic Value",
                  icon: <DollarSign size={16} />,
                },
                {
                  id: "compare",
                  label: "Scenario Analysis",
                  icon: <TrendingUp size={16} />,
                },
                {
                  id: "akad",
                  label: "Smart Akad",
                  icon: <FileText size={16} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {/* TAB 1: PREDICTIVE IMPACT */}
              {activeTab === "predictive" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Environmental Section */}
                  <div>
                    <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                      <Leaf className="text-green-500 mr-2" size={20} />{" "}
                      Environmental Impact
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-green-600 mb-1">
                          CO2 Reduction
                        </div>
                        <div className="text-2xl font-extrabold text-green-800">
                          {co2Total}{" "}
                          <span className="text-sm font-normal">Tons</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over {duration} years
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-green-600 mb-1">
                          Clean Energy
                        </div>
                        <div className="text-2xl font-extrabold text-green-800">
                          {energyTotal}{" "}
                          <span className="text-sm font-normal">MWh/yr</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ~ {households} Households
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-green-600 mb-1">
                          Tree Equivalent
                        </div>
                        <div className="text-2xl font-extrabold text-green-800">
                          {trees}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mature trees planted
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100"></div>

                  {/* Social Section */}
                  <div>
                    <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                      <Users className="text-blue-500 mr-2" size={20} /> Social
                      Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                          <span className="text-gray-600">
                            Direct Beneficiaries
                          </span>
                          <span className="font-bold text-blue-800">
                            {Math.floor(2500 * factor).toLocaleString()}{" "}
                            Families
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                          <span className="text-gray-600">
                            Energy Cost Savings
                          </span>
                          <span className="font-bold text-blue-800">
                            Rp {Math.floor(2500000 * factor).toLocaleString()}
                            /yr
                          </span>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                        <h5 className="text-sm font-bold text-gray-700 mb-3">
                          Jobs Created
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Construction (Temp)</span>
                              <span className="font-bold">
                                {jobsConstr} Jobs
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full">
                              <div
                                className="bg-blue-400 h-2 rounded-full"
                                style={{ width: "70%" }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Operations (Perm)</span>
                              <span className="font-bold">{jobsOps} Jobs</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: "30%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ECONOMIC VALUE */}
              {activeTab === "economic" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Direct Value */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-gray-700">
                        Direct Economic Value
                      </h4>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-6 text-center divide-x divide-gray-100">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">
                          Leverage Ratio
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                          1 : {leverageRatio}
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Highly Efficient
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">
                          SROI
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                          {sroi}x
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Social Return
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">
                          Payback Period
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                          4.2
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Years</div>
                      </div>
                    </div>
                  </div>

                  {/* Multiplier & Avoided Costs */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h5 className="font-bold text-gray-800 mb-4">
                        Multiplier Effects
                      </h5>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Local GDP Contribution
                          </span>
                          <span className="font-medium">Rp {localGdp}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Tax Revenue Generated
                          </span>
                          <span className="font-medium">Rp {taxRev}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Import Substitution
                          </span>
                          <span className="font-medium">
                            Rp {(amount * 0.5).toLocaleString()}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h5 className="font-bold text-gray-800 mb-4">
                        Avoided Costs
                      </h5>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Healthcare Savings
                          </span>
                          <span className="font-medium text-green-600">
                            Rp {(amount * 0.05).toLocaleString()}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Carbon Credits Value
                          </span>
                          <span className="font-medium text-green-600">
                            Rp {(Number(co2Total) * 150000).toLocaleString()}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            Subsidy Reduction
                          </span>
                          <span className="font-medium text-green-600">
                            Rp {(amount * 0.1).toLocaleString()}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCENARIO ANALYSIS */}
              {activeTab === "compare" && (
                <div className="animate-fade-in h-full flex flex-col">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                    <div className="mr-3 mt-1 text-yellow-600">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-yellow-800 text-sm">
                        Strategic Decision Support
                      </h5>
                      <p className="text-xs text-yellow-700 mt-1">
                        Comparing 100% Waqf (Long-term sustainability) vs.
                        Blended Funding (Immediate impact).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {/* Scenario A */}
                    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                          Scenario A
                        </span>
                        <span className="font-bold text-gray-800">
                          100% Waqf
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500">
                            Sustainability Score
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            High (9.5/10)
                          </div>
                        </div>
                        <ul className="text-sm space-y-2 text-gray-600">
                          <li>• Perpetual asset retention</li>
                          <li>• Slower initial deployment</li>
                          <li>• Returns reinvested 100%</li>
                        </ul>
                      </div>
                    </div>

                    {/* Scenario B */}
                    <div className="border-2 border-green-500 bg-green-50 rounded-xl p-5 relative">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        Recommended
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded border border-green-200">
                          Scenario B
                        </span>
                        <span className="font-bold text-gray-800">
                          Blended (30/70)
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="text-center py-4 bg-white rounded-lg border border-green-100">
                          <div className="text-xs text-gray-500">
                            Impact Velocity
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            Very High
                          </div>
                        </div>
                        <ul className="text-sm space-y-2 text-gray-700">
                          <li>• Immediate beneficiary reach</li>
                          <li>• Zakat covers OpsEx</li>
                          <li>• Waqf secures CapEx</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SMART AKAD */}
              {activeTab === "akad" && (
                <div className="animate-fade-in h-full">
                  <div className="bg-gray-900 text-gray-300 p-6 rounded-xl h-full font-mono text-sm relative overflow-hidden flex flex-col">
                    <div className="absolute top-4 right-4 text-green-500 opacity-20">
                      <Lock size={120} />
                    </div>

                    <div className="border-b border-gray-700 pb-4 mb-4 flex justify-between items-center z-10">
                      <div>
                        <h4 className="text-green-400 font-bold text-lg mb-1 flex items-center">
                          <FileText size={18} className="mr-2" /> DIGITAL AKAD
                          DRAFT
                        </h4>
                        <div className="text-xs text-gray-500">
                          Hash: 8f4a...29c1 • Timestamp:{" "}
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="px-2 py-1 border border-green-600 text-green-500 text-xs rounded uppercase">
                        {fundingType} Mode
                      </div>
                    </div>

                    <div className="space-y-6 overflow-y-auto z-10 flex-1 pr-2 custom-scrollbar">
                      <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                          Contract Type
                        </label>
                        <div className="text-white font-bold text-lg">
                          {akad.title}
                        </div>
                        <div className="text-green-600 text-xs">
                          {akad.desc}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                          Parties Involved
                        </label>
                        <div className="text-gray-300">{akad.parties}</div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded border border-gray-700">
                        <label className="text-gray-500 text-xs uppercase tracking-wider block mb-2">
                          Terms & Declaration
                        </label>
                        <p className="whitespace-pre-line leading-relaxed text-gray-300">
                          {akad.content}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <CheckCircle
                            size={12}
                            className="mr-1 text-green-500"
                          />
                          Sharia Board Approved (Fatwa No. 12/DSN-MUI/IV/2000)
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Activity size={12} className="mr-1 text-blue-500" />
                          Smart Contract Ready (Solidity/Ethereum Compatible)
                        </div>
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-green-800 hover:bg-green-700 text-green-100 py-3 rounded flex items-center justify-center transition-colors z-10">
                      Generate PDF Contract
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <span className="block text-xs text-gray-500">
                  Projected Total Impact Value
                </span>
                <span className="text-xl font-bold text-gray-900">
                  Rp {(amount * sroi).toLocaleString()}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="mr-2" /> Confirm Allocation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;
