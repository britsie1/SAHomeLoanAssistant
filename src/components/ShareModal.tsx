import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Modal } from './Modal';
import { generateShareUrl } from '../utils/urlState';
import type { LoanInputs } from '../utils/loanMath';
import type { SavedScenario } from '../hooks/useLoanCalculations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: LoanInputs;
  scenarios: SavedScenario[];
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, inputs, scenarios }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl({ inputs, scenarios });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Scenarios">
      <div className="space-y-6 py-2">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Copy this link to share your current loan inputs and all comparison scenarios with others. 
          The link contains all your current settings.
        </p>

        <div className="relative group">
          <input 
            readOnly
            className="w-full pr-24 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={shareUrl}
          />
          <button 
            onClick={handleCopy}
            className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors"
          >
            Close
          </button>
          <a 
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>
        </div>
      </div>
    </Modal>
  );
};
