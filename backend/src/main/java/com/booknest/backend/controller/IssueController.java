package com.booknest.backend.controller;

import com.booknest.backend.model.IssueRecord;
import com.booknest.backend.model.IssueRequest;
import com.booknest.backend.service.IssueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {
    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public ResponseEntity<List<IssueRecord>> getActiveIssues() {
        return ResponseEntity.ok(issueService.getActiveIssues());
    }

    @PostMapping
    public ResponseEntity<Void> issueBook(@RequestBody IssueRequest request) {
        issueService.issueBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Void> returnBook(@PathVariable int id) {
        issueService.returnBook(id);
        return ResponseEntity.noContent().build();
    }
}
