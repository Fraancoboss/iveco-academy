CREATE OR ALTER VIEW v_course_ranking AS
SELECT
  soa.enrollment_id,
  soa.user_id,
  soa.edition_id,
  soa.student_name,
  soa.overall_avg,
  soa.evaluation_count,
  RANK() OVER (PARTITION BY soa.edition_id ORDER BY soa.overall_avg DESC) AS ranking
FROM v_student_overall_avg soa
WHERE soa.evaluation_count > 0;
