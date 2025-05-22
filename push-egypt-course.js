import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cwgfnvjzygxmxnvwwtth.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function createInstructor() {
  const instructor = {
    name: 'Dr. Alexandria Kincaid',
    title: 'Egyptologist & Ancient History Expert',
    bio: 'Leading Egyptologist with over 15 years of field experience at major archaeological sites including Giza, Luxor, and the Valley of the Kings. Specializes in dynastic transitions and cultural evolution throughout Egypt\'s 3,000-year history.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=egypt'
  };

  // First check if instructor already exists
  const { data: existingInstructor } = await supabase
    .from('instructors')
    .select()
    .eq('name', instructor.name)
    .single();

  if (existingInstructor) {
    console.log('Instructor already exists, using existing record');
    return existingInstructor;
  }

  const { data, error } = await supabase
    .from('instructors')
    .insert(instructor)
    .select()
    .single();

  if (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }

  console.log('Successfully created instructor');
  return data;
}

async function pushEgyptCourse() {
  try {
    // Read the course data
    const courseData = JSON.parse(
      await fs.readFile(join(__dirname, 'ancient_egypt_dynasties_course.json'), 'utf8')
    );

    // Create instructor first
    const instructor = await createInstructor();
    console.log('Using instructor:', instructor);

    // Check if learning path already exists
    const { data: existingPath } = await supabase
      .from('learning_paths')
      .select()
      .eq('title', courseData.course.title)
      .single();

    if (existingPath) {
      console.log('Learning path already exists, updating image...');
      const { error: updateError } = await supabase
        .from('learning_paths')
        .update({ image: '/path-images/ancient-egypt-pyramids.jpg' })
        .eq('id', existingPath.id);
        
      if (updateError) {
        console.error('Error updating image:', updateError);
      } else {
        console.log('Successfully updated image');
      }
      return;
    }

    // Prepare learning path data
    const learningPath = {
      title: courseData.course.title,
      description: courseData.course.description,
      category: 'History',
      level: 'Intermediate',
      image: '/path-images/ancient-egypt-pyramids.jpg',
      estimated_time: '6 hours',
      rating: 4.9,
      review_count: 156,
      students_count: 0,
      tags: ['Ancient History', 'Egyptology', 'Archaeology', 'Pyramids'],
      objectives: courseData.course.learningObjectives,
      prerequisites: courseData.course.prerequisites,
      instructor_id: instructor.id
    };

    // Insert learning path
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .insert(learningPath)
      .select()
      .single();

    if (pathError) {
      console.error('Error creating learning path:', pathError);
      return;
    }

    console.log('Successfully created learning path:', pathData.id);

    // Create modules and sprints
    for (let i = 0; i < courseData.course.modules.length; i++) {
      const moduleData = courseData.course.modules[i];
      
      // Insert module
      const { data: moduleRecord, error: moduleError } = await supabase
        .from('modules')
        .insert({
          path_id: pathData.id,
          title: moduleData.title,
          description: moduleData.description,
          order_index: i + 1
        })
        .select()
        .single();

      if (moduleError) {
        console.error(`Error creating module ${i + 1}:`, moduleError);
        continue;
      }

      console.log(`Created module ${i + 1}:`, moduleRecord.id);

      // Create sprints for this module
      for (let j = 0; j < moduleData.sprints.length; j++) {
        const sprintData = moduleData.sprints[j];
        
        const { error: sprintError } = await supabase
          .from('sprints')
          .insert({
            module_id: moduleRecord.id,
            title: sprintData.title,
            description: sprintData.description,
            time: sprintData.duration,
            content: JSON.stringify(sprintData.contentOutline),
            order_index: j + 1
          });

        if (sprintError) {
          console.error(`Error creating sprint ${j + 1} in module ${i + 1}:`, sprintError);
        } else {
          console.log(`Created sprint ${j + 1} in module ${i + 1}`);
        }
      }
    }

    console.log('Successfully pushed Ancient Egypt course with all components');
  } catch (error) {
    console.error('Error:', error);
  }
}

pushEgyptCourse(); 