import React from 'react';
import { format } from 'date-fns';
import type { LoanInputs, LoanResult } from '../utils/loanMath';
import type { CalculationResult } from '../hooks/useLoanCalculations';

interface PrintReportProps {
  inputs: LoanInputs;
  results: CalculationResult[];
  formatCurrency: (val: number) => string;
  formatTimeSaved: (months: number) => string | null;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  inputs,
  results,
  formatCurrency,
  formatTimeSaved
}) => {
  const date = new Date();
  
  return (
    <div className="hidden print:block print:p-8 bg-white text-black min-h-screen font-serif">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Loan Comparison Report</h1>
          <p className="text-sm italic">Generated on {format(date, 'PPPP')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">SA Home Loan Assistant</p>
          <p className="text-xs">Precision Mortgage Modeling</p>
        </div>
      </div>

      {/* Input Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-bold border-b border-black mb-3">1. Loan Parameters</h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Outstanding Balance:</span>
            <span className="font-bold">{formatCurrency(inputs.currentOutstanding)}</span>
          </div>
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Interest Rate (Nominal):</span>
            <span className="font-bold">{inputs.interestRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Remaining Term:</span>
            <span className="font-bold">{inputs.remainingTermYears}y {inputs.remainingTermMonths}m</span>
          </div>
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Interest Calculation:</span>
            <span className="font-bold">{inputs.interestMethod}</span>
          </div>
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Monthly Service Fee:</span>
            <span className="font-bold">{formatCurrency(inputs.monthlyServiceFee || 0)}</span>
          </div>
          <div className="flex justify-between border-b border-dotted border-slate-300">
            <span>Life Assurance (Current):</span>
            <span className="font-bold">{formatCurrency(inputs.monthlyAssurance || 0)}</span>
          </div>
        </div>
      </section>

      {/* Executive Comparison */}
      <section className="mb-8">
        <h2 className="text-lg font-bold border-b border-black mb-3">2. Scenario Comparison</h2>
        <table className="w-full text-left text-sm border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2">Scenario</th>
              <th className="border border-black p-2">Payoff Date</th>
              <th className="border border-black p-2">Time Saved</th>
              <th className="border border-black p-2">Interest Saved</th>
              <th className="border border-black p-2">Total Outflow</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const timeSaved = results[0].result.totalMonths - r.result.totalMonths;
              const interestSaved = results[0].result.totalInterest - r.result.totalInterest;
              const totalCost = r.result.totalInterest + r.result.totalServiceFees + r.result.totalAssurance + r.result.totalInsurance;
              
              return (
                <tr key={r.scenario.id}>
                  <td className="border border-black p-2 font-bold">{r.scenario.name}</td>
                  <td className="border border-black p-2">{format(r.result.payoffDate, 'MMM yyyy')}</td>
                  <td className="border border-black p-2">{i === 0 ? '-' : (formatTimeSaved(timeSaved) || '0m')}</td>
                  <td className="border border-black p-2">{i === 0 ? '-' : formatCurrency(interestSaved)}</td>
                  <td className="border border-black p-2 font-bold">{formatCurrency(totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Financial Impact */}
      <section className="mb-8">
        <h2 className="text-lg font-bold border-b border-black mb-3">3. Key Financial Milestones</h2>
        <div className="space-y-4">
          {results.length > 1 && results.slice(1).filter(r => (results[0].result.totalMonths - r.result.totalMonths) > 0).map(r => {
            const interestSaved = results[0].result.totalInterest - r.result.totalInterest;
            const payoffDiff = results[0].result.totalMonths - r.result.totalMonths;
            
            return (
              <div key={r.scenario.id} className="p-4 bg-slate-50 border border-slate-200">
                <p className="text-sm leading-relaxed">
                  By implementing the <strong>{r.scenario.name}</strong> strategy, you will pay off your bond <strong>{formatTimeSaved(payoffDiff)}</strong> earlier. 
                  This results in a direct interest saving of <strong>{formatCurrency(interestSaved)}</strong>. 
                  Your "Tipping Point" (where principal exceeds interest) will move to <strong>{r.result.tippingPointMonth ? format(r.result.schedule[r.result.tippingPointMonth].date, 'MMM yyyy') : 'N/A'}</strong>.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <div className="mt-auto pt-12 text-[10px] text-slate-500 text-center border-t border-slate-200">
        <p>Disclaimer: This report is for illustrative purposes only. Calculations are based on information provided and current market assumptions. Actual bank installments, interest rates, and fees are subject to change and should be verified with your financial institution.</p>
        <p className="mt-1 font-bold">SA Home Loan Assistant &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
