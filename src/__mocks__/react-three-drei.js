const Drei = {
  OrbitControls: () => null,
  useGLTF: () => ({
    scene: {
      scale: { set: jest.fn() },
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      traverse: jest.fn()
    }
  }),
  Environment: () => null,
  Html: ({ children }) => <div>{children}</div>,
  Bounds: ({ children }) => <div>{children}</div>,
  PerspectiveCamera: () => null,
  AccumulativeShadows: () => null,
  RandomizedLight: () => null,
  BakeShadows: () => null,
  MeshReflectorMaterial: () => null,
  SpotLight: () => null,
  PerformanceMonitor: () => null,
  Selection: ({ children }) => <div data-testid="selection-mock">{children}</div>
};

module.exports = Drei;