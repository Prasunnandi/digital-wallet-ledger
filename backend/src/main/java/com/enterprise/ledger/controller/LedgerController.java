package com.enterprise.ledger.controller;

import com.enterprise.ledger.model.*;
import com.enterprise.ledger.service.LedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ledger")
@CrossOrigin(origins = "*")
public class LedgerController {

    private final LedgerService ledgerService;

    public LedgerController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "Java 21 Double-Entry Financial Ledger",
                "framework", "Spring Boot 3.3.0",
                "concurrency", "Pessimistic Row-Level Locking"
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(ledgerService.getStats());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<WalletAccount>> getAccounts() {
        return ResponseEntity.ok(ledgerService.getAllAccounts());
    }

    @GetMapping("/entries")
    public ResponseEntity<List<LedgerEntry>> getEntries() {
        return ResponseEntity.ok(ledgerService.getAllEntries());
    }

    @PostMapping("/transfers")
    public ResponseEntity<TransferResult> transfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(ledgerService.transfer(request));
    }
}
