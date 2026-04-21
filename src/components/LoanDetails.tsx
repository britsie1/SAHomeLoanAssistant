import React from 'react';
import { Info } from 'lucide-react';
import type { LoanInputs, InterestCalculationMethod } from '../utils/loanMath';
import { parseSafeNumber } from '../utils/formatters';

interface LoanDetailsProps {
  inputs: LoanInputs;
  setInputs: (inputs: LoanInputs) => void;
  monthlyInstallment: number;
  baseInstallment: number;
  formatCurrency: (val: number) => string;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({ 
  inputs, 
  setInputs, 
  monthlyInstallment, 
  baseInstallment, 
  formatCurrency 
}) => {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Loan Details
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Outstanding</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">R</span>
            <input 
              type="text" 
              inputMode="decimal"
              className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputs.currentOutstanding}
              onChange={(e) => setInputs({...inputs, currentOutstanding: parseSafeNumber(e.target.value)})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remaining Years</label>
            <input 
              type="text" 
              inputMode="numeric"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputs.remainingTermYears}
              onChange={(e) => setInputs({...inputs, remainingTermYears: parseSafeNumber(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Months</label>
            <input 
              type="text" 
              inputMode="numeric"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputs.remainingTermMonths}
              onChange={(e) => setInputs({...inputs, remainingTermMonths: parseSafeNumber(e.target.value)})}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interest Rate (%)</label>
          <input 
            type="text" 
            inputMode="decimal"
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={inputs.interestRate}
            onChange={(e) => setInputs({...inputs, interestRate: parseSafeNumber(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interest Calculation</label>
          <select 
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            value={inputs.interestMethod}
            onChange={(e) => setInputs({...inputs, interestMethod: e.target.value as InterestCalculationMethod})}
          >
            <option value="Daily">Daily Balance (Standard Bank, etc.)</option>
            <option value="Monthly">Monthly Balance</option>
          </select>
        </div>

        <div className="flex items-center gap-2 py-1">
          <input 
            type="checkbox"
            id="isAccessBond"
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            checked={inputs.isAccessBond}
            onChange={(e) => setInputs({...inputs, isAccessBond: e.target.checked})}
          />
          <label htmlFor="isAccessBond" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            This is an Access Bond
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Service Fee (R)</label>
          <input 
            type="text" 
            inputMode="decimal"
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={inputs.monthlyServiceFee}
            onChange={(e) => setInputs({...inputs, monthlyServiceFee: parseSafeNumber(e.target.value)})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assurance (R)</label>
            <input 
              type="text" 
              inputMode="decimal"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputs.monthlyAssurance}
              onChange={(e) => setInputs({...inputs, monthlyAssurance: parseSafeNumber(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Insurance (R)</label>
            <input 
              type="text" 
              inputMode="decimal"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputs.monthlyInsurance}
              onChange={(e) => setInputs({...inputs, monthlyInsurance: parseSafeNumber(e.target.value)})}
            />
          </div>
        </div>

        <p className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-800 italic">
          <strong>Note:</strong> Only include Assurance (Life) or Insurance (Building) if your bank collects these as part of your monthly bond installment.
        </p>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Installment</span>
            <div className="text-right">
              {inputs.interestRateHike > 0 && (
                <span className="block text-xs text-slate-400 line-through decoration-red-400">{formatCurrency(baseInstallment)}</span>
              )}
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyInstallment)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight italic">
            * Estimated amount. Actual installment may differ due to service fees, assurance, and insurance.
          </p>
        </div>
      </div>
    </section>
  );
};
