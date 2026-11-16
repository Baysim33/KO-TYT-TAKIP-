import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

// YKS Haziran 2027 — using the 2nd Sunday of June as a representative exam window.
const YKS_TARGET_DATE = new Date('2027-06-20T10:15:00+03:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function YKSCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(YKS_TARGET_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(YKS_TARGET_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: 'Gün', value: timeLeft.days },
    { label: 'Saat', value: timeLeft.hours },
    { label: 'Dakika', value: timeLeft.minutes },
    { label: 'Saniye', value: timeLeft.seconds },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 dark:from-primary-800 dark:via-primary-900 dark:to-accent-800 shadow-lg">
      {/* Decorative glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent-300/30 blur-2xl" />
      </div>

      <div className="relative px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          {/* Title */}
          <div className="flex items-center gap-2.5 sm:flex-shrink-0">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">YKS Geri Sayım</h2>
              <p className="text-[11px] text-white/70 leading-tight">Haziran 2027</p>
            </div>
          </div>

          {/* Countdown units */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
            {units.map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="flex flex-col items-center min-w-[3.25rem] sm:min-w-[4rem]">
                  <div className="w-full px-1.5 py-1.5 sm:py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/10 tabular-nums">
                    <span className="block text-center text-lg sm:text-2xl font-bold text-white leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] sm:text-xs font-medium text-white/70">{unit.label}</span>
                </div>
                {i < units.length - 1 && (
                  <span className="text-white/40 font-bold text-lg sm:text-xl -mt-4">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
