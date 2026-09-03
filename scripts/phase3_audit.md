# Phase 3 Audit: Institutional Analytics

## Data Sources Evaluated
- `users`: Includes `role` (student, faculty, admin).
- `departments`, `semesters`, `courses`, `labs`, `experiments`: The core institutional hierarchy.
- `enrollments`: Maps students to courses/labs and assigned faculty.
- `faculty_assignments`: Maps faculty to courses/labs.
- `lab_submissions`: Core interaction record. Includes `user_id`, `experiment_id`, `status` (pending, verified, failed), `numeric_grade`, `submitted_at`, `verified_by`.

## Metrics Analysis

| METRIC | DATA SOURCE | CURRENTLY CALCULABLE? | REQUIRED NEW DATA? | ROLE | PRIORITY |
|---|---|---|---|---|---|
| Total Students | `users` | YES | None | ADMIN | High |
| Total Faculty | `users` | YES | None | ADMIN | High |
| Total Labs / Courses / Experiments | `labs`, `courses`, `experiments` | YES | None | ADMIN | High |
| Total Submissions | `lab_submissions` | YES | None | ALL | High |
| Pending / Verified / Failed Submissions | `lab_submissions.status` | YES | None | ALL | High |
| Average Grade | `lab_submissions.numeric_grade` | YES (avg non-null) | None | ALL | High |
| Grade Distribution | `lab_submissions.numeric_grade` (grouped) | YES | None | ALL | Medium |
| Completion Rate | `lab_submissions` / `enrollments` / `experiments` | YES (Verified submissions / Total expected submissions) | None | ALL | High |
| Submissions Over Time | `lab_submissions.submitted_at` | YES (grouped by date) | None | ADMIN/FACULTY | Medium |
| Active Students | `lab_submissions` / `attendance_logs` | YES (Students with recent submissions or attendance) | None | ADMIN | Low |
| Course/Lab Performance | `lab_submissions` JOIN `experiments` JOIN `labs` | YES | None | ADMIN/FACULTY | Medium |

## Intentional Exclusions (No Fake Data)
- **Time Spent / Avg Completion Time**: Cannot be honestly calculated. `lab_submissions` only records submission time, not start time. (We will remove this from the frontend).
- **Engagement Score**: A fabricated metric in the frontend. We will remove it.

## API & Architecture Strategy
- A dedicated `iot-backend/routes/analytics.py` will be created with `GET /analytics/admin`, `GET /analytics/faculty`, `GET /analytics/student`.
- The frontend will utilize `Recharts` for Grade Distribution and Submissions Over Time (only if data exists).
- Frontend components will have `isLoading`, error boundaries, and empty states.
