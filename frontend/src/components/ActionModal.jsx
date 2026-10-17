import React, { useState } from 'react';
import { CloseIcon, BookIcon, IssueReturnIcon, FinesIcon, CheckCircleIcon } from './Icons';

export default function ActionModal({
  modalType,
  modalData,
  onClose,
  onSubmitIssue,
  onSubmitAddBook,
  onSubmitCollectFine,
}) {
  // State for Quick Issue form
  const [issueForm, setIssueForm] = useState({
    rollNumber: modalData?.rollNumber || '2023CSE042',
    studentName: modalData?.studentName || 'Aarav Sharma',
    bookTitle: modalData?.bookTitle || 'Introduction to Algorithms (CLRS)',
    isbn: modalData?.isbn || '978-0262046305',
    loanDays: '14',
  });

  // State for Add Book form
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    department: 'Computer Science',
    isbn: '',
    rack: 'CS-06 / B',
    copies: 5,
  });

  if (!modalType) return null;

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.studentName || !issueForm.bookTitle) return;
    onSubmitIssue(issueForm);
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author) return;
    onSubmitAddBook(bookForm);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-flex">
            {modalType === 'quick-issue' && <IssueReturnIcon size={22} className="modal-header-icon" />}
            {modalType === 'add-book' && <BookIcon size={22} className="modal-header-icon" />}
            {modalType === 'collect-fine' && <FinesIcon size={22} className="modal-header-icon" />}
            {modalType === 'inspect-book' && <BookIcon size={22} className="modal-header-icon" />}

            <div>
              <h3 className="modal-title">
                {modalType === 'quick-issue' && 'Issue Book to Student'}
                {modalType === 'add-book' && 'Add New Book to Inventory'}
                {modalType === 'collect-fine' && 'Process Fine Payment'}
                {modalType === 'inspect-book' && 'Textbook Information'}
              </h3>
              <p className="modal-subtitle">
                {modalType === 'quick-issue' && 'Demo circulation desk check-out simulation'}
                {modalType === 'add-book' && 'Enter bibliographic data for campus stacks'}
                {modalType === 'collect-fine' && 'Simulate overdue penalty collection receipt'}
                {modalType === 'inspect-book' && 'Live stack location and availability status'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {modalType === 'quick-issue' && (
            <form onSubmit={handleIssueSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="issue-roll" className="form-label">Student Roll Number / Member ID</label>
                <input
                  id="issue-roll"
                  type="text"
                  className="form-input"
                  value={issueForm.rollNumber}
                  onChange={(e) => setIssueForm({ ...issueForm, rollNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="issue-student" className="form-label">Student / Member Name</label>
                <input
                  id="issue-student"
                  type="text"
                  className="form-input"
                  value={issueForm.studentName}
                  onChange={(e) => setIssueForm({ ...issueForm, studentName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="issue-title" className="form-label">Book Title</label>
                <input
                  id="issue-title"
                  type="text"
                  className="form-input"
                  value={issueForm.bookTitle}
                  onChange={(e) => setIssueForm({ ...issueForm, bookTitle: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="issue-isbn" className="form-label">ISBN / Barcode</label>
                  <input
                    id="issue-isbn"
                    type="text"
                    className="form-input"
                    value={issueForm.isbn}
                    onChange={(e) => setIssueForm({ ...issueForm, isbn: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="issue-days" className="form-label">Loan Duration</label>
                  <select
                    id="issue-days"
                    className="form-input"
                    value={issueForm.loanDays}
                    onChange={(e) => setIssueForm({ ...issueForm, loanDays: e.target.value })}
                  >
                    <option value="14">14 Days (Standard Student)</option>
                    <option value="30">30 Days (Extended Loan)</option>
                    <option value="60">60 Days (Faculty Privilege)</option>
                  </select>
                </div>
              </div>

              <div className="demo-notice-box">
                <span className="demo-dot"></span>
                <span>Note: This simulates the circulation checkout in local state. No MySQL writes will be executed.</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircleIcon size={16} />
                  <span>Confirm Issue (Demo)</span>
                </button>
              </div>
            </form>
          )}

          {modalType === 'add-book' && (
            <form onSubmit={handleBookSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="book-title" className="form-label">Book Title</label>
                <input
                  id="book-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Distributed Systems: Concepts and Design"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="book-author" className="form-label">Author(s)</label>
                <input
                  id="book-author"
                  type="text"
                  className="form-input"
                  placeholder="e.g. George Coulouris, Jean Dollimore"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="book-dept" className="form-label">Department</label>
                  <select
                    id="book-dept"
                    className="form-input"
                    value={bookForm.department}
                    onChange={(e) => setBookForm({ ...bookForm, department: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science & IT</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Basic Sciences">Basic Sciences & Humanities</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="book-rack" className="form-label">Shelf Rack Location</label>
                  <input
                    id="book-rack"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS-04 / Shelf B"
                    value={bookForm.rack}
                    onChange={(e) => setBookForm({ ...bookForm, rack: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="book-isbn" className="form-label">ISBN</label>
                  <input
                    id="book-isbn"
                    type="text"
                    className="form-input"
                    placeholder="978-0132143011"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="book-copies" className="form-label">Initial Copies</label>
                  <input
                    id="book-copies"
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={bookForm.copies}
                    onChange={(e) => setBookForm({ ...bookForm, copies: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="demo-notice-box">
                <span className="demo-dot"></span>
                <span>Note: Newly added books are displayed instantly in the catalogue for testing.</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircleIcon size={16} />
                  <span>Add Book (Demo)</span>
                </button>
              </div>
            </form>
          )}

          {modalType === 'inspect-book' && modalData && (
            <div className="inspect-details">
              <div className="inspect-header-card">
                <h4 className="inspect-book-title">{modalData.title}</h4>
                <p className="inspect-book-author">By {modalData.author} • {modalData.edition || 'Latest Edition'}</p>
                <div className="inspect-badges">
                  <span className="dept-tag">{modalData.department}</span>
                  <span className="shelf-location-tag">📍 {modalData.shelfLocation || modalData.rack}</span>
                </div>
              </div>

              <div className="inspect-grid">
                <div className="inspect-item">
                  <span className="inspect-label">ISBN-13</span>
                  <span className="inspect-val mono">{modalData.isbn}</span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Available Copies</span>
                  <span className="inspect-val font-semibold text-blue">
                    {modalData.availableCopies} of {modalData.totalCopies} copies
                  </span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Stack Rack</span>
                  <span className="inspect-val">{modalData.shelfLocation || modalData.rack}</span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Circulation Status</span>
                  <span className="inspect-val text-green font-semibold">Active In Catalogue</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onSubmitIssue({
                      studentName: 'Aarav Sharma',
                      rollNumber: '2023CSE042',
                      bookTitle: modalData.title,
                      isbn: modalData.isbn,
                      loanDays: '14',
                    });
                  }}
                >
                  <IssueReturnIcon size={16} />
                  <span>Issue This Book</span>
                </button>
              </div>
            </div>
          )}

          {modalType === 'collect-fine' && modalData && (
            <div className="inspect-details">
              <div className="fine-payment-card">
                <div className="fine-amount-display">
                  <span className="currency-sign">₹</span>
                  <span className="fine-digits">{modalData.totalFine}</span>
                </div>
                <p className="fine-subtext">Overdue fine for {modalData.daysOverdue} days ({modalData.ratePerDay})</p>
              </div>

              <div className="inspect-grid">
                <div className="inspect-item">
                  <span className="inspect-label">Student Name</span>
                  <span className="inspect-val font-semibold">{modalData.studentName}</span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Roll Number</span>
                  <span className="inspect-val mono">{modalData.rollNumber}</span>
                </div>
                <div className="inspect-item full-span">
                  <span className="inspect-label">Book Title</span>
                  <span className="inspect-val">{modalData.bookTitle}</span>
                </div>
              </div>

              <div className="demo-notice-box">
                <span className="demo-dot"></span>
                <span>Demo Receipt: Clicking Collect marks this fine as Paid in local state.</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-success"
                  onClick={() => onSubmitCollectFine(modalData.id)}
                >
                  <CheckCircleIcon size={16} />
                  <span>Collect ₹{modalData.totalFine} & Clear Due</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
