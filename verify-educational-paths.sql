-- Verify instructor creation
SELECT id, name, title FROM public.instructors WHERE id = 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb';

-- Verify learning paths creation
SELECT id, title, category, level FROM public.learning_paths;

-- Count modules for each path
SELECT 
    p.title AS path_title,
    COUNT(m.id) AS module_count
FROM 
    public.learning_paths p
    LEFT JOIN public.modules m ON p.id = m.path_id
GROUP BY
    p.id, p.title
ORDER BY
    p.title;

-- Count sprints for each module
SELECT 
    p.title AS path_title,
    m.title AS module_title,
    COUNT(s.id) AS sprint_count
FROM 
    public.learning_paths p
    LEFT JOIN public.modules m ON p.id = m.path_id
    LEFT JOIN public.sprints s ON m.id = s.module_id
GROUP BY
    p.id, p.title, m.id, m.title
ORDER BY
    p.title, m.order_index;

-- Show example sprint content
SELECT 
    p.title AS path_title,
    m.title AS module_title,
    s.title AS sprint_title,
    LEFT(s.content, 100) AS content_preview
FROM 
    public.learning_paths p
    JOIN public.modules m ON p.id = m.path_id
    JOIN public.sprints s ON m.id = s.module_id
ORDER BY
    p.title, m.order_index, s.order_index
LIMIT 5; 