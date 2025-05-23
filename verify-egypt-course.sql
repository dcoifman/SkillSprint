-- Check if the Egypt course exists in learning paths
SELECT 
  id,
  title,
  description,
  category,
  level,
  image,
  estimated_time,
  rating,
  review_count,
  students_count,
  tags,
  objectives,
  prerequisites,
  instructor_id
FROM 
  learning_paths
WHERE 
  title LIKE '%Egypt%' OR
  title LIKE '%Pharaoh%' OR
  description LIKE '%Egypt%';

-- Check modules for the Egypt course
SELECT 
  m.id,
  m.title,
  m.description,
  m.order_index,
  lp.title as path_title
FROM 
  modules m
  JOIN learning_paths lp ON m.path_id = lp.id
WHERE 
  lp.title LIKE '%Egypt%' OR
  lp.title LIKE '%Pharaoh%';

-- Check sprints for the Egypt course modules
SELECT 
  s.id,
  s.title,
  s.description,
  s.time,
  s.order_index,
  m.title as module_title,
  lp.title as path_title
FROM 
  sprints s
  JOIN modules m ON s.module_id = m.id
  JOIN learning_paths lp ON m.path_id = lp.id
WHERE 
  lp.title LIKE '%Egypt%' OR
  lp.title LIKE '%Pharaoh%'; 