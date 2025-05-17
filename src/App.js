import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Import page components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SprintPage from './pages/SprintPage';
import ProfilePage from './pages/ProfilePage';
import InstructorProfilePage from './pages/InstructorProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ExplorePathsPage from './pages/ExplorePathsPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import PathDetailPage from './pages/PathDetailPage';
import CourseBuilderPage from './pages/CourseBuilderPage';
import CommunityPage from './pages/CommunityPage';
import CourseGenerationPage from './pages/CourseGenerationPage';
import HowItWorksPage from './pages/HowItWorksPage';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Import Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Consider using a better loading component
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const theme = extendTheme({});

function AppRoutes() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1" as="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/sprint/:sprintId" element={
            <ProtectedRoute>
              <SprintPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/instructor-profile" element={
            <ProtectedRoute>
              <InstructorProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={<ExplorePathsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/path/:pathId" element={<PathDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/course-builder" element={
            <ProtectedRoute>
              <CourseBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/course-generation" element={
            <ProtectedRoute>
              <CourseGenerationPage />
            </ProtectedRoute>
          } />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
        <AppRoutes />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 