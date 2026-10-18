-- Manual, additive migration. Existing member rows and names are preserved;
-- profile details remain NULL until entered by staff.
ALTER TABLE members
    ADD COLUMN email VARCHAR(254) NULL,
    ADD COLUMN role VARCHAR(32) NULL,
    ADD COLUMN year_of_study SMALLINT UNSIGNED NULL,
    ADD COLUMN department VARCHAR(150) NULL;