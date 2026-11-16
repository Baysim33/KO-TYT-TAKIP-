interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({ value, max = 100, color = 'primary', size = 'md', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 tabular-nums min-w-[3rem] text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
