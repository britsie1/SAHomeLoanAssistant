import { useState, useMemo, useEffect } from 'react';
import { parseISO, isValid } from 'date-fns';
import { calculateLoanSchedule, calculateTargetExtraPayment } from '../utils/loanMath';
import type { LoanInputs, Scenario, LoanResult, SolveTarget } from '../utils/loanMath';
import { decodeState } from '../utils/urlState';

export interface SavedScenario extends Omit<Scenario, 'targetPayoffDate'> {
  color: string;
  targetPayoffDate?: string;
  solveTarget?: SolveTarget;
  isAccessBond?: boolean;
  salaryAmount?: number;
  salarySpent?: number;
  savings?: number;
}

export interface CalculationResult {
  scenario: SavedScenario;
  result: LoanResult;
  solvedValue?: number;
}

export const DEFAULT_INPUTS: LoanInputs = {
  loanAmount: 1000000,
  currentOutstanding: 1000000,
  interestRate: 11.75,
  interestRateHike: 0,
  remainingTermYears: 20,
  remainingTermMonths: 0,
  startDate: new Date(),
  interestMethod: 'Daily',
  isAccessBond: false,
  monthlyServiceFee: 69,
  monthlyAssurance: 0,
  monthlyInsurance: 0
};

export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function useLoanCalculations() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [inputs, setInputs] = useState<LoanInputs>(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedState = params.get('s') ? decodeState(params.get('s')!) : null;
    if (sharedState) return sharedState.inputs;

    const saved = localStorage.getItem('loan_inputs');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_INPUTS, 
        ...parsed, 
        startDate: parsed.startDate ? new Date(parsed.startDate) : DEFAULT_INPUTS.startDate 
      };
    }
    return DEFAULT_INPUTS;
  });

  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedState = params.get('s') ? decodeState(params.get('s')!) : null;
    if (sharedState) return sharedState.scenarios;

    const saved = localStorage.getItem('loan_scenarios');
    const parsed: SavedScenario[] = saved ? JSON.parse(saved) : [
      { id: '1', name: 'Baseline', lumpSums: [], extraMonthlyPayment: 0, color: COLORS[0] },
      { id: '2', name: 'Monthly Boost (R1k)', lumpSums: [], extraMonthlyPayment: 1000, color: COLORS[1] },
      { id: '3', name: 'Year 1 Lump Sum (R50k)', lumpSums: [{ monthIndex: 12, amount: 50000 }], extraMonthlyPayment: 0, color: COLORS[2] }
    ];
    // Sanitize in case of schema changes
    return parsed.map(s => ({
      ...s,
      lumpSums: s.lumpSums || [],
      extraMonthlyPayment: s.extraMonthlyPayment || 0,
      isAccessBond: s.isAccessBond || false,
      salaryAmount: s.salaryAmount || 0,
      salarySpent: s.salarySpent || 0,
      savings: s.savings || 0
    }));
  });

  useEffect(() => {
    localStorage.setItem('loan_inputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem('loan_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const monthlyInstallment = useMemo(() => {
    const totalRemainingMonths = (inputs.remainingTermYears * 12) + inputs.remainingTermMonths;
    if (totalRemainingMonths <= 0) return 0;
    const effectiveRate = inputs.interestRate + (inputs.interestRateHike || 0);
    const monthlyRate = effectiveRate / 100 / 12;
    const pmt = monthlyRate === 0 
      ? inputs.currentOutstanding / totalRemainingMonths 
      : (inputs.currentOutstanding * monthlyRate * Math.pow(1 + monthlyRate, totalRemainingMonths)) / 
        (Math.pow(1 + monthlyRate, totalRemainingMonths) - 1);

    // Add current month's fees and insurance to the displayed total
    return pmt + (inputs.monthlyServiceFee || 0) + (inputs.monthlyAssurance || 0) + (inputs.monthlyInsurance || 0);
  }, [inputs]);

  const baseInstallment = useMemo(() => {
    const totalRemainingMonths = (inputs.remainingTermYears * 12) + inputs.remainingTermMonths;
    if (totalRemainingMonths <= 0) return 0;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const pmt = monthlyRate === 0 
      ? inputs.currentOutstanding / totalRemainingMonths 
      : (inputs.currentOutstanding * monthlyRate * Math.pow(1 + monthlyRate, totalRemainingMonths)) / 
        (Math.pow(1 + monthlyRate, totalRemainingMonths) - 1);

    return pmt + (inputs.monthlyServiceFee || 0) + (inputs.monthlyAssurance || 0) + (inputs.monthlyInsurance || 0);
  }, [inputs.interestRate, inputs.currentOutstanding, inputs.remainingTermYears, inputs.remainingTermMonths, inputs.monthlyServiceFee, inputs.monthlyAssurance, inputs.monthlyInsurance]);

  const results = useMemo(() => {
    return scenarios.map(s => {
      let finalScenario: Scenario = { 
        ...s, 
        targetPayoffDate: s.targetPayoffDate ? parseISO(s.targetPayoffDate) : undefined 
      };
      
      let solvedValue: number | undefined;

      if (finalScenario.targetPayoffDate && isValid(finalScenario.targetPayoffDate)) {
        const target = s.solveTarget || 'extraMonthlyPayment';
        solvedValue = calculateTargetExtraPayment(inputs, finalScenario.targetPayoffDate, finalScenario, target);
        
        // Apply the solved value to the final scenario for calculation
        // @ts-ignore - Dynamic key assignment
        finalScenario[target] = solvedValue;

        // If we solved for annual increment and the base was 0, we need to match the solver's default base
        if (target === 'annualExtraIncrement' && finalScenario.extraMonthlyPayment <= 0) {
          finalScenario.extraMonthlyPayment = 500;
        }
      }

      return {
        scenario: s,
        result: calculateLoanSchedule(inputs, finalScenario),
        solvedValue
      };
    });
  }, [inputs, scenarios]);

  const addScenario = () => {
    const nextColor = COLORS[scenarios.length % COLORS.length];
    const newScenario: SavedScenario = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Scenario ${scenarios.length + 1}`,
      lumpSums: [],
      extraMonthlyPayment: 0,
      color: nextColor
    };
    setScenarios([...scenarios, newScenario]);
  };

  const updateScenario = (id: string, updates: Partial<SavedScenario>) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  return {
    inputs,
    setInputs,
    scenarios,
    setScenarios,
    isDarkMode,
    setIsDarkMode,
    monthlyInstallment,
    baseInstallment,
    results,
    addScenario,
    updateScenario,
    removeScenario
  };
}
