import { useState } from 'react';
import { GraduationCap, CheckSquare, NotebookPen, BarChart3, Moon, Sun, Menu, X } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import SubjectMatrix from '@/components/SubjectMatrix';
import WrongNotebook from '@/components/WrongNotebook';
import ExamAnalysis from '@/components/ExamAnalysis';
import YKSCountdown from '@/components/YKSCountdown';
import type { TabId } from '@/types';

const tabs: { id: TabId; label: string; icon: typeof CheckSquare; description: string }[] = [
  { id: 'matrix', label: 'Konu Takip', icon: CheckSquare, description: 'TYT müfredat matrisi' },
  { id: 'notebook', label: 'Yanlış Defterim', icon: NotebookPen, description: 'Hatalı sorularını kaydet' },
  { id: 'analysis', label: 'Net Analizi', icon: BarChart3, description: 'AI koç analizi' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('matrix');
  const [isDark, toggleDark] = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  TYT Akıllı Koç
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block leading-tight">
                  Takip Asistanı
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Tema değiştir"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menü"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-up">
            <div className="max-w-5xl mx-auto px-4 py-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Mobile Tab Bar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8 space-y-6">
        <YKSCountdown />
        {activeTab === 'matrix' && <SubjectMatrix />}
        {activeTab === 'notebook' && <WrongNotebook />}
        {activeTab === 'analysis' && <ExamAnalysis />}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            TYT Akıllı Koç ve Takip Asistanı — Verileriniz tarayıcınızda yerel olarak saklanır.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
