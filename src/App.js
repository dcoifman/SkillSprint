import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

// Import page components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SprintPage from './pages/SprintPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ExplorePathsPage from './pages/ExplorePathsPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import PathDetailPage from './pages/PathDetailPage';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header />
        <Box flex="1" as="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sprint/:sprintId" element={<SprintPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<ExplorePathsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/paths/:pathId" element={<PathDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App; 