import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  bg: string;
  iconColor: string;
}

export default function StatCard({ label, value, icon, bg, iconColor }: StatCardProps) {
  return (
    <div className="apple-card p-6 flex items-start justify-between gap-4 animate-slide-up">
      <div>
        <p className="text-sm font-medium text-[#86868b]">{label}</p>
        <p className="text-2xl font-bold text-[#1d1d1f] mt-1">{value}</p>
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110"
        style={{ background: bg }}
      >
        <div style={{ color: iconColor }}>{icon}</div>
      </div>
    </div>
  );
}
