-- First, create the instructor
INSERT INTO public.instructors (
  name,
  title,
  bio,
  avatar
) VALUES (
  'Dr. Naval History',
  'Naval History Expert',
  'Expert in naval history and military disasters, with a special focus on the Russo-Japanese War.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=naval'
) RETURNING id;

-- Then, create the learning path
INSERT INTO public.learning_paths (
  title,
  description,
  category,
  level,
  image,
  estimated_time,
  rating,
  review_count,
  students_count,
  tags,
  objectives,
  prerequisites,
  instructor_id
) VALUES (
  'Around the World in 80 Blunders: The Russian Baltic Fleet''s Epic Fail',
  'Embark on a hilariously tragic voyage with the Tsar''s Baltic Fleet during the Russo-Japanese War! This course charts the unbelievable journey of a fleet plagued by misfortune, incompetence, and a severe shortage of common sense. From mistaking British fishermen for Japanese destroyers to the logistical nightmare of coaling obsolete battleships across the globe, you''ll learn why this expedition is a textbook example of ''what not to do.''',
  'History',
  'Intermediate',
  '/path-images/naval-disaster.jpg',
  '5 hours',
  4.8,
  128,
  0,
  ARRAY['Military History', 'Naval Warfare', 'Comedy in History'],
  ARRAY[
    'Understand the basic geopolitical context and causes of the Russo-Japanese War',
    'Recount the major (and most comical) blunders committed by the Baltic Fleet during its voyage',
    'Identify the key figures involved and their (often questionable) decisions',
    'Analyze the logistical, technical, and human factors contributing to the fleet''s disastrous performance',
    'Appreciate the darkly humorous side of historical events and the importance of learning from past mistakes',
    'Explain the ultimate fate of the fleet at the Battle of Tsushima and its impact on the war'
  ],
  ARRAY[
    'A sense of humor',
    'Basic understanding of world map geography',
    'Interest in naval or military history'
  ],
  (SELECT id FROM public.instructors WHERE name = 'Dr. Naval History' LIMIT 1)
) RETURNING id;

-- Store the learning path ID for use in all modules
DO $$
DECLARE
  path_id UUID;
  module_id UUID;
