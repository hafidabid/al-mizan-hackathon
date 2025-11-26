import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import axios from "axios";
import PortfolioOverview from "../components/dashboard/wakif/PortfolioOverview";
import LiveImpactTracking from "../components/dashboard/wakif/LiveImpactTracking";
import SatelliteVerificationSection from "../components/dashboard/wakif/SatelliteVerificationSection";
import TransactionMonitoring, {
  type MoneyOutEvent,
  type TokenTransfer,
} from "../components/dashboard/wakif/TransactionMonitoring";
import ValueCreationMetrics from "../components/dashboard/wakif/ValueCreationMetrics";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const IDR_CONTRACT_ADDRESS = import.meta.env
  .VITE_IDR_CONTRACT_ADDRESS as `0x${string}`;
const WAKAF_CONTRACT_ADDRESS = import.meta.env
  .VITE_WAKAF_CONTRACT_ADDRESS as `0x${string}`;

const WakifDashboard = () => {
  const [moneyOutEvents, setMoneyOutEvents] = useState<MoneyOutEvent[]>([]);
  const [tokenTransfers, setTokenTransfers] = useState<TokenTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch MoneyOut Events (only IDR token distributions)
      const moneyOutQuery = `
        query {
          wakafMoneyOutEvents(
            where: { tokenAddress: "${IDR_CONTRACT_ADDRESS.toLowerCase()}" }
            orderBy: "blockTimestamp"
            orderDirection: "desc"
            limit: 20
          ) {
            items {
              id
              nazir
              sendTo
              amount
              tokenAddress
              reason
              blockNumber
              blockTimestamp
            }
          }
        }
      `;

      // Fetch Token Transfers to Wakaf Contract (donations)
      const transfersQuery = `
        query {
          mocKIDRTransfers(
            where: { to: "${WAKAF_CONTRACT_ADDRESS.toLowerCase()}" }
            orderBy: "blockTimestamp"
            orderDirection: "desc"
            limit: 20
          ) {
            items {
              id
              from
              to
              value
              blockNumber
              blockTimestamp
            }
          }
        }
      `;

      const [moneyOutResponse, transfersResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/indexer/query`, {
          query: moneyOutQuery,
        }),
        axios.post(`${API_BASE_URL}/indexer/query`, {
          query: transfersQuery,
        }),
      ]);

      if (moneyOutResponse.data?.data?.wakafMoneyOutEvents?.items) {
        setMoneyOutEvents(moneyOutResponse.data.data.wakafMoneyOutEvents.items);
      }

      if (transfersResponse.data?.data?.mocKIDRTransfers?.items) {
        setTokenTransfers(transfersResponse.data.data.mocKIDRTransfers.items);
      }
    } catch (err: any) {
      console.error("Error fetching blockchain data:", err);
      setError(
        err.response?.data?.message || "Failed to fetch blockchain data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBlockchainData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-gray-50 font-sans text-gray-800 p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          <p className="text-gray-500">
            Impact Measurement, Reporting, and Verification (MRV) Monitor
          </p>
        </div>
        <div className="flex items-center space-x-4"></div>
      </div>

      <PortfolioOverview />
      <LiveImpactTracking />
      <SatelliteVerificationSection />
      <TransactionMonitoring
        moneyOutEvents={moneyOutEvents}
        tokenTransfers={tokenTransfers}
        loading={loading}
        error={error}
        onRefresh={fetchBlockchainData}
      />
      <ValueCreationMetrics />
    </div>
  );
};

export default WakifDashboard;
