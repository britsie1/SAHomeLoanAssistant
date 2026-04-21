import React, { useState, useMemo } from 'react';
import { format, addMonths } from 'date-fns';
import { useLoanCalculations } from './hooks/useLoanCalculations';
import type { CalculationResult } from './hooks/useLoanCalculations';
import { calculatePropertyCosts } from './utils/costCalculators';
import { formatCurrency, formatTimeSaved } from './utils/formatters';

// Components
import { Header } from './components/Header';
import { LoanDetails } from './components/LoanDetails';
import { StressTest } from './components/StressTest';
import { CostCalculator } from './components/CostCalculator';
import { SummaryCards } from './components/SummaryCards';
import { ComparisonChart } from './components/ComparisonChart';
import { ScenarioManager } from './components/ScenarioManager';
import { AssistantSuggestions } from './components/AssistantSuggestions';
import { FAQSection } from './components/FAQSection';
import { Modal } from './components/Modal';
import { AmortizationTable } from './components/AmortizationTable';
import { ShareModal } from './components/ShareModal';
import { PrintReport } from './components/PrintReport';

export interface ChartEntry {
  month: number;
  date: string;
  [key: string]: string | number;
}

const App: React.FC = () => {
  const {
    inputs,
    setInputs,
    scenarios,
    isDarkMode,
    setIsDarkMode,
    monthlyInstallment,
    baseInstallment,
    results,
    addScenario,
    updateScenario,
    removeScenario
  } = useLoanCalculations();

  // State for Amortization Table Modal
  const [selectedResult, setSelectedResult] = useState<CalculationResult | null>(null);
  
  // State for Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Cost Calculator State
  const [propertyPrice, setPropertyPrice] = useState(1500000);
  const [costBondAmount, setCostBondAmount] = useState(1500000);

  const propertyCosts = useMemo(() => {
    return calculatePropertyCosts(propertyPrice, costBondAmount);
  }, [propertyPrice, costBondAmount]);

  const chartData = useMemo(() => {
    const maxMonths = Math.max(...results.map(r => r.result.schedule.length));
    if (maxMonths === 0) return [];

    const data: ChartEntry[] = [];
    const step = maxMonths > 120 ? 3 : 1;

    for (let i = 0; i <= maxMonths + step; i += step) {
      const currentMonth = Math.min(i, maxMonths - 1);
      if (currentMonth < 0) break;

      const entry: ChartEntry = { 
        month: currentMonth, 
        date: format(addMonths(inputs.startDate, currentMonth), 'MMM yyyy') 
      };
      
      let hasValue = false;
      results.forEach(r => {
        const scenarioName = r.scenario.name;
        const schedule = r.result.schedule;
        const len = schedule.length;

        if (currentMonth < len) {
          entry[scenarioName] = Math.round(schedule[currentMonth].closingBalance);
          hasValue = true;
        } else if (len > 0 && schedule[len - 1].closingBalance < 0.01) {
          // Add exactly one terminal zero point if the loan actually finished
          const prevEntry = data[data.length - 1];
          if (prevEntry && prevEntry[scenarioName] !== undefined && (prevEntry[scenarioName] as number) > 0) {
            entry[scenarioName] = 0;
            hasValue = true;
          }
        }
      });

      if (hasValue) {
        if (data.length > 0 && data[data.length - 1].month === currentMonth) {
          Object.assign(data[data.length - 1], entry);
        } else {
          data.push(entry);
        }
      }
      
      if (currentMonth >= maxMonths - 1) break;
    }
    return data;
  }, [results, inputs.startDate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        onShare={() => setIsShareModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar - Inputs */}
        <aside className="lg:col-span-4 space-y-6">
          <LoanDetails 
            inputs={inputs}
            setInputs={setInputs}
            monthlyInstallment={monthlyInstallment}
            baseInstallment={baseInstallment}
            formatCurrency={formatCurrency}
          />

          <StressTest 
            inputs={inputs}
            setInputs={setInputs}
            monthlyInstallment={monthlyInstallment}
            baseInstallment={baseInstallment}
            results={results}
            formatCurrency={formatCurrency}
          />

          <CostCalculator 
            propertyPrice={propertyPrice}
            setPropertyPrice={setPropertyPrice}
            costBondAmount={costBondAmount}
            setCostBondAmount={setCostBondAmount}
            propertyCosts={propertyCosts}
            formatCurrency={formatCurrency}
          />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <SummaryCards 
            results={results} 
            inputs={inputs}
            formatCurrency={formatCurrency}
            formatTimeSaved={formatTimeSaved}
            onViewSchedule={setSelectedResult}
          />

          <ComparisonChart 
            chartData={chartData}
            isDarkMode={isDarkMode}
            scenarios={scenarios}
            results={results}
            formatCurrency={formatCurrency}
          />

          <ScenarioManager 
            scenarios={scenarios}
            results={results}
            inputs={inputs}
            addScenario={addScenario}
            updateScenario={updateScenario}
            removeScenario={removeScenario}
          />

          <AssistantSuggestions inputs={inputs} />

          <FAQSection />
        </div>
      </main>

      <Modal 
        isOpen={!!selectedResult} 
        onClose={() => setSelectedResult(null)}
        title={`Amortization Schedule: ${selectedResult?.scenario.name}`}
      >
        {selectedResult && (
          <AmortizationTable 
            schedule={selectedResult.result.schedule} 
            baselineSchedule={results[0]?.result.schedule}
            formatCurrency={formatCurrency} 
            scenarioName={selectedResult.scenario.name}
            inputs={inputs}
          />
        )}
      </Modal>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        inputs={inputs}
        scenarios={scenarios}
      />

      <PrintReport 
        inputs={inputs}
        results={results}
        formatCurrency={formatCurrency}
        formatTimeSaved={formatTimeSaved}
      />

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} South African Home Loan Assistant. 
            All calculations are estimates. Consult with your bank for exact figures.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
