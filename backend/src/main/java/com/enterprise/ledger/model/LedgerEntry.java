package com.enterprise.ledger.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerEntry {
    private String entryId;
    private String transactionId;
    private String accountId;
    private String counterpartyAccountId;
    private String entryType; // DEBIT or CREDIT
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String currency;
    private String idempotencyKey;
    private LocalDateTime timestamp;
    private String auditHash;
}
