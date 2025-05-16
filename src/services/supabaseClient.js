import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.warn(`
    Warning: Supabase environment variables may not be properly configured.
    Make sure you have a .env.local file with:
    
    REACT_APP_SUPABASE_URL=your_supabase_url_here
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    
    For development purposes, using fallback values.
  `);
}

// Create a Supabase client with fallback values for development if needed
export const supabase = createClient(
  supabaseUrl || 'https://your-project-id.supabase.co', 
  supabaseAnonKey || 'your-anon-key'
);

// Auth helper functions
export const signUp = async (email, password, name) => {
  try {
    console.log('Signing up user:', { email, name });
    
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
    
    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful');
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception during sign up:', err);
    return { data: null, error: err };
  }
};

export const signIn = async (email, password) => {
  try {
    console.log('Signing in user:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful');
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception during sign in:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  try {
    console.log('Signing out user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
    } else {
      console.log('Sign out successful');
    }
    
    return { error };
  } catch (err) {
    console.error('Exception during sign out:', err);
    return { error: err };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
    
    const user = data?.session?.user || null;
    return { user, error: null };
  } catch (err) {
    console.error('Exception during get current user:', err);
    return { user: null, error: err };
  }
};

// Database helper functions for learning paths
export const fetchLearningPaths = async ({ category = null, level = null, search = null }) => {
  let query = supabase
    .from('learning_paths')
    .select(`
      *,
      instructor:instructor_id (name, avatar)
    `);
  
  // Apply filters if provided
  if (category) {
    query = query.eq('category', category);
  }
  
  if (level) {
    query = query.eq('level', level);
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const fetchPathDetail = async (pathId) => {
  // First get the learning path with instructor
  const { data: pathData, error: pathError } = await supabase
    .from('learning_paths')
    .select(`
      *,
      instructor:instructor_id (id, name, title, bio, avatar)
    `)
    .eq('id', pathId)
    .single();
  
  if (pathError) {
    return { error: pathError };
  }
  
  // Get all modules for this path
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('path_id', pathId)
    .order('order_index');
  
  if (modulesError) {
    return { error: modulesError };
  }
  
  // Get all sprints for these modules
  const moduleIds = modulesData.map(module => module.id);
  
  const { data: sprintsData, error: sprintsError } = await supabase
    .from('sprints')
    .select('*')
    .in('module_id', moduleIds)
    .order('order_index');
  
  if (sprintsError) {
    return { error: sprintsError };
  }
  
  // Get user progress if user is authenticated
  const { user } = await getCurrentUser();
  let userProgress = [];
  
  if (user) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('path_id', pathId);
    
    userProgress = progressData || [];
  }
  
  // Check enrollment status
  let isEnrolled = false;
  
  if (user) {
    const { data: enrollmentData } = await supabase
      .from('user_paths')
      .select('*')
      .eq('user_id', user.id)
      .eq('path_id', pathId)
      .single();
    
    isEnrolled = !!enrollmentData;
  }
  
  // Structure the data
  const modules = modulesData.map(module => {
    const moduleSprintData = sprintsData.filter(sprint => sprint.module_id === module.id);
    
    const sprints = moduleSprintData.map(sprint => {
      const progress = userProgress.find(p => p.sprint_id === sprint.id);
      
      return {
        ...sprint,
        isCompleted: progress ? progress.is_completed : false,
        isUnlocked: isEnrolled, // In a real app, you might have more complex unlock logic
      };
    });
    
    return {
      ...module,
      sprints
    };
  });
  
  // Get related paths (based on same category)
  const { data: relatedPathsData } = await supabase
    .from('learning_paths')
    .select('id, title, level, image, total_sprints, estimated_time')
    .eq('category', pathData.category)
    .neq('id', pathId)
    .limit(3);
  
  // Count completed sprints
  const completedSprints = userProgress.filter(p => p.is_completed).length;
  
  // Combine all data
  const pathDetail = {
    ...pathData,
    modules,
    relatedPaths: relatedPathsData || [],
    completedSprints,
    isEnrolled
  };
  
  return { data: pathDetail, error: null };
};

export const enrollUserInPath = async (pathId) => {
  const { user } = await getCurrentUser();
  
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }
  
  const { data, error } = await supabase
    .from('user_paths')
    .insert([
      { user_id: user.id, path_id: pathId }
    ]);
  
  return { data, error };
};

export const updateSprintProgress = async (sprintId, isCompleted) => {
  const { user } = await getCurrentUser();
  
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }
  
  // Get the path_id and module_id for this sprint
  const { data: sprintData, error: sprintError } = await supabase
    .from('sprints')
    .select('*, module:module_id (path_id)')
    .eq('id', sprintId)
    .single();
  
  if (sprintError) {
    return { error: sprintError };
  }
  
  // Update or insert progress
  const { data, error } = await supabase
    .from('user_progress')
    .upsert([
      {
        user_id: user.id,
        path_id: sprintData.module.path_id,
        module_id: sprintData.module_id,
        sprint_id: sprintId,
        is_completed: isCompleted
      }
    ]);
  
  return { data, error };
};