import crypto from 'crypto';

/**
 * Genesis anchor constant for initial immutable block
 */
export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Deterministically serialize a JSON payload to prevent hash mismatches
 * caused by object key reordering.
 */
export function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Calculate SHA-256 digest of journal block attributes
 */
export function calculateBlockHash({ sequenceNumber, timestamp, previousHash, payload }) {
  const canonicalPayload = canonicalJsonStringify(payload);
  const dataToHash = `${sequenceNumber}:${timestamp}:${previousHash}:${canonicalPayload}`;
  return crypto.createHash('sha256').update(dataToHash, 'utf8').digest('hex');
}

/**
 * Cryptographically Chained SHA-256 Immutable Ledger Journal
 * Provides tamper-evident write-once audit log for financial ledger transactions.
 */
export class CryptographicLedgerJournal {
  constructor(initialEntries = []) {
    this.chain = [];
    if (initialEntries && initialEntries.length > 0) {
      this.loadEntries(initialEntries);
    }
  }

  /**
   * Append a new transaction payload to the cryptographic journal
   * @param {Object} payload - Transaction object, amounts, accounts, metadata
   * @param {Object} options - Optional overrides (timestamp for testing)
   * @returns {Object} Newly sealed journal entry with cryptographic hash
   */
  append(payload, options = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Journal payload must be a non-null object.');
    }

    const sequenceNumber = this.chain.length + 1;
    const timestamp = options.timestamp || new Date().toISOString();
    const previousHash = this.chain.length === 0
      ? GENESIS_HASH
      : this.chain[this.chain.length - 1].hash;

    const blockData = {
      sequenceNumber,
      timestamp,
      previousHash,
      payload
    };

    const hash = calculateBlockHash(blockData);

    const sealedEntry = {
      ...blockData,
      hash,
      signature: options.signature || null
    };

    this.chain.push(sealedEntry);
    return sealedEntry;
  }

  /**
   * Return the latest sealed journal entry
   */
  getLatestEntry() {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1] : null;
  }

  /**
   * Return the total count of sealed journal entries
   */
  length() {
    return this.chain.length;
  }

  /**
   * Get all journal entries (shallow clone to prevent accidental outside mutation)
   */
  getEntries() {
    return [...this.chain];
  }

  /**
   * Rigorously verify full cryptographic chain integrity from genesis to head
   * @returns {Object} { isValid: boolean, verifiedBlocks: number, error?: string, brokenIndex?: number }
   */
  verifyChain() {
    if (this.chain.length === 0) {
      return { isValid: true, verifiedBlocks: 0, message: 'Chain is empty' };
    }

    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i];
      const expectedSeq = i + 1;

      // 1. Verify sequence order
      if (entry.sequenceNumber !== expectedSeq) {
        return {
          isValid: false,
          brokenIndex: i,
          reason: `Invalid sequence number at index ${i}: expected ${expectedSeq}, got ${entry.sequenceNumber}`
        };
      }

      // 2. Verify previousHash pointer
      const expectedPrevHash = (i === 0) ? GENESIS_HASH : this.chain[i - 1].hash;
      if (entry.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          brokenIndex: i,
          reason: `Previous hash pointer broken at index ${i}: expected "${expectedPrevHash}", got "${entry.previousHash}"`
        };
      }

      // 3. Verify cryptographic SHA-256 digest
      const recomputedHash = calculateBlockHash({
        sequenceNumber: entry.sequenceNumber,
        timestamp: entry.timestamp,
        previousHash: entry.previousHash,
        payload: entry.payload
      });

      if (entry.hash !== recomputedHash) {
        return {
          isValid: false,
          brokenIndex: i,
          reason: `Digest mismatch at index ${i}: stored "${entry.hash}", recomputed "${recomputedHash}" (tamper detected)`
        };
      }
    }

    return {
      isValid: true,
      verifiedBlocks: this.chain.length,
      headHash: this.chain[this.chain.length - 1].hash
    };
  }

  /**
   * Export the entire journal chain as serializable JSON
   */
  exportJournal() {
    return JSON.stringify(this.chain, null, 2);
  }

  /**
   * Bulk import and validate an existing journal chain
   */
  loadEntries(entries) {
    if (!Array.isArray(entries)) {
      throw new Error('Imported entries must be an array.');
    }
    this.chain = [...entries];
    const verification = this.verifyChain();
    if (!verification.isValid) {
      throw new Error(`Import failed cryptographic verification: ${verification.reason}`);
    }
    return verification;
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GENESIS_HASH,
    canonicalJsonStringify,
    calculateBlockHash,
    CryptographicLedgerJournal
  };
}

export default CryptographicLedgerJournal;
