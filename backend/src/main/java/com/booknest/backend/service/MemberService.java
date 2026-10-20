
package com.booknest.backend.service;

import com.booknest.backend.exception.DuplicateMemberException;
import com.booknest.backend.exception.MemberNotFoundException;
import com.booknest.backend.exception.MemberValidationException;
import com.booknest.backend.model.Member;
import com.booknest.backend.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class MemberService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(int id) {
        if (id <= 0) {
            throw new MemberValidationException(
                    "Member ID must be greater than zero."
            );
        }

        return memberRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException(
                        "Member with ID " + id + " was not found."
                ));
    }

    public Member addMember(Member member) {
        normalizeMember(member);
        if (member != null && member.getBooksIssued() == null) {
            member.setBooksIssued(0);
        }
        validateMember(member);

        if (memberRepository.existsById(member.getId())) {
            throw new DuplicateMemberException(
                    "A member with ID " + member.getId() + " already exists."
            );
        }

        memberRepository.save(member);

        return memberRepository.findById(member.getId()).orElse(member);
    }

    public Member updateMember(int id, Member member) {
        if (id <= 0) {
            throw new MemberValidationException(
                    "Member ID must be greater than zero."
            );
        }

        member.setId(id);
        normalizeMember(member);
        validateMember(member);

        if (!memberRepository.existsById(id)) {
            throw new MemberNotFoundException(
                    "Member with ID " + id + " was not found."
            );
        }

        memberRepository.update(member);

        return memberRepository.findById(id).orElse(member);
    }

    public void deleteMember(int id) {
        if (id <= 0) {
            throw new MemberValidationException(
                    "Member ID must be greater than zero."
            );
        }

        if (!memberRepository.existsById(id)) {
            throw new MemberNotFoundException(
                    "Member with ID " + id + " was not found."
            );
        }

        if (memberRepository.hasIssueRecords(id)) {
            throw new MemberValidationException(
                    "Cannot delete this member because issue records exist for this member."
            );
        }

        memberRepository.deleteById(id);
    }

    private void validateMember(Member member) {
        if (member == null) {
            throw new MemberValidationException(
                    "Member details must not be null."
            );
        }

        if (member.getId() == null) {
            throw new MemberValidationException(
                    "Member ID is required."
            );
        }

        if (member.getId() <= 0) {
            throw new MemberValidationException(
                    "Member ID must be greater than zero."
            );
        }

        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new MemberValidationException(
                    "Member name cannot be blank."
            );
        }

        if (member.getName().trim().length() > 150) {
            throw new MemberValidationException(
                    "Member name cannot exceed 150 characters."
            );
        }

        if (member.getEmail() == null || member.getEmail().trim().length() > 254
            || !EMAIL_PATTERN.matcher(member.getEmail().trim()).matches()) {
            throw new MemberValidationException(
                "Enter a valid email address (maximum 254 characters)."
            );
        }

        if (!"Student".equals(member.getRole())
            && !"Faculty & Staff".equals(member.getRole())) {
            throw new MemberValidationException(
                "Role must be Student or Faculty & Staff."
            );
        }

        if (member.getDepartment() == null
            || member.getDepartment().trim().isEmpty()) {
            throw new MemberValidationException(
                "Department is required."
            );
        }

        if (member.getDepartment().trim().length() > 150) {
            throw new MemberValidationException(
                "Department cannot exceed 150 characters."
            );
        }

        if ("Student".equals(member.getRole())
                && (member.getYearOfStudy() == null || member.getYearOfStudy() < 1
                || member.getYearOfStudy() > 8)) {
            throw new MemberValidationException(
                    "Year of study must be a whole number from 1 to 8 for students."
            );
        }

        if ("Faculty & Staff".equals(member.getRole())
            && member.getYearOfStudy() != null) {
            throw new MemberValidationException(
                "Year of study only applies to students."
            );
        }
        }

        private void normalizeMember(Member member) {
            if (member == null) {
                return;
            }
            if (member.getBooksIssued() != null && member.getBooksIssued() < 0) {
                throw new MemberValidationException(
                        "Books issued cannot be less than zero."
                );
            }
            if (member.getName() != null) {
                member.setName(member.getName().trim());
            }
            if (member.getEmail() != null) {
                member.setEmail(member.getEmail().trim());
            }
            if (member.getRole() != null) {
                member.setRole(member.getRole().trim());
            }
            if (member.getDepartment() != null) {
                member.setDepartment(member.getDepartment().trim());
            }
    }
}
