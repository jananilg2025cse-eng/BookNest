package com.booknest.backend.service;

import com.booknest.backend.exception.IssueNotFoundException;
import com.booknest.backend.exception.IssueValidationException;
import com.booknest.backend.model.IssueRecord;
import com.booknest.backend.model.IssueRequest;
import com.booknest.backend.repository.BookRepository;
import com.booknest.backend.repository.IssueRepository;
import com.booknest.backend.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IssueService {
    private static final int MAX_LOAN_DAYS = 365;

    private final IssueRepository issueRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public IssueService(IssueRepository issueRepository, BookRepository bookRepository,
                        MemberRepository memberRepository) {
        this.issueRepository = issueRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    public List<IssueRecord> getActiveIssues() {
        return issueRepository.findActive();
    }

    @Transactional
    public void issueBook(IssueRequest request) {
        if (request == null || request.getBookId() == null || request.getBookId() <= 0
                || request.getMemberId() == null || request.getMemberId() <= 0) {
            throw new IssueValidationException("Choose a valid book and member.");
        }
        if (request.getLoanDays() == null || request.getLoanDays() < 1
                || request.getLoanDays() > MAX_LOAN_DAYS) {
            throw new IssueValidationException(
                    "Loan duration must be between 1 and " + MAX_LOAN_DAYS + " days."
            );
        }

        var book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new IssueValidationException(
                        "Book with ID " + request.getBookId() + " was not found."
                ));
        if (!memberRepository.existsById(request.getMemberId())) {
            throw new IssueValidationException(
                    "Member with ID " + request.getMemberId() + " was not found."
            );
        }
        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new IssueValidationException("No copies of this book are currently available.");
        }
        if (issueRepository.decrementAvailableCopies(request.getBookId()) != 1) {
            throw new IssueValidationException("No copies of this book are currently available.");
        }
        if (issueRepository.create(request.getBookId(), request.getMemberId(), request.getLoanDays()) != 1) {
            throw new IllegalStateException("The issue record could not be saved.");
        }
        if (memberRepository.incrementBooksIssued(request.getMemberId()) != 1) {
            throw new IllegalStateException("The member's Books Issued count could not be updated.");
        }
    }

    @Transactional
    public void returnBook(int issueId) {
        if (issueId <= 0) {
            throw new IssueValidationException("Issue ID must be greater than zero.");
        }
        Integer bookId = issueRepository.findBookIdByActiveIssue(issueId);
        if (bookId == null) {
            throw new IssueNotFoundException("Active issue with ID " + issueId + " was not found.");
        }
        Integer memberId = issueRepository.findMemberIdByActiveIssue(issueId);
        if (memberId == null) {
            throw new IssueNotFoundException("Active issue with ID " + issueId + " was not found.");
        }
        if (issueRepository.returnActive(issueId) != 1) {
            throw new IssueNotFoundException("Active issue with ID " + issueId + " was not found.");
        }
        if (issueRepository.incrementAvailableCopies(bookId) != 1) {
            throw new IllegalStateException("The returned book could not be added back to inventory.");
        }
        if (memberRepository.decrementBooksIssued(memberId) != 1) {
            throw new IllegalStateException("The member's Books Issued count could not be updated.");
        }
    }
}
