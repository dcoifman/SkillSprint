import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersonalizedSprint, generateQuizQuestions, generateLearningObjectives, KnowledgeArea } from "./gemini-service.ts";

interface UserPerformanceAnalysis {
  weakAreas: Array<KnowledgeArea>;
  strongAreas: Array<KnowledgeArea>;
  recommendedFocus: Array<string>; // knowledge area ids
  completedSprints: number;
  averageScore: number;
  basePathId?: string;
}

interface SprintProgress {
  id: string;
  user_id: string;
  sprint_id: string;
  module_id: string;
  path_id: string;
  completed_at: string;
  time_spent_seconds: number | null;
  score: number | null;
  attempts: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeProficiency {
  id: string;
  user_id: string;
  knowledge_area_id: string;
  proficiency_score: number;
  confidence_level: number;
  last_assessed_at: string;
  created_at: string;
  updated_at: string;
  knowledge_areas: {
    name: string;
    description: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { userId, basePathId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create a Supabase client with the request auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    
    // Get user performance data
    const userPerformanceAnalysis = await analyzeUserPerformance(supabaseClient, userId, basePathId);
    
    // Generate personalized learning path
    const personalizedPath = await generatePersonalizedPath(supabaseClient, userId, userPerformanceAnalysis);
    
    return new Response(
      JSON.stringify({
        success: true,
        personalizedPath,
        performanceAnalysis: userPerformanceAnalysis
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error: unknown) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function analyzeUserPerformance(supabaseClient: SupabaseClient, userId: string, basePathId?: string): Promise<UserPerformanceAnalysis> {
  // Get user's completed sprints
  const { data: userSprintProgress, error: sprintError } = await supabaseClient
    .from("user_sprint_progress")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
    
  if (sprintError) throw new Error(`Error fetching user sprint progress: ${sprintError.message}`);
  
  // Get user's quiz results
  const { data: quizResults, error: quizError } = await supabaseClient
    .from("user_quiz_results")
    .select("*")
    .eq("user_id", userId);
    
  if (quizError) throw new Error(`Error fetching user quiz results: ${quizError.message}`);
  
  // Get user's knowledge proficiency
  const { data: initialKnowledgeProficiency, error: proficiencyError } = await supabaseClient
    .from("user_knowledge_proficiency")
    .select("*, knowledge_areas(name, description)")
    .eq("user_id", userId);
    
  if (proficiencyError) throw new Error(`Error fetching knowledge proficiency: ${proficiencyError.message}`);

  // Handle knowledge proficiency data
  let knowledgeProficiency: KnowledgeProficiency[] = initialKnowledgeProficiency || [];

  // If we don't have any knowledge proficiency data, create default entries
  if (knowledgeProficiency.length === 0) {
    // Get all knowledge areas
    const { data: allKnowledgeAreas, error: areasError } = await supabaseClient
      .from("knowledge_areas")
      .select("*");
      
    if (areasError) throw new Error(`Error fetching knowledge areas: ${areasError.message}`);
    
    // If there are no knowledge areas, create some default ones
    if (!allKnowledgeAreas || allKnowledgeAreas.length === 0) {
      const defaultAreas = [
        { name: "Anatomical Terminology", description: "Terms used to describe body positions, regions, and directional terms." },
        { name: "Skeletal System", description: "Bones, cartilage, and joints of the human body." },
        { name: "Muscular System", description: "Muscles and associated tissues that control movement." },
        { name: "Nervous System", description: "Brain, spinal cord, nerves, and associated structures." },
        { name: "Cardiovascular System", description: "Heart, blood vessels, and blood circulation." }
      ];
      
      for (const area of defaultAreas) {
        const { data: newArea, error: newAreaError } = await supabaseClient
          .from("knowledge_areas")
          .insert(area)
          .select()
          .single();
          
        if (newAreaError) throw new Error(`Error creating knowledge area: ${newAreaError.message}`);
        
        // Create default proficiency entry for this user
        await supabaseClient
          .from("user_knowledge_proficiency")
          .insert({
            user_id: userId,
            knowledge_area_id: newArea.id,
            proficiency_score: Math.random() * 0.7, // Random initial score between 0 and 0.7
            confidence_level: 0.5
          });
      }
      
      // Fetch the newly created proficiency entries
      const { data: newProficiency, error: newProfError } = await supabaseClient
        .from("user_knowledge_proficiency")
        .select("*, knowledge_areas(name, description)")
        .eq("user_id", userId);
        
      if (newProfError) throw new Error(`Error fetching new proficiency data: ${newProfError.message}`);
      
      knowledgeProficiency = newProficiency || [];
    } else {
      // Create default proficiency entries for existing knowledge areas
      for (const area of allKnowledgeAreas) {
        await supabaseClient
          .from("user_knowledge_proficiency")
          .insert({
            user_id: userId,
            knowledge_area_id: area.id,
            proficiency_score: Math.random() * 0.7, // Random initial score between 0 and 0.7
            confidence_level: 0.5
          });
      }
      
      // Fetch the newly created proficiency entries
      const { data: newProficiency, error: newProfError } = await supabaseClient
        .from("user_knowledge_proficiency")
        .select("*, knowledge_areas(name, description)")
        .eq("user_id", userId);
        
      if (newProfError) throw new Error(`Error fetching new proficiency data: ${newProfError.message}`);
      
      knowledgeProficiency = newProficiency || [];
    }
  }

  // Calculate metrics
  const completedSprints = userSprintProgress ? userSprintProgress.length : 0;
  const totalScore = userSprintProgress ? userSprintProgress.reduce((sum: number, sprint: SprintProgress) => sum + (sprint.score || 0), 0) : 0;
  const averageScore = completedSprints > 0 ? totalScore / completedSprints : 0;
  
  // Map knowledge proficiency data to KnowledgeArea interface
  const knowledgeAreas = knowledgeProficiency.map((prof: KnowledgeProficiency) => ({
    id: prof.knowledge_area_id,
    name: prof.knowledge_areas.name,
    description: prof.knowledge_areas.description,
    proficiency_score: prof.proficiency_score
  }));
  
  // Sort knowledge areas by proficiency
  const sortedAreas = [...knowledgeAreas].sort((a, b) => a.proficiency_score - b.proficiency_score);
  
  // Identify weak areas (lowest proficiency scores)
  const weakAreas = sortedAreas.slice(0, 3);
  
  // Identify strong areas (highest proficiency scores)
  const strongAreas = sortedAreas.slice(-3).reverse();
  
  // Create recommended focus areas (prioritizing weak areas)
  const recommendedFocus = weakAreas.map(area => area.id);
  
  return {
    weakAreas,
    strongAreas,
    recommendedFocus,
    completedSprints,
    averageScore,
    basePathId
  };
}

async function generatePersonalizedPath(supabaseClient: SupabaseClient, userId: string, performance: UserPerformanceAnalysis) {
  // If basePathId is provided, use it as a starting point
  let basePath;
  let baseModules;
  
  if (performance.basePathId) {
    // Fetch base learning path
    const { data: basePathData, error: basePathError } = await supabaseClient
      .from("learning_paths")
      .select("*")
      .eq("id", performance.basePathId)
      .single();
      
    if (basePathError) throw new Error(`Error fetching base path: ${basePathError.message}`);
    
    basePath = basePathData;
    
    // Fetch modules for the base path
    const { data: baseModulesData, error: baseModulesError } = await supabaseClient
      .from("modules")
      .select("*, sprints(*)")
      .eq("path_id", performance.basePathId)
      .order("order_index");
      
    if (baseModulesError) throw new Error(`Error fetching base modules: ${baseModulesError.message}`);
    
    baseModules = baseModulesData;
  } else {
    // Recommend a new path based on user's knowledge profile
    // For now, simply select the first available path
    const { data: recommendedPath, error: recommendedPathError } = await supabaseClient
      .from("learning_paths")
      .select("*")
      .limit(1)
      .single();
      
    if (recommendedPathError) throw new Error(`Error fetching recommended path: ${recommendedPathError.message}`);
    
    basePath = recommendedPath;
    
    // Fetch modules for the recommended path
    const { data: recommendedModules, error: recommendedModulesError } = await supabaseClient
      .from("modules")
      .select("*, sprints(*)")
      .eq("path_id", basePath.id)
      .order("order_index");
      
    if (recommendedModulesError) throw new Error(`Error fetching recommended modules: ${recommendedModulesError.message}`);
    
    baseModules = recommendedModules;
  }
  
  // Generate personalized learning objectives using Gemini API
  const learningObjectives = await generateLearningObjectives(
    performance.weakAreas, 
    performance.strongAreas
  );

  // Create personalized learning path
  const { data: personalizedPath, error: pathError } = await supabaseClient
    .from("personalized_learning_paths")
    .insert({
      user_id: userId,
      title: `Personalized: ${basePath.title}`,
      description: `Your personalized learning journey based on ${basePath.title}, adapted to your strengths and areas for improvement.`,
      base_path_id: basePath.id,
      is_active: true
    })
    .select()
    .single();
  
  if (pathError) throw new Error(`Error creating personalized path: ${pathError.message}`);
  
  // Create personalized modules based on base path
  const personalizedModules = [];
  
  for (const [index, module] of baseModules.entries()) {
    const { data: personalizedModule, error: moduleError } = await supabaseClient
      .from("personalized_modules")
      .insert({
        personalized_path_id: personalizedPath.id,
        original_module_id: module.id,
        title: module.title,
        description: module.description,
        order_index: index,
        is_custom: false
      })
      .select()
      .single();
      
    if (moduleError) throw new Error(`Error creating personalized module: ${moduleError.message}`);
    
    personalizedModules.push(personalizedModule);
    
    // Create personalized sprints for this module
    for (const [sprintIndex, sprint] of module.sprints.entries()) {
      await supabaseClient
        .from("personalized_sprints")
        .insert({
          personalized_module_id: personalizedModule.id,
          original_sprint_id: sprint.id,
          title: sprint.title,
          description: sprint.description,
          time: sprint.time,
          content: sprint.content,
          order_index: sprintIndex,
          is_custom: false
        });
    }
  }
  
  // Generate additional sprints for weak areas using Gemini API
  if (performance.weakAreas.length > 0) {
    // Create a new module focusing on weak areas
    const { data: reinforcementModule, error: reinforcementError } = await supabaseClient
      .from("personalized_modules")
      .insert({
        personalized_path_id: personalizedPath.id,
        original_module_id: null,
        title: "Personalized Reinforcement Module",
        description: "This module is specially generated to help strengthen your understanding in areas where you need improvement.",
        order_index: personalizedModules.length,
        is_custom: true
      })
      .select()
      .single();
      
    if (reinforcementError) throw new Error(`Error creating reinforcement module: ${reinforcementError.message}`);
    
    // Generate personalized sprints for each weak area
    for (const [index, area] of performance.weakAreas.entries()) {
      // Use Gemini API to generate personalized sprint content
      const sprintContent = await generatePersonalizedSprint(area, 3);
      
      if (sprintContent) {
        const { data: personalizedSprint, error: sprintError } = await supabaseClient
          .from("personalized_sprints")
          .insert({
            personalized_module_id: reinforcementModule.id,
            original_sprint_id: null,
            title: sprintContent.title,
            description: `This sprint helps strengthen your understanding of ${area.name}.`,
            time: "20-30 min",
            content: JSON.stringify(sprintContent),
            order_index: index,
            is_custom: true,
            is_generated: true,
            knowledge_area_focus: area.id
          })
          .select()
          .single();
          
        if (sprintError) throw new Error(`Error creating personalized sprint: ${sprintError.message}`);
        
        // Generate additional quiz questions
        const quizQuestions = await generateQuizQuestions(area, 3, 5);
        
        if (quizQuestions) {
          // Save each quiz question to the database
          for (const question of quizQuestions) {
            await supabaseClient
              .from("personalized_quiz_questions")
              .insert({
                personalized_sprint_id: personalizedSprint.id,
                question: question.question,
                options: JSON.stringify(question.options),
                correct_answer: question.correctAnswer,
                explanation: question.explanation,
                difficulty_level: 3,
                knowledge_area_id: area.id
              });
          }
        }
      } else {
        // Fallback if Gemini API fails
        await supabaseClient
          .from("personalized_sprints")
          .insert({
            personalized_module_id: reinforcementModule.id,
            original_sprint_id: null,
            title: `Reinforcement: ${area.name}`,
            description: `This sprint helps strengthen your understanding of ${area.name}.`,
            time: "20-30 min",
            content: JSON.stringify({
              title: `Reinforcement: ${area.name}`,
              introduction: `This sprint focuses on improving your understanding of ${area.name}.`,
              content: [
                {
                  type: "text",
                  value: `Content will be provided when you start this sprint.`
                }
              ],
              quiz: []
            }),
            order_index: index,
            is_custom: true,
            is_generated: true,
            knowledge_area_focus: area.id
          });
      }
    }
  }
  
  // Return the complete personalized path with modules and sprints
  const { data: completePath, error: completePathError } = await supabaseClient
    .from("personalized_learning_paths")
    .select(`
      *,
      personalized_modules(
        *,
        personalized_sprints(
          *,
          personalized_quiz_questions(*)
        )
      )
    `)
    .eq("id", personalizedPath.id)
    .single();
    
  if (completePathError) throw new Error(`Error fetching complete path: ${completePathError.message}`);
  
  return completePath;
} 