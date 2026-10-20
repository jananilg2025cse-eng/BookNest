package com.booknest.backend.controller;

import com.booknest.backend.exception.GlobalExceptionHandler;
import com.booknest.backend.model.IssueRecord;
import com.booknest.backend.model.IssueRequest;
import com.booknest.backend.service.IssueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IssueControllerTest {
    private MockMvc mockMvc;

    @Mock
    private IssueService issueService;

    @InjectMocks
    private IssueController issueController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(issueController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getIssuesReturnsActiveLoanDetails() throws Exception {
        when(issueService.getActiveIssues()).thenReturn(List.of(
                new IssueRecord(12, 4, 101, "Algorithms", "Asha Raman",
                        LocalDate.parse("2026-10-01"), LocalDate.parse("2026-10-15"),
                        "Overdue", 5)
        ));

        mockMvc.perform(get("/api/issues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(12))
                .andExpect(jsonPath("$[0].bookId").value(4))
                .andExpect(jsonPath("$[0].memberId").value(101))
                .andExpect(jsonPath("$[0].studentName").value("Asha Raman"))
                .andExpect(jsonPath("$[0].status").value("Overdue"))
                .andExpect(jsonPath("$[0].daysOverdue").value(5));
    }

    @Test
    void postIssuePersistsTheSelectedBookAndMember() throws Exception {
        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"bookId": 4, "memberId": 101, "loanDays": 14}
                                """))
                .andExpect(status().isCreated());

        verify(issueService).issueBook(any(IssueRequest.class));
    }

    @Test
    void returnIssueRecordsTheCheckIn() throws Exception {
        mockMvc.perform(post("/api/issues/12/return"))
                .andExpect(status().isNoContent());

        verify(issueService).returnBook(eq(12));
    }
}
