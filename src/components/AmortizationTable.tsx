import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import type { ScheduleEntry, LoanInputs } from '../utils/loanMath';

interface AmortizationTableProps {
  schedule: ScheduleEntry[];
  baselineSchedule?: ScheduleEntry[];
  formatCurrency: (val: number) => string;
  scenarioName?: string;
  inputs: LoanInputs;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ 
  schedule, 
  baselineSchedule, 
  formatCurrency,
  scenarioName = 'Schedule',
  inputs
}) => {
  const isBaseline = baselineSchedule && schedule === baselineSchedule;
  const hasOffsetSavings = schedule.some(e => e.interestSavedByOffset > 0);

  const exportToCSV = () => {
    const headers = ['Month', 'Date', 'Installment', 'Extra', 'Total Outflow', 'Principal', 'Interest', 'Fees & Ins', 'Balance'];
    if (hasOffsetSavings) headers.push('Interest Earned (Offset)');
    if (baselineSchedule && !isBaseline) {
      headers.push('Balance Reduction');
    }

    const rows = schedule.map((entry, index) => {
      const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
      const currentAssurance = Math.max(0, entry.openingBalance * assuranceRate);
      const monthlyFees = (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);
      const installment = entry.payment + monthlyFees;
      const totalOutflow = installment + entry.extraPayment;

      const row = [
        entry.month + 1,
        format(entry.date, 'MMM yyyy'),
        installment.toFixed(2),
        entry.extraPayment.toFixed(2),
        totalOutflow.toFixed(2),
        entry.principal.toFixed(2),
        entry.interest.toFixed(2),
        monthlyFees.toFixed(2),
        entry.closingBalance.toFixed(2),
      ];

      if (hasOffsetSavings) row.push(entry.interestSavedByOffset.toFixed(2));

      if (baselineSchedule && !isBaseline) {
        const baselineEntry = baselineSchedule?.[index];
        const diff = baselineEntry ? baselineEntry.closingBalance - entry.closingBalance : 0;
        row.push(diff.toFixed(2));
      }

      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${scenarioName.replace(/\s+/g, '_')}_amortization.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
      
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3">Month</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3 text-right">Installment</th>
              <th scope="col" className="px-4 py-3 text-right text-blue-500 dark:text-blue-400">Extra</th>
              <th scope="col" className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">Total</th>
              <th scope="col" className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">Principal</th>
              <th scope="col" className="px-4 py-3 text-right text-red-500 dark:text-red-400">Interest</th>
              <th scope="col" className="px-4 py-3 text-right">Fees & Ins</th>
              {hasOffsetSavings && (
                <th scope="col" className="px-4 py-3 text-right text-indigo-500 dark:text-indigo-400">Offset</th>
              )}
              <th scope="col" className="px-4 py-3 text-right">Balance</th>
              {baselineSchedule && !isBaseline && (
                <th scope="col" className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">Benefit</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {schedule.map((entry, index) => {
              const baselineEntry = baselineSchedule?.[index];
              const diff = baselineEntry ? baselineEntry.closingBalance - entry.closingBalance : 0;
              
              const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
              const currentAssurance = Math.max(0, entry.openingBalance * assuranceRate);
              const monthlyFees = (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);
              const installment = entry.payment + monthlyFees;
              const totalOutflow = installment + entry.extraPayment;

              return (
                <tr key={entry.month} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{entry.month + 1}</td>
                  <td className="px-4 py-2.5">{format(entry.date, 'MMM yyyy')}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-300">
                    {formatCurrency(installment)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-blue-500 dark:text-blue-400">
                    {entry.extraPayment > 0 ? formatCurrency(entry.extraPayment) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalOutflow)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(entry.principal)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">
                    {formatCurrency(entry.interest)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {formatCurrency(monthlyFees)}
                  </td>
                  {hasOffsetSavings && (
                    <td className="px-4 py-2.5 text-right text-indigo-500 dark:text-indigo-400 italic">
                      {entry.interestSavedByOffset > 0 ? `+${formatCurrency(entry.interestSavedByOffset)}` : '-'}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(entry.closingBalance)}
                  </td>
                  {baselineSchedule && !isBaseline && (
                    <td className="px-4 py-2.5 text-right font-medium text-indigo-600 dark:text-indigo-400">
                      <div className="flex flex-col items-end">
                        <span>{diff > 0 ? `+${formatCurrency(diff)}` : diff < 0 ? `-${formatCurrency(Math.abs(diff))}` : '-'}</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {baselineSchedule && (
            <tfoot className="bg-slate-50 dark:bg-slate-700/50 font-bold text-slate-900 dark:text-white">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(schedule.reduce((sum, e) => {
                    const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
                    const currentAssurance = Math.max(0, e.openingBalance * assuranceRate);
                    const fees = (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);
                    return sum + e.payment + fees;
                  }, 0))}
                </td>
                <td className="px-4 py-3 text-right text-blue-500 dark:text-blue-400">
                  {formatCurrency(schedule.reduce((sum, e) => sum + e.extraPayment, 0))}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(schedule.reduce((sum, e) => {
                    const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
                    const currentAssurance = Math.max(0, e.openingBalance * assuranceRate);
                    const fees = (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);
                    return sum + e.payment + e.extraPayment + fees;
                  }, 0))}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(schedule.reduce((sum, e) => sum + e.principal, 0))}
                </td>
                <td className="px-4 py-3 text-right text-red-500 dark:text-red-400">
                  {formatCurrency(schedule.reduce((sum, e) => sum + e.interest, 0))}
                </td>
                <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                  {formatCurrency(schedule.reduce((sum, e) => {
                    const assuranceRate = (inputs.monthlyAssurance || 0) / (inputs.currentOutstanding || 1);
                    const currentAssurance = Math.max(0, e.openingBalance * assuranceRate);
                    return sum + (inputs.monthlyServiceFee || 0) + currentAssurance + (inputs.monthlyInsurance || 0);
                  }, 0))}
                </td>
                <td colSpan={isBaseline ? 1 : 2} className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};