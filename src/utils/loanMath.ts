import { addMonths, differenceInDays, differenceInMonths, endOfMonth, startOfMonth } from 'date-fns';

export type InterestCalculationMethod = 'Daily' | 'Monthly';

export interface Scenario {
  id: string;
  name: string;
  lumpSums: LumpSum[];
  extraMonthlyPayment: number;
  fixedMonthlyPayment?: number;
  targetPayoffDate?: Date;
  annualExtraIncrement?: number; // Annual % increase for extra payment
  isAccessBond?: boolean;
  salaryAmount?: number;
  salarySpent?: number;
  savings?: number;
}

export interface LumpSum {
  monthIndex: number; // Months from start
  amount: number;
}

export interface LoanInputs {
  loanAmount: number;
  currentOutstanding: number;
  interestRate: number; // Annual percentage (e.g., 11.75)
  interestRateHike: number; // Potential hike for stress testing
  remainingTermYears: number;
  remainingTermMonths: number;
  startDate: Date;
  interestMethod: InterestCalculationMethod;
  isAccessBond?: boolean;
  monthlyServiceFee?: number;
  monthlyAssurance?: number; // Life cover
  monthlyInsurance?: number; // Building cover (HOC)
}

export interface ScheduleEntry {
  month: number;
  date: Date;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  extraPayment: number;
  closingBalance: number;
  interestSavedByOffset: number;
}

export interface LoanResult {
  schedule: ScheduleEntry[];
  totalInterest: number;
  totalServiceFees: number;
  totalAssurance: number;
  totalInsurance: number;
  payoffDate: Date;
  totalMonths: number;
  tippingPointMonth: number | null;
  interestSavedByOffset: number;
}

