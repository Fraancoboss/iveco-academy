CREATE OR ALTER VIEW v_pending_evaluations AS
SELECT
  w.id AS week_id,
  w.editionId AS edition_id,
  ed.name AS edition_name,
  w.weekNumber AS week_number,
  w.weekType AS week_type,
  w.endDate AS week_end_date,
  DATEDIFF(day, w.endDate, GETDATE()) AS days_overdue,
  e.id AS enrollment_id,
  e.userId AS user_id,
  u.name AS student_name
FROM weeks w
INNER JOIN editions ed ON ed.id = w.editionId
CROSS JOIN enrollments e
INNER JOIN users u ON u.id = e.userId
WHERE e.editionId = w.editionId
  AND DATEDIFF(day, w.endDate, GETDATE()) >= 5
  AND NOT EXISTS (
    SELECT 1 FROM evaluations ev
    WHERE ev.enrollmentId = e.id AND ev.weekId = w.id
  );
