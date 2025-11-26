import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, formatUnits, parseEther } from "viem";
import { mockStableCoin } from "../../abi/mockStableCoin";
import { rupiahFormatter } from "../../utils/rupiahFormatter";

const IDR_CONTRACT_ADDRESS = import.meta.env
  .VITE_IDR_CONTRACT_ADDRESS as `0x${string}`;
const NAZIR_ADDRESS = import.meta.env.VITE_NAZIR_ADDRESS as
  | `0x${string}`
  | undefined;

export const Navbar = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();

  // Check if connected address is Nazir
  const isNazir = useMemo(() => {
    if (!isConnected || !address || !NAZIR_ADDRESS) return false;
    return address.toLowerCase() === NAZIR_ADDRESS.toLowerCase();
  }, [address, isConnected, NAZIR_ADDRESS]);

  // Read Balance
  const { data: balance } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: decimals } = useReadContract({
    address: IDR_CONTRACT_ADDRESS,
    abi: mockStableCoin,
    functionName: "decimals",
  });

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-30 sticky top-0 shadow-sm">
      {/* Logo Area */}
      <Link to="/" className="flex items-center space-x-2 text-green-700">
        <span className="text-xl font-extrabold tracking-tight">Al-Mizan+</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex space-x-8">
        <Link
          to="/"
          className={`text-sm font-medium hover:text-green-700 ${
            location.pathname === "/" ? "text-green-700" : "text-gray-500"
          }`}
        >
          Home
        </Link>
        <Link
          to="/wakif"
          className={`text-sm font-medium hover:text-green-700 ${
            location.pathname === "/wakif" ? "text-green-700" : "text-gray-500"
          }`}
        >
          Dashboard
        </Link>
        {isNazir && (
          <Link
            to="/nazir"
            className={`text-sm font-medium hover:text-green-700 ${
              location.pathname === "/nazir"
                ? "text-green-700"
                : "text-gray-500"
            }`}
          >
            Nazir Dashboard
          </Link>
        )}
      </nav>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {isConnected && (
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Your Balance
            </span>
            <span className="text-sm font-bold text-gray-800">
              {rupiahFormatter(
                Number(formatUnits(balance ?? BigInt(0), decimals ?? 0))
              )}{" "}
              IDR
            </span>
          </div>
        )}

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
};
