package com.booknest.backend.controller;

import com.booknest.backend.exception.GlobalExceptionHandler;
import com.booknest.backend.model.Member;
import com.booknest.backend.service.MemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MemberControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MemberService memberService;

    @InjectMocks
    private MemberController memberController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(memberController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getMembersReturnsAllSupportedFields() throws Exception {
        when(memberService.getAllMembers()).thenReturn(List.of(
                new Member(101, "Asha Raman", "asha@example.edu", "Student",
                        2, "Computer Science", 3)
        ));

        mockMvc.perform(get("/api/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].name").value("Asha Raman"))
                .andExpect(jsonPath("$[0].email").value("asha@example.edu"))
                .andExpect(jsonPath("$[0].role").value("Student"))
                .andExpect(jsonPath("$[0].yearOfStudy").value(2))
                .andExpect(jsonPath("$[0].department").value("Computer Science"))
                .andExpect(jsonPath("$[0].booksIssued").value(3));
    }

    @Test
    void postMemberAcceptsAllEditableFields() throws Exception {
        when(memberService.addMember(any(Member.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 102,
                                  "name": "Morgan Lee",
                                  "email": "morgan@example.edu",
                                  "role": "Faculty & Staff",
                                  "yearOfStudy": null,
                                  "department": "Library",
                                  "booksIssued": 4
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("morgan@example.edu"))
                .andExpect(jsonPath("$.role").value("Faculty & Staff"))
                .andExpect(jsonPath("$.department").value("Library"))
                .andExpect(jsonPath("$.booksIssued").value(4));
    }

    @Test
    void putMemberUsesPathIdAndPersistsEditableFields() throws Exception {
        when(memberService.updateMember(eq(101), any(Member.class)))
                .thenAnswer(invocation -> invocation.getArgument(1));

        mockMvc.perform(put("/api/members/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 101,
                                  "name": "Asha Updated",
                                  "email": "asha.updated@example.edu",
                                  "role": "Student",
                                  "yearOfStudy": 3,
                                  "department": "Physics"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Asha Updated"))
                .andExpect(jsonPath("$.yearOfStudy").value(3))
                .andExpect(jsonPath("$.department").value("Physics"));

        verify(memberService).updateMember(eq(101), any(Member.class));
    }

    @Test
    void deleteMemberReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/members/101"))
                .andExpect(status().isNoContent());

        verify(memberService).deleteMember(101);
    }
}
