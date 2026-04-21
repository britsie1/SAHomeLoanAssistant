import React, { useState } from 'react';
import { HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { 
      q: "Can I use my existing life insurance for bond assurance?", 
      a: "Yes, you can. Most South African banks allow you to substitute their mandatory bond protection insurance with your own life cover. You simply need to provide the bank with a letter from your insurer noting them as the first cessionary. This is often significantly cheaper than the bank-offered product." 
    },
    { 
      q: "How does an access bond work?", 
      a: "An access bond allows you to pay extra money into your bond account and then withdraw it again if needed. The primary benefit is that any extra funds in the account reduce the principal balance on which interest is calculated, effectively saving you the interest rate (e.g., 11.75%) tax-free." 
    },
    { 
      q: "What is the 90-day bond cancellation notice?", 
      a: "In South Africa, banks require you to give at least 90 days' written notice of your intention to cancel your bond (usually when you've sold your home). If you cancel the bond before the notice period ends, they charge a 'pro-rata cancellation interest' penalty." 
    },
    { 
      q: "Why is daily interest better?", 
      a: "With daily interest calculation (standard for most SA home loans), interest is calculated on the balance you owe at the end of each day. This means if you deposit your salary on the 1st of the month, the interest for the rest of the month is calculated on that lower balance, even if you draw money for expenses later." 
    }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
        <HelpCircle className="w-6 h-6 text-slate-400" />
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
            <button 
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <span className="font-semibold text-slate-800 dark:text-white">{faq.q}</span>
              {activeFaq === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {activeFaq === idx && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
