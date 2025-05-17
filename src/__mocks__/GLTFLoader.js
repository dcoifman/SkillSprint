class GLTFLoader {
  constructor() {
    this.setDRACOLoader = jest.fn();
    this.load = jest.fn((url, onLoad) => {
      onLoad({
        scene: {
          traverse: jest.fn(),
          scale: { set: jest.fn() },
          position: { set: jest.fn() },
          rotation: { set: jest.fn() }
        },
        animations: []
      });
    });
  }
}

module.exports = { GLTFLoader }; 