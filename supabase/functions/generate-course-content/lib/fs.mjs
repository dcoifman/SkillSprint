// Stub implementation for fs.readFileSync to satisfy Gemini API client
export const readFileSync = (p, e = "utf-8") => {
  console.log(`Stub: Called readFileSync with path: ${p}, encoding: ${e}`);
  return p;
};

// Add other fs functions that might be needed
export const promises = {
  readFile: async (path) => {
    console.log(`Stub: Called promises.readFile with path: ${path}`);
    return path;
  }
};

// Stub any other filesystem functions if needed
export const existsSync = () => false;
export const statSync = () => ({ isFile: () => true }); 