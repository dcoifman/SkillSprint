const { toMatchImageSnapshot } = require('jest-image-snapshot');

module.exports = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postRender(page, context) {
    // Add any custom waiting logic here
    await page.waitForTimeout(1000); // Wait for animations to complete
    
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: '__snapshots__',
      customDiffDir: '__diff__',
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  },
}; 