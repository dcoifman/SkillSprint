#!/usr/bin/env node
import fs from 'fs';

// Use the request ID from command line argument or default
const requestId = process.argv[2] || '24bd4369-7e7a-41c8-af5c-1b4c2f50c5bf';

// Function to search for course data in a file
function searchInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Try to find content containing the request ID
    if (content.includes(requestId)) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(requestId) && lines[i].includes('course_data')) {
          // Extract the line with the course data
          const startLine = Math.max(0, i - 5);
          const endLine = Math.min(lines.length - 1, i + 20);
          const context = lines.slice(startLine, endLine).join('\n');
          
          // Try to extract JSON from the content
          try {
            const jsonMatch = context.match(/course_data":\s*(\{.*\})/);
            if (jsonMatch && jsonMatch[1]) {
              return JSON.parse(jsonMatch[1]);
            }
          } catch (e) {
            console.log('Error parsing JSON:', e.message);
          }
          
          return { rawContent: context };
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Places to look for the course data
const possibleFiles = [
  'course_data.json',
  'course_dump.json',
  'logs.txt',
  'events.log'
];

// Try to find the course data
let courseData = null;
for (const file of possibleFiles) {
  console.log(`Looking for course data in ${file}...`);
  courseData = searchInFile(file);
  if (courseData) {
    console.log(`Found course data in ${file}!`);
    break;
  }
}

if (!courseData) {
  // Try the current directory
  const files = fs.readdirSync('.');
  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.log') || file.endsWith('.txt')) {
      console.log(`Looking for course data in ${file}...`);
      courseData = searchInFile(file);
      if (courseData) {
        console.log(`Found course data in ${file}!`);
        break;
      }
    }
  }
}

if (courseData) {
  if (courseData.course) {
    // Display course information
    console.log('\n===== COURSE OVERVIEW =====');
    console.log(`Title: ${courseData.course.title || 'N/A'}`);
    console.log(`Description: ${courseData.course.description || 'N/A'}`);
    
    console.log('\n===== LEARNING OBJECTIVES =====');
    if (courseData.course.learningObjectives && Array.isArray(courseData.course.learningObjectives)) {
      courseData.course.learningObjectives.forEach((obj, i) => {
        console.log(`${i+1}. ${obj}`);
      });
    } else {
      console.log('No learning objectives found');
    }
    
    console.log('\n===== MODULES =====');
    if (courseData.course.modules && Array.isArray(courseData.course.modules)) {
      courseData.course.modules.forEach((module, i) => {
        console.log(`\nModule ${i+1}: ${module.title}`);
        console.log(`Description: ${module.description}`);
        
        if (module.sprints && Array.isArray(module.sprints)) {
          console.log(`\n--- Sprints (${module.sprints.length}) ---`);
          module.sprints.forEach((sprint, j) => {
            console.log(`\nSprint ${j+1}: ${sprint.title}`);
            console.log(`Description: ${sprint.description}`);
            console.log(`Duration: ${sprint.duration}`);
            
            // Show the content outline
            if (sprint.contentOutline && Array.isArray(sprint.contentOutline)) {
              console.log('Content Outline:');
              sprint.contentOutline.forEach((item, k) => {
                console.log(`  - ${item}`);
              });
            }
          });
        }
      });
    } else {
      console.log('No modules found');
    }
    
    // Check if we have sprint content
    if (courseData.sprints) {
      console.log('\n===== SPRINT DETAILS =====');
      Object.keys(courseData.sprints).forEach(key => {
        const [moduleIndex, sprintIndex] = key.split('-').map(Number);
        const sprint = courseData.sprints[key];
        
        console.log(`\nSprint ${moduleIndex+1}.${sprintIndex+1}: ${sprint.title || 'N/A'}`);
        
        if (sprint.content && Array.isArray(sprint.content)) {
          console.log('Content:');
          sprint.content.forEach((item, i) => {
            console.log(`  ${item.type}: ${item.value.substring(0, 50)}${item.value.length > 50 ? '...' : ''}`);
          });
        }
        
        if (sprint.quiz && Array.isArray(sprint.quiz)) {
          console.log(`\nQuiz (${sprint.quiz.length} questions)`);
        }
      });
    }
  } else if (courseData.rawContent) {
    console.log('\n===== RAW CONTENT =====');
    console.log(courseData.rawContent);
  } else {
    console.log('Course data found but format is unknown');
    console.log(JSON.stringify(courseData, null, 2));
  }
} else {
  console.log(`Could not find course data for request ID: ${requestId}`);
  console.log('Try providing a file with course data or the request ID as a command-line argument.');
} 