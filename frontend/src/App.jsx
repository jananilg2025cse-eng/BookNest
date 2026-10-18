import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DemoNoticeBanner from './components/DemoNoticeBanner';
import ActionModal from './components/ActionModal';
import Toast from './components/Toast';
import DashboardView from './views/DashboardView';
import BooksView from './views/BooksView';
import MembersView from './views/MembersView';
import CirculationView from './views/CirculationView';
import FinesView from './views/FinesView';

import {
  INITIAL_STATS,
  POPULAR_BOOKS,
  RECENT_ACTIVITIES,
  MOCK_MEMBERS,
  MOCK_CIRCULATION,
  MOCK_FINES,
} from './data/mockData';
import { fetchAllBooks, fetchBookById, createBook, updateBook, deleteBook } from './services/bookService';

import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Core application data
  const [stats, setStats] = useState(INITIAL_STATS);
  const [popularBooks] = useState(POPULAR_BOOKS);
  const [recentActivities, setRecentActivities] = useState(RECENT_ACTIVITIES);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState(null);
  const [members] = useState(MOCK_MEMBERS);
  const [circulation, setCirculation] = useState(MOCK_CIRCULATION);
  const [fines, setFines] = useState(MOCK_FINES);

  // Modal & Toast notification states
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch books from Spring Boot API and update total holding metrics
  const loadBooks = async () => {
    try {
      setLoadingBooks(true);
      setBooksError(null);
      const data = await fetchAllBooks();
      setBooks(data);

      const totalCopies = data.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
      setStats((prev) =>
        prev.map((s) =>
          s.id === 'total-books'
            ? {
                ...s,
                value: totalCopies.toLocaleString(),
                numericValue: totalCopies,
                subtext: `${data.length} unique titles registered in MySQL`,
              }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to load books from backend:', err);
      setBooksError(err.message || 'Cannot reach Spring Boot API.');
    } finally {
      setLoadingBooks(false);
    }
  };

  // Refresh books on mount and whenever user navigates to Books or Dashboard tab
  useEffect(() => {
    let ignore = false;

    async function fetchCatalogue() {
      try {
        const data = await fetchAllBooks();
        if (!ignore) {
          setBooks(data);
          const totalCopies = data.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
          setStats((prev) =>
            prev.map((s) =>
              s.id === 'total-books'
                ? {
                    ...s,
                    value: totalCopies.toLocaleString(),
                    numericValue: totalCopies,
                    subtext: `${data.length} unique titles registered in MySQL`,
                  }
                : s
            )
          );
          setBooksError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load books from backend:', err);
          setBooksError(err.message || 'Cannot reach Spring Boot API.');
        }
      } finally {
        if (!ignore) {
          setLoadingBooks(false);
        }
      }
    }

    fetchCatalogue();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  // Handler: Open Quick Issue Modal
  const handleOpenQuickIssue = (presetData = null) => {
    setModalType('quick-issue');
    setModalData(presetData);
  };

  // Handler: Open Add Book Modal
  const handleOpenAddBook = () => {
    setModalType('add-book');
    setModalData(null);
  };

  // Handler: Inspect Book (retrieves fresh book record from GET /api/books/{id})
  const handleInspectBook = async (book) => {
    try {
      const freshBook = await fetchBookById(book.id);
      setModalType('inspect-book');
      setModalData(freshBook);
    } catch {
      setModalType('inspect-book');
      setModalData(book);
    }
  };

  // Handler: Open Edit Book Modal (retrieves fresh book record from GET /api/books/{id})
  const handleOpenEditBook = async (book) => {
    try {
      const freshBook = await fetchBookById(book.id);
      setModalType('edit-book');
      setModalData(freshBook);
    } catch {
      setModalType('edit-book');
      setModalData(book);
    }
  };

  // Handler: Open Delete Book Modal
  const handleOpenDeleteBook = (book) => {
    setModalType('delete-book');
    setModalData(book);
  };

  // Handler: Open Collect Fine Modal
  const handleOpenCollectFine = (fine) => {
    setModalType('collect-fine');
    setModalData(fine);
  };

  // Handler: Submit Issue Book (in-memory demo)
  const handleSubmitIssue = (formData) => {
    const newTxnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newLoan = {
      id: newTxnId,
      bookTitle: formData.bookTitle,
      isbn: formData.isbn || '978-0262046305',
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      issuedDate: today,
      dueDate: dueDate,
      status: 'On Loan',
      daysOverdue: 0,
    };

    // Update circulation records
    setCirculation((prev) => [newLoan, ...prev]);

    // Add activity record
    const newActivity = {
      id: `act-${Date.now()}`,
      studentName: formData.studentName,
      memberId: formData.rollNumber,
      action: 'Issued Book',
      bookTitle: formData.bookTitle,
      isbn: formData.isbn || '978-0262046305',
      timestamp: 'Just now',
      type: 'issue',
      badgeText: 'Issued',
      dueDate: dueDate,
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    // Increment books issued stat count
    setStats((prev) =>
      prev.map((s) =>
        s.id === 'books-issued'
          ? {
              ...s,
              value: String(s.numericValue + 1),
              numericValue: s.numericValue + 1,
            }
          : s
      )
    );

    setModalType(null);
    setToast({
      title: 'Book Issued (Demo)',
      message: `"${formData.bookTitle}" checked out to ${formData.studentName}. Stored in local state.`,
      type: 'success',
    });
  };

  // Handler: Check-in / Return Book (in-memory demo)
  const handleReturnBook = (loan) => {
    // Remove from active loans
    setCirculation((prev) => prev.filter((item) => item.id !== loan.id));

    // Add return activity
    const newActivity = {
      id: `act-${Date.now()}`,
      studentName: loan.studentName,
      memberId: loan.rollNumber,
      action: 'Returned Book',
      bookTitle: loan.bookTitle,
      isbn: loan.isbn,
      timestamp: 'Just now',
      type: 'return',
      badgeText: 'Returned',
      dueDate: loan.dueDate,
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    // Decrement books issued stat
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'books-issued') {
          return {
            ...s,
            value: String(Math.max(0, s.numericValue - 1)),
            numericValue: Math.max(0, s.numericValue - 1),
          };
        }
        if (s.id === 'overdue-books' && loan.status === 'Overdue') {
          return {
            ...s,
            value: String(Math.max(0, s.numericValue - 1)),
            numericValue: Math.max(0, s.numericValue - 1),
          };
        }
        return s;
      })
    );

    // Increment available copy count in catalogue if found
    setBooks((prev) =>
      prev.map((b) =>
        b.title.toLowerCase() === loan.bookTitle.toLowerCase() || b.isbn === loan.isbn
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );

    setToast({
      title: 'Book Returned (Demo)',
      message: `Check-in recorded for "${loan.bookTitle}". Available inventory restocked.`,
      type: 'success',
    });
  };

  // Handler: Add Book (persists to MySQL via POST /api/books)
  const handleSubmitAddBook = async (bookForm) => {
    const savedBook = await createBook(bookForm);

    // Refresh books list from backend
    await loadBooks();

    setModalType(null);
    setToast({
      title: 'Book Added (MySQL)',
      message: `"${savedBook.title}" (ID #${savedBook.id}) saved to MySQL database.`,
      type: 'success',
    });
    return savedBook;
  };

  // Handler: Update Book (persists to MySQL via PUT /api/books/{id})
  const handleSubmitEditBook = async (bookId, bookForm) => {
    const updatedBook = await updateBook(bookId, bookForm);

    // Refresh books list from backend
    await loadBooks();

    setModalType(null);
    setToast({
      title: 'Book Updated (MySQL)',
      message: `"${updatedBook.title}" (ID #${updatedBook.id}) updated successfully in MySQL database.`,
      type: 'success',
    });
    return updatedBook;
  };

  // Handler: Delete Book (persists to MySQL via DELETE /api/books/{id})
  const handleSubmitDeleteBook = async (bookId) => {
    await deleteBook(bookId);

    // Refresh books list from backend
    await loadBooks();

    const bookTitle = modalData?.title ? `"${modalData.title}"` : `Book #${bookId}`;
    setModalType(null);
    setToast({
      title: 'Book Deleted (MySQL)',
      message: `${bookTitle} was removed from the MySQL catalogue.`,
      type: 'success',
    });
  };

  // Handler: Collect Fine (in-memory demo)
  const handleSubmitCollectFine = (fineId) => {
    const fineRecord = fines.find((f) => f.id === fineId);
    if (!fineRecord) return;

    setFines((prev) =>
      prev.map((f) => (f.id === fineId ? { ...f, status: 'Paid' } : f))
    );

    // Add activity
    const newActivity = {
      id: `act-${Date.now()}`,
      studentName: fineRecord.studentName,
      memberId: fineRecord.rollNumber,
      action: 'Fine Collected',
      bookTitle: fineRecord.bookTitle,
      isbn: 'N/A',
      timestamp: 'Just now',
      type: 'fine',
      badgeText: `Paid ₹${fineRecord.totalFine}`,
      dueDate: 'Cleared',
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    // Decrement overdue stat count
    setStats((prev) =>
      prev.map((s) =>
        s.id === 'overdue-books'
          ? {
              ...s,
              value: String(Math.max(0, s.numericValue - 1)),
              numericValue: Math.max(0, s.numericValue - 1),
            }
          : s
      )
    );

    setModalType(null);
    setToast({
      title: 'Fine Collected (Demo)',
      message: `₹${fineRecord.totalFine} collected from ${fineRecord.studentName} for overdue book.`,
      type: 'success',
    });
  };

  // Calculate overdue count for sidebar badge
  const overdueCount = fines.filter((f) => f.status === 'Pending').length;

  return (
    <div className="booknest-app-layout">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setMobileOpen={setMobileOpen}
          onOpenQuickIssue={() => handleOpenQuickIssue()}
          onOpenAddBook={handleOpenAddBook}
        />

        <main className="main-content" id="main-content-scroll">
          <DemoNoticeBanner />

          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentActivities={recentActivities}
              popularBooks={popularBooks}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onQuickIssue={() => handleOpenQuickIssue()}
              onAddBook={handleOpenAddBook}
              onQuickReturnDemo={handleReturnBook}
              onInspectBook={handleInspectBook}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'books' && (
            <BooksView
              books={books}
              loading={loadingBooks}
              error={booksError}
              onRefresh={loadBooks}
              onAddBook={handleOpenAddBook}
              onInspectBook={handleInspectBook}
              onEditBook={handleOpenEditBook}
              onDeleteBook={handleOpenDeleteBook}
              searchQuery={searchQuery}
              onAddBookSubmit={handleSubmitAddBook}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'circulation' && (
            <CirculationView
              circulation={circulation}
              onOpenQuickIssue={() => handleOpenQuickIssue()}
              onReturnBook={handleReturnBook}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'fines' && (
            <FinesView
              fines={fines}
              onOpenCollectFine={handleOpenCollectFine}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Modal Dialog */}
      <ActionModal
        modalType={modalType}
        modalData={modalData}
        onClose={() => setModalType(null)}
        onSubmitIssue={handleSubmitIssue}
        onSubmitAddBook={handleSubmitAddBook}
        onSubmitEditBook={handleSubmitEditBook}
        onSubmitDeleteBook={handleSubmitDeleteBook}
        onSubmitCollectFine={handleSubmitCollectFine}
        onSwitchToEdit={handleOpenEditBook}
        onSwitchToDelete={handleOpenDeleteBook}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
