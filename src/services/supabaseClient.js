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