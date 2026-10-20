import React, { useState, useEffect, useCallback } from 'react';
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
  MOCK_FINES,
} from './data/mockData';

import { fetchAllBooks, fetchBookById, createBook, updateBook, deleteBook } from './services/bookService';
import { fetchAllMembers } from './services/memberService';
import { createIssue, fetchActiveIssues, returnIssue } from './services/issueService';


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
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [circulation, setCirculation] = useState([]);
  const [circulationLoading, setCirculationLoading] = useState(true);
  const [circulationError, setCirculationError] = useState('');
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

  const requestMembers = useCallback(async () => {
    try {
      return { members: await fetchAllMembers() };
    } catch (error) {
      console.error('Failed to load members from backend:', error);
      return { error: error.message || 'Could not load members. Please check the backend.' };
    }
  }, []);

  const refreshMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError('');

    const result = await requestMembers();
    if (result.error) {
      setMembersError(result.error);
    } else {
      setMembers(result.members);
    }

    setMembersLoading(false);
    return !result.error;
  }, [requestMembers]);

  const requestCirculation = useCallback(async () => {
    try {
      return { issues: await fetchActiveIssues() };
    } catch (error) {
      console.error('Failed to load active issues from backend:', error);
      return { error: error.message || 'Could not load active issues. Please check the backend.' };
    }
  }, []);

  const refreshCirculation = useCallback(async () => {
    setCirculationLoading(true);
    setCirculationError('');
    const result = await requestCirculation();

    if (result.error) {
      setCirculationError(result.error);
    } else {
      setCirculation(result.issues);
      setStats((prev) =>
        prev.map((stat) => stat.id === 'books-issued'
          ? { ...stat, value: String(result.issues.length), numericValue: result.issues.length }
          : stat)
      );
    }

    setCirculationLoading(false);
    return !result.error;
  }, [requestCirculation]);

  useEffect(() => {
    let active = true;

    requestCirculation().then((result) => {
      if (!active) return;
      if (result.error) {
        setCirculationError(result.error);
      } else {
        setCirculation(result.issues);
        setStats((prev) =>
          prev.map((stat) => stat.id === 'books-issued'
            ? { ...stat, value: String(result.issues.length), numericValue: result.issues.length }
            : stat)
        );
      }
    }).finally(() => {
      if (active) setCirculationLoading(false);
    });

    return () => {
      active = false;
    };
  }, [requestCirculation]);

  useEffect(() => {
    let active = true;

    requestMembers().then((result) => {
      if (!active) return;
      if (result.error) {
        setMembersError(result.error);
      } else {
        setMembers(result.members);
      }
    }).finally(() => {
      if (active) setMembersLoading(false);
    });

    return () => {
      active = false;
    };
  }, [requestMembers]);


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
      return true;
    } catch (err) {
      console.error('Failed to load books from backend:', err);
      setBooksError(err.message || 'Cannot reach Spring Boot API.');
      return false;
    } finally {
      setLoadingBooks(false);
    }
  };

  // Load books on initial application mount
  useEffect(() => {
    let ignore = false;

    async function initialFetch() {
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

    initialFetch();

    return () => {
      ignore = true;
    };
  }, []);

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

  // Handler: Submit Issue Book (persists issue record and inventory in MySQL)
  const handleSubmitIssue = async (formData) => {
    await createIssue(formData);
    const [membersRefreshed, issuesRefreshed, booksRefreshed] = await Promise.all([
      refreshMembers(),
      refreshCirculation(),
      loadBooks(),
    ]);
    setModalType(null);
    setToast({
      title: 'Book Issued',
      message: membersRefreshed && issuesRefreshed && booksRefreshed
        ? 'Issue recorded and member loan count updated.'
        : 'Issue recorded. Some displayed data could not refresh; refresh the affected view.',
      type: membersRefreshed && issuesRefreshed && booksRefreshed ? 'success' : 'error',
    });
  };

  // Handler: Check-in / Return Book (persists return and inventory in MySQL)
  const handleReturnBook = async (loan) => {
    try {
      await returnIssue(loan.id);

      const newActivity = {
        id: `act-${Date.now()}`,
        studentName: loan.studentName,
        memberId: loan.rollNumber,
        action: 'Returned Book',
        bookTitle: loan.bookTitle,
        isbn: `Book ID ${loan.bookId}`,
        timestamp: 'Just now',
        type: 'return',
        badgeText: 'Returned',
        dueDate: loan.dueDate,
      };
      setRecentActivities((prev) => [newActivity, ...prev]);

      const [membersRefreshed, issuesRefreshed, booksRefreshed] = await Promise.all([
        refreshMembers(),
        refreshCirculation(),
        loadBooks(),
      ]);

      setToast({
        title: 'Book Returned',
        message: membersRefreshed && issuesRefreshed && booksRefreshed
          ? `Return recorded for "${loan.bookTitle}".`
          : 'Return recorded. Some displayed data could not refresh; refresh the affected view.',
        type: membersRefreshed && issuesRefreshed && booksRefreshed ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Failed to return book:', error);
      setToast({
        title: 'Could Not Return Book',
        message: error.message || 'The return could not be recorded.',
        type: 'error',
      });
    }
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
              loading={membersLoading}
              error={membersError}
              onRefresh={refreshMembers}
            />
          )}

          {activeTab === 'circulation' && (
            <CirculationView
              circulation={circulation}
              loading={circulationLoading}
              error={circulationError}
              onOpenQuickIssue={() => handleOpenQuickIssue()}
              onReturnBook={handleReturnBook}
              onRefresh={refreshCirculation}
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
        key={modalType}
        modalType={modalType}
        modalData={modalData}
        members={members}
        books={books}
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
