CREATE OR ALTER VIEW v_edition_kpis AS
SELECT
  ed.id AS edition_id,
  ed.name AS edition_name,
  c.name AS course_name,
  ed.capacity,
  ed.startDate AS start_date,
  ed.endDate AS end_date,
  (SELECT COUNT(*) FROM enrollments en WHERE en.editionId = ed.id) AS enrolled_count,
  (SELECT COUNT(*) FROM applications ap WHERE ap.editionId = ed.id AND ap.status = 'APPROVED') AS approved_count,
  (SELECT COUNT(*) FROM applications ap WHERE ap.editionId = ed.id AND ap.status = 'RECEIVED') AS pending_count,
  (SELECT AVG(soa.overall_avg) FROM v_student_overall_avg soa WHERE soa.edition_id = ed.id AND soa.evaluation_count > 0) AS avg_score,
  (SELECT COUNT(*) FROM v_students_at_risk sar WHERE sar.edition_id = ed.id) AS at_risk_count,
  (SELECT AVG(ap.attendance_pct) FROM v_attendance_pct ap WHERE ap.edition_id = ed.id) AS avg_attendance_pct,
  (SELECT COUNT(*) FROM weeks w WHERE w.editionId = ed.id) AS total_weeks,
  (SELECT COUNT(DISTINCT ev.weekId) FROM evaluations ev
   INNER JOIN enrollments en ON en.id = ev.enrollmentId
   WHERE en.editionId = ed.id) AS weeks_with_evaluations
FROM editions ed
INNER JOIN courses c ON c.id = ed.courseId;
