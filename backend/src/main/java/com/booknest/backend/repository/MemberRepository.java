
package com.booknest.backend.repository;

import com.booknest.backend.model.Member;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MemberRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final String MEMBER_SELECT = """
        SELECT m.member_id, m.name, m.email, m.role, m.year_of_study,
           m.department,
           (SELECT COUNT(*) FROM issue_records ir
            WHERE ir.member_id = m.member_id AND ir.return_date IS NULL)
               AS books_issued
        FROM members m
        """;

    private final RowMapper<Member> memberRowMapper = (rs, rowNum) ->
            new Member(
                    rs.getInt("member_id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getObject("year_of_study", Integer.class),
            rs.getString("department"),
            rs.getInt("books_issued")
            );

    public MemberRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Member> findAll() {
        String sql = MEMBER_SELECT + " ORDER BY m.member_id ASC";
        return jdbcTemplate.query(sql, memberRowMapper);
    }

    public Optional<Member> findById(int id) {
        String sql = MEMBER_SELECT + " WHERE m.member_id = ?";
        List<Member> members = jdbcTemplate.query(sql, memberRowMapper, id);
        return members.stream().findFirst();
    }

    public boolean existsById(int id) {
        String sql = "SELECT COUNT(*) FROM members WHERE member_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    public int save(Member member) {
        String sql = "INSERT INTO members "
            + "(member_id, name, email, role, year_of_study, department) "
            + "VALUES (?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(
                sql,
                member.getId(),
            member.getName(),
            member.getEmail(),
            member.getRole(),
            member.getYearOfStudy(),
            member.getDepartment()
        );
    }

    public int update(Member member) {
        String sql = "UPDATE members SET name = ?, email = ?, role = ?, "
            + "year_of_study = ?, department = ? WHERE member_id = ?";
        return jdbcTemplate.update(
                sql,
                member.getName(),
            member.getEmail(),
            member.getRole(),
            member.getYearOfStudy(),
            member.getDepartment(),
                member.getId()
        );
    }

    public int deleteById(int id) {
        String sql = "DELETE FROM members WHERE member_id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public boolean hasIssueRecords(int id) {
        String sql = "SELECT COUNT(*) FROM issue_records WHERE member_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }
}
