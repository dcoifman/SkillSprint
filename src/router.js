import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout.js';
import HomePage from './pages/HomePage.js';
import DashboardPage from './pages/DashboardPage.js';
import SprintPage from './pages/SprintPage.js';
import ProfilePage from './pages/ProfilePage.js';
import InstructorProfilePage from './pages/InstructorProfilePage.js';
import NotFoundPage from './pages/NotFoundPage.js';
import ExplorePathsPage from './pages/ExplorePathsPage.js';
import { LoginPage, SignupPage } from './pages/AuthPages.js';
import PathDetailPage from './pages/PathDetailPage.js';
import CourseBuilderPage from './pages/CourseBuilderPage.js';
import CommunityPage from './pages/CommunityPage.js';
import CourseGenerationPage from './pages/CourseGenerationPage.js';
import HowItWorksPage from './pages/HowItWorksPage.js';
import UnifiedCourseDashboard from './pages/UnifiedCourseDashboard.js';
import InstructorDashboardPage from './pages/InstructorDashboardPage.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/sprint/:sprintId" element={<ProtectedRoute><SprintPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/instructor-profile" element={<ProtectedRoute><InstructorProfilePage /></ProtectedRoute>} />
      <Route path="/explore" element={<ExplorePathsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/path/:pathId" element={<PathDetailPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/course-builder" element={<ProtectedRoute><UnifiedCourseDashboard /></ProtectedRoute>} />
      <Route path="/course-generation" element={<ProtectedRoute><CourseGenerationPage /></ProtectedRoute>} />
      <Route path="/course-builder/new" element={<ProtectedRoute><CourseBuilderPage /></ProtectedRoute>} />
      <Route path="/instructor-dashboard" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
      <Route path="/instructor-dashboard/:pathId" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
); 