package com.booknest.backend.service;

import com.booknest.backend.exception.DuplicateMemberException;
import com.booknest.backend.exception.MemberValidationException;
import com.booknest.backend.model.Member;
import com.booknest.backend.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.argThat;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    private MemberService memberService;

    @BeforeEach
    void setUp() {
        memberService = new MemberService(memberRepository);
    }

    @Test
    void addsStudentAndReturnsDerivedBooksIssuedCount() {
        Member savedMember = new Member(
                102, "Asha Raman", "asha@example.edu", "Student", 2,
                "Computer Science", 3
        );
        when(memberRepository.existsById(102)).thenReturn(false);
        when(memberRepository.findById(102)).thenReturn(Optional.of(savedMember));

        Member result = memberService.addMember(new Member(
                102, " Asha Raman ", " asha@example.edu ", " Student ", 2,
                " Computer Science ", 999
        ));

        assertEquals("Asha Raman", result.getName());
        assertEquals("asha@example.edu", result.getEmail());
        assertEquals("Computer Science", result.getDepartment());
        assertEquals(3, result.getBooksIssued());
        verify(memberRepository).save(argThat(member ->
                "Student".equals(member.getRole())
                        && "asha@example.edu".equals(member.getEmail())
        ));
    }

    @Test
    void acceptsFacultyWithoutYearOfStudy() {
        Member savedMember = new Member(
                103, "Morgan Lee", "morgan@example.edu", "Faculty & Staff",
                null, "Library", 0
        );
        when(memberRepository.existsById(103)).thenReturn(false);
        when(memberRepository.findById(103)).thenReturn(Optional.of(savedMember));

        Member result = memberService.addMember(new Member(
                103, "Morgan Lee", "morgan@example.edu", "Faculty & Staff",
                null, "Library", 0
        ));

        assertEquals("Faculty & Staff", result.getRole());
        assertEquals(null, result.getYearOfStudy());
    }

    @Test
    void rejectsInvalidEmailBeforeWriting() {
        assertThrows(MemberValidationException.class, () -> memberService.addMember(
                new Member(104, "Name", "not-an-email", "Student", 1, "Math", 0)
        ));

        verifyNoInteractions(memberRepository);
    }

    @Test
    void rejectsUnsupportedRoleBeforeWriting() {
        assertThrows(MemberValidationException.class, () -> memberService.addMember(
                new Member(104, "Name", "name@example.edu", "Visitor", null, "Math", 0)
        ));

        verifyNoInteractions(memberRepository);
    }

    @Test
    void requiresStudentYearAndDepartment() {
        assertThrows(MemberValidationException.class, () -> memberService.addMember(
                new Member(104, "Name", "name@example.edu", "Student", null, "Math", 0)
        ));
        assertThrows(MemberValidationException.class, () -> memberService.addMember(
                new Member(104, "Name", "name@example.edu", "Student", 1, " ", 0)
        ));

        verifyNoInteractions(memberRepository);
    }

    @Test
    void rejectsDuplicateMemberId() {
        when(memberRepository.existsById(101)).thenReturn(true);

        assertThrows(DuplicateMemberException.class, () -> memberService.addMember(
                new Member(101, "Name", "name@example.edu", "Student", 1, "Math", 0)
        ));

        verify(memberRepository, never()).save(any(Member.class));
    }

        @Test
        void updatesProfileFieldsWithoutChangingThePathId() {
                Member persistedMember = new Member(
                                101, "Updated Name", "updated@example.edu", "Student", 3,
                                "Physics", 2
                );
                when(memberRepository.existsById(101)).thenReturn(true);
                when(memberRepository.findById(101)).thenReturn(Optional.of(persistedMember));

                Member result = memberService.updateMember(101, new Member(
                                999, " Updated Name ", " updated@example.edu ", "Student", 3,
                                " Physics ", 100
                ));

                assertEquals(101, result.getId());
                assertEquals("Updated Name", result.getName());
                assertEquals(2, result.getBooksIssued());
                verify(memberRepository).update(argThat(member ->
                                member.getId() == 101
                                                && "Updated Name".equals(member.getName())
                                                && "updated@example.edu".equals(member.getEmail())
                                                && "Physics".equals(member.getDepartment())
                ));
        }

        @Test
        void doesNotDeleteMemberReferencedByAnIssueRecord() {
                when(memberRepository.existsById(101)).thenReturn(true);
                when(memberRepository.hasIssueRecords(101)).thenReturn(true);

                assertThrows(MemberValidationException.class, () -> memberService.deleteMember(101));

                verify(memberRepository, never()).deleteById(101);
        }
}