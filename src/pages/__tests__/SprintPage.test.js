import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SprintPage from '../SprintPage'; // Adjust path as necessary
import supabaseClient from '../../services/supabaseClient'; // Mocked version
import { useAuth } from '../../contexts/AuthContext'; // Mocked version

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock child components
jest.mock('../../components/InteractiveAnatomyModel.js', () => () => <div data-testid="interactive-anatomy-model-mock">InteractiveAnatomyModel Mock</div>);
jest.mock('../../components/ThreeDAnatomyModel.js', () => () => <div data-testid="3d-anatomy-model-mock">ThreeDAnatomyModel Mock</div>);
jest.mock('../../components/ErrorBoundary.js', () => ({ children }) => <>{children}</>); // Simple pass-through mock
jest.mock('../../components/MarkdownWithMath.js', () => ({ children }) => <div data-testid="markdown-mock">{children}</div>);


// Default mock for useAuth
const mockUseAuth = useAuth;

// Default mock for supabaseClient
const mockSupabaseClient = supabaseClient;

const mockSprintData = {
  id: 'sprint-123',
  title: 'Introduction to Sprinting',
  path: 'Agile Methodologies',
  totalSteps: 3,
  estimatedTime: '10 min',
  progress: 0, // Initial progress
  steps: [
    {
      type: 'content',
      title: 'Step 1: What is a Sprint?',
      content: 'A sprint is a short, time-boxed period...',
    },
    {
      type: 'quiz',
      title: 'Step 2: Quiz Time!',
      question: 'What is the typical duration of a sprint in Scrum?',
      options: ['1 week', '2 weeks', '1 month', '3 months'],
      correctAnswer: 1, // '2 weeks'
      explanation: 'Most sprints are 2 weeks long to allow for rapid feedback.',
    },
    {
      type: 'content',
      title: 'Step 3: Sprint Review',
      content: 'The sprint review is a meeting held at the end of the sprint...',
    },
  ],
};

