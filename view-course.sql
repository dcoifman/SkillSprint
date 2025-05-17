-- View basic course info
SELECT 
  id, 
  status, 
  course_data->'course'->>'title' as title,
  course_data->'course'->>'description' as description,
  jsonb_array_length(course_data->'course'->'modules') as module_count,
  course_data->'course'->'learningObjectives' as learning_objectives
FROM 
  course_generation_requests 
WHERE 
  id = '24bd4369-7e7a-41c8-af5c-1b4c2f50c5bf';

-- View modules and sprints structure
SELECT 
  course_data->'course'->'modules' as modules
FROM 
  course_generation_requests 
WHERE 
  id = '24bd4369-7e7a-41c8-af5c-1b4c2f50c5bf';

-- View content of the first sprint (if available)
SELECT 
  content
FROM 
  sprint_contents 
WHERE 
  request_id = '24bd4369-7e7a-41c8-af5c-1b4c2f50c5bf'
  AND module_index = 0 
  AND sprint_index = 0;
