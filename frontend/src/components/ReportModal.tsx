import React, { useState } from 'react';
import { X, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Opportunity } from '../types';
import { api } from '../services/api';

interface ReportModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ opportunity, onClose }) => {
  if (!opportunity) return null;

  const [reason, setReason] = useState('Expired Deadline');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.submitReport(opportunity.id, reason, details || 'Reported by student user');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Flag className="w-4 h-4" />
            <span>Report Opportunity Listing</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-slate-100 text-sm">Thank You for Your Report!</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Our trust & verification engine will review {opportunity.title} to keep our community safe and accurate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">Opportunity:</p>
              <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                {opportunity.title} ({opportunity.organization})
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reason for reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Expired Deadline">Deadline has already passed</option>
                <option value="Broken URL">Application or official link is broken (404)</option>
                <option value="Inaccurate Eligibility">Eligibility criteria or CGPA requirements incorrect</option>
                <option value="Suspicious Listing">Suspicious or unverified organization</option>
                <option value="Other">Other problem</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was inaccurate or paste updated official URL..."
                className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
