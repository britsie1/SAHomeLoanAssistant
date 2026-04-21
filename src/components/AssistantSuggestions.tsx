import React from 'react';
import { Lightbulb, TrendingDown, HelpCircle, Info } from 'lucide-react';
import type { LoanInputs } from '../utils/loanMath';

interface AssistantSuggestionsProps {
  inputs: LoanInputs;
}

export const AssistantSuggestions: React.FC<AssistantSuggestionsProps> = ({ inputs }) => {
  return (
    <section className="bg-blue-600 dark:bg-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden transition-colors">
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-yellow-300" />
          Assistant Suggestions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              The Power of Daily Interest
            </h3>
            <p className="text-sm text-blue-50/80 leading-relaxed">
              Since many banks calculate interest daily, 
              paying your salary into your access bond and spending from it reduces your balance 
              every day, saving you thousands in interest over time.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Access Bond vs Savings
            </h3>
            <p className="text-sm text-blue-50/80 leading-relaxed">
              Don't keep your emergency fund in a separate savings account. 
              Putting it in your access bond effectively earns you {inputs.interestRate}% 
              tax-free interest by reducing the principal amount.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Bond Assurance Tip
            </h3>
            <p className="text-sm text-blue-50/80 leading-relaxed">
              You can often use your existing life insurance policy instead of the bank's 
              bond insurance. This could save you R200-R500 per month! Just note the bank 
              as a cessionary on your policy.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              90-Day Notice
            </h3>
            <p className="text-sm text-blue-50/80 leading-relaxed">
              Always give 90 days notice before cancelling your bond (e.g., when selling). 
              Failing to do so can result in a cancellation interest penalty of up to 1% of the bond.
            </p>
          </div>
        </div>
      </div>
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
    </section>
  );
};
