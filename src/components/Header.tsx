import React from 'react';
import { Home, Sun, Moon, Share, Printer } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, onShare }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SA Home Loan Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium">
            Helping you pay off your bond faster
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-bold"
              title="Generate shareable link"
            >
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-bold"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
