import { useState, useMemo, useRef } from 'react';
import {
  Plus, Trash2, CheckCircle2, RotateCcw, Camera, X, NotebookPen,
  Filter, ImageIcon, Search,
} from 'lucide-react';
import { subjects } from '@/data/curriculum';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { WrongQuestion } from '@/types';
import { uid, formatDate } from '@/utils/helpers';
import StatCard from '@/components/StatCard';

const emptyForm = {
  subject: '',
  topic: '',
  questionType: '',
  text: '',
  image: '' as string,
  note: '',
};

export default function WrongNotebook() {
  const [questions, setQuestions] = useLocalStorage<WrongQuestion[]>('tyt-wrong-questions', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Görsel boyutu 2MB\'dan küçük olmalıdır.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.topic || (!form.text && !form.image)) return;
    const q: WrongQuestion = {
      id: uid(),
      subject: form.subject,
      topic: form.topic,
      questionType: form.questionType || 'Genel',
      text: form.text,
      image: form.image || null,
      note: form.note,
      solved: false,
      createdAt: Date.now(),
    };
    setQuestions(prev => [q, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const toggleSolved = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, solved: !q.solved } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filterSubject && q.subject !== filterSubject) return false;
      if (filterStatus === 'solved' && !q.solved) return false;
      if (filterStatus === 'unsolved' && q.solved) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          q.topic.toLowerCase().includes(s) ||
          q.questionType.toLowerCase().includes(s) ||
          q.text.toLowerCase().includes(s) ||
          q.note.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [questions, filterSubject, filterStatus, search]);

  const stats = useMemo(() => ({
    total: questions.length,
    solved: questions.filter(q => q.solved).length,
    unsolved: questions.filter(q => !q.solved).length,
  }), [questions]);

  const selectedSubject = subjects.find(s => s.id === form.subject);
  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yanlış Defterim</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Yanlış yaptığın soruları kaydet, tekrar et, netlerini yükselt.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Vazgeç' : 'Yanlış Soru Ekle'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={NotebookPen} label="Toplam Yanlış" value={stats.total} color="accent" />
        <StatCard icon={CheckCircle2} label="Çözüldü" value={stats.solved} color="success" />
        <StatCard icon={RotateCcw} label="Bekleyen" value={stats.unsolved} color="warning" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-4 animate-slide-up shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Yeni Yanlış Soru Kaydı</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Ders *</label>
              <select
                value={form.subject}
                onChange={e => setForm(prev => ({ ...prev, subject: e.target.value, topic: '' }))}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Ders seç...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">İlgili Konu *</label>
              <select
                value={form.topic}
                onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
                required
                disabled={!form.subject}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
              >
                <option value="">Konu seç...</option>
                {selectedSubject?.topics.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Soru Kalıbı / Tipi</label>
            <input
              type="text"
              value={form.questionType}
              onChange={e => setForm(prev => ({ ...prev, questionType: e.target.value }))}
              placeholder='örn: "Paragraf - Ana Düşünce" veya "Fizik - Basınç Formül Hatası"'
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Soru Metni</label>
            <textarea
              value={form.text}
              onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Sorunun metnini buraya yazabilirsin..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Soru Fotoğrafı (opsiyonel)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {form.image ? (
              <div className="relative inline-block">
                <img src={form.image} alt="Soru" className="max-h-40 rounded-xl border border-gray-200 dark:border-gray-700" />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, image: '' }))} className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 shadow-md hover:bg-error-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all w-full justify-center"
              >
                <Camera className="w-4 h-4" />
                Fotoğraf Yükle (Base64)
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Neden Yanlış Yaptım?</label>
            <textarea
              value={form.note}
              onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Hatanın sebebini yaz. Örn: 'Formülü karıştırdım', 'Konuyu yeterince çalışmamıştım'..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            Kaydet
          </button>
        </form>
      )}

      {questions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ara: konu, tip, not..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Tüm Dersler</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'all' | 'solved' | 'unsolved')}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="all">Tümü</option>
            <option value="unsolved">Bekleyen</option>
            <option value="solved">Çözüldü</option>
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <NotebookPen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {questions.length === 0 ? 'Henüz yanlış soru eklenmedi.' : 'Filtrelere uygun kayıt bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(q => (
            <div
              key={q.id}
              className={`rounded-2xl border p-4 transition-all animate-scale-in ${
                q.solved
                  ? 'border-success-200 dark:border-success-900 bg-success-50/50 dark:bg-success-950/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-medium">
                    {subjectName(q.subject)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    q.solved
                      ? 'bg-success-100 dark:bg-success-950/60 text-success-700 dark:text-success-300'
                      : 'bg-warning-100 dark:bg-warning-950/60 text-warning-700 dark:text-warning-300'
                  }`}>
                    {q.solved ? 'Çözüldü' : 'Bekliyor'}
                  </span>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="text-gray-300 hover:text-error-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{q.topic}</h4>
              {q.questionType && q.questionType !== 'Genel' && (
                <p className="text-xs text-accent-600 dark:text-accent-400 font-medium mb-2">{q.questionType}</p>
              )}

              {q.image && (
                <div className="mb-3">
                  <img src={q.image} alt="Soru" className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700" />
                </div>
              )}
              {q.text && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap line-clamp-4">{q.text}</p>
              )}
              {q.note && (
                <div className="mt-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Neden yanlış: </span>
                    {q.note}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(q.createdAt)}</span>
                <button
                  onClick={() => toggleSolved(q.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    q.solved
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-success-600 text-white hover:bg-success-700'
                  }`}
                >
                  {q.solved ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {q.solved ? 'Tekrar Et' : 'Çözüldü'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
