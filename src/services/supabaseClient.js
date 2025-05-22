import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Custom error formatter function
export const formatError = (error, type = 'api') => {
  if (!error) return null;
  
  return {
    message: error.message || 'Unknown error',
    code: error.code || 'unknown',
    type,
    timestamp: new Date().toISOString()
  };
};

// Safe JSON parser with proper error handling
export const safeJsonParse = (jsonString) => {
  try {
    return { 
      data: JSON.parse(jsonString), 
      error: null 
    };
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return { 
      data: null, 
      error: new Error(`JSON Parse error: ${error.message}`)
    };
  }
};

// Create a Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Client-Info': 'skillsprint-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle API responses with proper error handling
const handleApiResponse = async (promise) => {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error('API Error:', error);
      // Handle specific error cases
      if (error.status === 406) {
        return { data: null, error: { message: 'Invalid request format' } };
      }
      if (error.status === 400) {
        return { data: null, error: { message: 'Invalid request parameters' } };
      }
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error('Exception:', err);
    return { 
      data: null, 
      error: {
        message: err.message || 'An unexpected error occurred',
        code: err.code || 'unknown_error'
      }
    };
  }
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
    const formattedError = formatError(err);
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
    console.log('Fetching learning paths with params:', { category, level, search });
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
    } else {
      console.log('Successfully fetched learning paths:', data);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Exception during fetching learning paths:', err);
    const formattedError = formatError(err);
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

export const updateSprintStarted = async (sprintId, isStarted) => {
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
        is_started: isStarted
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

// Helper function to get instructor by user_id
export const getInstructorByUserId = async (userId) => {
  return handleApiResponse(
    supabase
      .from('instructors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
  );
};

// Get instructor profile for current user
export const getInstructorProfile = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  return handleApiResponse(
    supabase
      .from('instructors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
  );
};

export const updateInstructorProfile = async (profileData) => {
  try {
    // Get current user
    const { user, error: userError } = await getCurrentUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Check if instructor profile exists
    const { data: existingProfile } = await supabase
      .from('instructors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('instructors')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('instructors')
        .insert([{ ...profileData, user_id: user.id }])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (err) {
    console.error('Error updating instructor profile:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(err.message || 'Unknown error')
    };
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

// Debug helper functions
export const inspectTableStructure = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error inspecting ${tableName}:`, error);
      return { error };
    }

    const structure = data && data[0] ? Object.keys(data[0]) : [];
    console.log(`Table ${tableName} structure:`, structure);
    return { data: structure, error: null };
  } catch (err) {
    console.error(`Exception inspecting ${tableName}:`, err);
    return { error: err };
  }
};

export const debugDatabase = async () => {
  const tables = [
    'instructors',
    'learning_paths',
    'modules',
    'sprints',
    'user_paths',
    'user_progress',
    'course_invitations'
  ];

  console.log('Starting database inspection...');
  
  for (const table of tables) {
    await inspectTableStructure(table);
  }
  
  // Get instructor count
  const { data: instructorCount } = await supabase
    .from('instructors')
    .select('*', { count: 'exact' });
  
  console.log('Instructor count:', instructorCount?.length || 0);
  
  // Get a sample instructor
  const { data: sampleInstructor } = await supabase
    .from('instructors')
    .select('*')
    .limit(1);
  
  console.log('Sample instructor:', sampleInstructor?.[0]);
};

export const generateCourseContentBackend = async (courseRequest, onProgress) => {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return { error: { message: 'You must be logged in to generate course content' } };
    }
    
    // Create a course generation request in Supabase
    const { data: requestData, error: requestError } = await supabase
      .from('course_generation_requests')
      .insert([
        {
          user_id: user.id,
          status: 'pending',
          request_data: courseRequest,
          content_generated: false
        }
      ])
      .select('id')
      .single();
    
    if (requestError) {
      console.error('Error creating course generation request:', requestError);
      return { error: requestError };
    }
    
    // Set up real-time subscription to track progress
    const channel = supabase
      .channel(`course-gen-${requestData.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'course_generation_requests',
        filter: `id=eq.${requestData.id}`
      }, (payload) => {
        // Call progress callback with updated status
        if (onProgress && typeof onProgress === 'function') {
          onProgress({
            status: payload.new.status,
            progress: payload.new.progress || 0,
            message: payload.new.status_message,
            isComplete: payload.new.content_generated,
            error: payload.new.error_message
          });
        }
        
        // If generation is complete, clean up the subscription
        if (payload.new.status === 'completed' || payload.new.status === 'failed') {
          channel.unsubscribe();
        }
      })
      .subscribe();
    
    // Trigger Edge Function to handle the generation process asynchronously
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-course-content', {
      body: { 
        requestId: requestData.id,
        courseRequest
      }
    });
    
    if (functionError) {
      console.error('Error invoking Edge Function:', functionError);
      
      // Show detailed error message to the user
      let errorMessage = 'Failed to start course generation';
      if (functionError.message) errorMessage = functionError.message;
      
      // If we have a specific error from the Edge Function response
      if (functionData && typeof functionData === 'object') {
        if (functionData.error) {
          errorMessage = functionData.error;
          if (functionData.details) {
            errorMessage += `: ${functionData.details}`;
          }
        }
      }
      
      // Update the request status to failed
      try {
        await supabase
          .from('course_generation_requests')
          .update({
            status: 'failed',
            error_message: errorMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestData.id);
      } catch (updateError) {
        console.error('Error updating request status:', updateError);
      }
      
      return { 
        error: { 
          message: errorMessage, 
          originalError: functionError,
          responseData: functionData
        } 
      };
    }
    
    return { 
      data: { 
        requestId: requestData.id,
        message: 'Course generation started successfully'
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Exception during course generation:', err);
    return { error: err };
  }
};

// Return the request status for a course generation
export const getCourseGenerationStatus = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('course_generation_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (error) {
      console.error('Error fetching course generation status:', error);
      return { error };
    }
    
    return { 
      data: {
        status: data.status,
        progress: data.progress || 0,
        message: data.status_message,
        isComplete: data.content_generated,
        error: data.error_message,
        courseData: data.course_data
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Exception fetching course generation status:', err);
    return { error: err };
  }
};

export const fetchUserStats = async () => {
// ... existing code ...
};

export const savePracticeProblems = async (sprintId, problems) => {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      return { data: null, error: userError || { message: 'User not authenticated' } };
    }

    // Assuming a 'user_practice_problems' table with columns: user_id, sprint_id, problems_data (jsonb)
    const { data, error } = await supabase
      .from('user_practice_problems')
      .upsert(
        {
          user_id: user.id,
          sprint_id: sprintId,
          problems_data: problems, // Store problems as JSON
        },
        { onConflict: ['user_id', 'sprint_id'] } // Upsert based on user and sprint
      )
      .select();

    if (error) {
      console.error('Error saving practice problems:', error);
    }

    return { data, error };

  } catch (err) {
    console.error('Exception during saving practice problems:', err);
    return { data: null, error: err };
  }
};

export const saveLearningSummary = async (pathId, summary) => {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      return { data: null, error: userError || { message: 'User not authenticated' } };
    }

    // Assuming a 'user_learning_summaries' table with columns: user_id, path_id, summary_text, generated_at
    const { data, error } = await supabase
      .from('user_learning_summaries')
      .upsert(
        {
          user_id: user.id,
          path_id: pathId,
          summary_text: summary,
          generated_at: new Date().toISOString(),
        },
        { onConflict: ['user_id', 'path_id'] } // Upsert based on user and path
      )
      .select();

    if (error) {
      console.error('Error saving learning summary:', error);
    }

    return { data, error };

  } catch (err) {
    console.error('Exception during saving learning summary:', err);
    return { data: null, error: err };
  }
};

export const fetchPracticeProblems = async (sprintId) => {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      return { data: null, error: userError || { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('user_practice_problems')
      .select('problems_data')
      .eq('user_id', user.id)
      .eq('sprint_id', sprintId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means row not found, which is okay
      console.error('Error fetching practice problems:', error);
    }

    return { data: data ? data.problems_data : null, error: error && error.code === 'PGRST116' ? null : error };

  } catch (err) {
    console.error('Exception during fetching practice problems:', err);
    return { data: null, error: err };
  }
};

export const fetchLearningSummary = async (pathId) => {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      return { data: null, error: userError || { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('user_learning_summaries')
      .select('summary_text')
      .eq('user_id', user.id)
      .eq('path_id', pathId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means row not found, which is okay
      console.error('Error fetching learning summary:', error);
    }

    return { data: data ? data.summary_text : null, error: error && error.code === 'PGRST116' ? null : error };

  } catch (err) {
    console.error('Exception during fetching learning summary:', err);
    return { data: null, error: err };
  }
};

// Function to fetch user's enrolled paths with progress and next incomplete sprint
export const fetchUserEnrolledPathsWithNextSprint = async () => {
  try {
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      return { data: null, error: userError || { message: 'User not authenticated' } };
    }

    // Fetch all paths the user is enrolled in
    const { data: userPaths, error: userPathsError } = await supabase
      .from('user_paths')
      .select(`
        path:path_id (
          id,
          title,
          description,
          category,
          level,
          image,
          total_sprints,
          estimated_time,
          rating,
          review_count,
          students_count,
          tags,
          objectives,
          prerequisites,
          instructor_id,
          created_at,
          updated_at,
          modules (
            *,
            sprints (*)
          )
        )
      `)
      .eq('user_id', user.id);

    if (userPathsError) {
      console.error('Error fetching user paths:', userPathsError);
      return { data: null, error: userPathsError };
    }

    const enrolledPathsData = [];

    for (const userPath of userPaths) {
      const path = userPath.path;
      if (!path) continue; // Skip if path data is null

      // Fetch user's progress for this specific path
      const { data: userProgress, error: userProgressError } = await supabase
        .from('user_progress')
        .select('sprint_id, is_completed')
        .eq('user_id', user.id)
        .eq('path_id', path.id);

      if (userProgressError) {
        console.error(`Error fetching user progress for path ${path.id}:`, userProgressError);
        // Continue to the next path even if progress fetch fails for one
        enrolledPathsData.push({ ...path, progress: 0, nextSprint: null });
        continue;
      }

      const completedSprints = userProgress ? userProgress.filter(p => p.is_completed).length : 0;
      const totalSprints = path.total_sprints || 0;
      const progress = totalSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0;

      let nextSprint = null;

      // Find the next incomplete sprint
      if (path.modules && path.modules.length > 0) {
        for (const module of path.modules) {
          if (module.sprints && module.sprints.length > 0) {
            // Sort sprints within module by order_index
            const sortedSprints = module.sprints.sort((a, b) => a.order_index - b.order_index);

            for (const sprint of sortedSprints) {
              const progressEntry = userProgress ? userProgress.find(p => p.sprint_id === sprint.id) : null;
              const isCompleted = progressEntry ? progressEntry.is_completed : false;

              if (!isCompleted) {
                nextSprint = {
                  id: sprint.id,
                  title: sprint.title,
                  time: sprint.time,
                };
                break; // Found the next incomplete sprint for this path
              }
            }
          }
          if (nextSprint) break; // Found next sprint in a module, move to next path
        }
      }

      enrolledPathsData.push({ ...path, progress, nextSprint });
    }

    return { data: enrolledPathsData, error: null };

  } catch (err) {
    console.error('Exception during fetching user enrolled paths with next sprint:', err);
    return { data: null, error: err };
  }
};

// Create a named object for export
const supabaseClient = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchLearningPaths,
  fetchPathDetail,
  enrollUserInPath,
  updateSprintProgress,
  updateSprintStarted,
  createLearningPath,
  sendCourseToStudent,
  getInstructorByUserId,
  getInstructorProfile,
  updateInstructorProfile,
  getInstructorCourses,
  getMyInstructorCourses,
  inspectTableStructure,
  debugDatabase,
  formatError,
  safeJsonParse,
  supabase,
  generateCourseContentBackend,
  getCourseGenerationStatus,
  fetchUserStats,
  savePracticeProblems,
  saveLearningSummary,
  fetchPracticeProblems,
  fetchLearningSummary,
  fetchUserEnrolledPathsWithNextSprint,
};

// Export the named object
export default supabaseClient;