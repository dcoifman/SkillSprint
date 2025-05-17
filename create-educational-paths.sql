-- First create default instructor
INSERT INTO public.instructors (id, name, title, bio, avatar)
VALUES (
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb',
  'Dr. Sarah Johnson',
  'Professor of Anatomy',
  'Dr. Johnson has over 15 years of experience teaching medical anatomy at top universities. Her research focuses on innovative educational methods for medical students.',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3'
)
ON CONFLICT (id) DO NOTHING;

-- Create learning paths

-- 1. Human Anatomy Fundamentals
INSERT INTO public.learning_paths (
  id, title, description, category, level, image, 
  estimated_time, rating, review_count, students_count,
  tags, objectives, prerequisites, instructor_id
)
VALUES (
  '3a9c2adc-6a9f-4fb4-a528-247b60d54c7c',
  'Human Anatomy Fundamentals',
  'A comprehensive introduction to human anatomy with detailed 3D models and interactive lessons. Master the foundational knowledge of body systems and structures essential for healthcare education.',
  'Anatomy',
  'Beginner',
  'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3',
  '6-8 weeks',
  4.8,
  324,
  2150,
  ARRAY['anatomy', '3d-models', 'healthcare', 'medical-education'],
  ARRAY['Identify and describe major body systems and their components', 'Understand the relationships between body structures', 'Learn anatomical terminology and directional terms', 'Visualize 3D anatomical relationships'],
  ARRAY['No prior anatomy knowledge required', 'Basic understanding of biology helpful'],
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'
);

-- Create modules for Human Anatomy Fundamentals
INSERT INTO public.modules (id, path_id, title, description, order_index)
VALUES
  ('51b22a6d-e2a1-4f33-8a47-b198d48f0b0a', '3a9c2adc-6a9f-4fb4-a528-247b60d54c7c', 'Anatomical Terminology and Body Organization', 'Master the fundamental terminology used in anatomy and understand how the body is organized into systems.', 1),
  ('62c33b7e-f3b2-4f44-9b58-c2a9e59f1b1b', '3a9c2adc-6a9f-4fb4-a528-247b60d54c7c', 'The Skeletal System', 'Explore the structure and function of the human skeletal system using interactive 3D models.', 2),
  ('73d44c8f-a4c3-4f55-8c69-d3b0f60a2c2c', '3a9c2adc-6a9f-4fb4-a528-247b60d54c7c', 'The Muscular System', 'Learn about major muscle groups, their functions, and clinical significance.', 3),
  ('84e55d9a-b5d4-4f66-9d70-e4c1a71b3d3d', '3a9c2adc-6a9f-4fb4-a528-247b60d54c7c', 'The Nervous System', 'Understand the organization and function of the nervous system through interactive lessons.', 4);

