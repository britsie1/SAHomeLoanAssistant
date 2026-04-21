import React from 'react';
import { format } from 'date-fns';
import { Clock, TrendingDown, Table, Wallet } from 'lucide-react';
import type { CalculationResult } from '../hooks/useLoanCalculations';
import type { LoanInputs } from '../utils/loanMath';

interface SummaryCardsProps {
  results: CalculationResult[];
  inputs: LoanInputs;
  formatCurrency: (val: number) => string;
  formatTimeSaved: (months: number) => string | null;
  onViewSchedule: (result: CalculationResult) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  results, 
  inputs,
  formatCurrency, 
  formatTimeSaved,
  onViewSchedule
}) => {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
        {results.map((r, i) => {
          const timeSavedMonths = results[0].result.totalMonths - r.result.totalMonths;
          const isAccessBond = inputs.isAccessBond || r.scenario.isAccessBond;

          return (
            <div 
              key={r.scenario.id} 
              className="min-w-[280px] md:min-w-[320px] snap-start bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-t-4 transition-all hover:scale-[1.02] flex flex-col" 
              style={{ borderTopColor: r.scenario.color }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{r.scenario.name}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{format(r.result.payoffDate, 'MMM yyyy')}</p>
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-slate-400">
                    Total Interest: {formatCurrency(r.result.totalInterest)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Total Fees & Ins: {formatCurrency(r.result.totalServiceFees + r.result.totalAssurance + r.result.totalInsurance)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-tighter">
                    Total Cost of Credit: <span className="text-slate-900 dark:text-white">{formatCurrency(r.result.totalInterest + r.result.totalServiceFees + r.result.totalAssurance + r.result.totalInsurance)}</span>
                  </p>
                  
                  {isAccessBond && r.result.interestSavedByOffset > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Access Bond Benefit
                      </p>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Effective Yield: <span className="font-bold text-indigo-600 dark:text-indigo-400">{(inputs.interestRate + inputs.interestRateHike).toFixed(2)}%</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Offset Savings: <span className="font-semibold">{formatCurrency(r.result.interestSavedByOffset)}</span>
                      </p>
                    </div>
                  )}

                  {i > 0 && (timeSavedMonths > 0 || (results[0].result.totalInterest - r.result.totalInterest) > 0) && (
                    <div className="flex flex-col gap-1 mt-3">
                      {timeSavedMonths > 0 && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[11px] font-bold w-fit">
                          <Clock className="w-3 h-3" />
                          Saved {formatTimeSaved(timeSavedMonths)}
                        </div>
                      )}
                      {(results[0].result.totalInterest - r.result.totalInterest) > 0 && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[11px] font-bold w-fit">
                          <TrendingDown className="w-3 h-3" />
                          Interest Saved {formatCurrency(results[0].result.totalInterest - r.result.totalInterest)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => onViewSchedule(r)}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              >
                <Table className="w-3.5 h-3.5" />
                Amortization Table
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
