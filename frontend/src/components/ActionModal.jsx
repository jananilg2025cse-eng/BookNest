import React, { useState, useEffect } from 'react';
import { CloseIcon, BookIcon, IssueReturnIcon, FinesIcon, CheckCircleIcon, AlertCircleIcon, EditIcon, TrashIcon } from './Icons';

export default function ActionModal({
  modalType,
  modalData,
  onClose,
  onSubmitIssue,
  onSubmitAddBook,
  onSubmitEditBook,
  onSubmitDeleteBook,
  onSubmitCollectFine,
  onSwitchToEdit,
  onSwitchToDelete,
}) {
  // State for Quick Issue form
  const [issueForm, setIssueForm] = useState({
    rollNumber: modalData?.rollNumber || '2023CSE042',
    studentName: modalData?.studentName || 'Aarav Sharma',
    bookTitle: modalData?.bookTitle || 'Introduction to Algorithms',
    isbn: modalData?.isbn || '978-0262046305',
    loanDays: '14',
  });

  // State for Add Book form (connected to Spring Boot POST /api/books)
  const [bookForm, setBookForm] = useState({
    id: '',
    title: '',
    author: '',
    totalCopies: 5,
  });
  const [addBookLoading, setAddBookLoading] = useState(false);
  const [addBookError, setAddBookError] = useState(null);

  // State for Edit Book form (connected to Spring Boot PUT /api/books/{id})
  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    author: '',
    totalCopies: '',
    availableCopies: '',
  });
  const [editBookLoading, setEditBookLoading] = useState(false);
  const [editBookError, setEditBookError] = useState(null);

  // State for Delete Book confirmation
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Sync edit form whenever modal opens or modalData changes
  useEffect(() => {
    if (modalType === 'edit-book' && modalData) {
      setEditForm({
        id: modalData.id ?? '',
        title: modalData.title ?? '',
        author: modalData.author ?? '',
        totalCopies: modalData.totalCopies ?? '',
        availableCopies: modalData.availableCopies ?? '',
      });
      setEditBookError(null);
    }
    if (modalType === 'delete-book') {
      setDeleteError(null);
    }
  }, [modalType, modalData]);

  if (!modalType) return null;

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.studentName || !issueForm.bookTitle) return;
    onSubmitIssue(issueForm);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setAddBookError(null);

    const idNum = parseInt(bookForm.id, 10);
    const copiesNum = parseInt(bookForm.totalCopies, 10);

    if (isNaN(idNum) || idNum <= 0) {
      setAddBookError('Book ID must be a positive integer (e.g. 103).');
      return;
    }
    if (!bookForm.title || !bookForm.title.trim()) {
      setAddBookError('Book title cannot be blank.');
      return;
    }
    if (!bookForm.author || !bookForm.author.trim()) {
      setAddBookError('Book author cannot be blank.');
      return;
    }
    if (isNaN(copiesNum) || copiesNum <= 0) {
      setAddBookError('Total copies must be greater than zero.');
      return;
    }

    try {
      setAddBookLoading(true);
      await onSubmitAddBook({
        id: idNum,
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        totalCopies: copiesNum,
      });
      setBookForm({ id: '', title: '', author: '', totalCopies: 5 });
    } catch (err) {
      setAddBookError(err.message || 'Failed to save book to backend.');
    } finally {
      setAddBookLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditBookError(null);

    const copiesNum = parseInt(editForm.totalCopies, 10);
    const availNum = parseInt(editForm.availableCopies, 10);

    if (!editForm.title || !editForm.title.trim()) {
      setEditBookError('Book title cannot be blank.');
      return;
    }
    if (!editForm.author || !editForm.author.trim()) {
      setEditBookError('Book author cannot be blank.');
      return;
    }
    if (isNaN(copiesNum) || copiesNum <= 0) {
      setEditBookError('Total copies count must be greater than zero.');
      return;
    }
    if (isNaN(availNum) || availNum < 0) {
      setEditBookError('Available copies cannot be negative.');
      return;
    }
    if (availNum > copiesNum) {
      setEditBookError('Available copies cannot exceed total copies.');
      return;
    }

    try {
      setEditBookLoading(true);
      await onSubmitEditBook(modalData.id, {
        id: modalData.id,
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        totalCopies: copiesNum,
        availableCopies: availNum,
      });
    } catch (err) {
      setEditBookError(err.message || 'Failed to update book.');
    } finally {
      setEditBookLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteError(null);
    try {
      setDeleteLoading(true);
      await onSubmitDeleteBook(modalData.id);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete book.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-flex">
            {modalType === 'quick-issue' && <IssueReturnIcon size={22} className="modal-header-icon" />}
            {modalType === 'add-book' && <BookIcon size={22} className="modal-header-icon" />}
            {modalType === 'edit-book' && <EditIcon size={22} className="modal-header-icon" />}
            {modalType === 'delete-book' && <TrashIcon size={22} className="modal-header-icon" style={{ color: 'var(--rose-500)' }} />}
            {modalType === 'collect-fine' && <FinesIcon size={22} className="modal-header-icon" />}
            {modalType === 'inspect-book' && <BookIcon size={22} className="modal-header-icon" />}

            <div>
              <h3 className="modal-title">
                {modalType === 'quick-issue' && 'Issue Book to Student'}
                {modalType === 'add-book' && 'Add New Book to Inventory'}
                {modalType === 'edit-book' && 'Edit Book Details'}
                {modalType === 'delete-book' && 'Delete Book from Catalogue'}
                {modalType === 'collect-fine' && 'Process Fine Payment'}
                {modalType === 'inspect-book' && 'Textbook Information'}
              </h3>
              <p className="modal-subtitle">
                {modalType === 'quick-issue' && 'Demo circulation desk check-out simulation'}
                {modalType === 'add-book' && 'Enter bibliographic data for campus stacks'}
                {modalType === 'edit-book' && 'Update bibliographic and stack inventory in MySQL'}
                {modalType === 'delete-book' && 'Confirm permanent removal from MySQL database'}
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
              {addBookError && (
                <div className="form-error-alert" role="alert">
                  <AlertCircleIcon size={16} />
                  <span>{addBookError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="book-id" className="form-label">
                  Book ID (Unique Number) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-id"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input mono"
                  placeholder="e.g. 103"
                  value={bookForm.id}
                  onChange={(e) => setBookForm({ ...bookForm, id: e.target.value })}
                  required
                />
                <span className="form-field-hint">Primary key in MySQL books table. Duplicate IDs will be rejected.</span>
              </div>

              <div className="form-group">
                <label htmlFor="book-title" className="form-label">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Database System Concepts"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="book-author" className="form-label">
                  Author(s) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-author"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Abraham Silberschatz, Henry F. Korth"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="book-copies" className="form-label">
                  Total Copies <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-copies"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 5"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                  required
                />
                <span className="form-field-hint">Initial available copies will match this count automatically.</span>
              </div>

              <div className="live-api-badge-box">
                <span className="live-pulse-dot"></span>
                <span>Target: <code>POST http://localhost:8080/api/books</code> (Persisted in MySQL)</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={addBookLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addBookLoading}>
                  {addBookLoading ? (
                    <span>Saving to Database...</span>
                  ) : (
                    <>
                      <CheckCircleIcon size={16} />
                      <span>Add Book to Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {modalType === 'edit-book' && (
            <form onSubmit={handleEditSubmit} className="modal-form">
              {editBookError && (
                <div className="form-error-alert" role="alert">
                  <AlertCircleIcon size={16} />
                  <span>{editBookError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-book-id" className="form-label">
                  Book ID (MySQL Primary Key)
                </label>
                <input
                  id="edit-book-id"
                  type="text"
                  className="form-input mono"
                  value={`#${editForm.id}`}
                  disabled
                  readOnly
                />
                <span className="form-field-hint">Book ID is immutable and cannot be changed.</span>
              </div>

              <div className="form-group">
                <label htmlFor="edit-book-title" className="form-label">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-book-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Database System Concepts"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  disabled={editBookLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-book-author" className="form-label">
                  Author(s) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-book-author"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Abraham Silberschatz, Henry F. Korth"
                  value={editForm.author}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  disabled={editBookLoading}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-book-copies" className="form-label">
                    Total Copies <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="edit-book-copies"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 5"
                    value={editForm.totalCopies}
                    onChange={(e) => setEditForm({ ...editForm, totalCopies: e.target.value })}
                    disabled={editBookLoading}
                    required
                  />
                  <span className="form-field-hint">Total holdings inventory</span>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-book-avail-copies" className="form-label">
                    Available Copies <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="edit-book-avail-copies"
                    type="number"
                    min="0"
                    max={editForm.totalCopies || undefined}
                    className="form-input"
                    placeholder="e.g. 3"
                    value={editForm.availableCopies}
                    onChange={(e) => setEditForm({ ...editForm, availableCopies: e.target.value })}
                    disabled={editBookLoading}
                    required
                  />
                  <span className="form-field-hint">Must not exceed total copies</span>
                </div>
              </div>

              <div className="live-api-badge-box">
                <span className="live-pulse-dot"></span>
                <span>Target: <code>PUT http://localhost:8080/api/books/{editForm.id}</code> (Persisted in MySQL)</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={editBookLoading}>
                  Cancel
                </button>
                <button type="submit" id="save-edit-book-btn" className="btn btn-primary" disabled={editBookLoading}>
                  {editBookLoading ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <CheckCircleIcon size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {modalType === 'inspect-book' && modalData && (
            <div className="inspect-details">
              <div className="inspect-header-card">
                <div className="inspect-book-id-badge">Book #{modalData.id}</div>
                <h4 className="inspect-book-title">{modalData.title}</h4>
                <p className="inspect-book-author">By {modalData.author}</p>
                <div className="inspect-badges">
                  <span className={`status-badge ${
                    modalData.availableCopies === 0 ? 'badge-red' : modalData.availableCopies <= 2 ? 'badge-amber' : 'badge-green'
                  }`}>
                    {modalData.availableCopies === 0 ? 'Out of Stock' : modalData.availableCopies <= 2 ? 'Limited Copies' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="inspect-grid">
                <div className="inspect-item">
                  <span className="inspect-label">Database ID</span>
                  <span className="inspect-val mono font-semibold">#{modalData.id}</span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Available Copies</span>
                  <span className="inspect-val font-semibold text-blue">
                    {modalData.availableCopies} of {modalData.totalCopies} copies
                  </span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Total Inventory</span>
                  <span className="inspect-val font-semibold">{modalData.totalCopies} Copies</span>
                </div>
                <div className="inspect-item">
                  <span className="inspect-label">Storage Backend</span>
                  <span className="inspect-val text-green font-semibold">MySQL books table</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                {onSwitchToDelete && (
                  <button
                    type="button"
                    className="btn btn-danger-ghost"
                    onClick={() => onSwitchToDelete(modalData)}
                    title="Delete this book"
                  >
                    <TrashIcon size={16} />
                    <span>Delete</span>
                  </button>
                )}
                {onSwitchToEdit && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onSwitchToEdit(modalData)}
                  >
                    <EditIcon size={16} />
                    <span>Edit Book</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {modalType === 'delete-book' && modalData && (
            <div className="inspect-details">
              {deleteError && (
                <div className="form-error-alert" role="alert">
                  <AlertCircleIcon size={16} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="delete-confirm-card">
                <div className="delete-badge">Book #{modalData.id}</div>
                <h4 className="inspect-book-title">{modalData.title}</h4>
                <p className="inspect-book-author">By {modalData.author}</p>
                <div className="inspect-grid" style={{ marginTop: '12px' }}>
                  <div className="inspect-item">
                    <span className="inspect-label">Available Copies</span>
                    <span className="inspect-val font-semibold">{modalData.availableCopies}</span>
                  </div>
                  <div className="inspect-item">
                    <span className="inspect-label">Total Inventory</span>
                    <span className="inspect-val font-semibold">{modalData.totalCopies}</span>
                  </div>
                </div>
              </div>

              <div className="delete-warning-banner" role="alert">
                <AlertCircleIcon size={20} className="warning-icon" />
                <div className="warning-content">
                  <strong>Are you sure you want to delete this book?</strong>
                  <p>This action cannot be undone. The book record will be permanently deleted from MySQL.</p>
                </div>
              </div>

              <div className="live-api-badge-box">
                <span className="live-pulse-dot" style={{ background: 'var(--rose-500)' }}></span>
                <span>Target: <code>DELETE http://localhost:8080/api/books/{modalData.id}</code> (MySQL)</span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-book-btn"
                  className="btn btn-danger"
                  onClick={handleDeleteSubmit}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>Deleting Book...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon size={16} />
                      <span>Delete Book</span>
                    </>
                  )}
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
