import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { LoanInputs } from '../utils/loanMath';
import type { CalculationResult } from '../hooks/useLoanCalculations';
import { parseSafeNumber } from '../utils/formatters';

interface StressTestProps {
  inputs: LoanInputs;
  setInputs: (inputs: LoanInputs) => void;
  monthlyInstallment: number;
  baseInstallment: number;
  results: CalculationResult[];
  formatCurrency: (val: number) => string;
}

export const StressTest: React.FC<StressTestProps> = ({
  inputs,
  setInputs,
  monthlyInstallment,
  baseInstallment,
  results,
  formatCurrency
}) => {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Rate Stress Test
        </h2>
        {inputs.interestRateHike > 0 && (
          <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">
            ACTIVE
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        How would a rate hike affect you? Adjust the slider to see the impact on your monthly installment and payoff date.
      </p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium dark:text-slate-300">Potential Hike: +{inputs.interestRateHike.toFixed(2)}%</span>
            <span className="text-xs font-bold text-amber-500">{formatCurrency(monthlyInstallment - baseInstallment)} more / month</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.25"
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            value={inputs.interestRateHike}
            onChange={(e) => setInputs({...inputs, interestRateHike: parseSafeNumber(e.target.value)})}
          />
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            At +{inputs.interestRateHike}%: You will pay an extra <strong>{formatCurrency((monthlyInstallment - baseInstallment) * results[0].result.totalMonths)}</strong> in interest over the remaining term.
          </p>
        </div>
      </div>
    </section>
  );
};
