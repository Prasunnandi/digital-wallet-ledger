import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import WalletAccountsView from './pages/WalletAccountsView';
import LedgerJournalView from './pages/LedgerJournalView';
import { fetchStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('wallets');
  const [stats, setStats] = useState({
    totalAccounts: 4,
    totalJournalEntries: 4,
    settledVolumeUsd: 1450.50,
    doubleEntryInvariant: "VERIFIED (SUM_DEBITS == SUM_CREDITS)",
    concurrencyModel: "Pessimistic Row-Level Lock (SELECT FOR UPDATE)",
    acidGuarantee: "STRICT"
  });

  const refreshStats = () => {
    fetchStats().then(data => {
      if (data) setStats(data);
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar stats={stats} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'wallets' && (
            <WalletAccountsView onTransferCompleted={refreshStats} />
          )}
          {activeTab === 'journal' && (
            <LedgerJournalView />
          )}
        </main>
      </div>
    </div>
  );
}
