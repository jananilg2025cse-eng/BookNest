package com.booknest.backend.service;

import com.booknest.backend.exception.BookValidationException;
import com.booknest.backend.exception.DuplicateBookException;
import com.booknest.backend.model.Book;
import com.booknest.backend.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    private BookService bookService;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository);
    }

    @Test
    @DisplayName("Should successfully add a valid book")
    void testAddBook_Success() {
        Book book = new Book(1, "Clean Code", "Robert C. Martin", 5, 5);
        when(bookRepository.existsById(1)).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenReturn(1);

        Book savedBook = bookService.addBook(book);

        assertNotNull(savedBook);
        assertEquals(1, savedBook.getId());
        assertEquals("Clean Code", savedBook.getTitle());
        assertEquals("Robert C. Martin", savedBook.getAuthor());
        assertEquals(5, savedBook.getTotalCopies());
        assertEquals(5, savedBook.getAvailableCopies());
        verify(bookRepository, times(1)).save(book);
    }

    @Test
    @DisplayName("Should default availableCopies to totalCopies when availableCopies is null")
    void testAddBook_DefaultAvailableCopies() {
        Book book = new Book(2, "Refactoring", "Martin Fowler", 4, null);
        when(bookRepository.existsById(2)).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenReturn(1);

        Book savedBook = bookService.addBook(book);

        assertEquals(4, savedBook.getAvailableCopies());
        verify(bookRepository, times(1)).save(book);
    }

    @Test
    @DisplayName("Should throw DuplicateBookException when ID already exists")
    void testAddBook_DuplicateId() {
        Book book = new Book(1, "Clean Code", "Robert C. Martin", 5, 5);
        when(bookRepository.existsById(1)).thenReturn(true);

        DuplicateBookException exception = assertThrows(
                DuplicateBookException.class,
                () -> bookService.addBook(book)
        );

        assertTrue(exception.getMessage().contains("A book with ID 1 already exists"));
        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BookValidationException when ID is null or non-positive")
    void testAddBook_InvalidId() {
        Book nullIdBook = new Book(null, "Title", "Author", 5, 5);
        assertThrows(BookValidationException.class, () -> bookService.addBook(nullIdBook));

        Book zeroIdBook = new Book(0, "Title", "Author", 5, 5);
        assertThrows(BookValidationException.class, () -> bookService.addBook(zeroIdBook));

        Book negativeIdBook = new Book(-1, "Title", "Author", 5, 5);
        assertThrows(BookValidationException.class, () -> bookService.addBook(negativeIdBook));

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BookValidationException when title is null or blank")
    void testAddBook_BlankTitle() {
        Book nullTitleBook = new Book(1, null, "Author", 5, 5);
        when(bookRepository.existsById(1)).thenReturn(false);
        assertThrows(BookValidationException.class, () -> bookService.addBook(nullTitleBook));

        Book blankTitleBook = new Book(1, "   ", "Author", 5, 5);
        assertThrows(BookValidationException.class, () -> bookService.addBook(blankTitleBook));

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BookValidationException when author is null or blank")
    void testAddBook_BlankAuthor() {
        Book nullAuthorBook = new Book(1, "Title", null, 5, 5);
        when(bookRepository.existsById(1)).thenReturn(false);
        assertThrows(BookValidationException.class, () -> bookService.addBook(nullAuthorBook));

        Book blankAuthorBook = new Book(1, "Title", "   ", 5, 5);
        assertThrows(BookValidationException.class, () -> bookService.addBook(blankAuthorBook));

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BookValidationException when totalCopies is non-positive or null")
    void testAddBook_NonPositiveTotalCopies() {
        Book nullCopies = new Book(1, "Title", "Author", null, null);
        when(bookRepository.existsById(1)).thenReturn(false);
        assertThrows(BookValidationException.class, () -> bookService.addBook(nullCopies));

        Book zeroCopies = new Book(1, "Title", "Author", 0, null);
        assertThrows(BookValidationException.class, () -> bookService.addBook(zeroCopies));

        Book negativeCopies = new Book(1, "Title", "Author", -3, null);
        assertThrows(BookValidationException.class, () -> bookService.addBook(negativeCopies));

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BookValidationException when availableCopies is non-positive or exceeds totalCopies")
    void testAddBook_InvalidAvailableCopies() {
        Book zeroAvailable = new Book(1, "Title", "Author", 5, 0);
        when(bookRepository.existsById(1)).thenReturn(false);
        assertThrows(BookValidationException.class, () -> bookService.addBook(zeroAvailable));

        Book negativeAvailable = new Book(1, "Title", "Author", 5, -2);
        assertThrows(BookValidationException.class, () -> bookService.addBook(negativeAvailable));

        Book exceedsTotal = new Book(1, "Title", "Author", 5, 6);
        assertThrows(BookValidationException.class, () -> bookService.addBook(exceedsTotal));

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return all books from repository")
    void testGetAllBooks() {
        List<Book> mockBooks = List.of(
                new Book(1, "Book One", "Author A", 5, 5),
                new Book(2, "Book Two", "Author B", 3, 2)
        );
        when(bookRepository.findAll()).thenReturn(mockBooks);

        List<Book> result = bookService.getAllBooks();

        assertEquals(2, result.size());
        assertEquals("Book One", result.get(0).getTitle());
        verify(bookRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return book by id from repository")
    void testGetBookById() {
        Book mockBook = new Book(1, "Book One", "Author A", 5, 5);
        when(bookRepository.findById(1)).thenReturn(Optional.of(mockBook));

        Optional<Book> result = bookService.getBookById(1);

        assertTrue(result.isPresent());
        assertEquals("Book One", result.get().getTitle());
        verify(bookRepository, times(1)).findById(1);
    }
}
