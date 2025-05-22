import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PathDetailPage from '../PathDetailPage'; // Adjust path as necessary
import { useAuth } from '../../contexts/AuthContext'; // Mocked version
import { fetchPathDetail, enrollUserInPath } from '../../services/supabaseClient'; // Mocked version
import { useToast } from '@chakra-ui/react';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock Chakra UI hooks
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: jest.fn(),
}));

// Mock services
jest.mock('../../services/supabaseClient', () => ({
  fetchPathDetail: jest.fn(),
  enrollUserInPath: jest.fn(),
}));

// Default mock for useAuth
const mockUseAuth = useAuth;

const mockPathDetailBase = {
  id: 'path-123',
  title: 'Test Learning Path',
  description: 'A detailed description of the test learning path.',
  category: 'Technology',
  level: 'Intermediate',
  image: '/path-images/test-path.jpg',
  rating: 4.5,
  review_count: 150,
  estimated_time: '6 hours',
  total_sprints: 10,
  tags: ['React', 'JavaScript', 'Web Development'],
  instructor: {
    name: 'Dr. Test Instructor',
    avatar_url: 'https://via.placeholder.com/150/000000/FFFFFF?Text=TI',
    title: 'Lead Educator',
    bio: 'An expert in testing and education.',
  },
  objectives: ['Objective 1', 'Objective 2', 'Objective 3'],
  prerequisites: ['Basic HTML', 'Basic CSS'],
  modules: [
    {
      title: 'Module 1: Introduction',
      description: 'Overview of the module.',
      sprints: [
        { id: 'sprint-1', title: 'Sprint 1.1: Basics', time: '10', isUnlocked: true, isCompleted: true },
        { id: 'sprint-2', title: 'Sprint 1.2: Advanced', time: '15', isUnlocked: true, isCompleted: false },
      ],
    },
    {
      title: 'Module 2: Core Concepts',
      description: 'Diving into the core.',
      sprints: [
        { id: 'sprint-3', title: 'Sprint 2.1: Key Ideas', time: '20', isUnlocked: false, isCompleted: false },
      ],
    },
  ],
  // Progress related fields (will be overridden in tests)
  completedSprints: 0, 
  // relatedPaths: [], // Can add if testing this section
  // students_count: 1000, // Can add if testing this
};


