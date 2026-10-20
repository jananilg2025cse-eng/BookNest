package com.booknest.backend.exception;

public class IssueValidationException extends RuntimeException {
    public IssueValidationException(String message) {
        super(message);
    }
}
