#!/usr/bin/env node
import fs from 'fs';

// Read from stdin or file
let input = '';
if (process.argv.length > 2) {
  input = fs.readFileSync(process.argv[2], 'utf8');
} else {
  // Read from stdin
  input = fs.readFileSync(0, 'utf8'); // 0 is stdin file descriptor
}

// Extract course data
const courseDataMatch = input.match(/course_data":\s*({.*?}),\s*"content_generated"/);
if (courseDataMatch && courseDataMatch[1]) {
  try {
    // Try to parse and format the JSON
    const courseData = JSON.parse(courseDataMatch[1]);
    console.log(JSON.stringify(courseData, null, 2));
    
    // Save to file
    fs.writeFileSync('course_data.json', JSON.stringify(courseData, null, 2));
    console.error('Extracted course data to course_data.json');
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
    console.error('Raw match:', courseDataMatch[1]);
  }
} else {
  console.error('Could not find course data in input');
} 