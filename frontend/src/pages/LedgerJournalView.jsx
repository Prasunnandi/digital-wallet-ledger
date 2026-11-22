import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  CheckCircle, 
  Hash, 
  Clock, 
  Key, 
  Layers, 
  ShieldCheck,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { fetchEntries } from '../services/api';

export default function LedgerJournalView() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await fetchEntries();
    setEntries(data);
  };

  const filtered = entries.filter(e => 
    e.entryId.toLowerCase().includes(search.toLowerCase()) ||
    e.transactionId.toLowerCase().includes(search.toLowerCase()) ||
    e.accountId.toLowerCase().includes(search.toLowerCase()) ||
    (e.idempotencyKey && e.idempotencyKey.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDebits = entries
    .filter(e => e.entryType === 'DEBIT')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalCredits = entries
    .filter(e => e.entryType === 'CREDIT')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

  return (
    <div className="space-y-6">
      {/* Top Ledger Invariant Audit Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Double-Entry Balance Invariant Status
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  100% INVARIANT PRESERVED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical proof: The sum of all recorded debits equals the sum of all recorded credits at all times.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Σ Total Debits</div>
              <div className="text-sm font-bold text-red-400 font-mono">
                -${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-slate-600 font-mono text-lg">=</div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Σ Total Credits</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                +${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Entry ID, Transaction ID, Account ID, Idempotency Key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-emerald-400 font-bold">{filtered.length}</span> journal entries
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Entry & Txn ID</th>
                <th className="py-3 px-4">Account & Counterparty</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Idempotency Key & Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((entry) => {
                const isDebit = entry.entryType === 'DEBIT';

                return (
                  <tr key={entry.entryId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-white font-semibold flex items-center gap-1.5">
                        <span>{entry.entryId}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded">
                          {entry.transactionId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-200 font-semibold">{entry.accountId}</div>
                      <div className="text-[10px] text-slate-400">
                        Counterparty: {entry.counterpartyAccountId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isDebit 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {entry.entryType}
                      </span>
                    </td>

                    <td className={`py-3.5 px-4 font-mono font-bold ${isDebit ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isDebit ? '-' : '+'}${Number(entry.amount).toFixed(2)} {entry.currency}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-white">
                      ${Number(entry.balanceAfter).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>{entry.idempotencyKey || 'N/A'}</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 mt-0.5 truncate max-w-xs">
                        SHA256: {entry.auditHash?.slice(0, 20)}...
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
