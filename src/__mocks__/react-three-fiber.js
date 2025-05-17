const ReactThreeFiber = {
  Canvas: ({ children }) => (
    <div data-testid="canvas-mock">
      <div data-testid="canvas-content">
        {children}
      </div>
    </div>
  ),
  useThree: () => ({
    camera: { position: { set: jest.fn() }, lookAt: jest.fn() },
    gl: { domElement: { addEventListener: jest.fn(), removeEventListener: jest.fn() } }
  }),
  useFrame: jest.fn()
};

module.exports = ReactThreeFiber; 