import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractiveAnatomyModel from '../InteractiveAnatomyModel';

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
  initialView: 'anterior',
  onSelectStructure: jest.fn(),
  selectedStructure: null,
  hoveredStructure: null,
  setHoveredStructure: jest.fn(),
  showControls: true
};

describe('InteractiveAnatomyModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByTestId('view-control-anterior')).toBeInTheDocument();
  });

  it('shows system type in heading', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Skeletal System' })).toBeInTheDocument();
  });

  it('shows view controls by default', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByTestId('view-control-anterior')).toBeInTheDocument();
    expect(screen.getByTestId('view-control-posterior')).toBeInTheDocument();
  });

  it('hides view controls when disabled', () => {
    render(<InteractiveAnatomyModel {...defaultProps} showControls={false} />);
    expect(screen.queryByTestId('view-control-anterior')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-control-posterior')).not.toBeInTheDocument();
  });

  it('shows zoom controls', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });

  it('shows labels toggle button', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Hide Labels' })).toBeInTheDocument();
  });

  it('shows reset view button', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument();
  });

  it('handles view changes', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    const posteriorButton = screen.getByTestId('view-control-posterior');
    fireEvent.click(posteriorButton);
    expect(posteriorButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles system type changes', () => {
    render(<InteractiveAnatomyModel {...defaultProps} />);
    const systemButton = screen.getByRole('button', { name: /skeletal/i });
    fireEvent.click(systemButton);
    // System change is handled internally
  });
}); 