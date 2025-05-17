import fs from 'fs';

// Read the course data file
try {
  const courseData = JSON.parse(fs.readFileSync('./formatted_course.json', 'utf8'));
  
  if (courseData) {
    if (courseData.course) {
      // Display course information
      console.log('\n===== NAVAL DISASTER COURSE OVERVIEW =====');
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
      
      console.log('\n===== PREREQUISITES =====');
      if (courseData.course.prerequisites && Array.isArray(courseData.course.prerequisites)) {
        courseData.course.prerequisites.forEach((prereq, i) => {
          console.log(`${i+1}. ${prereq}`);
        });
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
      
      // Display sample sprint content if available
      console.log('\n===== SAMPLE SPRINT CONTENT =====');
      if (courseData.sprints && Object.keys(courseData.sprints).length > 0) {
        // Pick a sprint to display (e.g., "2.1" for Dogger Bank)
        const sampleSprintId = "2.1"; // Dogger Bank incident
        const sampleSprint = courseData.sprints[sampleSprintId];
        
        if (sampleSprint) {
          console.log(`\nSprint: ${sampleSprint.title}`);
          console.log(`Introduction: ${sampleSprint.introduction}`);
          
          if (sampleSprint.content && Array.isArray(sampleSprint.content)) {
            console.log('\nContent:');
            sampleSprint.content.forEach((item, i) => {
              console.log(`\n[${item.type.toUpperCase()}]`);
              console.log(item.value);
            });
          }
          
          if (sampleSprint.quiz && Array.isArray(sampleSprint.quiz)) {
            console.log('\nQuiz:');
            sampleSprint.quiz.forEach((question, i) => {
              console.log(`\nQuestion ${i+1}: ${question.question}`);
              
              if (question.type === "multiple_choice" && question.options) {
                question.options.forEach((option, j) => {
                  console.log(`  ${String.fromCharCode(97 + j)}) ${option}${j === question.correctAnswer ? ' (CORRECT)' : ''}`);
                });
              } else if (question.type === "fill_blank") {
                console.log(`  Answer: ${question.correctAnswer}`);
              } else if (question.type === "ordering" && question.options) {
                console.log(`  Items to order:`);
                question.options.forEach((option, j) => {
                  console.log(`    ${j+1}. ${option}`);
                });
                console.log(`  Correct order: ${question.correctOrder.map(idx => idx + 1).join(', ')}`);
              }
            });
          }
          
          if (sampleSprint.summary) {
            console.log(`\nSummary: ${sampleSprint.summary}`);
          }
          
          if (sampleSprint.nextSteps) {
            console.log(`\nNext Steps: ${sampleSprint.nextSteps}`);
          }
        } else {
          console.log(`Sprint ${sampleSprintId} not found.`);
        }
      } else {
        console.log('No sprint content found');
      }
    }
  }
} catch (error) {
  console.error('Error reading or parsing course data:', error.message);
} 