import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// For development, use these fallback values if environment variables aren't set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a custom Supabase client for development
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { 
    user: data?.session?.user || null,
    error 
  };
};

// For development, we'll use mock data for learning paths
const mockLearningPaths = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    description: 'Learn the core concepts of machine learning, from basic algorithms to neural networks.',
    category: 'Data Science',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hY2hpbmUlMjBsZWFybmluZ3xlbnwwfHwwfHx8MA%3D%3D',
    total_sprints: 24,
    estimated_time: '4 hours',
    students_count: 1245,
    tags: ['AI', 'Python', 'Neural Networks'],
    instructor: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    }
  },
  {
    id: '2',
    title: 'Web Development with React',
    description: 'Master React.js and build modern, responsive web applications from scratch.',
    category: 'Technology',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhY3QlMjBqc3xlbnwwfHwwfHx8MA%3D%3D',
    total_sprints: 32,
    estimated_time: '6 hours',
    students_count: 2780,
    tags: ['React', 'JavaScript', 'Frontend'],
    instructor: {
      name: 'Michael Taylor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    }
  },
  {
    id: '3',
    title: 'Business Communication',
    description: 'Develop effective communication skills for professional environments and leadership.',
    category: 'Business',
    level: 'All Levels',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YnVzaW5lc3MlMjBjb21tdW5pY2F0aW9ufGVufDB8fDB8fHww',
    total_sprints: 18,
    estimated_time: '3 hours',
    students_count: 3150,
    tags: ['Communication', 'Leadership', 'Presentations'],
    instructor: {
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    }
  }
];

// Mock path details for development
const mockPathDetail = {
  id: '1',
  title: 'Machine Learning Fundamentals',
  description: 'A comprehensive introduction to machine learning concepts, algorithms, and practical applications. Learn how to build models that can make predictions and improve with experience.',
  image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hY2hpbmUlMjBsZWFybmluZ3xlbnwwfHwwfHx8MA%3D%3D',
  category: 'Data Science',
  level: 'Beginner',
  rating: 4.8,
  review_count: 324,
  students_count: 1245,
  total_sprints: 24,
  completedSprints: 0,
  estimated_time: '4 hours',
  tags: ['AI', 'Python', 'Neural Networks', 'Data Science'],
  prerequisites: [
    'Basic understanding of programming concepts', 
    'Familiarity with Python (recommended but not required)',
    'High school level mathematics'
  ],
  objectives: [
    'Understand machine learning foundations and key concepts',
    'Implement basic supervised and unsupervised learning algorithms',
    'Build neural network models for classification and regression tasks',
    'Apply machine learning to solve real-world problems',
    'Understand model evaluation and validation techniques'
  ],
  instructor: {
    name: 'Dr. Sarah Chen',
    title: 'AI Research Scientist & Educator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    bio: 'Dr. Sarah Chen is an AI researcher with over 10 years of experience at leading tech companies. She specializes in making complex machine learning concepts accessible to beginners.',
  },
  modules: [
    {
      title: 'Introduction to Machine Learning',
      description: 'Understand the core concepts and types of machine learning',
      sprints: [
        {
          id: 1,
          title: 'What is Machine Learning?',
          time: '8 min',
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: 2,
          title: 'Supervised vs Unsupervised Learning',
          time: '12 min',
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: 3,
          title: 'Key Machine Learning Applications',
          time: '10 min',
          isCompleted: false,
          isUnlocked: true,
        },
      ]
    },
    {
      title: 'Data Preparation for Machine Learning',
      description: 'Learn how to prepare and preprocess data for ML algorithms',
      sprints: [
        {
          id: 4,
          title: 'Data Cleaning Techniques',
          time: '15 min',
          isCompleted: false,
          isUnlocked: false,
        },
        {
          id: 5,
          title: 'Feature Scaling and Normalization',
          time: '12 min',
          isCompleted: false,
          isUnlocked: false,
        }
      ]
    }
  ],
  relatedPaths: [
    {
      id: 101,
      title: 'Data Science with Python',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHwwfHx8MA%3D%3D',
      total_sprints: 28,
      estimated_time: '5 hours',
    },
    {
      id: 102,
      title: 'Deep Learning Specialization',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1677442135136-760302227f2a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVlcCUyMGxlYXJuaW5nfGVufDB8fDB8fHww',
      total_sprints: 36,
      estimated_time: '7 hours',
    }
  ]
};

// Database helper functions for paths - using mock data for development
export const fetchLearningPaths = async ({ category = null, level = null, search = null }) => {
  // In a real app, this would query Supabase
  console.log('Fetching learning paths with filters:', { category, level, search });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter mock data based on parameters
  let filteredPaths = [...mockLearningPaths];
  
  if (category) {
    filteredPaths = filteredPaths.filter(path => path.category === category);
  }
  
  if (level) {
    filteredPaths = filteredPaths.filter(path => path.level === level);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPaths = filteredPaths.filter(path => 
      path.title.toLowerCase().includes(searchLower) || 
      path.description.toLowerCase().includes(searchLower) ||
      (path.tags && path.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  return { data: filteredPaths, error: null };
};

export const fetchPathDetail = async (pathId) => {
  // In a real app, this would query Supabase
  console.log('Fetching path details for ID:', pathId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return mock data for development
  if (pathId === '1' || pathId === 1) {
    return { data: mockPathDetail, error: null };
  }
  
  // Return a different path for other IDs
  const mockData = { ...mockPathDetail, id: pathId, title: `Learning Path ${pathId}` };
  return { data: mockData, error: null };
};

export const enrollUserInPath = async (pathId) => {
  // In a real app, this would insert into Supabase
  console.log('Enrolling user in path:', pathId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Always return success for development
  return { data: { enrolled: true, path_id: pathId }, error: null };
};

export const updateSprintProgress = async (sprintId, isCompleted) => {
  // In a real app, this would upsert into Supabase
  console.log('Updating sprint progress:', { sprintId, isCompleted });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Always return success for development
  return { data: { updated: true, sprint_id: sprintId, is_completed: isCompleted }, error: null };
}; 