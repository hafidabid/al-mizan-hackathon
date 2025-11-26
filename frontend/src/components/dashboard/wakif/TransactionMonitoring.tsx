import React from "react";
import { RefreshCw, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { formatUnits } from "viem";
import { rupiahFormatter } from "../../../utils/rupiahFormatter";

export interface MoneyOutEvent {
  id: string;
  nazir: string;
  sendTo: string;
  amount: string;
  tokenAddress: string;
  reason: string;
  blockNumber: string;
  blockTimestamp: string;
}

export interface TokenTransfer {
  id: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface TransactionMonitoringProps {
  moneyOutEvents: MoneyOutEvent[];
  tokenTransfers: TokenTransfer[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  tokenContractAddress?: string;
}

const TransactionMonitoring: React.FC<TransactionMonitoringProps> = ({
  moneyOutEvents,
  tokenTransfers,
  loading,
  error,
  onRefresh,
  tokenContractAddress,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-gray-800">Blockchain Transactions</h3>
          {loading && (
            <RefreshCw className="animate-spin text-gray-400" size={16} />
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-sm text-green-600 font-medium hover:underline disabled:opacity-50 flex items-center space-x-1"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="text-red-600 mr-2 mt-0.5" size={20} />
            <div>
              <div className="font-bold text-red-800">Error</div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Money Out Events */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center">
              <DollarSign size={16} className="mr-2 text-green-600" />
              Fund Distributions ({moneyOutEvents.length})
            </h4>
            {tokenContractAddress && (
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">
                Token: {tokenContractAddress.slice(0, 6)}...
                {tokenContractAddress.slice(-4)}
              </span>
            )}
          </div>
          {loading && moneyOutEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Loading transactions...
            </div>
          ) : moneyOutEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No distributions yet
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {moneyOutEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatTimestamp(event.blockTimestamp)}
                      </div>
                      <div className="font-bold text-gray-900 text-sm mb-1">
                        Rp{" "}
                        {rupiahFormatter(
                          Number(formatUnits(BigInt(event.amount), 6))
                        )}{" "}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {event.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <span className="font-medium">To:</span>{" "}
                      {formatAddress(event.sendTo)}
                    </div>
                    <div>
                      <span className="font-medium">Block:</span>{" "}
                      {Number(event.blockNumber).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Token Transfers */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
            <TrendingUp size={16} className="mr-2 text-blue-600" />
            Donations Received ({tokenTransfers.length})
          </h4>
          {loading && tokenTransfers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Loading transactions...
            </div>
          ) : tokenTransfers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No donations yet
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tokenTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatTimestamp(transfer.blockTimestamp)}
                      </div>
                      <div className="font-bold text-green-600 text-sm mb-1">
                        + Rp{" "}
                        {rupiahFormatter(
                          Number(formatUnits(BigInt(transfer.value), 6))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <span className="font-medium">From:</span>{" "}
                      {formatAddress(transfer.from)}
                    </div>
                    <div>
                      <span className="font-medium">Block:</span>{" "}
                      {Number(transfer.blockNumber).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
