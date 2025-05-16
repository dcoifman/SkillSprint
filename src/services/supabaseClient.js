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

// Custom error formatter function
export const formatErrorAsXml = (error, type = 'api') => {
  if (!error) return null;
  
  const errorMsg = error.message || 'Unknown error';
  const errorCode = error.code || 'unknown';
  const timestamp = new Date().toISOString();
  
  return `<error type="${type}"><message>${errorMsg}</message><code>${errorCode}</code><timestamp>${timestamp}</timestamp></error>`;
};

// Safe JSON parser to handle malformed JSON
export const safeJsonParse = (jsonString) => {
  try {
    return { 
      data: JSON.parse(jsonString), 
      error: null 
    };
  } catch (error) {
    console.error('JSON Parse Error:', error);
    const xmlError = formatErrorAsXml({
      message: `JSON Parse error: ${error.message}`,
      code: 'INVALID_JSON'
    }, 'json');
    
    return { 
      data: null, 
      error: {
        message: `JSON Parse error: ${error.message}`,
        code: 'INVALID_JSON',
        xml: xmlError
      }
    };
  }
};

// Create a Supabase client with fallback values for development if needed
export const supabase = createClient(
  supabaseUrl || 'https://your-project-id.supabase.co', 
  supabaseAnonKey || 'your-anon-key'
);

// Augment the built-in fetch to handle malformed JSON
const originalFetch = supabase.fetch;
if (originalFetch) {
  supabase.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (error) {
      if (error.message && error.message.includes('JSON')) {
        console.error('JSON parsing error in Supabase fetch:', error);
        
        const xmlError = formatErrorAsXml({
          message: `API Response JSON Parse error: ${error.message}`,
          code: 'INVALID_JSON_RESPONSE'
        }, 'json_response');
        
        throw {
          ...error,
          xml: xmlError
        };
      }
      throw error;
    }
  };
}

// Custom error handler for JSON parsing issues in API responses
const handleJsonParseError = (error) => {
  if (error.message && error.message.includes('JSON')) {
    console.error('JSON parsing error:', error);
    
    const errorMessage = `JSON Parse error: ${error.message}`;
    const errorXml = `<error type="json"><message>${errorMessage}</message><timestamp>${new Date().toISOString()}</timestamp></error>`;
    
    // Create a custom error object with XML formatting for the error
    return {
      message: errorMessage,
      code: 'INVALID_JSON',
      xml: errorXml
    };
  }
  return error;
};

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
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception during sign up:', err);
    const formattedError = handleJsonParseError(err);
    return { data: null, error: formattedError };
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
  try {
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
    
    if (error) {
      console.error('Error fetching learning paths:', error);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception during fetching learning paths:', err);
    const formattedError = handleJsonParseError(err);
    return { data: null, error: formattedError };
  }
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

export const createLearningPath = async (pathData, moduleData) => {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return { error: { message: 'You must be logged in to create a course' } };
    }
    
    // First, check if this user has an instructor profile
    const { data: instructorData, error: instructorError } = await supabase
      .from('instructors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    // If no instructor profile exists, create one
    let instructorId;
    if (instructorError || !instructorData) {
      const { data: newInstructor, error: createError } = await supabase
        .from('instructors')
        .insert([
          { 
            user_id: user.id,
            name: user.user_metadata?.full_name || 'Instructor',
            avatar: user.user_metadata?.avatar_url || null
          }
        ])
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating instructor profile:', createError);
        return { error: createError };
      }
      
      instructorId = newInstructor.id;
    } else {
      instructorId = instructorData.id;
    }
    
    // Create the learning path
    const { data: path, error: pathError } = await supabase
      .from('learning_paths')
      .insert([
        {
          ...pathData,
          instructor_id: instructorId
        }
      ])
      .select('id')
      .single();
    
    if (pathError) {
      console.error('Error creating learning path:', pathError);
      return { error: pathError };
    }
    
    // Create modules for this path
    for (const module of moduleData) {
      const { data: newModule, error: moduleError } = await supabase
        .from('modules')
        .insert([
          {
            path_id: path.id,
            title: module.title,
            description: module.description,
            order_index: module.order_index
          }
        ])
        .select('id')
        .single();
      
      if (moduleError) {
        console.error('Error creating module:', moduleError);
        continue;
      }
      
      // Create sprints for this module
      for (const sprint of module.sprints) {
        const { error: sprintError } = await supabase
          .from('sprints')
          .insert([
            {
              module_id: newModule.id,
              title: sprint.title,
              description: sprint.description,
              content: JSON.stringify(sprint.content),
              time: sprint.time,
              order_index: sprint.order_index
            }
          ]);
        
        if (sprintError) {
          console.error('Error creating sprint:', sprintError);
        }
      }
    }
    
    return { data: { path_id: path.id }, error: null };
  } catch (err) {
    console.error('Exception during course creation:', err);
    return { data: null, error: err };
  }
};

export const sendCourseToStudent = async (pathId, studentEmail) => {
  try {
    // First check if the student exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', studentEmail)
      .single();
    
    if (userError) {
      return { error: { message: 'Student not found with this email' } };
    }
    
    // Add an invitation record
    const { data, error } = await supabase
      .from('course_invitations')
      .insert([
        {
          path_id: pathId,
          user_id: userData.id,
          status: 'pending'
        }
      ]);
    
    if (error) {
      console.error('Error sending course invitation:', error);
      return { error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception during sending course invitation:', err);
    return { error: err };
  }
};

export const getInstructorProfile = async () => {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }
    
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Exception during fetching instructor profile:', err);
    return { error: err };
  }
};

export const updateInstructorProfile = async (profileData) => {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }
    
    // Check if instructor profile exists
    const { data: existingProfile } = await getInstructorProfile();
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('instructors')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      return { data, error };
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('instructors')
        .insert([
          { 
            ...profileData,
            user_id: user.id,
            name: profileData.name || user.user_metadata?.full_name || 'Instructor'
          }
        ])
        .select()
        .single();
      
      return { data, error };
    }
  } catch (err) {
    console.error('Exception during updating instructor profile:', err);
    return { error: err };
  }
};

export const getInstructorCourses = async (instructorId) => {
  try {
    const { data, error } = await supabase
      .from('learning_paths')
      .select(`
        *,
        instructor:instructor_id (name, avatar)
      `)
      .eq('instructor_id', instructorId);
    
    return { data, error };
  } catch (err) {
    console.error('Exception during fetching instructor courses:', err);
    return { error: err };
  }
};

export const getMyInstructorCourses = async () => {
  try {
    const { data: instructorData } = await getInstructorProfile();
    
    if (!instructorData) {
      return { data: [], error: null };
    }
    
    return await getInstructorCourses(instructorData.id);
  } catch (err) {
    console.error('Exception during fetching my instructor courses:', err);
    return { error: err };
  }
};