CREATE OR ALTER VIEW v_students_at_risk AS
SELECT
  soa.enrollment_id,
  soa.user_id,
  soa.edition_id,
  soa.student_name,
  soa.student_email,
  soa.overall_avg,
  soa.evaluation_count,
  ap.attendance_pct
FROM v_student_overall_avg soa
LEFT JOIN v_attendance_pct ap ON ap.enrollment_id = soa.enrollment_id
WHERE soa.overall_avg < 5.0
  AND soa.evaluation_count > 0;