-- Create sprints for Module 1: Anatomical Terminology
INSERT INTO public.sprints (id, module_id, title, description, time, order_index, content)
VALUES
  ('91f66e0a-c6e5-4f77-8e81-f5d2a82b4e4e', '51b22a6d-e2a1-4f33-8a47-b198d48f0b0a', 'Introduction to Anatomical Terminology', 'Learn the standardized terms used to describe the human body and its parts.', '45 min', 1, 
   'In this sprint, we will cover the standardized language of anatomy. You will learn:

   - Anatomical position and why it is important
   - Directional terms (superior/inferior, anterior/posterior, etc.)
   - Body planes (sagittal, coronal, and transverse)
   - Regional terms used to identify specific areas of the body

   Interactive exercises will help reinforce these concepts as you practice identifying anatomical directions and planes on 3D models.'),
   
  ('02a77f1a-d7f6-4f88-9f92-a6e3b93c5f5f', '51b22a6d-e2a1-4f33-8a47-b198d48f0b0a', 'Body Cavities and Regions', 'Explore the major cavities of the body and regional divisions used in clinical settings.', '50 min', 2, 
   'This sprint focuses on understanding how the body is divided:

   - The dorsal and ventral body cavities and their subdivisions
   - Thoracic, abdominal, and pelvic cavities and their contents
   - The clinical importance of these divisions
   - Common medical terminology related to body regions

   You will work with cross-sectional models to visualize these cavities and understand their clinical relevance.'),
   
  ('13a88a2a-e8a7-4f99-af03-b7f4c04d6a6a', '51b22a6d-e2a1-4f33-8a47-b198d48f0b0a', 'Levels of Structural Organization', 'Discover how the body is organized from cells to organ systems.', '40 min', 3,
   'In this sprint, we examine how the body is organized hierarchically:

   - Cellular level: Structure and function of different cell types
   - Tissue level: Epithelial, connective, muscle, and nervous tissues
   - Organ level: How tissues form functional units
   - Organ system level: How organs work together
   - Organism level: Integration of all systems

   Interactive visualizations will help you understand the relationships between these levels.');

-- 2. Advanced Cardiovascular Systems
INSERT INTO public.learning_paths (
  id, title, description, category, level, image, 
  estimated_time, rating, review_count, students_count,
  tags, objectives, prerequisites, instructor_id
)
VALUES (
  '4b0d3bfe-7b0a-4ac5-b639-358c71e65d8d',
  'Advanced Cardiovascular Systems',
  'Dive deep into the structure and function of the cardiovascular system. Explore cardiac anatomy, blood vessel histology, and the mechanisms of circulation with detailed 3D models and clinical correlations.',
  'Anatomy',
  'Advanced',
  'https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&q=80&w=1587&ixlib=rb-4.0.3',
  '8-10 weeks',
  4.7,
  286,
  1840,
  ARRAY['cardiovascular', 'heart', 'blood vessels', 'clinical', 'advanced'],
  ARRAY['Analyze cardiac structure and function in detail', 'Understand coronary circulation and cardiac pathology', 'Master vascular histology and hemodynamics', 'Apply knowledge to clinical scenarios'],
  ARRAY['Basic anatomy knowledge required', 'Understanding of cell biology and physiology recommended'],
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'
);

-- Create modules for Advanced Cardiovascular Systems
INSERT INTO public.modules (id, path_id, title, description, order_index)
VALUES
  ('95a66a0a-a9a8-4a00-9a14-a8a5a15a7a7a', '4b0d3bfe-7b0a-4ac5-b639-358c71e65d8d', 'Heart Anatomy and Physiology', 'Detailed exploration of cardiac structure, function, and clinical correlations.', 1),
  ('06a77a1a-a0a9-4a11-aa25-a9a6a26a8a8a', '4b0d3bfe-7b0a-4ac5-b639-358c71e65d8d', 'Vascular System', 'Comprehensive study of blood vessels from histology to functional dynamics.', 2),
  ('17a88a2a-a1a0-4a22-aa36-a0a7a37a9a9a', '4b0d3bfe-7b0a-4ac5-b639-358c71e65d8d', 'Cardiac Pathology', 'Investigation of common cardiac diseases, their anatomical basis, and clinical presentations.', 3);

-- Create a sprint for Heart Anatomy module
INSERT INTO public.sprints (id, module_id, title, description, time, order_index, content)
VALUES
  ('28a99a3a-a2a1-4a33-aa47-a1a8a48a0a0a', '95a66a0a-a9a8-4a00-9a14-a8a5a15a7a7a', 'Advanced Cardiac Chamber Anatomy', 'Detailed exploration of the four chambers of the heart and their clinical significance.', '60 min', 1,
   'This sprint provides an in-depth analysis of cardiac chambers:

   - Detailed anatomy of atria and ventricles including trabeculae, papillary muscles, and chordae tendineae
   - Structural differences between right and left chambers and their functional significance
   - Interventricular and interatrial septa - normal structure and common defects
   - Valve anatomy and mechanics in detail
   - Clinical correlations with imaging modalities (echocardiography, cardiac MRI)

   You will work with high-resolution 3D heart models, examining each chamber in detail and understanding how structure relates to function.');

-- 3. Neuroanatomy Deep Dive
INSERT INTO public.learning_paths (
  id, title, description, category, level, image, 
  estimated_time, rating, review_count, students_count,
  tags, objectives, prerequisites, instructor_id
)
VALUES (
  '5c1e4caf-8c1a-4ad6-c740-469d82f76e9e',
  'Neuroanatomy Deep Dive',
  'Explore the intricate structures of the central and peripheral nervous systems with advanced 3D visualizations. Study brain regions, neural pathways, and clinical correlations essential for neuroscience professionals.',
  'Anatomy',
  'Intermediate',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1471&ixlib=rb-4.0.3',
  '10-12 weeks',
  4.9,
  215,
  1456,
  ARRAY['neuroscience', 'brain', 'central nervous system', 'neural pathways', 'clinical neurology'],
  ARRAY['Identify and describe brain structures and their functions', 'Trace major neural pathways and understand their significance', 'Correlate neuroanatomy with clinical presentations', 'Analyze brain sections and neuroimaging data'],
  ARRAY['Basic anatomy knowledge required', 'Foundational understanding of nervous system recommended'],
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'
); 