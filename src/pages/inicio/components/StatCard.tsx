import React from 'react'

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

const StatCard = ({ label, value, icon, iconColor, iconBg }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor, display: "flex" }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium mb-0.5">
          {label}
        </p>
        <p className="text-[22px] font-semibold text-[#1E293B] leading-none">
          {value}
        </p>
      </div>
    </div>
  )
}

export default StatCard