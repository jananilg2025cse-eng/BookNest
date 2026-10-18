
package com.booknest.backend.model;

public class Member {
    private Integer id;
    private String name;
    private String email;
    private String role;
    private Integer yearOfStudy;
    private String department;
    private Integer booksIssued;

    public Member() {
    }

    public Member(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Member(Integer id, String name, String email, String role,
                  Integer yearOfStudy, String department, Integer booksIssued) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.yearOfStudy = yearOfStudy;
        this.department = department;
        this.booksIssued = booksIssued;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getBooksIssued() {
        return booksIssued;
    }

    public void setBooksIssued(Integer booksIssued) {
        this.booksIssued = booksIssued;
    }

    @Override
    public String toString() {
        return "Member{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", yearOfStudy=" + yearOfStudy +
                ", department='" + department + '\'' +
                ", booksIssued=" + booksIssued +
                '}';
    }
}
