import React, { useState } from 'react';
import { PlusIcon, CheckCircleIcon } from '../components/Icons';

export default function CirculationView({
  circulation,
  onOpenQuickIssue,
  onReturnBook,
  searchQuery,
}) {
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredLoans = circulation.filter((item) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Overdue' && item.status === 'Overdue') ||
      (statusFilter === 'Active' && item.status !== 'Overdue');
    if (!matchesStatus) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.bookTitle.toLowerCase().includes(q) ||
      item.studentName.toLowerCase().includes(q) ||
      item.rollNumber.toLowerCase().includes(q) ||
      item.isbn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="tab-view-container">
      <div className="view-header-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All Active Loans ({circulation.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            Regular Loans
          </button>
          <button
            type="button"
            className={`filter-btn ${statusFilter === 'Overdue' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Overdue')}
          >
            Overdue Loans
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenQuickIssue}
        >
          <PlusIcon size={16} />
          <span>New Book Issue (Demo)</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-heading">Active Circulation Ledger</h2>
            <span className="card-subheading">Currently checked-out books across campus</span>
          </div>
          <span className="stock-pill stock-ok">Circulating: 546 Books</span>
        </div>

        <div className="activity-table-wrapper">
          <table className="library-table">
            <thead>
              <tr>
                <th scope="col">Transaction ID</th>
                <th scope="col">Book Title</th>
                <th scope="col">Borrower / Student</th>
                <th scope="col">Issued Date</th>
                <th scope="col">Due Date</th>
                <th scope="col">Loan Status</th>
                <th scope="col" className="text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-muted">
                    No active loan records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = loan.status === 'Overdue';

                  return (
                    <tr key={loan.id}>
                      <td>
                        <span className="member-id-pill mono">{loan.id}</span>
                      </td>
                      <td>
                        <div className="book-cell">
                          <span className="book-title-main">{loan.bookTitle}</span>
                          <span className="book-isbn-sub mono">ISBN: {loan.isbn}</span>
                        </div>
                      </td>
                      <td>
                        <div className="member-cell">
                          <span className="member-name">{loan.studentName}</span>
                          <span className="member-id-pill mono">{loan.rollNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-slate text-sm">{loan.issuedDate}</span>
                      </td>
                      <td>
                        <div className="due-date-block">
                          <span className={`text-sm font-semibold ${isOverdue ? 'text-red' : 'text-slate'}`}>
                            {loan.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="overdue-tag">
                              {loan.daysOverdue} days overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            isOverdue
                              ? 'badge-red'
                              : loan.status === 'Faculty Loan'
                              ? 'badge-purple'
                              : 'badge-blue'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onReturnBook(loan)}
                          title="Simulate check-in and inventory restock"
                        >
                          <CheckCircleIcon size={14} />
                          <span>Check In</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer-note">
          <span className="data-disclaimer-dot"></span>
          <span>Clicking 'Check In' simulates immediate return in local state for UI demonstration.</span>
        </div>
      </div>
    </div>
  );
}
