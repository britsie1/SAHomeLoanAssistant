import React from 'react';
import { Plus, X, TrendingDown, TrendingUp, Target, Info, Wallet } from 'lucide-react';
import type { SavedScenario, CalculationResult } from '../hooks/useLoanCalculations';
import type { LoanInputs } from '../utils/loanMath';
import { parseSafeNumber } from '../utils/formatters';

interface ScenarioManagerProps {
  scenarios: SavedScenario[];
  results: CalculationResult[];
  inputs: LoanInputs;
  addScenario: () => void;
  updateScenario: (id: string, updates: Partial<SavedScenario>) => void;
  removeScenario: (id: string) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  results,
  inputs,
  addScenario,
  updateScenario,
  removeScenario
}) => {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <TrendingDown className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          Scenarios
        </h2>
        <button 
          onClick={addScenario}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-blue-600 dark:text-blue-400"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        {scenarios.map((s, idx) => {
          const result = results.find(r => r.scenario.id === s.id);
          return (
            <div key={s.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 relative group">
              {idx > 0 && (
                <button 
                  onClick={() => removeScenario(s.id)}
                  className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                <input 
                  className="bg-transparent font-semibold text-slate-800 dark:text-white outline-none w-full"
                  value={s.name}
                  onChange={(e) => updateScenario(s.id, { name: e.target.value })}
                />
              </div>

              {/* Target Date Picker (Solver Trigger) moved to top */}
              <div className={`p-3 rounded-xl mb-4 transition-colors ${s.targetPayoffDate ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className={`w-3.5 h-3.5 ${s.targetPayoffDate ? 'text-blue-500' : 'text-slate-400'}`} />
                    TARGET PAYOFF DATE
                  </label>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                      Setting a target date activates the Auto-Solver, which adjusts your payments to hit this specific month.
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input 
                      type="month"
                      className={`w-full px-3 py-1.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${s.targetPayoffDate ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 font-bold' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                      value={s.targetPayoffDate || ''}
                      onChange={(e) => updateScenario(s.id, { targetPayoffDate: e.target.value || undefined })}
                    />
                    {s.targetPayoffDate && (
                      <button 
                        onClick={() => updateScenario(s.id, { targetPayoffDate: undefined })}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {s.targetPayoffDate && (
                    <div className="mt-1 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-blue-600/70 dark:text-blue-400/70 mb-1.5">Solving For:</label>
                      <select 
                        className="w-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg p-1.5 text-xs outline-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/50"
                        value={s.solveTarget || 'extraMonthlyPayment'}
                        onChange={(e) => updateScenario(s.id, { solveTarget: e.target.value as any })}
                      >
                        <option value="extraMonthlyPayment">Extra Monthly Payment</option>
                        <option value="fixedMonthlyPayment">Fixed Monthly Premium</option>
                        <option value="annualExtraIncrement">Annual Increase (%)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex justify-between items-center">
                    Extra Monthly Payment
                    {s.targetPayoffDate && s.solveTarget === 'extraMonthlyPayment' && (
                      <span className="text-[10px] text-blue-500 font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded">SOLVED</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400">R</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      className={`w-full pl-6 pr-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        s.targetPayoffDate && s.solveTarget === 'extraMonthlyPayment' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300' 
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                      value={s.targetPayoffDate && (s.solveTarget === 'extraMonthlyPayment' || !s.solveTarget) ? (result?.solvedValue ?? '') : s.extraMonthlyPayment}
                      onChange={(e) => updateScenario(s.id, { extraMonthlyPayment: parseSafeNumber(e.target.value) })}
                      disabled={!!(s.targetPayoffDate && (s.solveTarget === 'extraMonthlyPayment' || !s.solveTarget))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Annual Extra Increase (%)
                    </span>
                    {s.targetPayoffDate && s.solveTarget === 'annualExtraIncrement' && (
                      <span className="text-[10px] text-blue-500 font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded">SOLVED</span>
                    )}
                  </label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 7"
                    className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      s.targetPayoffDate && s.solveTarget === 'annualExtraIncrement' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300' 
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                    value={s.targetPayoffDate && s.solveTarget === 'annualExtraIncrement' ? (result?.solvedValue ?? '') : (s.annualExtraIncrement || '')}
                    onChange={(e) => updateScenario(s.id, { annualExtraIncrement: parseSafeNumber(e.target.value) || undefined })}
                    disabled={!!(s.targetPayoffDate && s.solveTarget === 'annualExtraIncrement')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex justify-between items-center">
                    Fixed Premium (Optional)
                    {s.targetPayoffDate && s.solveTarget === 'fixedMonthlyPayment' && (
                      <span className="text-[10px] text-blue-500 font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded">SOLVED</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400">R</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 15000"
                      className={`w-full pl-6 pr-3 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        s.targetPayoffDate && s.solveTarget === 'fixedMonthlyPayment' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300' 
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                      value={s.targetPayoffDate && s.solveTarget === 'fixedMonthlyPayment' ? (result?.solvedValue ?? '') : (s.fixedMonthlyPayment || '')}
                      onChange={(e) => updateScenario(s.id, { fixedMonthlyPayment: parseSafeNumber(e.target.value) || undefined })}
                      disabled={!!(s.targetPayoffDate && s.solveTarget === 'fixedMonthlyPayment')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                    Lump Sums
                    <button 
                      onClick={() => {
                        const newLumpSum = { monthIndex: 12, amount: 10000 };
                        updateScenario(s.id, { lumpSums: [...s.lumpSums, newLumpSum] });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </label>
                  <div className="space-y-2">
                    {s.lumpSums.map((ls, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2">
                        <input 
                          type="text"
                          inputMode="numeric"
                          placeholder="Month"
                          className="w-16 px-1 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
                          value={ls.monthIndex}
                          onChange={(e) => {
                            const newLumpSums = [...s.lumpSums];
                            newLumpSums[lIdx].monthIndex = parseSafeNumber(e.target.value);
                            updateScenario(s.id, { lumpSums: newLumpSums });
                          }}
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-1 top-1 text-[10px] text-slate-400">R</span>
                          <input 
                            type="text"
                            inputMode="decimal"
                            placeholder="Amount"
                            className="w-full pl-4 pr-1 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
                            value={ls.amount}
                            onChange={(e) => {
                              const newLumpSums = [...s.lumpSums];
                              newLumpSums[lIdx].amount = parseSafeNumber(e.target.value);
                              updateScenario(s.id, { lumpSums: newLumpSums });
                            }}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newLumpSums = s.lumpSums.filter((_, i) => i !== lIdx);
                            updateScenario(s.id, { lumpSums: newLumpSums });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  {!inputs.isAccessBond && (
                    <div className="flex items-center gap-2 mb-3">
                      <input 
                        type="checkbox"
                        id={`access-bond-${s.id}`}
                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        checked={!!s.isAccessBond}
                        onChange={(e) => updateScenario(s.id, { isAccessBond: e.target.checked })}
                      />
                      <label htmlFor={`access-bond-${s.id}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Simulate Access Bond
                      </label>
                    </div>
                  )}

                  {(inputs.isAccessBond || s.isAccessBond) && (
                    <div className="grid grid-cols-1 gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Monthly Salary</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-blue-400">R</span>
                          <input 
                            type="text"
                            inputMode="decimal"
                            className="w-full pl-5 pr-2 py-1 text-xs border border-blue-100 dark:border-blue-800 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={s.salaryAmount ?? ''}
                            onChange={(e) => updateScenario(s.id, { salaryAmount: parseSafeNumber(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Amount Spent by Month End</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-blue-400">R</span>
                          <input 
                            type="text"
                            inputMode="decimal"
                            className="w-full pl-5 pr-2 py-1 text-xs border border-blue-100 dark:border-blue-800 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={s.salarySpent ?? ''}
                            onChange={(e) => updateScenario(s.id, { salarySpent: parseSafeNumber(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Savings (Initial Deposit)</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-blue-400">R</span>
                          <input 
                            type="text"
                            inputMode="decimal"
                            className="w-full pl-5 pr-2 py-1 text-xs border border-blue-100 dark:border-blue-800 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={s.savings ?? ''}
                            onChange={(e) => updateScenario(s.id, { savings: parseSafeNumber(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
