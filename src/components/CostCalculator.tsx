import React from 'react';
import { Home } from 'lucide-react';
import type { PropertyCosts } from '../utils/costCalculators';
import { parseSafeNumber } from '../utils/formatters';

interface CostCalculatorProps {
  propertyPrice: number;
  setPropertyPrice: (val: number) => void;
  costBondAmount: number;
  setCostBondAmount: (val: number) => void;
  propertyCosts: PropertyCosts;
  formatCurrency: (val: number) => string;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  propertyPrice,
  setPropertyPrice,
  costBondAmount,
  setCostBondAmount,
  propertyCosts,
  formatCurrency
}) => {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
        <Home className="w-5 h-5 text-purple-500" />
        Transfer & Bond Costs
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Property Price</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">R</span>
            <input 
              type="text" 
              inputMode="decimal"
              className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(parseSafeNumber(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bond Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">R</span>
            <input 
              type="text" 
              inputMode="decimal"
              className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={costBondAmount}
              onChange={(e) => setCostBondAmount(parseSafeNumber(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Transfer Duty (SARS)</span>
            <span className="font-semibold dark:text-white">{formatCurrency(propertyCosts.transferDuty)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Attorneys Fees (Incl. VAT)</span>
            <span className="font-semibold dark:text-white">{formatCurrency(propertyCosts.conveyancingFees + propertyCosts.bondRegistrationFees + propertyCosts.vatOnFees)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Upfront Cash</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(propertyCosts.totalCosts)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
