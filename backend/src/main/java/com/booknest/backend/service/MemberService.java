
package com.booknest.backend.service;

import com.booknest.backend.exception.DuplicateMemberException;
import com.booknest.backend.exception.MemberNotFoundException;
import com.booknest.backend.exception.MemberValidationException;
import com.booknest.backend.model.Member;
import com.booknest.backend.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

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
        validateMember(member);

        if (memberRepository.existsById(member.getId())) {
            throw new DuplicateMemberException(
                    "A member with ID " + member.getId() + " already exists."
            );
        }

        member.setName(member.getName().trim());
        memberRepository.save(member);

        return member;
    }

    public Member updateMember(int id, Member member) {
        if (id <= 0) {
            throw new MemberValidationException(
                    "Member ID must be greater than zero."
            );
        }

        validateMember(member);

        if (!memberRepository.existsById(id)) {
            throw new MemberNotFoundException(
                    "Member with ID " + id + " was not found."
            );
        }

        member.setId(id);
        member.setName(member.getName().trim());

        memberRepository.update(member);

        return member;
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
    }
}