BEGIN
  SELECT id INTO path_id FROM public.learning_paths 
  WHERE title = 'Around the World in 80 Blunders: The Russian Baltic Fleet''s Epic Fail' 
  LIMIT 1;

  -- Module 1: Setting Sail for Disaster
  INSERT INTO public.modules (path_id, title, description, order_index)
  VALUES (
    path_id,
    'Setting Sail for Disaster',
    'Learn about the background of the Russo-Japanese War and the formation of the Baltic Fleet that would embark on one of history''s most calamitous naval expeditions.',
    1
  ) RETURNING id INTO module_id;

  -- Module 1 Sprints
  INSERT INTO public.sprints (module_id, title, description, time, content, order_index)
  VALUES
    (module_id,
     'Why Are We Even Here? - The Russo-Japanese Powder Keg',
     'Explore the imperial ambitions, competition for warm-water ports, and the geopolitical tension that led to war.',
     '10 minutes',
     '["Imperial Russia''s Eastward Expansion (Text Explanation)", "Japan''s Modernization and Regional Ambitions (Visual Timeline)", "The Prize: Port Arthur and Warm-Water Ports (Map/Diagram)", "Early Japanese Victories and Russian Humiliation (Text/Images)", "The Tsar''s Desperate ''Plan B'': Send in the Baltic Fleet! (Text with Humor)"]',
     1),
    (module_id,
     'Meet the Fleet! - Russia''s Not-So-Secret Weapon',
     'Get acquainted with the ships (some new, some ridiculously outdated), the unprepared crew, and Admiral Rozhestvensky.',
     '8 minutes',
     '["The Motley Collection of Vessels (Visual Diagram/Humor)", "Admiral Zinovy Rozhestvensky: The Man, The Temper, The Binoculars (Character Profile)", "Crew Composition: From Nobles to Peasants Who''d Never Seen the Sea (Text Explanation)", "''Training? What Training?'' - Crew Preparedness (Humorous Analysis)", "Quiz: Match the Actual Ship Names to Their Embarrassing Characteristics (Interactive Quiz)"]',
     2),
    (module_id,
     'The Grand Plan (Spoiler: It Wasn''t Grand) - Voyage to the Far East',
     'Examine the audacious (or foolhardy) plan to sail 18,000 miles to reach the war, and the early signs of trouble.',
     '12 minutes',
     '["The Big Idea: Sail 18,000 Miles Around the World to Fight (Map Animation)", "Logistics 101: How to (Not) Supply a Fleet on a Global Journey (Text/Humor)", "The Coal Problem: These Ships Are Hungry! (Diagram/Explanation)", "Early Warning Signs: Things Going Wrong Before Leaving European Waters (Text with Examples)", "Foreign Observers'' Reactions: ''Are They Serious?'' (Historical Quotes)", "Activity: Calculate Your Odds of Success (Spoiler: Low) (Interactive Exercise)"]',
     3);

  -- Module 2: The North Sea Fiasco & European Escapades
  INSERT INTO public.modules (path_id, title, description, order_index)
  VALUES (
    path_id,
    'The North Sea Fiasco & European Escapades',
    'Follow the fleet''s disastrous journey through European waters, featuring paranoia, international incidents, and questionable priorities.',
    2
  ) RETURNING id INTO module_id;

  -- Module 2 Sprints
  INSERT INTO public.sprints (module_id, title, description, time, content, order_index)
  VALUES
    (module_id,
     'The Dogger Bank Incident: Fishermen or Fiends?',
     'Experience the paranoia that led to the Baltic Fleet attacking innocent British fishermen, mistaking them for Japanese torpedo boats in the North Sea.',
     '15 minutes',
     '["Setting the Scene: Nervous Wrecks in the North Sea (Text/Mood Setting)", "The ''Attack'': When Fishing Trawlers Look Terrifying in the Dark (Narrative/Humor)", "Friendly Fire, International Incident: The Diplomatic Mess (Text Explanation)", "Captain''s Log (Probably): Fictional Humorous Account from Russian Perspective (Creative Content)", "British Press Reaction: ''The Russians Are Mad!'' (Historical Quotes/Cartoons)", "Casualties and Damage: The Very Real Consequences (Factual Summary)", "Quiz: What Were the Russians Actually Firing At? (Multiple Choice Quiz)"]',
     1),
    (module_id,
     'How to Nearly Start a War with Britain - Diplomatic Damage Control',
     'Learn about Britain''s fury, Russia''s embarrassment, and the complex negotiations to avoid a wider conflict after the Dogger Bank disaster.',
     '10 minutes',
     '["Britain''s Reaction: Mobilizing the Fleet (Historical Quotes/Facts)", "Ultimatum: The British Demands (Text Explanation)", "Tsar Nicholas II: ''Oops, My Bad!'' (Diplomatic Correspondence, Simplified)", "The International Commission: Investigating the Incident (Process Diagram)", "Financial Compensation: Putting a Price on Embarrassment (Text with Humor)", "Activity: Draft An Apology Letter as Tsar Nicholas II (Interactive Exercise)"]',
     2),
    (module_id,
     'Coaling, Complaining, and Champagne - Priorities at Sea',
     'Explore the logistical nightmare of refueling ships, maintaining crew morale, and the curious supply choices made by officers.',
     '8 minutes',
     '["Coal: The Fleet''s Addiction (Text Explanation with Humor)", "The Coaling Process: Black Lung for Everyone! (Visual Explanation/Historical Photos)", "Officer vs. Sailor Life: Champagne vs. Hardtack (Comparison Table with Humor)", "Supply Manifest Oddities: What They Packed vs. What They Needed (List with Commentary)", "Morale Management: Rozhestvensky''s ''Motivational'' Outbursts (Anecdotes/Quotes)", "Quiz: Which Items Were Actually Brought on the Journey? (True/False Quiz)"]',
     3);

  -- Module 3: The Agonizingly Long Haul
  INSERT INTO public.modules (path_id, title, description, order_index)
  VALUES (
    path_id,
    'The Agonizingly Long Haul',
    'Follow the fleet''s painful progress around Africa and through the Indian Ocean, as ships deteriorate and morale plummets.',
    3
  ) RETURNING id INTO module_id;

  -- Module 3 Sprints
  INSERT INTO public.sprints (module_id, title, description, time, content, order_index)
  VALUES
    (module_id,
     'Around Africa: Heat, Hull Fouling, and Hellish Conditions',
     'Experience the fleet''s journey around Africa, facing unfamiliar waters, strain on outdated ships, and declining health and morale.',
     '12 minutes',
     '["Into Tropical Waters: When Siberian Sailors Meet Equatorial Heat (Narrative with Humor)", "Hull Fouling: Collecting Exotic Marine Life the Hard Way (Explanation with Diagrams)", "Engineering Nightmares: Breakdowns, Makeshift Repairs, and Prayers (Text with Examples)", "Medical Crisis: Scurvy, Heat Stroke, and Mysterious Ailments (List with Commentary)", "Sea Creatures vs. Paranoid Gunners: More Shooting at Shadows (Anecdotes)", "Activity: Sailor''s Diary - Write an Entry After 60 Days at Sea (Creative Exercise)"]',
     1),
    (module_id,
     'Madagascar Madness & The Second Pacific Squadron - Reinforcements? Really?',
     'Discover the chaos during the extended stop in Madagascar, growing mutinous thoughts, and the arrival of even older reinforcement ships.',
     '10 minutes',
     '["Madagascar Stop: Tropical Paradise or Naval Nightmare? (Setting Description)", "News from Home: The Fall of Port Arthur (Historical Context/Impact)", "Reinforcements Arrive: ''We Asked for Battleships, Not Floating Museums!'' (Humorous Introduction)", "The ''Volunteer Fleet'': Converted Civilian Ships Join the Mission (Facts with Commentary)", "The ''Kamchatka'' Problem: Meet the Fleet''s Most Accident-Prone Ship (Character Profile)", "Mutiny in the Air: Revolutionary Sentiments Among the Crew (Historical Context)", "Quiz: Identify the Real Ships from the Made-Up Ones (All Are Equally Ridiculous) (Quiz)"]',
     2),
    (module_id,
     'The Final Stretch: Creeping Towards Destiny',
     'Follow the fleet''s final journey across the Indian and Pacific Oceans, as they approach their inevitable confrontation with the Japanese navy.',
     '10 minutes',
     '["Crossing the Indian Ocean: More Coal, More Problems (Narrative)", "The French Connection: Diplomatic Help in French Indochina (Historical Context)", "Path Choices: Around Singapore or Through the Straits? (Strategic Analysis with Map)", "Intelligence Failure: The Russians Have No Idea Where the Japanese Fleet Is (Text with Humor)", "Approaching Japan: The Growing Sense of Doom (Mood Setting)", "Admiral Togo''s Preparation: The Spider Waiting for the Fly (Contrast with Japanese Readiness)", "Activity: Strategic Decision Making - Plot Your Own Route to Vladivostok (Interactive Map Exercise)"]',
     3);

  -- Module 4: Tsushima: The Predictable Annihilation
  INSERT INTO public.modules (path_id, title, description, order_index)
  VALUES (
    path_id,
    'Tsushima: The Predictable Annihilation',
    'Witness the inevitable confrontation between the weary Russian fleet and the well-prepared Japanese navy, resulting in one of history''s most one-sided naval battles.',
    4
  ) RETURNING id INTO module_id;

  -- Module 4 Sprints
  INSERT INTO public.sprints (module_id, title, description, time, content, order_index)
  VALUES
    (module_id,
     'Admiral Togo is Waiting: The Japanese Trap',
     'Learn about the superior Japanese fleet, their strategy, and how they tracked Russian movements with precision.',
     '8 minutes',
     '["Meet Admiral Togo: Japan''s ''Nelson of the East'' (Character Profile)", "Japanese Naval Intelligence: They Know Exactly Where You Are (Text Explanation)", "The Tsushima Strait: Perfect Spot for an Ambush (Geographical Analysis with Map)", "Japanese Fleet Composition: Modern, Well-Maintained, Well-Trained (Comparison Chart)", "The Strategy: How to Catch a Russian Fleet (Visual Diagram)", "The Waiting Game: Togo''s Patience vs. Russian Fatalism (Contrast Analysis)", "Quiz: Compare Japanese vs. Russian Naval Advantages (Multiple Choice)"]',
     1),
    (module_id,
     'Crossing the ''T'': A Bad Day to be Russian',
     'Experience the naval maneuver that sealed the fleet''s fate and the stark difference between Russian and Japanese gunnery.',
     '12 minutes',
     '["May 27, 1905: The Fleets Sight Each Other (Narrative Setting)", "Rozhestvensky''s Battle Plan: ''Was There One?'' (Analysis with Humor)", "Naval Tactics 101: What ''Crossing the T'' Means and Why It''s Bad News for Russians (Animated Diagram)", "The Opening Salvos: Japanese Precision vs. Russian... Attempts (Comparison)", "Russian Gunnery Statistics: Hitting Water Successfully Since 1905 (Humorous Data Presentation)", "Kamchatka''s Final Performance: Mistakenly Firing at Russian Ships (Anecdote)", "The Suvorov (Flagship) Takes a Beating: Rozhestvensky Wounded (Historical Account)", "Activity: Calculate Hit Ratios Between Forces (Interactive Data Exercise)"]',
     2),
    (module_id,
     'The Decimation: Surrender, Sinking, and Scattered Survivors',
     'Witness the brutal efficiency of the Japanese victory, the massive Russian losses, and the inglorious end of the voyage.',
     '15 minutes',
     '["Day Turns to Night: The Battle Continues After Dark (Narrative)", "Ship After Ship: Russian Vessels Sunk, Captured, or Scuttled (Visual Timeline)", "The Human Cost: Casualties and POWs (Factual Summary)", "Nebogatov''s Surrender: ''Enough is Enough'' (Historical Account)", "Scattered Survivors: The Dash to Neutral Ports (Map with Ship Movements)", "Counting the Losses: The Staggering Statistics (Data Visualization)", "Was This the Most Lopsided Naval Battle in Modern History? (Analysis)", "Admiral Rozhestvensky as POW: From Commander to Captive (Biographical Note)", "Quiz: Match the Ship to Its Fate in the Battle (Matching Exercise)"]',
     3);

  -- Module 5: Aftermath & Absurd Legacies
  INSERT INTO public.modules (path_id, title, description, order_index)
  VALUES (
    path_id,
    'Aftermath & Absurd Legacies',
    'Examine the consequences of the Battle of Tsushima, its impact on Russia, and the lasting legacy of this extraordinary military disaster.',
    5
  ) RETURNING id INTO module_id;

  -- Module 5 Sprints
  INSERT INTO public.sprints (module_id, title, description, time, content, order_index)
  VALUES
    (module_id,
     'The Tsar''s Headache: Ripples Through Russia',
     'Explore the impact of the naval defeat on the Russo-Japanese War and how it fueled revolutionary sentiment in Russia.',
     '10 minutes',
     '["News Reaches St. Petersburg: ''We Lost HOW MANY Ships?'' (Historical Reaction)", "Peace Treaty of Portsmouth: Admitting Defeat (Historical Context)", "Financial Cost of the Expedition: Rubles Down the Drain (Economic Analysis with Humor)", "Political Fallout: Adding Fuel to Revolutionary Fire (Historical Context)", "The 1905 Revolution: Sailors Lead the Way (Connection to Broader History)", "The Tsar''s Reaction: Nicholas II''s Personal Response (Historical Quotes)", "Activity: Write a Telegram Announcing the Defeat to the Tsar (Creative Exercise)"]',
     1),
    (module_id,
     'The Fleet That Became a Punchline: Lessons (Not) Learned',
     'See how the voyage became a symbol of incompetence and its lasting place in naval ''folklore''.',
     '8 minutes',
     '["International Reaction: From Sympathy to Ridicule (Press Quotes)", "Naval Experts'' Analysis: ''What Not To Do'' Case Study (Expert Commentary)", "Cultural Impact: The Voyage in Literature and Later References (Cultural Notes)", "Famous Quotes About the Expedition: Historical Zingers (Quote Collection)", "The ''Kamchatka'' Legacy: When Your Ship''s Name Becomes Synonymous with Chaos (Linguistic Note)", "Myths vs. Reality: Separating Legend from Historical Fact (Myth Busting)", "Quiz: True or False Russian Baltic Fleet Legends (Quiz)"]',
     2),
    (module_id,
     'So, What Can We Learn? - Beyond the Laughter',
     'Reflect on the serious lessons from this comic tragedy about training, equipment, leadership, and preparation.',
     '10 minutes',
     '["Leadership Lessons: When Authority Doesn''t Equal Competence (Analysis)", "Technology Matters: The Cost of Falling Behind (Military Analysis)", "Training and Morale: Foundations of Military Effectiveness (Practical Lessons)", "Logistics: The Unsexy but Critical Element of Warfare (Strategic Analysis)", "Decision Making Under Political Pressure: When to Say ''No'' (Leadership Lessons)", "Modern Military Parallels: Similar Mistakes in Recent History (Connections to Present)", "The Human Element: Courage Amid Absurdity (Reflection)", "Activity: Draft Your Own ''Lessons Learned'' Report as an Admiralty Official (Interactive Exercise)"]',
     3);

END $$; 