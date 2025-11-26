import React from "react";
import { DollarSign, Briefcase, TrendingUp, Heart, Sun } from "lucide-react";

const ValueCreationMetrics = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Value Creation Metrics</h3>
        <button className="text-sm text-green-600 font-medium hover:underline">
          View Detailed Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Direct Economic Activity
          </h4>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <DollarSign size={14} className="mr-2" /> Revenue Generated
              </span>
              <span className="font-mono font-bold text-gray-900">
                Rp 125.000.000 / yr
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Briefcase size={14} className="mr-2" /> Wages Paid (Local)
              </span>
              <span className="font-mono font-bold text-gray-900">
                Rp 42.000.000 / yr
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                Local Procurement
              </span>
              <span className="font-mono font-bold text-gray-900">
                Rp 50.000.000 / yr
              </span>
            </li>
          </ul>
        </div>
        <div className="p-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Indirect Benefits (Est.)
          </h4>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <TrendingUp size={14} className="mr-2" /> Productivity Gains
              </span>
              <span className="font-mono font-bold text-green-600">
                + 18.5%
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Heart size={14} className="mr-2" /> Healthcare Savings
              </span>
              <span className="font-mono font-bold text-green-600">
                Rp 50.000.000 / yr
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Sun size={14} className="mr-2" /> Time Saved (Households)
              </span>
              <span className="font-mono font-bold text-green-600">
                2.5 hrs / day
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValueCreationMetrics;
