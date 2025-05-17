-- Insert a test course generation request
INSERT INTO public.course_generation_requests 
(request_data)
VALUES 
('{
  "topic": "Introduction to Python Programming",
  "level": "beginner",
  "objectives": ["Learn basic Python syntax", "Understand variables and data types", "Write simple programs"],
  "estimated_time": "2 hours"
}'::jsonb)
RETURNING id, status, request_data; 