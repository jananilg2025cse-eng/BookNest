
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

    private final RowMapper<Member> memberRowMapper = (rs, rowNum) ->
            new Member(
                    rs.getInt("member_id"),
                    rs.getString("name")
            );

    public MemberRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Member> findAll() {
        String sql = "SELECT member_id, name FROM members ORDER BY member_id ASC";
        return jdbcTemplate.query(sql, memberRowMapper);
    }

    public Optional<Member> findById(int id) {
        String sql = "SELECT member_id, name FROM members WHERE member_id = ?";
        List<Member> members = jdbcTemplate.query(sql, memberRowMapper, id);
        return members.stream().findFirst();
    }

    public boolean existsById(int id) {
        String sql = "SELECT COUNT(*) FROM members WHERE member_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    public int save(Member member) {
        String sql = "INSERT INTO members (member_id, name) VALUES (?, ?)";
        return jdbcTemplate.update(
                sql,
                member.getId(),
                member.getName()
        );
    }

    public int update(Member member) {
        String sql = "UPDATE members SET name = ? WHERE member_id = ?";
        return jdbcTemplate.update(
                sql,
                member.getName(),
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
