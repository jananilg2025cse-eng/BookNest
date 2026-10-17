import React, { useState } from 'react';
import { PlusIcon, BookmarkIcon } from '../components/Icons';

export default function BooksView({ books, onAddBook, onInspectBook, searchQuery }) {
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', 'Computer Science', 'Information Technology', 'AI & Data Science', 'Mechanical', 'Electrical'];

  const filteredBooks = books.filter((book) => {
    const matchesDept = selectedDept === 'All' || book.department.toLowerCase().includes(selectedDept.toLowerCase());
    if (!matchesDept) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="tab-view-container">
      {/* Top Controls: Category filters + Add book button */}
      <div className="view-header-bar">
        <div className="dept-filter-scroll">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              className={`filter-btn ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onAddBook}
        >
          <PlusIcon size={16} />
          <span>Add New Book (Demo)</span>
        </button>
      </div>

      {/* Book Catalog Table Card */}
      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-heading">Catalogue Stack Inventory</h2>
            <span className="card-subheading">
              Showing {filteredBooks.length} book titles in library holdings
            </span>
          </div>
          <span className="stock-pill stock-ok">Holdings: 14,820 Total Copies</span>
        </div>

        <div className="activity-table-wrapper">
          <table className="library-table">
            <thead>
              <tr>
                <th scope="col">Book Title & Details</th>
                <th scope="col">Department</th>
                <th scope="col">Shelf Location</th>
                <th scope="col">Available Copies</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const isOutOfStock = book.availableCopies === 0;
                const isLow = book.availableCopies <= 2 && !isOutOfStock;

                return (
                  <tr key={book.id}>
                    <td>
                      <div className="book-cell">
                        <span className="book-title-main">{book.title}</span>
                        <span className="book-author-sub">{book.author} • {book.edition}</span>
                        <span className="book-isbn-sub mono">ISBN: {book.isbn}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">{book.department}</span>
                    </td>
                    <td>
                      <span className="shelf-location-tag">📍 {book.rack}</span>
                    </td>
                    <td>
                      <span className="copies-count font-semibold">
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          isOutOfStock ? 'badge-red' : isLow ? 'badge-amber' : 'badge-green'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : isLow ? 'Limited Copies' : 'Available'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => onInspectBook(book)}
                        title="View details or loan out"
                      >
                        <BookmarkIcon size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card-footer-note">
          <span className="data-disclaimer-dot"></span>
          <span>Sample college catalog data. Full search index will connect to backend Spring Boot repository.</span>
        </div>
      </div>
    </div>
  );
}
