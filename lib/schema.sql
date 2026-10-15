-- ============================================================
-- Student360 – DDL, DML, Views, PL/pgSQL Procedures
-- Normalised to 3NF.  Run once via /api/seed.
-- ============================================================

-- ── 1. DDL ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(10)  NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  dept_id       INT         NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  code          VARCHAR(20)  NOT NULL UNIQUE,
  credits       SMALLINT     NOT NULL CHECK (credits BETWEEN 1 AND 6),
  semester      SMALLINT     NOT NULL CHECK (semester BETWEEN 1 AND 8)
);

CREATE TABLE IF NOT EXISTS students (
  id          SERIAL PRIMARY KEY,
  roll_no     VARCHAR(20)  NOT NULL UNIQUE,
  first_name  VARCHAR(60)  NOT NULL,
  last_name   VARCHAR(60)  NOT NULL,
  email       VARCHAR(120) NOT NULL UNIQUE,
  dob         DATE,
  dept_id     INT          NOT NULL REFERENCES departments(id),
  semester    SMALLINT     NOT NULL DEFAULT 1,
  enrolled_at DATE         NOT NULL DEFAULT CURRENT_DATE,
  status      VARCHAR(20)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','inactive','graduated'))
);

CREATE TABLE IF NOT EXISTS grades (
  id          SERIAL PRIMARY KEY,
  student_id  INT          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id   INT          NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  marks       NUMERIC(5,2) NOT NULL CHECK (marks BETWEEN 0 AND 100),
  grade       CHAR(2)      GENERATED ALWAYS AS (
                CASE
                  WHEN marks >= 90 THEN 'A+'
                  WHEN marks >= 80 THEN 'A'
                  WHEN marks >= 70 THEN 'B+'
                  WHEN marks >= 60 THEN 'B'
                  WHEN marks >= 50 THEN 'C'
                  ELSE 'F'
                END
              ) STORED,
  exam_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (student_id, course_id)
);

-- ── 2. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_dept   ON students(dept_id);
CREATE INDEX IF NOT EXISTS idx_grades_student  ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course   ON grades(course_id);

-- ── 3. Views ──────────────────────────────────────────────
CREATE OR REPLACE VIEW v_student_academic AS
SELECT
  s.id            AS student_id,
  s.roll_no,
  s.first_name || ' ' || s.last_name AS full_name,
  s.email,
  s.semester,
  s.status,
  d.name          AS department,
  d.code          AS dept_code,
  COUNT(g.id)     AS courses_attempted,
  ROUND(AVG(g.marks)::NUMERIC, 2) AS cgpa,
  SUM(CASE WHEN g.grade = 'F' THEN 1 ELSE 0 END) AS backlogs
FROM students s
JOIN departments d ON d.id = s.dept_id
LEFT JOIN grades  g ON g.student_id = s.id
GROUP BY s.id, d.id;

CREATE OR REPLACE VIEW v_course_stats AS
SELECT
  c.id,
  c.code,
  c.name,
  c.credits,
  c.semester,
  d.name        AS department,
  COUNT(g.id)   AS enrolled,
  ROUND(AVG(g.marks)::NUMERIC,2) AS avg_marks,
  MAX(g.marks)  AS highest,
  MIN(g.marks)  AS lowest
FROM courses  c
JOIN departments d ON d.id = c.dept_id
LEFT JOIN grades  g ON g.course_id = c.id
GROUP BY c.id, d.id;

-- ── 4. PL/pgSQL Procedure – enrol student in course ───────
CREATE OR REPLACE PROCEDURE sp_enrol_student(
  p_student_id INT,
  p_course_id  INT,
  p_marks      NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students WHERE id = p_student_id) THEN
    RAISE EXCEPTION 'Student % not found', p_student_id;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM courses WHERE id = p_course_id) THEN
    RAISE EXCEPTION 'Course % not found', p_course_id;
  END IF;

  INSERT INTO grades (student_id, course_id, marks)
  VALUES (p_student_id, p_course_id, p_marks)
  ON CONFLICT (student_id, course_id)
  DO UPDATE SET marks = EXCLUDED.marks, exam_date = CURRENT_DATE;
END;
$$;

