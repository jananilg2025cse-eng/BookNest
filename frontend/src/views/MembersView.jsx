
import React, { useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon, CloseIcon, PlusIcon, UsersIcon } from '../components/Icons';
import { createMember, deleteMember, updateMember } from '../services/memberService';

export default function MembersView({
  members = [],
  searchQuery = '',
  loading = false,
  error = '',
  onRefresh,
}) {
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    yearOfStudy: '',
    department: '',
    booksIssued: '0',
  });
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [booksIssuedDrafts, setBooksIssuedDrafts] = useState({});
  const [savingBooksIssuedId, setSavingBooksIssuedId] = useState(null);

  const query = searchQuery.trim().toLowerCase();
  const roleFilteredMembers = roleFilter === 'All'
    ? members
    : members.filter((member) => member.role === roleFilter);
  const filteredMembers = roleFilteredMembers.filter((member) => {
    const name = String(member.name ?? '').toLowerCase();
    const id = String(member.id ?? '').toLowerCase();
    const email = String(member.email ?? '').toLowerCase();
    return name.includes(query) || id.includes(query) || email.includes(query);
  });

  const openAddForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      role: '',
      yearOfStudy: '',
      department: '',
      booksIssued: '0',
    });
    setEditingId(null);
    setFormError('');
    setActionError('');
    setSuccessMessage('');
    setFormMode('add');
  };

  const openEditForm = (member) => {
    setFormData({
      id: String(member.id),
      name: member.name ?? '',
      email: member.email ?? '',
      role: member.role ?? '',
      yearOfStudy: member.yearOfStudy == null ? '' : String(member.yearOfStudy),
      department: member.department ?? '',
      booksIssued: String(member.booksIssued ?? 0),
    });
    setEditingId(member.id);
    setFormError('');
    setActionError('');
    setSuccessMessage('');
    setFormMode('edit');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const id = formMode === 'edit' ? Number(editingId) : Number(formData.id);
    const name = formData.name.trim();
    const email = formData.email.trim();
    const department = formData.department.trim();
    const booksIssued = Number(formData.booksIssued);
    const yearOfStudy = formData.role === 'Student'
      ? Number(formData.yearOfStudy)
      : null;

    if (!Number.isInteger(id) || id <= 0) {
      setFormError('Member ID must be a positive whole number.');
      return;
    }
    if (!name) {
      setFormError('Member name is required.');
      return;
    }
    if (name.length > 150) {
      setFormError('Member name cannot exceed 150 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      setFormError('Enter a valid email address (maximum 254 characters).');
      return;
    }
    if (!['Student', 'Faculty & Staff'].includes(formData.role)) {
      setFormError('Choose Student or Faculty & Staff as the member role.');
      return;
    }
    if (formData.role === 'Student'
        && (!Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 8)) {
      setFormError('Student year of study must be a whole number from 1 to 8.');
      return;
    }
    if (!department || department.length > 150) {
      setFormError('Department is required and cannot exceed 150 characters.');
      return;
    }
    if (!Number.isInteger(booksIssued) || booksIssued < 0) {
      setFormError('Books Issued must be a whole number greater than or equal to zero.');
      return;
    }

    try {
      setFormSubmitting(true);
      setActionError('');
      setSuccessMessage('');

      const member = {
        id,
        name,
        email,
        role: formData.role,
        yearOfStudy,
        department,
        booksIssued,
      };
      if (formMode === 'add') {
        await createMember(member);
      } else {
        await updateMember(id, member);
      }

      setFormMode(null);
      setSuccessMessage(formMode === 'add' ? 'Member added.' : 'Member updated.');
      if (onRefresh && !(await onRefresh())) {
        setActionError('The member was saved, but the list could not refresh. Use Refresh to try again.');
      }
    } catch (requestError) {
      setFormError(requestError.message || 'Could not save this member.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleBooksIssuedSave = async (member) => {
    const draft = booksIssuedDrafts[member.id] ?? String(member.booksIssued ?? 0);
    if (!draft.trim()) {
      setActionError('Enter a whole number for Books Issued.');
      return;
    }
    const booksIssued = Number(draft);
    if (!Number.isInteger(booksIssued) || booksIssued < 0) {
      setActionError('Books Issued must be a whole number greater than or equal to zero.');
      return;
    }

    setSavingBooksIssuedId(member.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await updateMember(member.id, {
        ...member,
        booksIssued,
      });
      setSuccessMessage(`Books Issued updated for member ${member.id}.`);
      setBooksIssuedDrafts((drafts) => {
        const nextDrafts = { ...drafts };
        delete nextDrafts[member.id];
        return nextDrafts;
      });
      if (onRefresh && !(await onRefresh())) {
        setActionError('The count was saved, but the list could not refresh. Use Refresh to try again.');
      }
    } catch (requestError) {
      setActionError(requestError.message || 'Could not update Books Issued.');
    } finally {
      setSavingBooksIssuedId(null);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete ${member.name} (ID ${member.id})? This cannot be undone.`)) {
      return;
    }

    setDeletingId(member.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await deleteMember(member.id);
      setSuccessMessage(`Member ${member.id} deleted.`);
      if (onRefresh && !(await onRefresh())) {
        setActionError('The member was deleted, but the list could not refresh. Use Refresh to try again.');
      }
    } catch (requestError) {
      setActionError(requestError.message || 'Could not delete this member.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="tab-view-container">
      <div className="view-header-bar">
        <div>
          <div className="filter-pill-group">
            <button type="button" className={`filter-btn ${roleFilter === 'All' ? 'active' : ''}`} onClick={() => setRoleFilter('All')}>
              All Members ({members.length})
            </button>
            <button type="button" className={`filter-btn ${roleFilter === 'Student' ? 'active' : ''}`} onClick={() => setRoleFilter('Student')}>
              Students ({members.filter((member) => member.role === 'Student').length})
            </button>
            <button type="button" className={`filter-btn ${roleFilter === 'Faculty & Staff' ? 'active' : ''}`} onClick={() => setRoleFilter('Faculty & Staff')}>
              Faculty &amp; Staff ({members.filter((member) => member.role === 'Faculty & Staff').length})
            </button>
          </div>
          <p className="card-subheading">Edit Books Issued directly in the table; issue and return actions adjust the count too.</p>
        </div>

        <div className="view-actions-cluster">
          <span className="stock-pill stock-ok">Total Registered: {members.length} Members</span>
          <button type="button" className="btn btn-primary" onClick={openAddForm}>
            <PlusIcon size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-heading">College Membership Roster</h2>
            <span className="card-subheading">Member details and editable book counts from the BookNest database.</span>
          </div>
        </div>

        {successMessage && (
          <div className="form-success-alert" role="status">
            <CheckCircleIcon size={16} />
            <span>{successMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="form-error-alert" role="alert">
            <AlertCircleIcon size={16} />
            <span>{actionError}</span>
          </div>
        )}

        <div className="activity-table-wrapper">
          <table className="library-table">
            <thead>
              <tr>
                <th scope="col">Roll / ID</th>
                <th scope="col">Member Name</th>
                <th scope="col">Role &amp; Year</th>
                <th scope="col">Department</th>
                <th scope="col">Books Issued</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}>Loading members...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} role="alert">{error}</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {query
                      ? 'No matching members found.'
                      : 'No members registered yet.'}
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td><span className="member-id-pill mono">{member.id}</span></td>
                  <td><span className="member-name-bold">{member.name}</span></td>
                  <td>
                    {member.role
                      ? `${member.role}${member.role === 'Student' && member.yearOfStudy ? ` · Year ${member.yearOfStudy}` : ''}`
                      : '—'}
                  </td>
                  <td>{member.department || '—'}</td>
                  <td>
                    <div className="view-actions-cluster">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        className="form-input mono"
                        aria-label={`Books issued for ${member.name}`}
                        value={booksIssuedDrafts[member.id] ?? String(member.booksIssued ?? 0)}
                        onChange={(event) => setBooksIssuedDrafts((drafts) => ({
                          ...drafts,
                          [member.id]: event.target.value,
                        }))}
                        disabled={loading || savingBooksIssuedId === member.id}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleBooksIssuedSave(member)}
                        disabled={loading || savingBooksIssuedId === member.id}
                      >
                        {savingBooksIssuedId === member.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="view-actions-cluster">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEditForm(member)}
                        disabled={loading || deletingId === member.id}
                      >
                        Modify
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDelete(member)}
                        disabled={loading || deletingId === member.id}
                      >
                        {deletingId === member.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer-note">
          <span className="data-disclaimer-dot"></span>
          <span>Books Issued is editable here and also changes when a book is issued or returned.</span>
        </div>
      </div>

      {formMode && (
        <div className="modal-overlay" onClick={() => !formSubmitting && setFormMode(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-flex">
                <UsersIcon size={22} className="modal-header-icon" />
                <div>
                  <h2 className="modal-title" id="member-form-title">
                    {formMode === 'add' ? 'Add Member' : 'Modify Member'}
                  </h2>
                  <p className="modal-subtitle">Save member details to the BookNest database.</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setFormMode(null)}
                disabled={formSubmitting}
                aria-label="Close dialog"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form className="modal-form" onSubmit={handleSubmit}>
                {formError && (
                  <div className="form-error-alert" role="alert">
                    <AlertCircleIcon size={16} />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="member-id" className="form-label">Member ID</label>
                  <input
                    id="member-id"
                    type={formMode === 'add' ? 'number' : 'text'}
                    min={formMode === 'add' ? '1' : undefined}
                    step={formMode === 'add' ? '1' : undefined}
                    className="form-input mono"
                    value={formData.id}
                    onChange={(event) => setFormData({ ...formData, id: event.target.value })}
                    readOnly={formMode === 'edit'}
                    required
                  />
                  {formMode === 'edit' && <span className="form-field-hint">Member ID cannot be changed.</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="member-name" className="form-label">Full Name</label>
                  <input
                    id="member-name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    maxLength={150}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="member-email" className="form-label">Email</label>
                  <input
                    id="member-email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    maxLength={254}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="member-role" className="form-label">Role</label>
                  <select
                    id="member-role"
                    className="form-input"
                    value={formData.role}
                    onChange={(event) => setFormData({
                      ...formData,
                      role: event.target.value,
                      yearOfStudy: event.target.value === 'Student' ? formData.yearOfStudy : '',
                    })}
                    required
                  >
                    <option value="" disabled>Select a role</option>
                    <option value="Student">Student</option>
                    <option value="Faculty & Staff">Faculty &amp; Staff</option>
                  </select>
                </div>
                {formData.role === 'Student' && (
                  <div className="form-group">
                    <label htmlFor="member-year" className="form-label">Year of Study</label>
                    <input
                      id="member-year"
                      type="number"
                      className="form-input"
                      min="1"
                      max="8"
                      step="1"
                      value={formData.yearOfStudy}
                      onChange={(event) => setFormData({ ...formData, yearOfStudy: event.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="member-department" className="form-label">Department</label>
                  <input
                    id="member-department"
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(event) => setFormData({ ...formData, department: event.target.value })}
                    maxLength={150}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="member-books-issued">Books Issued</label>
                  <input
                    id="member-books-issued"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    value={formData.booksIssued}
                    onChange={(event) => setFormData({ ...formData, booksIssued: event.target.value })}
                    required
                  />
                  <span className="form-field-hint">Enter the current number. New issues and returns will adjust this count.</span>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setFormMode(null)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? 'Saving...' : formMode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
