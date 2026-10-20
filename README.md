# BookNest

A Library Management System built with:

- React
- Java Spring Boot
- JDBC
- MySQL

## Features

- Book management
- Member management
- Book issue and return persisted in MySQL via the `issue_records` table; member loan counts are editable and increment/decrement with issue and return actions

### Database migration

Apply `backend/migrations/2026-10-20-enable-editable-books-issued.sql` to the configured MySQL database before starting the updated backend. It adds the editable member count and initializes existing rows from active issue records.

## Planned features

- Fine calculation
- Library reports