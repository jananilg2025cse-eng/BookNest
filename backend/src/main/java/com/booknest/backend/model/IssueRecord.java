package com.booknest.backend.model;

import java.time.LocalDate;

public class IssueRecord {
    private Integer id;
    private Integer bookId;
    private Integer memberId;
    private String bookTitle;
    private String studentName;
    private String rollNumber;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    private String status;
    private Integer daysOverdue;

    public IssueRecord() {
    }

    public IssueRecord(Integer id, Integer bookId, Integer memberId, String bookTitle,
                       String studentName, LocalDate issuedDate, LocalDate dueDate,
                       String status, Integer daysOverdue) {
        this.id = id;
        this.bookId = bookId;
        this.memberId = memberId;
        this.bookTitle = bookTitle;
        this.studentName = studentName;
        this.rollNumber = memberId == null ? null : memberId.toString();
        this.issuedDate = issuedDate;
        this.dueDate = dueDate;
        this.status = status;
        this.daysOverdue = daysOverdue;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getBookId() {
        return bookId;
    }

    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    public Integer getMemberId() {
        return memberId;
    }

    public void setMemberId(Integer memberId) {
        this.memberId = memberId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public LocalDate getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDate issuedDate) {
        this.issuedDate = issuedDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(Integer daysOverdue) {
        this.daysOverdue = daysOverdue;
    }
}
