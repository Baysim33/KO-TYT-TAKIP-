import { useState, useMemo } from 'react';
import {
  BookOpen, Calculator, Atom, FlaskConical, Leaf, ScrollText,
  Globe2, Brain, BookHeart, ChevronDown, TrendingUp, Search, X,
  CheckCircle2, Circle,
} from 'lucide-react';
import { subjects } from '@/data/curriculum';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { CheckedTopics } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import StatCard from '@/components/StatCard';
import { CheckboxIcon } from '@/components/StatCard';

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen, Calculator, Atom, FlaskConical, Leaf, ScrollText, Globe2, Brain, BookHeart,
};

const colorMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-950/40',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-900',
    ring: 'ring-primary-400',
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-950/40',
    text: 'text-accent-600 dark:text-accent-400',
    border: 'border-accent-200 dark:border-accent-900',
    ring: 'ring-accent-400',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-950/40',
    text: 'text-success-600 dark:text-success-400',
    border: 'border-success-200 dark:border-success-900',
    ring: 'ring-success-400',
  },
};

export default function SubjectMatrix() {
  const [checked, setChecked] = useLocalStorage<CheckedTopics>('tyt-checked-topics', {});
  const [expandedId, setExpandedId] = useState<string | null>(subjects[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const toggleTopic = (subjectId: string, topicIdx: number) => {
    const key = `${subjectId}-${topicIdx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const subjectProgress = useMemo(() => {
    return subjects.map(s => {
      const total = s.topics.length;
      const done = s.topics.reduce((acc, _, i) => acc + (checked[`${s.id}-${i}`] ? 1 : 0), 0);
      return { ...s, done, total, pct: total > 0 ? (done / total) * 100 : 0 };
    });
  }, [checked]);

  const overallProgress = useMemo(() => {
    const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
    const doneTopics = subjects.reduce(
      (acc, s) => acc + s.topics.reduce((a, _, i) => a + (checked[`${s.id}-${i}`] ? 1 : 0), 0),
      0,
    );
    return { done: doneTopics, total: totalTopics, pct: totalTopics > 0 ? (doneTopics / totalTopics) * 100 : 0 };
  }, [checked]);

  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjectProgress;
    const q = search.toLowerCase().trim();
    return subjectProgress
      .map(s => ({
        ...s,
        topics: s.topics.map((t, i) => ({ text: t, idx: i })).filter(t => t.text.toLowerCase().includes(q)),
      }))
      .filter(s => s.topics.length > 0 || s.name.toLowerCase().includes(q));
  }, [search, subjectProgress]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">TYT Konu Takip Matrisi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Müfredate uygun konuları işaretleyerek ilerlemeni takip et.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={TrendingUp} label="Genel İlerleme" value={`${Math.round(overallProgress.pct)}%`} sublabel={`${overallProgress.done} / ${overallProgress.total} konu`} color="primary" />
        <StatCard icon={BookOpen} label="Ders Sayısı" value={subjects.length} sublabel="TYT müfredatı" color="accent" />
        <StatCard icon={CheckCircle2} label="Biten Konu" value={overallProgress.done} sublabel="tamamlandı" color="success" />
        <StatCard icon={Circle} label="Kalan Konu" value={overallProgress.total - overallProgress.done} sublabel="bekliyor" color="warning" />
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Konu veya ders ara..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredSubjects.map(subject => {
          const Icon = iconMap[subject.icon] ?? BookOpen;
          const c = colorMap[subject.color] ?? colorMap.primary;
          const isExpanded = expandedId === subject.id || !!search.trim();

          return (
            <div
              key={subject.id}
              className={`rounded-2xl border ${isExpanded ? c.border : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-900 overflow-hidden transition-all`}
            >
              <button
                onClick={() => setExpandedId(isExpanded && !search ? null : subject.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{subject.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {subject.done} / {subject.total} konu tamamlandı
                  </p>
                </div>
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <ProgressBar value={subject.pct} color={subject.color as 'primary' | 'accent' | 'success'} size="sm" showLabel />
                </div>
                {!search && (
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 animate-slide-up">
                  <ProgressBar value={subject.pct} color={subject.color as 'primary' | 'accent' | 'success'} size="md" />
                  <div className="mt-3 space-y-1">
                    {(subject as any).topics.map((t: { text: string; idx: number } | string, i: number) => {
                      const topicText = typeof t === 'string' ? t : t.text;
                      const topicIdx = typeof t === 'string' ? i : t.idx;
                      const key = `${subject.id}-${topicIdx}`;
                      const isChecked = !!checked[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggleTopic(subject.id, topicIdx)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group ${
                            isChecked
                              ? 'bg-success-50 dark:bg-success-950/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <CheckboxIcon checked={isChecked} />
                          <span className={`text-sm flex-1 ${isChecked ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {topicText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
