import React from 'react';

export const useAuth = jest.fn(() => ({
  user: { id: 'test-user-id', user_metadata: { full_name: 'Test User', avatar_url: '' } },
  loading: false,
  isAuthenticated: true,
}));
