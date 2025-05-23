const supabaseClient = {
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(), // This will be mocked per test using .mockResolvedValueOnce typically
    // Add other chainable methods if used by SprintPage
  },
  // Mock direct utility functions if SprintPage uses them (fetchPathDetail is not used by SprintPage)
  // fetchPathDetail: jest.fn(), 
  // enrollUserInPath: jest.fn(),
};

export default supabaseClient;

// Re-exporting 'supabase' for direct import if used like: import { supabase } from ...
// However, SprintPage seems to import the default export: import supabaseClient from ...
// If it were `import { supabase } from ...`, we'd do:
// export const supabase = supabaseClient.supabase;
// For now, the default export is sufficient.
