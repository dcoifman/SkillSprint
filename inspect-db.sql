-- Get all instructors with their associated user details
SELECT 
    i.id,
    i.name,
    i.title,
    i.bio,
    i.avatar,
    i.created_at,
    i.updated_at,
    au.email,
    au.raw_user_meta_data->>'full_name' as user_full_name
FROM public.instructors i
LEFT JOIN auth.users au ON i.user_id = au.id
ORDER BY i.created_at DESC;

-- Get all learning paths with instructor details
SELECT 
    lp.id,
    lp.title,
    lp.description,
    lp.category,
    lp.level,
    lp.image,
    lp.total_sprints,
    lp.estimated_time,
    lp.rating,
    lp.review_count,
    lp.students_count,
    lp.tags,
    lp.objectives,
    lp.prerequisites,
    i.name as instructor_name,
    i.title as instructor_title
FROM public.learning_paths lp
LEFT JOIN public.instructors i ON lp.instructor_id = i.id
ORDER BY lp.created_at DESC;

-- Get all modules with their learning path titles
SELECT 
    m.*,
    lp.title as path_title
FROM public.modules m
LEFT JOIN public.learning_paths lp ON m.path_id = lp.id
ORDER BY lp.title, m.order_index;

-- Get all sprints with their module and path details
SELECT 
    s.*,
    m.title as module_title,
    lp.title as path_title
FROM public.sprints s
LEFT JOIN public.modules m ON s.module_id = m.id
LEFT JOIN public.learning_paths lp ON m.path_id = lp.id
ORDER BY lp.title, m.order_index, s.order_index;

-- Get user enrollments with path details
SELECT 
    up.*,
    au.email as user_email,
    lp.title as path_title
FROM public.user_paths up
LEFT JOIN auth.users au ON up.user_id = au.id
LEFT JOIN public.learning_paths lp ON up.path_id = lp.id
ORDER BY up.enrolled_at DESC;

-- Get user progress with sprint and path details
SELECT 
    up.*,
    au.email as user_email,
    lp.title as path_title,
    m.title as module_title,
    s.title as sprint_title
FROM public.user_progress up
LEFT JOIN auth.users au ON up.user_id = au.id
LEFT JOIN public.learning_paths lp ON up.path_id = lp.id
LEFT JOIN public.modules m ON up.module_id = m.id
LEFT JOIN public.sprints s ON up.sprint_id = s.id
ORDER BY au.email, lp.title, m.order_index, s.order_index;

-- Get course invitations with user and path details
SELECT 
    ci.*,
    au.email as user_email,
    lp.title as path_title,
    i.name as instructor_name
FROM public.course_invitations ci
LEFT JOIN auth.users au ON ci.user_id = au.id
LEFT JOIN public.learning_paths lp ON ci.path_id = lp.id
LEFT JOIN public.instructors i ON lp.instructor_id = i.id
ORDER BY ci.created_at DESC;

-- Get summary statistics
SELECT
    (SELECT COUNT(*) FROM public.instructors) as instructor_count,
    (SELECT COUNT(*) FROM public.learning_paths) as learning_path_count,
    (SELECT COUNT(*) FROM public.modules) as module_count,
    (SELECT COUNT(*) FROM public.sprints) as sprint_count,
    (SELECT COUNT(*) FROM public.user_paths) as enrollment_count,
    (SELECT COUNT(*) FROM public.user_progress WHERE is_completed = true) as completed_sprint_count,
    (SELECT COUNT(*) FROM public.course_invitations WHERE status = 'pending') as pending_invitation_count;

-- Check table structure
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('instructors', 'learning_paths', 'modules', 'sprints', 'user_paths', 'user_progress', 'course_invitations')
ORDER BY table_name, ordinal_position; 