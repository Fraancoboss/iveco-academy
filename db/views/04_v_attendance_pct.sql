CREATE OR ALTER VIEW v_attendance_pct AS
SELECT
  a.enrollmentId AS enrollment_id,
  e.userId AS user_id,
  e.editionId AS edition_id,
  u.name AS student_name,
  COUNT(*) AS total_weeks,
  SUM(CASE WHEN a.present = 1 THEN 1 ELSE 0 END) AS weeks_present,
  CAST(
    SUM(CASE WHEN a.present = 1 THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(*), 0) * 100
    AS DECIMAL(5, 2)
  ) AS attendance_pct
FROM attendances a
INNER JOIN enrollments e ON e.id = a.enrollmentId
INNER JOIN users u ON u.id = e.userId
GROUP BY a.enrollmentId, e.userId, e.editionId, u.name;
