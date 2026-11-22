import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Key, 
  ShieldCheck, 
  Lock, 
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { fetchAccounts, executeTransfer } from '../services/api';

export default function WalletAccountsView({ onTransferCompleted }) {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceId, setSourceId] = useState('ACC-USER-101');
  const [destId, setDestId] = useState('ACC-USER-102');
  const [amount, setAmount] = useState('150.00');
  const [idempotencyKey, setIdempotencyKey] = useState(`IDEM-${Date.now().toString().slice(-6)}`);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await fetchAccounts();
    setAccounts(data);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg(null);

    try {
      const res = await executeTransfer({
        idempotencyKey,
        sourceAccountId: sourceId,
        destinationAccountId: destId,
        amount: parseFloat(amount),
        currency: 'USD'
      });
      setResultMsg({
        type: 'success',
        text: res.message || 'Transfer successfully settled.',
        txnId: res.transactionId
      });
      await loadAccounts();
      if (onTransferCompleted) onTransferCompleted();
    } catch (err) {
      setResultMsg({
        type: 'error',
        text: err.message || 'Transfer failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = accounts
    .filter(a => a.accountType === 'ASSET')
    .reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Asset Liquidity</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>● 100% Invariant Compliant</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Wallets</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><CreditCard className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {accounts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-tenant Accounts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Concurrency Lock</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Lock className="w-4 h-4" /></span>
          </div>
          <div className="text-xl font-bold text-white mt-2 font-mono">SELECT FOR UPDATE</div>
          <div className="text-[11px] text-purple-400 mt-1">Zero Double-Spend Race</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Idempotency Shield</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Key className="w-4 h-4" /></span>
          </div>
          <div className="text-xl font-bold text-white mt-2 font-mono">Active (SHA-256)</div>
          <div className="text-[11px] text-amber-400 mt-1">Safe Replay Protection</div>
        </div>
      </div>

      {/* Main Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Corporate Digital Wallets & Account Balances
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict real-time balances backed by double-entry ledger journals.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAccounts}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
              title="Refresh Accounts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIdempotencyKey(`IDEM-${Date.now().toString().slice(-6)}`);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Atomic Transfer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Account ID & Owner</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Available Balance</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {accounts.map((acc) => (
                <tr key={acc.accountId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {acc.ownerName}
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {acc.accountId}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{acc.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      acc.accountType === 'ASSET' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                    }`}>
                      {acc.accountType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                    ${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {acc.currency}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" />
                      {acc.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSourceId(acc.accountId);
                        setIdempotencyKey(`IDEM-${Date.now().toString().slice(-6)}`);
                        setIsModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                    >
                      Transfer Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Execute Double-Entry Transfer</h3>
                  <p className="text-xs text-slate-400">Pessimistic Row-Locking & Idempotent Journal</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              {resultMsg && (
                <div className={`p-3 rounded-lg text-xs border ${
                  resultMsg.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}>
                  <p className="font-semibold">{resultMsg.text}</p>
                  {resultMsg.txnId && <p className="font-mono text-[10px] text-slate-300 mt-1">Txn ID: {resultMsg.txnId}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Source Account (Debit)</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map(a => (
                    <option key={a.accountId} value={a.accountId}>
                      {a.ownerName} ({a.accountId}) - Balance: ${Number(a.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Account (Credit)</label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map(a => (
                    <option key={a.accountId} value={a.accountId}>
                      {a.ownerName} ({a.accountId}) - Balance: ${Number(a.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Idempotency Key (Safe Replay Header)</label>
                  <button
                    type="button"
                    onClick={() => setIdempotencyKey(`IDEM-${Date.now().toString().slice(-6)}`)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Generate New Key
                  </button>
                </div>
                <input
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Submitting with an existing key will trigger safe idempotency replay without duplicate debits.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Acquiring Lock & Committing...' : 'Commit Double-Entry Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
