/**
 * Strict Double-Entry Ledger Transaction Engine
 * Enforces fundamental accounting equation: Assets = Liabilities + Equity on all postings.
 * Validates zero-sum balancing (Total Debits == Total Credits) using integer minor-currency units.
 */

export const ACCOUNT_TYPES = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE'
};

export class DoubleEntryLedgerEngine {
  constructor() {
    this.accounts = new Map(); // accountId -> { id, name, type, balanceCents }
    this.journalEntries = [];
  }

  /**
   * Register or initialize a chart of accounts entry
   */
  createAccount(accountId, name, type, initialBalanceCents = 0) {
    if (!ACCOUNT_TYPES[type]) {
      throw new Error(`Invalid account type: "${type}". Allowed: ${Object.keys(ACCOUNT_TYPES).join(', ')}`);
    }

    const acc = {
      id: accountId,
      name,
      type,
      balanceCents: Math.round(initialBalanceCents)
    };
    this.accounts.set(accountId, acc);
    return acc;
  }

  /**
   * Post an atomic double-entry transaction
   * @param {Object} transaction
   * @param {string} transaction.id - Transaction ID
   * @param {string} transaction.description - Narration / memo
   * @param {Array<Object>} transaction.entries - Array of entry legs [{ accountId, type: 'DEBIT'|'CREDIT', amountCents }]
   * @returns {Object} Confirmed journal entry and updated ledger balances
   */
  postTransaction(transaction) {
    const { id, description, entries } = transaction;

    if (!entries || entries.length < 2) {
      throw new Error('Double-entry transactions require at least two legs (one debit and one credit)');
    }

    let totalDebitsCents = 0;
    let totalCreditsCents = 0;

    // 1. Verify accounts exist and sum debits vs credits
    for (const leg of entries) {
      if (!this.accounts.has(leg.accountId)) {
        throw new Error(`Account "${leg.accountId}" not found in chart of accounts`);
      }
      const amount = Math.round(Number(leg.amountCents));
      if (amount <= 0) {
        throw new Error(`Entry leg amount must be positive: got ${amount}`);
      }

      if (leg.type === 'DEBIT') {
        totalDebitsCents += amount;
      } else if (leg.type === 'CREDIT') {
        totalCreditsCents += amount;
      } else {
        throw new Error(`Invalid leg type "${leg.type}". Must be "DEBIT" or "CREDIT"`);
      }
    }

    // 2. Strict Zero-Sum Validation
    if (totalDebitsCents !== totalCreditsCents) {
      throw new Error(`Transaction out of balance! Debits (${totalDebitsCents}) != Credits (${totalCreditsCents}). Delta: ${Math.abs(totalDebitsCents - totalCreditsCents)} cents`);
    }

    // 3. Apply updates to account balances
    const postingLegs = [];
    for (const leg of entries) {
      const acc = this.accounts.get(leg.accountId);
      const amount = Math.round(Number(leg.amountCents));

      // Balance rules:
      // Asset & Expense: Debit increases (+), Credit decreases (-)
      // Liability, Equity, Revenue: Credit increases (+), Debit decreases (-)
      const isDebitNormal = acc.type === ACCOUNT_TYPES.ASSET || acc.type === ACCOUNT_TYPES.EXPENSE;

      if (leg.type === 'DEBIT') {
        acc.balanceCents += isDebitNormal ? amount : -amount;
      } else {
        acc.balanceCents += isDebitNormal ? -amount : amount;
      }

      postingLegs.push({
        accountId: acc.id,
        accountName: acc.name,
        accountType: acc.type,
        entryType: leg.type,
        amountCents: amount,
        resultingBalanceCents: acc.balanceCents
      });
    }

    const journalEntry = {
      sequenceNumber: this.journalEntries.length + 1,
      id: id || `TX-${Date.now()}`,
      description,
      timestamp: new Date().toISOString(),
      totalAmountCents: totalDebitsCents,
      legs: postingLegs
    };

    this.journalEntries.push(journalEntry);
    return journalEntry;
  }

  /**
   * Validate the global accounting equation: Assets = Liabilities + Equity + (Revenue - Expenses)
   */
  verifyBalanceSheet() {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;
    let revenue = 0;
    let expenses = 0;

    for (const acc of this.accounts.values()) {
      switch (acc.type) {
        case ACCOUNT_TYPES.ASSET: assets += acc.balanceCents; break;
        case ACCOUNT_TYPES.LIABILITY: liabilities += acc.balanceCents; break;
        case ACCOUNT_TYPES.EQUITY: equity += acc.balanceCents; break;
        case ACCOUNT_TYPES.REVENUE: revenue += acc.balanceCents; break;
        case ACCOUNT_TYPES.EXPENSE: expenses += acc.balanceCents; break;
      }
    }

    const netIncome = revenue - expenses;
    const totalEquityAndLiabilities = liabilities + equity + netIncome;
    const isBalanced = assets === totalEquityAndLiabilities;

    return {
      isBalanced,
      equation: 'Assets = Liabilities + Equity + NetIncome',
      assetsCents: assets,
      liabilitiesCents: liabilities,
      equityCents: equity,
      revenueCents: revenue,
      expenseCents: expenses,
      netIncomeCents: netIncome,
      totalEquityAndLiabilitiesCents: totalEquityAndLiabilities,
      imbalanceDeltaCents: Math.abs(assets - totalEquityAndLiabilities)
    };
  }
}

export default DoubleEntryLedgerEngine;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DoubleEntryLedgerEngine;
  module.exports.DoubleEntryLedgerEngine = DoubleEntryLedgerEngine;
  module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
}
