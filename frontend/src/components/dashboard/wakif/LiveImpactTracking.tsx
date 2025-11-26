import React from "react";
import { Zap, Leaf } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { liveImpactData } from "../../../data/mockData";

const LiveImpactTracking = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">Live Energy Generation</h3>
          <Zap className="text-yellow-500" size={20} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveImpactData}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#F59E0B"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEnergy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-lg font-bold">1,240 MWh</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">↑ 12%</div>
            <div className="text-xs text-gray-500">vs Target</div>
          </div>
          <div>
            <div className="text-lg font-bold">99.8%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">Carbon Offset Tracker</h3>
          <Leaf className="text-green-500" size={20} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveImpactData}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCo2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-lg font-bold">450 Tons</div>
            <div className="text-xs text-gray-500">Removed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">On Track</div>
            <div className="text-xs text-gray-500">Status</div>
          </div>
          <div>
            <div className="text-lg font-bold">Rp 62.500.000</div>
            <div className="text-xs text-gray-500">Credit Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveImpactTracking;
