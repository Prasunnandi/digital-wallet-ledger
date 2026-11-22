package com.enterprise.ledger.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletAccount {
    private String accountId;
    private String ownerName;
    private String email;
    private BigDecimal balance;
    private String currency;
    private String accountType; // ASSET, LIABILITY, EXPENSE, REVENUE
    private String status;      // ACTIVE, FROZEN, CLOSED
}
