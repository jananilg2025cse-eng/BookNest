ALTER TABLE members
    ADD COLUMN books_issued INT NOT NULL DEFAULT 0;

UPDATE members m
SET m.books_issued = (
    SELECT COUNT(*)
    FROM issue_records ir
    WHERE ir.member_id = m.member_id AND ir.return_date IS NULL
);