const renderPathDetailPage = (pathId = 'path-123', authState = { isAuthenticated: true, user: { id: 'user-abc' } }, pathData, enrollmentData) => {
  useParams.mockReturnValue({ pathId });
  const navigateMock = jest.fn();
  useNavigate.mockReturnValue(navigateMock);
  const toastMock = jest.fn();
  useToast.mockReturnValue(toastMock);
  mockUseAuth.mockReturnValue(authState);

  if (pathData === 'error') {
    fetchPathDetail.mockRejectedValueOnce(new Error('Failed to fetch path details'));
  } else {
    fetchPathDetail.mockResolvedValueOnce({ data: pathData, error: null });
  }
  
  enrollUserInPath.mockResolvedValue(enrollmentData || { error: null }); // Default successful enrollment


  return render(
    <MemoryRouter initialEntries={[`/paths/${pathId}`]}>
      <Routes>
        <Route path="/paths/:pathId" element={<PathDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};


describe('PathDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering States', () => {
    it('renders loading state initially', () => {
      fetchPathDetail.mockImplementation(() => new Promise(() => {})); // Promise that never resolves
      renderPathDetailPage('path-123', { isAuthenticated: true, user: { id: 'user-abc' } }, undefined);
      expect(screen.getByText(/Loading path details.../i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Chakra Spinner has role="status"
    });

    it('renders path details when data is successfully fetched', async () => {
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, mockPathDetailBase);
      
      await waitFor(() => {
        expect(screen.getByText(mockPathDetailBase.title)).toBeInTheDocument();
      });
      expect(screen.getByText(mockPathDetailBase.description)).toBeInTheDocument();
      expect(screen.getByText(mockPathDetailBase.category)).toBeInTheDocument();
      expect(screen.getByText(mockPathDetailBase.level)).toBeInTheDocument();
      expect(screen.getByAltText(mockPathDetailBase.title)).toHaveAttribute('src', mockPathDetailBase.image); // Check image src
    });

    it('displays an error message if data fetching fails', async () => {
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, 'error');
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load path details/i)).toBeInTheDocument();
      });
    });

    it('displays a "Path Not Found" message if path data is null', async () => {
      renderPathDetailPage('path-not-found', { isAuthenticated: true, user: {id: 'user-abc'} }, null);
      
      await waitFor(() => {
        expect(screen.getByText(/Path Not Found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Module and Sprint Display', () => {
    beforeEach(async () => {
      // Ensure page is rendered with data before each test in this suite
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, mockPathDetailBase);
      await waitFor(() => expect(screen.getByText(mockPathDetailBase.title)).toBeInTheDocument());
    });

    it('displays module titles within accordion headers', () => {
      mockPathDetailBase.modules.forEach(module => {
        expect(screen.getByText(module.title)).toBeInTheDocument();
      });
    });

    it('displays sprint titles, times, and icons correctly', async () => {
      // Accordions might be closed by default, open them
      const firstModuleButton = screen.getByText(mockPathDetailBase.modules[0].title);
      fireEvent.click(firstModuleButton);

      await waitFor(() => {
        const sprint1 = mockPathDetailBase.modules[0].sprints[0]; // Completed
        const sprint2 = mockPathDetailBase.modules[0].sprints[1]; // Unlocked, not completed (Next Up)
        
        expect(screen.getByText(sprint1.title)).toBeInTheDocument();
        expect(screen.getAllByText(new RegExp(sprint1.time))[0]).toBeInTheDocument(); // Using getAllByText due to potential duplication
        expect(screen.getByText(sprint1.title).closest('div').querySelector('svg[data-icon="check-circle"]')).toBeInTheDocument(); // Check for CheckCircleIcon


        expect(screen.getByText(sprint2.title)).toBeInTheDocument();
        expect(screen.getAllByText(new RegExp(sprint2.time))[0]).toBeInTheDocument();
        // Check for TimeIcon or a specific "next up" indicator if available
        // The original code uses a generic SVG path for "unlocked but not completed"
        // For simplicity, we'll check if it's not lock or check
        const sprint2IconContainer = screen.getByText(sprint2.title).closest('div');
        expect(sprint2IconContainer.querySelector('svg[data-icon="lock"]')).not.toBeInTheDocument();
        expect(sprint2IconContainer.querySelector('svg[data-icon="check-circle"]')).not.toBeInTheDocument();

      });
      
      // Check a locked sprint in another module
      const secondModuleButton = screen.getByText(mockPathDetailBase.modules[1].title);
      // Close first, open second if they are exclusive, or just open second
      // fireEvent.click(firstModuleButton); // If accordions are exclusive
      fireEvent.click(secondModuleButton);

      await waitFor(() => {
        const sprint3 = mockPathDetailBase.modules[1].sprints[0]; // Locked
        expect(screen.getByText(sprint3.title)).toBeInTheDocument();
        expect(screen.getAllByText(new RegExp(sprint3.time))[0]).toBeInTheDocument();
        expect(screen.getByText(sprint3.title).closest('div').querySelector('svg[data-icon="lock"]')).toBeInTheDocument(); // Check for LockIcon
      });
    });

    it('renders "Review" button for completed sprints and "Start" for unlocked, non-completed', async () => {
      const firstModuleButton = screen.getByText(mockPathDetailBase.modules[0].title);
      fireEvent.click(firstModuleButton);

      await waitFor(() => {
        const sprint1Title = mockPathDetailBase.modules[0].sprints[0].title;
        const sprint2Title = mockPathDetailBase.modules[0].sprints[1].title;

        const reviewButton = screen.getByText(sprint1Title).closest('div').querySelector('button');
        expect(reviewButton).toHaveTextContent('Review');
        expect(reviewButton.closest('a')).toHaveAttribute('href', `/sprint/${mockPathDetailBase.modules[0].sprints[0].id}`);
        
        const startButton = screen.getByText(sprint2Title).closest('div').querySelector('button');
        expect(startButton).toHaveTextContent('Start');
        expect(startButton.closest('a')).toHaveAttribute('href', `/sprint/${mockPathDetailBase.modules[0].sprints[1].id}`);
      });
    });
  });

  describe('Enrollment and Progress', () => {
    it('shows "Enroll Now" button if user is not enrolled (progress is 0 or path has no completedSprints field)', async () => {
      const notEnrolledData = { ...mockPathDetailBase, completedSprints: 0 }; // Explicitly 0 for clarity
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, notEnrolledData);
      await waitFor(() => expect(screen.getByText(notEnrolledData.title)).toBeInTheDocument());
      expect(screen.getByRole('button', { name: /Enroll Now/i })).toBeInTheDocument();
    });

    it('calls enrollUserInPath on "Enroll Now" click and shows toast on success', async () => {
      const notEnrolledData = { ...mockPathDetailBase, completedSprints: 0 };
      const enrollmentSuccessData = { error: null };
      enrollUserInPath.mockResolvedValueOnce(enrollmentSuccessData);
      // Mock fetchPathDetail again for the refresh call after enrollment
      fetchPathDetail.mockResolvedValueOnce({ data: { ...notEnrolledData, completedSprints: 1, total_sprints: 10 }, error: null });


      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, notEnrolledData, enrollmentSuccessData);
      await waitFor(() => expect(screen.getByText(notEnrolledData.title)).toBeInTheDocument());
      
      const enrollButton = screen.getByRole('button', { name: /Enroll Now/i });
      fireEvent.click(enrollButton);

      await waitFor(() => expect(enrollUserInPath).toHaveBeenCalledWith('path-123'));
      await waitFor(() => expect(useToast().mock.calls[0][0]).toMatchObject({ status: 'success', title: 'Successfully enrolled' }));
      // Also check if UI updates to show progress (e.g., "Continue Learning" button)
      await waitFor(() => expect(screen.getByRole('button', { name: /Continue Learning/i})).toBeInTheDocument());
    });
    
    it('shows login redirect toast if unauthenticated user tries to enroll', async () => {
      const notEnrolledData = { ...mockPathDetailBase, completedSprints: 0 };
      renderPathDetailPage('path-123', { isAuthenticated: false, user: null }, notEnrolledData); // Unauthenticated user
      await waitFor(() => expect(screen.getByText(notEnrolledData.title)).toBeInTheDocument());
      
      const enrollButton = screen.getByRole('button', { name: /Enroll Now/i });
      fireEvent.click(enrollButton);

      await waitFor(() => expect(useToast().mock.calls[0][0]).toMatchObject({ status: 'info', title: 'Login required' }));
      expect(useNavigate().mock.calls[0][0]).toBe('/login?redirect=/paths/path-123');
    });

    it('displays progress bar and "Continue Learning" button if user is enrolled and has progress', async () => {
      const enrolledData = { ...mockPathDetailBase, completedSprints: 5, total_sprints: 10 }; // User has made progress
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, enrolledData);
      
      await waitFor(() => expect(screen.getByText(enrolledData.title)).toBeInTheDocument());
      
      expect(screen.getByText(/50% complete/i)).toBeInTheDocument(); // 5/10 sprints
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      const continueButton = screen.getByRole('button', { name: /Continue Learning/i });
      expect(continueButton).toBeInTheDocument();
      // Assuming the first module and sprint is where they'd continue if no specific next sprint is defined
      expect(continueButton.closest('a')).toHaveAttribute('href', `/sprint/${mockPathDetailBase.modules[0].sprints[0].id}`);
    });
  });

  describe('Display of Other Information', () => {
     beforeEach(async () => {
      renderPathDetailPage('path-123', { isAuthenticated: true, user: {id: 'user-abc'} }, mockPathDetailBase);
      await waitFor(() => expect(screen.getByText(mockPathDetailBase.title)).toBeInTheDocument());
    });

    it('renders learning objectives', () => {
      expect(screen.getByText(/What You'll Learn/i)).toBeInTheDocument();
      mockPathDetailBase.objectives.forEach(obj => {
        expect(screen.getByText(obj)).toBeInTheDocument();
      });
    });

    it('renders prerequisites', () => {
      expect(screen.getByText(/Prerequisites/i)).toBeInTheDocument();
      mockPathDetailBase.prerequisites.forEach(req => {
        expect(screen.getByText(req)).toBeInTheDocument();
      });
    });

    it('renders instructor details if present', () => {
      expect(screen.getByText(/About the Instructor/i)).toBeInTheDocument();
      expect(screen.getByText(mockPathDetailBase.instructor.name)).toBeInTheDocument();
      expect(screen.getByText(mockPathDetailBase.instructor.title)).toBeInTheDocument();
      expect(screen.getByText(mockPathDetailBase.instructor.bio)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: mockPathDetailBase.instructor.name })).toHaveAttribute('src', mockPathDetailBase.instructor.avatar_url);
    });
  });
});
