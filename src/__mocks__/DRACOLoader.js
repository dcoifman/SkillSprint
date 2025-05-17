class DRACOLoader {
  constructor() {
    this.setDecoderPath = jest.fn();
    this.setDecoderConfig = jest.fn();
    this.preload = jest.fn();
  }
}

module.exports = { DRACOLoader }; 