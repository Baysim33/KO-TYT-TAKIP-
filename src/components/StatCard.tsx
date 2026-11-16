import { CheckCircle2, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export default function StatCard({ icon: Icon, label, value, sublabel, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50',
    accent: 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/50',
    success: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-950/50',
    warning: 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-950/50',
    error: 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-950/50',
    gray: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-500 truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
          {sublabel && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

export function CheckboxIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
  ) : (
    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
  );
}
