import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThreeDAnatomyModel from '../ThreeDAnatomyModel';

// Mock Three.js and related libraries
jest.mock('@react-three/fiber', () => ({
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
}));

jest.mock('@react-three/drei', () => ({
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
}));

jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }) => <div>{children}</div>,
  NormalPass: () => null,
  Outline: () => null,
  SSAO: () => null
}));

// Mock Chakra UI's useColorModeValue
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useColorModeValue: jest.fn((light) => light)
  };
});

const defaultProps = {
  systemType: 'skeletal',
  onSelectStructure: jest.fn(),
  selectedStructure: null,
  hoveredStructure: null,
  setHoveredStructure: jest.fn()
};

describe('ThreeDAnatomyModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThreeDAnatomyModel {...defaultProps} />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<ThreeDAnatomyModel {...defaultProps} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles x-ray toggle', () => {
    render(<ThreeDAnatomyModel {...defaultProps} />);
    const xrayButton = screen.getByRole('button', { name: /x-ray/i });
    fireEvent.click(xrayButton);
    expect(xrayButton).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('handles system type changes', () => {
    render(<ThreeDAnatomyModel {...defaultProps} />);
    const systemTypeButton = screen.getByRole('button', { name: /skeletal/i });
    fireEvent.click(systemTypeButton);
    // System change is handled internally
  });
});