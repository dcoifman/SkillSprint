const ReactThreePostprocessing = {
  EffectComposer: ({ children }) => <div data-testid="effects-mock">{children}</div>,
  Bloom: () => null,
  SSAO: () => null,
  Outline: () => null,
  Selection: () => null,
  Noise: () => null,
  Vignette: () => null,
  ToneMapping: () => null
};

module.exports = ReactThreePostprocessing; 