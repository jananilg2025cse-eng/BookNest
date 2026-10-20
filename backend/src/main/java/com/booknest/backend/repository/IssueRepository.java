package com.booknest.backend.repository;

import com.booknest.backend.model.IssueRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class IssueRepository {
    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<IssueRecord> issueRowMapper = (rs, rowNum) -> {
        int daysOverdue = rs.getInt("days_overdue");
        return new IssueRecord(
                rs.getInt("issue_id"),
                rs.getInt("book_id"),
                rs.getInt("member_id"),
                rs.getString("book_title"),
                rs.getString("member_name"),
                rs.getDate("issue_date").toLocalDate(),
                rs.getDate("due_date").toLocalDate(),
                daysOverdue > 0 ? "Overdue" : "On Loan",
                Math.max(daysOverdue, 0)
        );
    };

    public IssueRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<IssueRecord> findActive() {
        String sql = """
                SELECT ir.issue_id, ir.book_id, ir.member_id, b.title AS book_title,
                       m.name AS member_name, ir.issue_date, ir.due_date,
                       DATEDIFF(CURDATE(), ir.due_date) AS days_overdue
                FROM issue_records ir
                JOIN books b ON b.book_id = ir.book_id
                JOIN members m ON m.member_id = ir.member_id
                WHERE ir.return_date IS NULL
                ORDER BY ir.issue_date DESC, ir.issue_id DESC
                """;
        return jdbcTemplate.query(sql, issueRowMapper);
    }

    public int decrementAvailableCopies(int bookId) {
        return jdbcTemplate.update(
                "UPDATE books SET available_copies = available_copies - 1 "
                        + "WHERE book_id = ? AND available_copies > 0",
                bookId
        );
    }

    public int create(int bookId, int memberId, int loanDays) {
        String sql = "INSERT INTO issue_records "
                + "(book_id, member_id, issue_date, due_date) "
                + "VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))";
        return jdbcTemplate.update(sql, bookId, memberId, loanDays);
    }

    public int returnActive(int issueId) {
        return jdbcTemplate.update(
                "UPDATE issue_records SET return_date = CURDATE() "
                        + "WHERE issue_id = ? AND return_date IS NULL",
                issueId
        );
    }

    public int incrementAvailableCopies(int bookId) {
        return jdbcTemplate.update(
                "UPDATE books SET available_copies = available_copies + 1 "
                        + "WHERE book_id = ? AND available_copies < total_copies",
                bookId
        );
    }

    public Integer findBookIdByActiveIssue(int issueId) {
        List<Integer> bookIds = jdbcTemplate.query(
                "SELECT book_id FROM issue_records WHERE issue_id = ? AND return_date IS NULL",
                (rs, rowNum) -> rs.getInt("book_id"),
                issueId
        );
        return bookIds.stream().findFirst().orElse(null);
    }

    public Integer findMemberIdByActiveIssue(int issueId) {
        List<Integer> memberIds = jdbcTemplate.query(
                "SELECT member_id FROM issue_records WHERE issue_id = ? AND return_date IS NULL",
                (rs, rowNum) -> rs.getInt("member_id"),
                issueId
        );
        return memberIds.stream().findFirst().orElse(null);
    }
}
