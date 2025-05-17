const THREE = {
  ColorManagement: { enabled: false },
  Color: jest.fn(() => ({
    set: jest.fn(),
    multiplyScalar: jest.fn(),
    convertSRGBToLinear: jest.fn()
  })),
  MeshStandardMaterial: jest.fn(() => ({
    clone: jest.fn(),
    dispose: jest.fn()
  })),
  Vector3: jest.fn(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
    multiplyScalar: jest.fn()
  })),
  Euler: jest.fn(() => ({
    set: jest.fn()
  })),
  Box3: jest.fn(() => ({
    setFromObject: jest.fn(),
    getCenter: jest.fn(),
    getSize: jest.fn()
  })),
  PlaneGeometry: jest.fn((width, height) => ({
    width,
    height,
    dispose: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
  })),
  PlaneBufferGeometry: jest.fn(() => ({
    dispose: jest.fn()
  })),
  MeshBasicMaterial: jest.fn(() => ({
    dispose: jest.fn()
  })),
  MeshPhongMaterial: jest.fn(() => ({
    dispose: jest.fn()
  })),
  SRGBColorSpace: 'srgb',
  LinearSRGBColorSpace: 'srgb-linear',
  ACESFilmicToneMapping: 'aces',
  sRGBEncoding: 'srgb',
  NoToneMapping: 'none'
};

module.exports = THREE; 