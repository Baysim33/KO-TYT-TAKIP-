import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Plus, Trash2,
  Award, Target, AlertTriangle, Lightbulb, BarChart3, History, ChevronRight,
  NotebookPen, Layers,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ExamResult, WrongQuestion, CheckedTopics } from '@/types';
import { uid, formatDateShort } from '@/utils/helpers';
import { analyzeExams, type AnalysisResult } from '@/utils/analysis';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';

const emptyForm = {
  name: '',
  date: new Date().toISOString().split('T')[0],
  turkce: 0,
  sosyal: 0,
  matematik: 0,
  fen: 0,
};

export default function ExamAnalysis() {
  const [exams, setExams] = useLocalStorage<ExamResult[]>('tyt-exam-results', []);
  const [wrongQuestions] = useLocalStorage<WrongQuestion[]>('tyt-wrong-questions', []);
  const [checkedTopics] = useLocalStorage<CheckedTopics>('tyt-checked-topics', {});
  const [form, setForm] = useState(emptyForm);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalNet = form.turkce + form.sosyal + form.matematik + form.fen;

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalNet === 0) return;
    const exam: ExamResult = {
      id: uid(),
      date: form.date,
      name: form.name || `Deneme ${exams.length + 1}`,
      turkce: form.turkce,
      sosyal: form.sosyal,
      matematik: form.matematik,
      fen: form.fen,
      total: totalNet,
    };
    setExams(prev => [...prev, exam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setForm(emptyForm);
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const runAnalysis = () => {
    if (exams.length === 0) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    setTimeout(() => {
      const latest = [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const result = analyzeExams(latest, exams, wrongQuestions, checkedTopics);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1200);
  };

  const sortedExams = useMemo(() =>
    [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [exams],
  );

  const maxNet = useMemo(() => {
    if (exams.length === 0) return 120;
    return Math.max(...exams.map(e => e.total), 50);
  }, [exams]);

  const scoreEstimate = (net: number) => Math.round(100 + net * 12.5);

  const numInputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 tabular-nums text-center font-semibold";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deneme Net Analizi ve Yapay Zeka Koçu</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Deneme sonuçlarını gir, akıllı koç nokta atışı tavsiyeler versin.
        </p>
      </div>

      {exams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={History} label="Deneme Sayısı" value={exams.length} color="primary" />
          <StatCard icon={Award} label="En Yüksek Net" value={Math.max(...exams.map(e => e.total))} color="success" />
          <StatCard icon={BarChart3} label="Ortalama Net" value={(exams.reduce((a, e) => a + e.total, 0) / exams.length).toFixed(1)} color="accent" />
          <StatCard icon={Target} label="Tahmini Puan" value={scoreEstimate(Math.max(...exams.map(e => e.total)))} color="warning" />
        </div>
      )}

      {/* Add Exam Form */}
      <form onSubmit={handleAddExam} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary-500" />
          Yeni Deneme Kaydı
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Deneme Adı</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder='örn: "3D Yayınları Deneme 5"'
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tarih</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'turkce' as const, label: 'Türkçe', max: 40 },
            { key: 'sosyal' as const, label: 'Sosyal', max: 20 },
            { key: 'matematik' as const, label: 'Matematik', max: 40 },
            { key: 'fen' as const, label: 'Fen', max: 20 },
          ].map(item => (
            <div key={item.key}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {item.label} <span className="text-gray-400">(max {item.max})</span>
              </label>
              <input
                type="number"
                min={0}
                max={item.max}
                step="0.25"
                value={form[item.key] === 0 ? '' : form[item.key]}
                onChange={e => setForm(prev => ({ ...prev, [item.key]: Math.max(0, Math.min(item.max, parseFloat(e.target.value) || 0)) }))}
                placeholder="0"
                className={numInputClass}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Toplam Net: </span>
            <span className="font-bold text-primary-600 dark:text-primary-400 text-lg tabular-nums">{totalNet.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={totalNet === 0} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
            Kaydet
          </button>
        </div>
      </form>

      {/* Run Analysis Button */}
      {exams.length > 0 && (
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
        >
          <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Yapay Zeka Analiz Ediliyor...' : 'Yapay Zeka Analizini Çalıştır'}
        </button>
      )}

      {/* Analysis Result */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center animate-pulse">
          <Sparkles className="w-10 h-10 mx-auto text-primary-500 animate-bounce mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Netleriniz ve yanlış defteriniz analiz ediliyor...</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/30 rounded-2xl p-5 border border-primary-200 dark:border-primary-900">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">Tahmini TYT Puanı</span>
              </div>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-300 tabular-nums">{analysis.estimatedScore}</p>
              <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1">{analysis.totalNet.toFixed(2)} toplam net</p>
            </div>

            <div className="bg-gradient-to-br from-error-50 to-error-100 dark:from-error-950/50 dark:to-error-900/30 rounded-2xl p-5 border border-error-200 dark:border-error-900">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-error-600 dark:text-error-400" />
                <span className="text-xs font-medium text-error-700 dark:text-error-300">En Zayıf Alan</span>
              </div>
              <p className="text-xl font-bold text-error-700 dark:text-error-300">{analysis.weakestArea}</p>
              <p className="text-xs text-error-600/70 dark:text-error-400/70 mt-1">{analysis.weakestNet.toFixed(2)} net</p>
            </div>

            <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-950/50 dark:to-success-900/30 rounded-2xl p-5 border border-success-200 dark:border-success-900">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-success-600 dark:text-success-400" />
                <span className="text-xs font-medium text-success-700 dark:text-success-300">En Güçlü Alan</span>
              </div>
              <p className="text-xl font-bold text-success-700 dark:text-success-300">{analysis.strongestArea}</p>
              <p className="text-xs text-success-600/70 dark:text-success-400/70 mt-1">{analysis.strongestNet.toFixed(2)} net</p>
            </div>
          </div>

          {/* Progress Trend */}
          {analysis.progressTrend !== 'none' && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
              analysis.progressTrend === 'up'
                ? 'bg-success-50 dark:bg-success-950/30 border-success-200 dark:border-success-900'
                : analysis.progressTrend === 'down'
                ? 'bg-error-50 dark:bg-error-950/30 border-error-200 dark:border-error-900'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            }`}>
              {analysis.progressTrend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
              ) : analysis.progressTrend === 'down' ? (
                <TrendingDown className="w-5 h-5 text-error-600 dark:text-error-400" />
              ) : (
                <Minus className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {analysis.progressTrend === 'up' && `Netlerin ${analysis.progressDelta > 0 ? '+' : ''}${analysis.progressDelta} arttı! Yükseliştesin.`}
                {analysis.progressTrend === 'down' && `Netlerin ${analysis.progressDelta} düştü. Tekrar odaklan.`}
                {analysis.progressTrend === 'stable' && 'Netlerin stabil. Bir adım öne geçmek için farklı çalış.`'}
              </span>
            </div>
          )}

          {/* Subject Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              Ders Bazlı Net Dağılımı
            </h4>
            <div className="space-y-3">
              {analysis.subjectBreakdown.map(s => (
                <div key={s.area}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      {s.isWeak && <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />}
                      {s.area}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{s.net.toFixed(2)}</span>
                  </div>
                  <ProgressBar
                    value={s.net}
                    max={s.area === 'Türkçe' || s.area === 'Matematik' ? 40 : 20}
                    color={s.isWeak ? 'warning' : 'success'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Per-Subject Error Analysis from Wrong Notebook */}
          {analysis.subjectAnalyses.some(sa => sa.wrongCount > 0) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-500" />
                Ders Bazında Yanlış Defteri Analizi
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Her ders için en çok hata yaptığın konular ve soru kalıpları
              </p>
              <div className="space-y-4">
                {analysis.subjectAnalyses
                  .filter(sa => sa.wrongCount > 0)
                  .map(sa => (
                    <div key={sa.subjectId} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-medium">
                            {sa.subjectName}
                          </span>
                          {sa.isWeak && (
                            <span className="px-2 py-0.5 rounded-md bg-warning-100 dark:bg-warning-950/60 text-warning-700 dark:text-warning-300 text-[10px] font-medium">
                              Zayıf Ders
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <NotebookPen className="w-3.5 h-3.5" />
                          {sa.wrongCount} yanlış
                        </span>
                      </div>

                      {/* Top error topics */}
                      {sa.topErrorTopics.length > 0 && (
                        <div className="space-y-2">
                          {sa.topErrorTopics.map((topic, idx) => (
                            <div key={topic.topic} className="flex items-start gap-2.5">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                idx === 0
                                  ? 'bg-error-100 dark:bg-error-950/60 text-error-600 dark:text-error-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {topic.topic}
                                  </span>
                                  <span className="text-xs font-semibold text-error-600 dark:text-error-400 flex-shrink-0 tabular-nums">
                                    {topic.count}x
                                  </span>
                                </div>
                                {topic.questionTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {topic.questionTypes.slice(0, 3).map(qt => (
                                      <span key={qt} className="px-1.5 py-0.5 rounded text-[10px] bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400">
                                        {qt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {topic.unsolvedCount > 0 && (
                                  <span className="text-[10px] text-warning-600 dark:text-warning-400 mt-0.5 inline-block">
                                    {topic.unsolvedCount} çözülmemiş
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Top question pattern */}
                      {sa.topQuestionPattern && sa.topQuestionPattern.pattern !== sa.topErrorTopics[0]?.topic && (
                        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            En çok tekrar eden soru kalıbı:
                          </span>
                          <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
                            {sa.topQuestionPattern.pattern} ({sa.topQuestionPattern.count}x)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Pattern Warnings */}
          {analysis.patternWarnings.length > 0 && (
            <div className="bg-warning-50 dark:bg-warning-950/30 rounded-2xl border border-warning-200 dark:border-warning-900 p-4 sm:p-6">
              <h4 className="font-semibold text-warning-800 dark:text-warning-300 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Tekrar Eden Hata Kalıpları
              </h4>
              <ul className="space-y-2">
                {analysis.patternWarnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warning-800 dark:text-warning-300">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-warning-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/40 dark:to-accent-950/40 rounded-2xl border border-primary-200 dark:border-primary-900 p-4 sm:p-6">
            <h4 className="font-semibold text-primary-800 dark:text-primary-300 text-base mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Yapay Zeka Koçundan Tavsiyeler
            </h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exam History Chart */}
      {sortedExams.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-primary-500" />
            Net Gelişim Grafiği
          </h4>
          <div className="space-y-2.5">
            {sortedExams.map(exam => {
              const pct = (exam.total / maxNet) * 100;
              return (
                <div key={exam.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{exam.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formatDateShort(exam.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{exam.total.toFixed(1)}</span>
                      <button onClick={() => deleteExam(exam.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-error-500 transition-all p-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex h-6 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-700 ease-out flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                      {pct > 15 && <span className="text-[10px] text-white font-medium tabular-nums">{exam.total.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1 h-1.5">
                    <div className="bg-primary-400 rounded-l-full" style={{ width: `${(exam.turkce / 40) * 25}%` }} title={`Türkçe: ${exam.turkce}`} />
                    <div className="bg-accent-400" style={{ width: `${(exam.sosyal / 20) * 12.5}%` }} title={`Sosyal: ${exam.sosyal}`} />
                    <div className="bg-success-400" style={{ width: `${(exam.matematik / 40) * 25}%` }} title={`Mat: ${exam.matematik}`} />
                    <div className="bg-warning-400 rounded-r-full" style={{ width: `${(exam.fen / 20) * 12.5}%` }} title={`Fen: ${exam.fen}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 dark:text-gray-500">Renk kodu:</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded bg-primary-400" /> Türkçe</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded bg-accent-400" /> Sosyal</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded bg-success-400" /> Mat</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded bg-warning-400" /> Fen</span>
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz deneme sonucu eklenmedi.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">İlk denemeni yukarıdaki formdan ekleyebilirsin.</p>
        </div>
      )}
    </div>
  );
}