-- ── 5. PL/pgSQL Function – promote semester ───────────────
CREATE OR REPLACE FUNCTION fn_promote_student(p_student_id INT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_sem   SMALLINT;
  v_backs INT;
BEGIN
  SELECT semester, COUNT(CASE WHEN grade = 'F' THEN 1 END)
  INTO   v_sem, v_backs
  FROM   students s
  LEFT JOIN grades g ON g.student_id = s.id
  WHERE  s.id = p_student_id
  GROUP BY s.semester;

  IF v_backs > 0 THEN
    RETURN 'Cannot promote – ' || v_backs || ' backlog(s) pending';
  END IF;
  IF v_sem >= 8 THEN
    UPDATE students SET status = 'graduated' WHERE id = p_student_id;
    RETURN 'Graduated';
  END IF;
  UPDATE students SET semester = semester + 1 WHERE id = p_student_id;
  RETURN 'Promoted to semester ' || (v_sem + 1);
END;
$$;

-- ── 6. DML – seed data ────────────────────────────────────
INSERT INTO departments (name, code) VALUES
  ('Computer Science',     'CS'),
  ('Electronics',          'EC'),
  ('Mechanical',           'ME'),
  ('Civil',                'CE')
ON CONFLICT DO NOTHING;

INSERT INTO courses (dept_id, name, code, credits, semester)
SELECT id, 'Data Structures',           'CS101', 4, 1 FROM departments WHERE code='CS'
ON CONFLICT DO NOTHING;
INSERT INTO courses (dept_id, name, code, credits, semester)
SELECT id, 'Database Management',       'CS201', 4, 2 FROM departments WHERE code='CS'
ON CONFLICT DO NOTHING;
INSERT INTO courses (dept_id, name, code, credits, semester)
SELECT id, 'Operating Systems',         'CS301', 3, 3 FROM departments WHERE code='CS'
ON CONFLICT DO NOTHING;
INSERT INTO courses (dept_id, name, code, credits, semester)
SELECT id, 'Circuit Theory',            'EC101', 4, 1 FROM departments WHERE code='EC'
ON CONFLICT DO NOTHING;
INSERT INTO courses (dept_id, name, code, credits, semester)
SELECT id, 'Thermodynamics',            'ME101', 4, 1 FROM departments WHERE code='ME'
ON CONFLICT DO NOTHING;

INSERT INTO students (roll_no, first_name, last_name, email, dob, dept_id, semester) VALUES
  ('CS2401','Aarav',   'Sharma',   'aarav.sharma@s360.edu',  '2005-03-12',
   (SELECT id FROM departments WHERE code='CS'), 2),
  ('CS2402','Diya',    'Patel',    'diya.patel@s360.edu',    '2005-07-22',
   (SELECT id FROM departments WHERE code='CS'), 2),
  ('EC2401','Rohan',   'Verma',    'rohan.verma@s360.edu',   '2004-11-01',
   (SELECT id FROM departments WHERE code='EC'), 2),
  ('ME2401','Priya',   'Nair',     'priya.nair@s360.edu',    '2005-01-15',
   (SELECT id FROM departments WHERE code='ME'), 1),
  ('CS2403','Kabir',   'Singh',    'kabir.singh@s360.edu',   '2004-09-30',
   (SELECT id FROM departments WHERE code='CS'), 3)
ON CONFLICT DO NOTHING;

INSERT INTO grades (student_id, course_id, marks) VALUES
  ((SELECT id FROM students WHERE roll_no='CS2401'),
   (SELECT id FROM courses  WHERE code='CS101'), 88.5),
  ((SELECT id FROM students WHERE roll_no='CS2401'),
   (SELECT id FROM courses  WHERE code='CS201'), 76.0),
  ((SELECT id FROM students WHERE roll_no='CS2402'),
   (SELECT id FROM courses  WHERE code='CS101'), 92.0),
  ((SELECT id FROM students WHERE roll_no='CS2402'),
   (SELECT id FROM courses  WHERE code='CS201'), 55.0),
  ((SELECT id FROM students WHERE roll_no='EC2401'),
   (SELECT id FROM courses  WHERE code='EC101'), 81.0),
  ((SELECT id FROM students WHERE roll_no='ME2401'),
   (SELECT id FROM courses  WHERE code='ME101'), 67.5),
  ((SELECT id FROM students WHERE roll_no='CS2403'),
   (SELECT id FROM courses  WHERE code='CS101'), 45.0),
  ((SELECT id FROM students WHERE roll_no='CS2403'),
   (SELECT id FROM courses  WHERE code='CS301'), 72.0)
ON CONFLICT DO NOTHING;
