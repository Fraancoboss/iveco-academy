-- v_student_module_progress
-- Per-student, per-module progress: evaluated weeks vs total weeks
CREATE OR ALTER VIEW v_student_module_progress AS
SELECT
    en.userId       AS user_id,
    en.editionId    AS edition_id,
    m.id            AS module_id,
    m.name          AS module_name,
    m.[order]       AS module_order,
    COUNT(w.id)     AS total_weeks,
    SUM(CASE WHEN ev.id IS NOT NULL THEN 1 ELSE 0 END) AS evaluated_weeks,
    CASE
        WHEN COUNT(w.id) = 0 THEN 0
        ELSE CAST(SUM(CASE WHEN ev.id IS NOT NULL THEN 1 ELSE 0 END) AS FLOAT)
             / COUNT(w.id) * 100
    END AS progress_pct
FROM enrollments en
INNER JOIN weeks w ON w.editionId = en.editionId AND w.moduleId IS NOT NULL
INNER JOIN modules m ON m.id = w.moduleId
LEFT JOIN evaluations ev ON ev.enrollmentId = en.id AND ev.weekId = w.id
GROUP BY en.userId, en.editionId, m.id, m.name, m.[order];
