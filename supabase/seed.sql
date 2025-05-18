-- Insert naval disaster course
INSERT INTO learning_paths (
  id,
  title,
  description,
  category,
  duration,
  modules,
  difficulty,
  rating,
  reviews,
  image_url,
  tags,
  featured,
  instructor_name,
  instructor_avatar
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'The Great Naval Disaster: Russian Baltic Fleet''s Epic Journey',
  'Experience the incredible (and incredibly disastrous) journey of the Russian Baltic Fleet during the Russo-Japanese War (1904-1905).',
  'History',
  '5 hours',
  5,
  'Intermediate',
  4.8,
  128,
  '/path-images/russian-baltic-fleet.jpg',
  ARRAY['Military History', 'Naval Warfare', 'Comedy in History'],
  true,
  'Dr. Naval History',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=naval'
); 