const renderSprintPage = (sprintId = 'sprint-123', initialSprintData = mockSprintData) => {
  useParams.mockReturnValue({ sprintId });
  const navigateMock = jest.fn();
  useNavigate.mockReturnValue(navigateMock);

  // Mock Supabase client calls for this render
  // For fetching sprint details (first call in useEffect)
  mockSupabaseClient.supabase.from.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: {
        id: initialSprintData.id,
        title: initialSprintData.title,
        time: initialSprintData.estimatedTime,
        module: {
          order_index: 0,
          path: {
            title: initialSprintData.path,
            course_generation_request_id: 'req-abc',
          },
        },
        order_index: 0,
      },
      error: null,
    }),
  });

  // For fetching user progress (second call in useEffect, if user is authenticated)
   mockSupabaseClient.supabase.from.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { progress: initialSprintData.progress },
      error: null,
    }),
  });
  
  // For fetching sprint content (third call in useEffect)
  mockSupabaseClient.supabase.from.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: { content: { steps: initialSprintData.steps } },
      error: null,
    }),
  });


  return render(
    <MemoryRouter initialEntries={[`/sprint/${sprintId}`]}>
      <Routes>
        <Route path="/sprint/:sprintId" element={<SprintPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SprintPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id', user_metadata: { full_name: 'Test User' } },
      loading: false,
      isAuthenticated: true,
    });
  });

  describe('Initial Rendering', () => {
    it('renders without crashing and displays initial sprint data', async () => {
      renderSprintPage();

      // Wait for data to load and initial content to appear
      await waitFor(() => {
        expect(screen.getByText(mockSprintData.title)).toBeInTheDocument();
      });
      
      expect(screen.getByText(mockSprintData.path)).toBeInTheDocument();
      // Progress text: "X of Y" and percentage
      expect(screen.getByText(`Step 1 of ${mockSprintData.totalSteps}`)).toBeInTheDocument();
      expect(screen.getByText(/0% Complete/i)).toBeInTheDocument(); // Initial progress
      
      // Check for first step content
      expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument();
      expect(screen.getByTestId('markdown-mock')).toHaveTextContent(mockSprintData.steps[0].content);
    });

    it('shows loading state initially', () => {
      // Override supabase mock to simulate loading for a longer time
       mockSupabaseClient.supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => new Promise(() => {})), // Promise that never resolves
      });
      renderSprintPage();
      expect(screen.getByText(/Loading sprint content.../i)).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('Previous button is disabled on the first step, Next button is enabled', async () => {
      renderSprintPage();
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());

      expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();
    });

    it('navigates to the next step (content to quiz)', async () => {
      renderSprintPage();
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      
      await waitFor(() => {
        expect(screen.getByText(mockSprintData.steps[1].title)).toBeInTheDocument(); // Quiz title
        expect(screen.getByText(`Step 2 of ${mockSprintData.totalSteps}`)).toBeInTheDocument();
      });
      // Next button should now be "Check Answer" for a quiz step
      expect(screen.getByRole('button', { name: /Check Answer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous/i })).toBeEnabled();
    });

    it('navigates to the previous step (quiz to content)', async () => {
      renderSprintPage();
      // Navigate to step 2 first
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[1].title)).toBeInTheDocument());

      // Navigate back
      fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
      await waitFor(() => {
        expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument();
        expect(screen.getByText(`Step 1 of ${mockSprintData.totalSteps}`)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
    });
    
    it('"Check Answer" button transitions to "Next" after showing feedback', async () => {
      renderSprintPage();
      // Navigate to quiz step
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[1].question)).toBeInTheDocument());

      // Select an answer (any answer for this test)
      const optionToSelect = mockSprintData.steps[1].options[0];
      fireEvent.click(screen.getByText(optionToSelect));
      
      // Click "Check Answer"
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
      
      // Feedback should be visible, and button should now be "Next"
      await waitFor(() => expect(screen.getByText(/Not quite right/i)).toBeInTheDocument()); // Assuming first option is wrong
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });

    it('Next button is not rendered on the last step (completion step type)', async () => {
       const completionSprintData = {
        ...mockSprintData,
        steps: [
          mockSprintData.steps[0], // Content
          { // Completion step
            type: 'completion',
            title: 'Sprint Complete!',
            content: 'You have finished this sprint.',
            nextSprintTitle: 'Advanced Topics'
          }
        ],
        totalSteps: 2,
      };
      renderSprintPage('sprint-complete', completionSprintData);
      
      // Navigate to the completion step
      await waitFor(() => expect(screen.getByText(completionSprintData.steps[0].title)).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => expect(screen.getByText(completionSprintData.steps[1].title)).toBeInTheDocument());
      expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument(); // Assuming completion step has this
    });
  });

  describe('MCQ Interaction', () => {
    beforeEach(async () => {
      renderSprintPage();
      // Navigate to the quiz step
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[1].question)).toBeInTheDocument());
    });

    it('allows selecting an answer and updates UI accordingly', () => {
      const quizStep = mockSprintData.steps[1];
      const optionToSelect = screen.getByText(quizStep.options[0]);
      
      fireEvent.click(optionToSelect);
      
      // Check if the radio button itself is checked (or its container gets styled)
      // This depends on how selection is visually indicated.
      // For Chakra UI Radio, the input element itself will be checked.
      const radioInput = screen.getByLabelText(quizStep.options[0]); // Assuming label text matches option text
      expect(radioInput).toBeChecked();
    });

    it('shows correct feedback for a correct answer', async () => {
      const quizStep = mockSprintData.steps[1];
      const correctOptionText = quizStep.options[quizStep.correctAnswer];
      fireEvent.click(screen.getByText(correctOptionText));
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

      await waitFor(() => {
        expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
        expect(screen.getByText(quizStep.explanation)).toBeInTheDocument();
      });
      // Check for green styling (depends on how it's implemented, e.g., class or specific color)
      // For now, checking text is sufficient.
    });

    it('shows incorrect feedback and correct answer for an incorrect answer', async () => {
      const quizStep = mockSprintData.steps[1];
      const incorrectOptionIndex = quizStep.correctAnswer === 0 ? 1 : 0;
      const incorrectOptionText = quizStep.options[incorrectOptionIndex];
      
      fireEvent.click(screen.getByText(incorrectOptionText));
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

      await waitFor(() => {
        expect(screen.getByText(/Not quite right/i)).toBeInTheDocument();
        expect(screen.getByText(`The correct answer is: ${quizStep.options[quizStep.correctAnswer]}`)).toBeInTheDocument();
      });
    });
  });

  describe('Content Rendering', () => {
    it('renders a content step with title and markdown content', async () => {
      renderSprintPage();
      await waitFor(() => {
        expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument();
        expect(screen.getByTestId('markdown-mock')).toHaveTextContent(mockSprintData.steps[0].content);
      });
    });

    it('renders a quiz step with question and options', async () => {
      renderSprintPage();
      // Navigate to quiz step
      await waitFor(() => expect(screen.getByText(mockSprintData.steps[0].title)).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      
      await waitFor(() => {
        const quizStep = mockSprintData.steps[1];
        expect(screen.getByText(quizStep.question)).toBeInTheDocument();
        quizStep.options.forEach(option => {
          expect(screen.getByText(option)).toBeInTheDocument();
        });
      });
    });
  });
});
