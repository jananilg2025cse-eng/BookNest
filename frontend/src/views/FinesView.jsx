import React, { useState } from 'react';
import { CheckCircleIcon } from '../components/Icons';

export default function FinesView({ fines, onOpenCollectFine, searchQuery }) {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredFines = fines.filter((fine) => {
    const matchesStatus = filterStatus === 'All' || fine.status === filterStatus;
    if (!matchesStatus) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      fine.studentName.toLowerCase().includes(q) ||
      fine.rollNumber.toLowerCase().includes(q) ||
      fine.bookTitle.toLowerCase().includes(q)
    );
  });

  const pendingTotal = fines
    .filter((f) => f.status === 'Pending')
    .reduce((sum, f) => sum + f.totalFine, 0);

  return (
    <div className="tab-view-container">
      {/* Mini Summary Strip for Fines */}
      <div className="fines-summary-strip">
        <div className="fine-metric-box">
          <span className="fine-metric-label">Pending Dues Total</span>
          <span className="fine-metric-val text-red">₹{pendingTotal}</span>
        </div>
        <div className="fine-metric-box">
          <span className="fine-metric-label">Daily Overdue Rate</span>
          <span className="fine-metric-val">₹5.00 / day</span>
        </div>
        <div className="fine-metric-box">
          <span className="fine-metric-label">Overdue Grace Period</span>
          <span className="fine-metric-val">2 Days Post Due</span>
        </div>
        <div className="fine-metric-box">
          <span className="fine-metric-label">Defaulters On Record</span>
          <span className="fine-metric-val text-amber">{fines.filter(f => f.status === 'Pending').length} Students</span>
        </div>
      </div>

      <div className="view-header-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All Records ({fines.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Pending')}
          >
            Pending ({fines.filter((f) => f.status === 'Pending').length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'Paid' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Paid')}
          >
            Settled / Paid
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-heading">Overdue Fine Ledger</h2>
            <span className="card-subheading">College standard fine rate: ₹5 per day after 14-day checkout</span>
          </div>
        </div>

        <div className="activity-table-wrapper">
          <table className="library-table">
            <thead>
              <tr>
                <th scope="col">Fine ID</th>
                <th scope="col">Student / Borrower</th>
                <th scope="col">Book Title</th>
                <th scope="col">Overdue Days</th>
                <th scope="col">Rate Calculation</th>
                <th scope="col">Total Fine</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-muted">
                    No fine records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFines.map((fine) => {
                  const isPending = fine.status === 'Pending';

                  return (
                    <tr key={fine.id}>
                      <td>
                        <span className="member-id-pill mono">{fine.id}</span>
                      </td>
                      <td>
                        <div className="member-cell">
                          <span className="member-name">{fine.studentName}</span>
                          <span className="member-id-pill mono">{fine.rollNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span className="book-title-main">{fine.bookTitle}</span>
                      </td>
                      <td>
                        <span className="overdue-days-pill">
                          {fine.daysOverdue} Days Late
                        </span>
                      </td>
                      <td>
                        <span className="text-muted text-sm">{fine.daysOverdue} × {fine.ratePerDay}</span>
                      </td>
                      <td>
                        <span className={`fine-amount font-semibold ${isPending ? 'text-red' : 'text-slate'}`}>
                          ₹{fine.totalFine}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            isPending ? 'badge-red' : 'badge-green'
                          }`}
                        >
                          {fine.status}
                        </span>
                      </td>
                      <td className="text-right">
                        {isPending ? (
                          <button
                            type="button"
                            className="table-action-btn btn-collect-fine"
                            onClick={() => onOpenCollectFine(fine)}
                            title="Collect fine demo"
                          >
                            <CheckCircleIcon size={14} />
                            <span>Collect (Demo)</span>
                          </button>
                        ) : (
                          <span className="text-green text-xs font-semibold">✓ Cleared</span>
                        )}
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
          <span>Sample college fine accounts. Real payment gateway and receipt generation will integrate with Spring Boot.</span>
        </div>
      </div>
    </div>
  );
}
