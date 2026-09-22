const { suggestCategory } = require('../src/services/smartCategorization.service');

describe('Smart Categorization Service', () => {
  it('should suggest Food for Swiggy with high confidence', async () => {
    const res = await suggestCategory(null, 'Swiggy order');
    expect(res.category).toBe('Food');
    expect(res.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should suggest Transportation for Uber', async () => {
    const res = await suggestCategory(null, 'Uber ride to office');
    expect(res.category).toBe('Transportation');
    expect(res.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should suggest Subscriptions for Netflix', async () => {
    const res = await suggestCategory(null, 'Netflix monthly subscription');
    expect(res.category).toBe('Entertainment'); // or Subscriptions depending on priority
    expect(res.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should return Other for unknown description with low confidence', async () => {
    const res = await suggestCategory(null, 'Random unknown text xyz');
    expect(res.category).toBe('Other');
    expect(res.confidence).toBeLessThan(0.5);
  });
});
