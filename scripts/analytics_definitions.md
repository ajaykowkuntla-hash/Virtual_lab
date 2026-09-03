# Institutional Analytics Definitions

| METRIC | DEFINITION | DATA SOURCE | SQL/LOGIC | ROLE |
|---|---|---|---|---|
| **Total Students** | Count of users with the 'student' role. | `users` table | `SELECT COUNT(id) FROM users WHERE role='student'` | ADMIN |
| **Total Faculty** | Count of users with the 'faculty' role. | `users` table | `SELECT COUNT(id) FROM users WHERE role='faculty'` | ADMIN |
| **Total Labs** | Count of all labs. | `labs` table | `SELECT COUNT(id) FROM labs` | ADMIN |
| **Total Experiments** | Count of all experiments. | `experiments` table | `SELECT COUNT(id) FROM experiments` | ADMIN |
| **Total Submissions** | Count of all lab submissions. | `lab_submissions` table | `SELECT COUNT(id) FROM lab_submissions` (Filtered by assigned scopes for Faculty/Student) | ADMIN, FACULTY, STUDENT |
| **Pending Submissions** | Submissions awaiting verification (status='pending'). | `lab_submissions` table | `SELECT COUNT(id) FROM lab_submissions WHERE status='pending'` | ADMIN, FACULTY |
| **Verified Submissions** | Submissions that have been graded/verified (status='verified'). | `lab_submissions` table | `SELECT COUNT(id) FROM lab_submissions WHERE status='verified'` | ADMIN, FACULTY, STUDENT |
| **Rejected Submissions** | Submissions that failed or were rejected (status='failed'). | `lab_submissions` table | `SELECT COUNT(id) FROM lab_submissions WHERE status='failed'` | ADMIN, FACULTY |
| **Average Grade** | The average numeric grade of verified submissions. | `lab_submissions` table | `SELECT AVG(numeric_grade) FROM lab_submissions WHERE numeric_grade IS NOT NULL` | ADMIN, FACULTY, STUDENT |
| **Grade Distribution** | Number of submissions in each grade bucket (0-50, 51-70, 71-90, 91-100). | `lab_submissions` table | `GROUP BY` grade ranges using `CASE WHEN` logic. | ADMIN, FACULTY, STUDENT |
| **Completion Rate** | Percentage of expected experiments that have a verified submission. | `lab_submissions`, `enrollments`, `experiments` | `(COUNT(DISTINCT user_id, experiment_id) of verified submissions) / (Total enrolled students * experiments per lab)` | ADMIN, FACULTY |
| **Student Completion %** | Percentage of available experiments a specific student has completed. | `lab_submissions`, `enrollments`, `experiments` | `(COUNT(verified submissions for student)) / (COUNT(available experiments for student's labs))` | STUDENT |
| **Submissions Over Time** | Count of submissions grouped by day. | `lab_submissions` table | `GROUP BY DATE(submitted_at)` | ADMIN, FACULTY |
| **Assigned Labs (Faculty)** | Number of labs assigned to a specific faculty member. | `faculty_assignments` | `SELECT COUNT(DISTINCT lab_id) FROM faculty_assignments WHERE faculty_id = ?` | FACULTY |
| **Enrolled Labs (Student)** | Number of labs a specific student is enrolled in. | `enrollments` | `SELECT COUNT(DISTINCT lab_id) FROM enrollments WHERE student_id = ?` | STUDENT |
