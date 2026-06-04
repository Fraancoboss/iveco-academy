CREATE OR ALTER VIEW v_student_overall_avg AS
SELECT
  e.id AS enrollment_id,
  e.userId AS user_id,
  e.editionId AS edition_id,
  u.name AS student_name,
  u.email AS student_email,
  AVG(ev.punctuality)    AS avg_punctuality,
  AVG(ev.attention)      AS avg_attention,
  AVG(ev.participation)  AS avg_participation,
  AVG(ev.documentation)  AS avg_documentation,
  AVG(ev.dexterity)      AS avg_dexterity,
  AVG(ev.problemSolving) AS avg_problem_solving,
  AVG(ev.workshopGrade)  AS avg_workshop_grade,
  (
    ISNULL(AVG(ev.punctuality), 0) +
    ISNULL(AVG(ev.attention), 0) +
    ISNULL(AVG(ev.participation), 0) +
    ISNULL(AVG(ev.documentation), 0) +
    ISNULL(AVG(ev.dexterity), 0) +
    ISNULL(AVG(ev.problemSolving), 0) +
    ISNULL(AVG(ev.workshopGrade), 0)
  ) / NULLIF(
    CASE WHEN AVG(ev.punctuality) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.attention) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.participation) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.documentation) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.dexterity) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.problemSolving) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN AVG(ev.workshopGrade) IS NOT NULL THEN 1 ELSE 0 END,
    0
  ) AS overall_avg,
  COUNT(ev.id) AS evaluation_count
FROM enrollments e
INNER JOIN users u ON u.id = e.userId
LEFT JOIN evaluations ev ON ev.enrollmentId = e.id
GROUP BY e.id, e.userId, e.editionId, u.name, u.email;
