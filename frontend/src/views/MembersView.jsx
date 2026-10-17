import React, { useState } from 'react';

export default function MembersView({ members, searchQuery }) {
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredMembers = members.filter((m) => {
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    if (!matchesRole) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.rollNumber.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="tab-view-container">
      <div className="view-header-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-btn ${roleFilter === 'All' ? 'active' : ''}`}
            onClick={() => setRoleFilter('All')}
          >
            All Members ({members.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${roleFilter === 'Student' ? 'active' : ''}`}
            onClick={() => setRoleFilter('Student')}
          >
            Students
          </button>
          <button
            type="button"
            className={`filter-btn ${roleFilter === 'Faculty' ? 'active' : ''}`}
            onClick={() => setRoleFilter('Faculty')}
          >
            Faculty & Staff
          </button>
        </div>

        <span className="stock-pill stock-ok">Total Registered: 2,150 Members</span>
      </div>

      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-heading">College Membership Roster</h2>
            <span className="card-subheading">Verified student and faculty library borrowing accounts</span>
          </div>
        </div>

        <div className="activity-table-wrapper">
          <table className="library-table">
            <thead>
              <tr>
                <th scope="col">Roll / ID</th>
                <th scope="col">Member Name</th>
                <th scope="col">Role & Year</th>
                <th scope="col">Department</th>
                <th scope="col">Books Issued</th>
                <th scope="col">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <span className="member-id-pill mono">{member.rollNumber}</span>
                  </td>
                  <td>
                    <div className="member-name-block">
                      <span className="member-name-bold">{member.name}</span>
                      <span className="member-email-sub">{member.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="role-block">
                      <span className="role-tag">{member.role}</span>
                      <span className="text-muted text-xs">{member.year}</span>
                    </div>
                  </td>
                  <td>
                    <span className="dept-tag">{member.department}</span>
                  </td>
                  <td>
                    <span className="books-count-badge">
                      {member.booksIssued} {member.booksIssued === 1 ? 'Book' : 'Books'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        member.status.includes('Suspended') ? 'badge-red' : 'badge-green'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer-note">
          <span className="data-disclaimer-dot"></span>
          <span>Sample college member directory. Member authentication & barcode scanning will connect to Spring Security & Spring Boot.</span>
        </div>
      </div>
    </div>
  );
}
