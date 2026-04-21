import { describe, it, expect } from 'vitest';
import { calculatePropertyCosts } from './costCalculators';

describe('calculatePropertyCosts', () => {
  it('calculates zero transfer duty for property under 1.1M', () => {
    const costs = calculatePropertyCosts(1000000, 0);
    expect(costs.transferDuty).toBe(0);
  });

  it('calculates transfer duty correctly for the second tier (up to 1,512,500)', () => {
    // (1,500,000 - 1,100,000) * 3% = 400,000 * 0.03 = 12,000
    const costs = calculatePropertyCosts(1500000, 0);
    expect(costs.transferDuty).toBe(12000);
  });

  it('calculates transfer duty correctly for the third tier (up to 2,117,500)', () => {
    // 12,375 + (2,000,000 - 1,512,500) * 6% = 12,375 + 487,500 * 0.06 = 12,375 + 29,250 = 41,625
    const costs = calculatePropertyCosts(2000000, 0);
    expect(costs.transferDuty).toBe(41625);
  });

  it('calculates bond registration fees based on bond amount', () => {
    const costsLow = calculatePropertyCosts(2000000, 500000);
    expect(costsLow.bondRegistrationFees).toBe(10000);

    const costsHigh = calculatePropertyCosts(2000000, 2500000);
    expect(costsHigh.bondRegistrationFees).toBe(35000);
  });

  it('calculates VAT on fees correctly (15%)', () => {
    const costs = calculatePropertyCosts(1000000, 1000000);
    // conveyancing (1M) = 18000, bond (1M) = 15000. Total fees = 33000.
    // VAT = 33000 * 0.15 = 4950
    expect(costs.vatOnFees).toBe(4950);
  });
});
