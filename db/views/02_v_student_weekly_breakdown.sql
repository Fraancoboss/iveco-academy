CREATE OR ALTER VIEW v_student_weekly_breakdown AS
SELECT
  e.id AS enrollment_id,
  e.userId AS user_id,
  e.editionId AS edition_id,
  w.weekNumber AS week_number,
  w.weekType AS week_type,
  ev.evalType AS eval_type,
  ev.punctuality,
  ev.attention,
  ev.participation,
  ev.documentation,
  ev.dexterity,
  ev.problemSolving AS problem_solving,
  ev.workshopGrade AS workshop_grade,
  (
    ISNULL(ev.punctuality, 0) +
    ISNULL(ev.attention, 0) +
    ISNULL(ev.participation, 0) +
    ISNULL(ev.documentation, 0) +
    ISNULL(ev.dexterity, 0) +
    ISNULL(ev.problemSolving, 0) +
    ISNULL(ev.workshopGrade, 0)
  ) / NULLIF(
    CASE WHEN ev.punctuality IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.attention IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.participation IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.documentation IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.dexterity IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.problemSolving IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ev.workshopGrade IS NOT NULL THEN 1 ELSE 0 END,
    0
  ) AS week_avg,
  course_week.course_week_avg
FROM enrollments e
INNER JOIN evaluations ev ON ev.enrollmentId = e.id
INNER JOIN weeks w ON w.id = ev.weekId
CROSS APPLY (
  SELECT AVG(
    (
      ISNULL(ev2.punctuality, 0) +
      ISNULL(ev2.attention, 0) +
      ISNULL(ev2.participation, 0) +
      ISNULL(ev2.documentation, 0) +
      ISNULL(ev2.dexterity, 0) +
      ISNULL(ev2.problemSolving, 0) +
      ISNULL(ev2.workshopGrade, 0)
    ) / NULLIF(
      CASE WHEN ev2.punctuality IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.attention IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.participation IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.documentation IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.dexterity IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.problemSolving IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN ev2.workshopGrade IS NOT NULL THEN 1 ELSE 0 END,
      0
    )
  ) AS course_week_avg
  FROM evaluations ev2
  WHERE ev2.weekId = ev.weekId
) course_week;
