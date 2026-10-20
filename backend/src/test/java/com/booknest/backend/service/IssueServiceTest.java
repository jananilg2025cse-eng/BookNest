package com.booknest.backend.service;

import com.booknest.backend.exception.IssueValidationException;
import com.booknest.backend.model.Book;
import com.booknest.backend.model.IssueRequest;
import com.booknest.backend.repository.BookRepository;
import com.booknest.backend.repository.IssueRepository;
import com.booknest.backend.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {
    @Mock
    private IssueRepository issueRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private MemberRepository memberRepository;

    private IssueService issueService;

    @BeforeEach
    void setUp() {
        issueService = new IssueService(issueRepository, bookRepository, memberRepository);
    }

    @Test
    void issuingBookCreatesIssueAndDecrementsInventory() {
        when(bookRepository.findById(4)).thenReturn(Optional.of(
                new Book(4, "Algorithms", "Author", 3, 2)
        ));
        when(memberRepository.existsById(101)).thenReturn(true);
        when(issueRepository.decrementAvailableCopies(4)).thenReturn(1);
        when(issueRepository.create(4, 101, 14)).thenReturn(1);
        when(memberRepository.incrementBooksIssued(101)).thenReturn(1);

        issueService.issueBook(issueRequest(4, 101, 14));

        verify(issueRepository).decrementAvailableCopies(4);
        verify(issueRepository).create(4, 101, 14);
    }

    @Test
    void issuingBookRejectsUnavailableInventory() {
        when(bookRepository.findById(4)).thenReturn(Optional.of(
                new Book(4, "Algorithms", "Author", 3, 0)
        ));
        when(memberRepository.existsById(101)).thenReturn(true);

        assertThrows(IssueValidationException.class,
                () -> issueService.issueBook(issueRequest(4, 101, 14)));

        verify(issueRepository, never()).create(4, 101, 14);
    }

    @Test
    void issuingBookRejectsInvalidLoanDuration() {
        assertThrows(IssueValidationException.class,
                () -> issueService.issueBook(issueRequest(4, 101, 0)));

        verify(bookRepository, never()).findById(4);
    }

    @Test
    void returningBookClosesTheIssueAndRestoresInventory() {
        when(issueRepository.findBookIdByActiveIssue(12)).thenReturn(4);
        when(issueRepository.findMemberIdByActiveIssue(12)).thenReturn(101);
        when(issueRepository.returnActive(12)).thenReturn(1);
        when(issueRepository.incrementAvailableCopies(4)).thenReturn(1);
        when(memberRepository.decrementBooksIssued(101)).thenReturn(1);

        issueService.returnBook(12);

        verify(issueRepository).returnActive(12);
        verify(issueRepository).incrementAvailableCopies(4);
        verify(memberRepository).decrementBooksIssued(101);
    }

    private IssueRequest issueRequest(int bookId, int memberId, int loanDays) {
        IssueRequest request = new IssueRequest();
        request.setBookId(bookId);
        request.setMemberId(memberId);
        request.setLoanDays(loanDays);
        return request;
    }
}
