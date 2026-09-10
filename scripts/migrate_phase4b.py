import sqlite3
import sys
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'iot-backend', 'database.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Audit Duplicates
    print("Auditing enrollments for (student_id, lab_id) duplicates...")
    c.execute("SELECT student_id, lab_id, COUNT(*) FROM enrollments GROUP BY student_id, lab_id HAVING COUNT(*) > 1")
    dupes = c.fetchall()
    if dupes:
        print("ERROR: Duplicate enrollments found:", dupes)
        print("ABORTING MIGRATION.")
        sys.exit(1)

    print("Auditing faculty_assignments for (faculty_id, lab_id) duplicates...")
    c.execute("SELECT faculty_id, lab_id, COUNT(*) FROM faculty_assignments GROUP BY faculty_id, lab_id HAVING COUNT(*) > 1")
    f_dupes = c.fetchall()
    if f_dupes:
        print("ERROR: Duplicate faculty assignments found:", f_dupes)
        print("ABORTING MIGRATION.")
        sys.exit(1)

    # 2. Add Unique Constraints (SQLite requires creating a new index since ALTER TABLE ADD CONSTRAINT is not supported, 
    # but UNIQUE INDEX works exactly the same and is much safer than table reconstruction)
    
    print("Creating UNIQUE INDEX on enrollments(student_id, lab_id)...")
    c.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_unique ON enrollments(student_id, lab_id);")

    print("Creating UNIQUE INDEX on faculty_assignments(faculty_id, lab_id)...")
    c.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_assignment_unique ON faculty_assignments(faculty_id, lab_id);")

    conn.commit()
    conn.close()
    print("MIGRATION COMPLETE.")

if __name__ == "__main__":
    migrate()