export function calculateMonthlyPayment(principal: number, annualRate: number, totalMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / totalMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

export function calculateLoanSchedule(inputs: LoanInputs, scenario: Scenario): LoanResult {
  const { currentOutstanding, interestRate, interestRateHike, startDate, interestMethod, remainingTermYears, remainingTermMonths } = inputs;
  const effectiveRate = interestRate + (interestRateHike || 0);
  const annualRateDecimal = effectiveRate / 100;
  
  const totalRemainingMonths = (remainingTermYears * 12) + remainingTermMonths;
  const baseMonthlyPayment = calculateMonthlyPayment(currentOutstanding, effectiveRate, totalRemainingMonths);

  let currentBalance = currentOutstanding;
  const schedule: ScheduleEntry[] = [];
  let totalInterest = 0;
  let totalServiceFees = 0;
  let totalAssurance = 0;
  let totalInsurance = 0;
  let interestSavedByOffset = 0;
  let virtualSavingsTrack = scenario.savings || 0;
  let month = 0;

  // Safety break at 50 years
  const maxMonths = 12 * 50;

  while (currentBalance > 0.01 && month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const openingBalance = currentBalance;
    
    // Decreasing term assurance: Premium decreases as balance decreases
    const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
    const currentAssurance = Math.max(0, openingBalance * assuranceRate);
    const monthlyCosts = (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);

    // Determine base payment for this month
    let scheduledPayment = baseMonthlyPayment;
    if (scenario.fixedMonthlyPayment !== undefined && scenario.fixedMonthlyPayment > 0) {
      // If user sets a fixed payment, we assume it's their TOTAL debit (Gross).
      // We subtract the non-interest costs to find how much actually goes to the loan account (Net).
      scheduledPayment = Math.max(0, scenario.fixedMonthlyPayment - monthlyCosts);
    }

    // Add extra monthly with annual increment
    let extraPayment = scenario.extraMonthlyPayment;
    if (scenario.annualExtraIncrement && scenario.annualExtraIncrement > 0) {
      const yearsElapsed = Math.floor(month / 12);
      extraPayment = scenario.extraMonthlyPayment * Math.pow(1 + (scenario.annualExtraIncrement / 100), yearsElapsed);
    }

    // Access Bond Logic
    const isAccessBond = !!(inputs.isAccessBond || scenario.isAccessBond);
    let interestOffset = 0;
    let monthlyInterestSavedByOffset = 0;

    if (isAccessBond) {
      const salary = scenario.salaryAmount || 0;
      const spent = scenario.salarySpent || 0;
      const unspent = Math.max(0, salary - spent);
      
      if (month === 0 && scenario.savings && scenario.savings > 0) {
        extraPayment += scenario.savings;
      }
      
      extraPayment += unspent;
      interestOffset = (scenario.savings || 0) + salary - (spent / 2);

      const avgVirtualBalance = virtualSavingsTrack + salary - (spent / 2);
      
      if (interestMethod === 'Monthly') {
        monthlyInterestSavedByOffset = (avgVirtualBalance * annualRateDecimal) / 12;
      } else {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const daysInMonth = differenceInDays(end, start) + 1;
        monthlyInterestSavedByOffset = (avgVirtualBalance * annualRateDecimal * daysInMonth) / 365;
      }

      virtualSavingsTrack += monthlyInterestSavedByOffset + unspent;
      interestSavedByOffset += monthlyInterestSavedByOffset;
    }

    // Add lump sums for this month
    const lumpSum = scenario.lumpSums.find(ls => ls.monthIndex === month);
    if (lumpSum) {
      extraPayment += lumpSum.amount;
    }

    const balanceForInterest = Math.max(0, currentBalance - interestOffset);
    
    let interest = 0;
    if (interestMethod === 'Monthly') {
      interest = (balanceForInterest * annualRateDecimal) / 12;
    } else {
      const daysInMonth = differenceInDays(end, start) + 1;
      interest = (balanceForInterest * annualRateDecimal * daysInMonth) / 365;
    }

    let totalPayment = scheduledPayment + extraPayment;

    // Cap payment to closing balance + interest
    if (totalPayment > (currentBalance + interest)) {
      totalPayment = currentBalance + interest;
    }

    const principal = Math.max(0, totalPayment - interest);
    currentBalance = Math.max(0, currentBalance + interest - totalPayment);
    
    totalInterest += interest;
    totalServiceFees += (inputs.monthlyServiceFee || 0);
    totalAssurance += currentAssurance;
    totalInsurance += (inputs.monthlyInsurance || 0);

    schedule.push({
      month,
      date: currentDate,
      openingBalance,
      payment: totalPayment - extraPayment,
      interest,
      principal,
      extraPayment,
      closingBalance: currentBalance,
      interestSavedByOffset: monthlyInterestSavedByOffset
    });

    month++;
  }

  const tippingPointMonth = schedule.findIndex(entry => entry.principal > entry.interest);

  return {
    schedule,
    totalInterest,
    totalServiceFees,
    totalAssurance,
    totalInsurance,
    payoffDate: schedule.length > 0 ? schedule[schedule.length - 1].date : startDate,
    totalMonths: schedule.length,
    tippingPointMonth: tippingPointMonth !== -1 ? tippingPointMonth : null,
    interestSavedByOffset
  };
}

export type SolveTarget = 'extraMonthlyPayment' | 'fixedMonthlyPayment' | 'annualExtraIncrement';

export function calculateTargetExtraPayment(
  inputs: LoanInputs, 
  targetDate: Date, 
  scenario: Scenario,
  solveFor: SolveTarget = 'extraMonthlyPayment'
): number {
  const targetMonths = differenceInMonths(targetDate, inputs.startDate);
  if (targetMonths <= 0) return 0;
  
  let low = 0;
  let high = solveFor === 'annualExtraIncrement' ? 500 : inputs.currentOutstanding; 
  
  let baseExtraForIncr = scenario.extraMonthlyPayment;
  if (solveFor === 'annualExtraIncrement' && baseExtraForIncr <= 0) {
    baseExtraForIncr = 500; 
  }

  if (solveFor === 'fixedMonthlyPayment') {
    const totalRemainingMonths = (inputs.remainingTermYears * 12) + inputs.remainingTermMonths;
    const basePMT = calculateMonthlyPayment(inputs.currentOutstanding, inputs.interestRate + inputs.interestRateHike, totalRemainingMonths);
    low = basePMT;
    high = Math.max(high, basePMT * 10); 
  }

  let val = 0;
  for (let i = 0; i < 30; i++) {
    val = (low + high) / 2;
    const testScenario: Scenario = { 
      ...scenario, 
      extraMonthlyPayment: solveFor === 'annualExtraIncrement' ? baseExtraForIncr : scenario.extraMonthlyPayment,
      [solveFor]: val, 
      targetPayoffDate: undefined 
    };
    
    const res = calculateLoanSchedule(inputs, testScenario);
    
    if (res.totalMonths > targetMonths) {
      low = val;
    } else {
      high = val;
    }
  }
  
  return solveFor === 'annualExtraIncrement' ? Number(high.toFixed(2)) : Math.ceil(high);
}
