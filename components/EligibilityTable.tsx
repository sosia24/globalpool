"use client";

import React from "react";
import { formatUnits } from "ethers";

// Interfaces
interface Table {
    isEligible: boolean[];
    directsRequirement: number[];
    valueInvestedRequirement: bigint[];
}

interface UserTable {
    table: Table;
    directsQuantity: number;
    valueInvested: bigint;
}

interface EligibilityTableProps {
    userData: UserTable;
}

const USDT_DECIMALS = 6;

// Format USDT BigInt values
const formatValue = (value: bigint): string => {
    return `$${formatUnits(value.toString(), USDT_DECIMALS)}`;
};

export const EligibilityTable: React.FC<EligibilityTableProps> = ({ userData }) => {
    const numberOfLevels = 15;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-[#11001f] rounded-xl shadow-xl border border-purple-700/40">
            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 text-purple-400 text-center drop-shadow-[0_0_6px_#b44cff] uppercase tracking-wide">
                Level Eligibility Status
            </h2>

            {/* User Summary */}
            <div className="bg-[#1a012e] p-4 rounded-lg mb-6 border border-purple-700/40 shadow-inner">
                <p className="text-gray-200 font-semibold mb-3 text-center">⭐ Your Current Data</p>

                <div className="flex justify-center gap-8 text-center flex-wrap">
                    <p className="text-purple-300">
                        👥 Direct Referrals:{" "}
                        <span className="font-bold text-lg text-purple-200">{userData.directsQuantity}</span>
                    </p>

                    <p className="text-purple-300">
                        💰 Total Pool Investment:{" "}
                        <span className="font-bold text-lg text-purple-200">
                            {formatValue(userData.valueInvested)}
                        </span>
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-800 text-left text-gray-100">
                    <thead className="bg-purple-900/40">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-purple-200">Level</th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-purple-200">
                                Required Directs
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-purple-200">
                                Required Pool Value
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center text-purple-200">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-purple-700/40">
                        {Array.from({ length: numberOfLevels }).map((_, i) => {
                            const level = i + 1;
                            const { isEligible, directsRequirement, valueInvestedRequirement } = userData.table;

                            const requiredDirects = directsRequirement[i];
                            const requiredValue = valueInvestedRequirement[i];

                            const meetsDirects = userData.directsQuantity >= requiredDirects;
                            const meetsValue = userData.valueInvested >= requiredValue;

                            const statusClasses = isEligible[i]
                                ? "bg-purple-600/40 text-purple-200"
                                : "bg-pink-700/30 text-pink-300";

                            return (
                                <tr key={i} className="hover:bg-purple-900/20 transition duration-150">
                                    {/* Level */}
                                    <td className="px-4 py-3 text-lg font-semibold text-purple-300/80">{level}</td>

                                    {/* Required Directs */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-sm font-mono ${
                                                meetsDirects ? "text-purple-300" : "text-pink-400"
                                            }`}
                                        >
                                            {requiredDirects}
                                        </span>
                                    </td>

                                    {/* Required Pool Value */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-sm font-mono ${
                                                meetsValue ? "text-purple-300" : "text-pink-400"
                                            }`}
                                        >
                                            {formatValue(requiredValue)}
                                        </span>
                                    </td>

                                    {/* Eligibility Status */}
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs uppercase font-semibold ${statusClasses}`}
                                        >
                                            {isEligible[i] ? "💜 Eligible" : "❌ Not Eligible"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
