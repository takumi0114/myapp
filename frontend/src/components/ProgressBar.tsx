import React from "react";

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600">達成率</span>
        <span className="text-blue-600 font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
