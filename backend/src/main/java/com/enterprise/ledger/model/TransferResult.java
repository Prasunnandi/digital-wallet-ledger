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
public class TransferResult {
    private String transactionId;
    private String status;
    private String idempotencyKey;
    private BigDecimal transferredAmount;
    private BigDecimal sourceBalanceAfter;
    private BigDecimal destBalanceAfter;
    private LocalDateTime settledAt;
    private String auditHash;
    private String message;
}
