# SkillSprint

> Short bursts. Big skills.

SkillSprint is an AI-powered adaptive learning app designed to make skill-building engaging, efficient, and personalized through micro-learning sessions.

## Overview

SkillSprint delivers concise, adaptive, and personalized mini-lessons ("sprints") powered by AI. These sprints are hyper-focused and typically last 5-15 minutes, maximizing learner engagement and retention through rapid-fire content tailored dynamically to each user's learning pace and preferences.

## Core Features

- **Adaptive Micro-Learning**: Short, engaging 5-15 minute sessions with dynamic difficulty adjustment
- **Personalized Skill Pathways**: AI-generated learning paths based on user goals
- **AI-Assisted Interactive Learning**: 24/7 conversational tutor and smart recommendations
- **Deliberate Practice & Spaced Repetition**: Reinforcement through optimal intervals
- **Progress Tracking & Gamification**: Skill badges and optional competitive elements
- **Skill Insights & Analytics**: Comprehensive dashboards and personalized insights
- **Multi-Format Content Delivery**: Interactive modules through varied formats
- **Social & Collaborative Learning**: Community-driven sprints and peer connections
- **Skill Marketplace Integration**: Verified micro-certifications and career recommendations
- **Cross-Platform Flexibility**: Seamless synchronization between devices

## Technology Stack

- **Frontend**: React (web/Android), SwiftUI (iOS/macOS)
- **Backend**: Node.js with Firebase/Supabase/AWS
- **AI/ML**: Custom GPT integration, TensorFlow/PyTorch
- **Database**: PostgreSQL or MongoDB (Cloud hosted)

## Supabase Integration Setup

This application uses Supabase for authentication and database functionality. Follow these steps to set up your Supabase integration:

### 1. Create a Supabase Project

1. Sign up or log in at [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon/public key from the API settings

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

For Vite-based projects, use:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from this project
3. Run the SQL queries to create all necessary tables and policies

### 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure Email Auth:
   - Enable Email confirmations (recommended)
   - Customize email templates if desired
3. Set up OAuth providers (optional):
   - Google
   - GitHub
   - Facebook
   - Add redirect URLs to your application (e.g., `http://localhost:3000/dashboard` for development)

### 5. Seed Initial Data

To populate your database with sample data:

1. Create instructors first
2. Create learning paths and link them to instructors
3. Create modules for each learning path
4. Create sprints for each module

You can use the Supabase dashboard interface or SQL queries to add this data.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skill-sprint.git

# Navigate to project directory
cd skill-sprint

# Install dependencies
npm install

# Start development server
npm start
```

## Project Structure

```
skill-sprint/
├── public/               # Static files
├── src/                  # Source files
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── features/         # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   ├── App.js            # Main App component
│   └── index.js          # Entry point
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## License

MIT 

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

## Database Structure

- **instructors**: Information about course instructors
- **learning_paths**: Main learning paths/courses
- **modules**: Sections within learning paths
- **sprints**: Individual micro-lessons within modules
- **user_paths**: User enrollments in learning paths
- **user_progress**: User progress through individual sprints

## Authentication Flow

The application uses Supabase Auth for:
- Email/password authentication
- Social login (Google, GitHub, Facebook)
- Session management
- Protected routes

## API Functions

Key functions for interacting with Supabase:
- `signUp`, `signIn`, `signOut`: User authentication
- `fetchLearningPaths`: Get learning paths with filtering options
- `fetchPathDetail`: Get detailed information about a specific path
- `enrollUserInPath`: Enroll a user in a learning path
- `updateSprintProgress`: Track user progress through sprints 