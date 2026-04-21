import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import type { SavedScenario, CalculationResult } from '../hooks/useLoanCalculations';
import type { ChartEntry } from '../App';

interface ComparisonChartProps {
  chartData: ChartEntry[];
  isDarkMode: boolean;
  scenarios: SavedScenario[];
  results: CalculationResult[];
  formatCurrency: (val: number) => string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  chartData,
  isDarkMode,
  scenarios,
  results,
  formatCurrency
}) => {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Balance Over Time Comparison</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipping Point</span>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}}
              tickFormatter={(val) => `R${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
              formatter={(val: number, name: string) => [formatCurrency(val), name]}
            />
            <Legend />
            
            {/* Tipping Point Reference Lines */}
            {results.map((r, idx) => {
              if (r.result.tippingPointMonth === null) return null;
              // Find the entry in chartData that matches this month index
              const entry = chartData.find(d => d.month >= r.result.tippingPointMonth!);
              if (!entry) return null;

              return (
                <ReferenceLine 
                  key={`tp-${r.scenario.id}`}
                  x={entry.date} 
                  stroke={r.scenario.color} 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5}
                >
                  {idx === 0 && (
                    <Label 
                      value="Tipping Point" 
                      position="top" 
                      fill={isDarkMode ? '#10b981' : '#059669'} 
                      fontSize={10} 
                      fontWeight="bold" 
                    />
                  )}
                </ReferenceLine>
              );
            })}

            {scenarios.map(s => (
              <Line 
                key={s.id}
                type="monotone" 
                dataKey={s.name} 
                stroke={s.color} 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[10px] text-slate-400 italic">
        * The Tipping Point is where your monthly principal payment first exceeds the interest payment.
      </p>
    </section>
  );
};
