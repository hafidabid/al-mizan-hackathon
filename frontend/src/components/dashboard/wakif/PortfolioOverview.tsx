import React from "react";
import { LayoutDashboard, Users, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import { allocationSplit } from "../../../data/mockData";

const PortfolioOverview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Allocated Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 col-span-1">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
          Total Allocated Funds
        </h3>
        <div className="flex items-end space-x-3 mb-6">
          <span className="text-4xl font-extrabold text-gray-900">
            Rp 123.000.000 / yr
          </span>
          <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded mb-1">
            ↑ 12%
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="p-3 bg-indigo-50 rounded-xl w-fit text-indigo-600 mb-4">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">12</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="p-3 bg-pink-50 rounded-xl w-fit text-pink-600 mb-4">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">45,000</div>
            <div className="text-sm text-gray-500">Beneficiaries Reached</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="p-3 bg-green-50 rounded-xl w-fit text-green-600 mb-4">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">100%</div>
            <div className="text-sm text-gray-500">Verification Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
