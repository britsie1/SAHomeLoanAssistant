import { describe, it, expect } from 'vitest';
import { addMonths } from 'date-fns';
import { calculateLoanSchedule, calculateMonthlyPayment, calculateTargetExtraPayment } from './loanMath';
import type { LoanInputs, Scenario } from './loanMath';

describe('loanMath', () => {
  describe('calculateMonthlyPayment', () => {
    it('calculates standard mortgage payment correctly', () => {
      // R1M at 12% for 20 years (240 months)
      // PMT = 1000000 * (0.01 * (1.01)^240) / ((1.01)^240 - 1)
      // Expected: ~11010.86
      const pmt = calculateMonthlyPayment(1000000, 12, 240);
      expect(pmt).toBeCloseTo(11010.86, 1);
    });

    it('handles zero interest rate', () => {
      const pmt = calculateMonthlyPayment(1000000, 0, 200);
      expect(pmt).toBe(5000);
    });
  });

  describe('calculateLoanSchedule', () => {
    const defaultInputs: LoanInputs = {
      loanAmount: 1000000,
      currentOutstanding: 1000000,
      interestRate: 12,
      interestRateHike: 0,
      remainingTermYears: 20,
      remainingTermMonths: 0,
      startDate: new Date(2024, 0, 1),
      interestMethod: 'Monthly'
    };

    const baselineScenario: Scenario = {
      id: 'baseline',
      name: 'Baseline',
      lumpSums: [],
      extraMonthlyPayment: 0
    };

    it('reaches zero balance at the end of the term in baseline scenario', () => {
      const result = calculateLoanSchedule(defaultInputs, baselineScenario);
      expect(result.totalMonths).toBe(240);
      const lastEntry = result.schedule[result.schedule.length - 1];
      expect(lastEntry.closingBalance).toBeLessThan(0.01);
    });

    it('reduces term significantly with extra monthly payments', () => {
      const extraScenario: Scenario = {
        ...baselineScenario,
        extraMonthlyPayment: 2000
      };
      const result = calculateLoanSchedule(defaultInputs, extraScenario);
      // R13010 instead of R11010 should save several years
      expect(result.totalMonths).toBeLessThan(240);
      expect(result.totalMonths).toBeLessThan(180); // Quick estimate
    });

    it('applies annual increments to extra payments correctly', () => {
      const incrementScenario: Scenario = {
        ...baselineScenario,
        extraMonthlyPayment: 1000,
        annualExtraIncrement: 10 // 10% increase every year
      };
      const result = calculateLoanSchedule(defaultInputs, incrementScenario);
      
      // Check year 1 (month 0-11)
      expect(result.schedule[0].extraPayment).toBe(1000);
      expect(result.schedule[11].extraPayment).toBe(1000);
      
      // Check year 2 (month 12)
      expect(result.schedule[12].extraPayment).toBe(1100);
    });

    it('identifies the tipping point correctly', () => {
      const result = calculateLoanSchedule(defaultInputs, baselineScenario);
      // In a 20yr 12% loan, the tipping point is usually around month 130-150
      expect(result.tippingPointMonth).not.toBeNull();
      const tpIndex = result.tippingPointMonth!;
      expect(result.schedule[tpIndex].principal).toBeGreaterThan(result.schedule[tpIndex].interest);
      if (tpIndex > 0) {
        expect(result.schedule[tpIndex - 1].principal).toBeLessThanOrEqual(result.schedule[tpIndex - 1].interest);
      }
    });

    describe('Access Bond Logic', () => {
      const accessInputs: LoanInputs = {
        ...defaultInputs,
        isAccessBond: true
      };

      it('applies savings as month 0 lump sum', () => {
        const scenario: Scenario = {
          ...baselineScenario,
          savings: 100000
        };
        const result = calculateLoanSchedule(accessInputs, scenario);
        
        // Month 0 extra payment should include the R100k savings
        expect(result.schedule[0].extraPayment).toBe(100000);
        expect(result.schedule[0].closingBalance).toBeLessThan(defaultInputs.currentOutstanding - 100000);
      });

      it('applies unspent salary as extra monthly payment', () => {
        const scenario: Scenario = {
          ...baselineScenario,
          salaryAmount: 50000,
          salarySpent: 40000
        };
        const result = calculateLoanSchedule(accessInputs, scenario);
        
        // Every month should have R10k extra payment (unspent)
        expect(result.schedule[0].extraPayment).toBe(10000);
        expect(result.schedule[12].extraPayment).toBe(10000);
      });

      it('reduces interest via the salary offset', () => {
        // Standard interest on R1M at 12% monthly is R10,000
        const normalResult = calculateLoanSchedule(defaultInputs, baselineScenario);
        const normalInterest = normalResult.schedule[0].interest;
        
        const scenario: Scenario = {
          ...baselineScenario,
          salaryAmount: 50000,
          salarySpent: 50000 // Fully spent, so NO unspent extra payment
        };
        const accessResult = calculateLoanSchedule(accessInputs, scenario);
        const accessInterest = accessResult.schedule[0].interest;
        
        // With R50k salary spent throughout the month, average offset is R25k.
        // Interest should be on R975,000 instead of R1,000,000.
        // R975k * 1% = R9,750
        expect(accessInterest).toBeLessThan(normalInterest);
        expect(accessInterest).toBeCloseTo(9750, 1);
        
        // Verify unspent was 0
        expect(accessResult.schedule[0].extraPayment).toBe(0);
      });

      it('combines all access bond features correctly', () => {
        const scenario: Scenario = {
          ...baselineScenario,
          savings: 100000,      // Lump sum AND persistent offset
          salaryAmount: 50000,   // + R10k unspent
          salarySpent: 40000     // Offset benefit of salary is R50k - (R40k/2) = R30k
        };
        const result = calculateLoanSchedule(accessInputs, scenario);
        
        // Month 0 extra: R100k (savings) + R10k (unspent) = R110k
        expect(result.schedule[0].extraPayment).toBe(110000);
        
        // Interest should be on R1M - (R100k savings + R30k salary effect) = R870,000
        // R870k * 1% = R8,700
        expect(result.schedule[0].interest).toBeCloseTo(8700, 1);
      });
    });

    describe('Savings Comparison', () => {
      it('calculates total interest saved correctly', () => {
        const baseline = calculateLoanSchedule(defaultInputs, baselineScenario);
        const extraScenario: Scenario = {
          ...baselineScenario,
          extraMonthlyPayment: 5000
        };
        const scenarioResult = calculateLoanSchedule(defaultInputs, extraScenario);
        
        const interestSaved = baseline.totalInterest - scenarioResult.totalInterest;
        
        // At the end of the scenario, the balance difference is NOT the interest saved
        const lastMonth = scenarioResult.schedule.length - 1;
        const balanceDiff = baseline.schedule[lastMonth].closingBalance - scenarioResult.schedule[lastMonth].closingBalance;
        
        expect(interestSaved).toBeGreaterThan(0);
        expect(interestSaved).toBeGreaterThan(balanceDiff); 
        // Interest Saved is the TOTAL benefit over the life of the loan.
        // balanceDiff is just the remaining baseline debt at the moment the scenario ends.
      });

      it('confirms that interest saved INCREASES when interest rates rise (The Savings Paradox)', () => {
        const extraPayment = 2000;
        const scenario: Scenario = { ...baselineScenario, extraMonthlyPayment: extraPayment };

        // Scenario at 10%
        const inputs10 = { ...defaultInputs, interestRate: 10 };
        const baseline10 = calculateLoanSchedule(inputs10, baselineScenario);
        const result10 = calculateLoanSchedule(inputs10, scenario);
        const savedAt10 = baseline10.totalInterest - result10.totalInterest;

        // Scenario at 15%
        const inputs15 = { ...defaultInputs, interestRate: 15 };
        const baseline15 = calculateLoanSchedule(inputs15, baselineScenario);
        const result15 = calculateLoanSchedule(inputs15, scenario);
        const savedAt15 = baseline15.totalInterest - result15.totalInterest;

        // Mathematically, R2000 extra saves MORE interest at 15% than at 10%
        expect(savedAt15).toBeGreaterThan(savedAt10);
      });
    });

    describe('South African Specific Precision', () => {
      it('handles Leap Year daily accrual correctly (365-day divisor)', () => {
        const leapYearInputs: LoanInputs = {
          ...defaultInputs,
          startDate: new Date(2024, 1, 1), // Feb 2024
          interestMethod: 'Daily',
          interestRate: 12
        };
        const result = calculateLoanSchedule(leapYearInputs, baselineScenario);
        
        // Feb 2024 has 29 days. 
        // Interest = Principal * (0.12 * 29 / 365)
        // R1M * (0.12 * 29 / 365) = 9534.246...
        expect(result.schedule[0].interest).toBeCloseTo(9534.25, 1);
      });

      it('calculates decreasing term assurance correctly', () => {
        const assuranceInputs: LoanInputs = {
          ...defaultInputs,
          monthlyAssurance: 1000, // R1000 at R1M balance
          currentOutstanding: 1000000
        };
        const result = calculateLoanSchedule(assuranceInputs, baselineScenario);
        
        // First month: R1000
        expect(result.schedule[0].openingBalance).toBe(1000000);
        // Middle of loan: Should be roughly half
        const midPoint = Math.floor(result.totalMonths / 2);
        const midBalance = result.schedule[midPoint].openingBalance;
        const midAssurance = (midBalance / 1000000) * 1000;
        
        // We can't easily check totalAssurance without summing, but we can check the logic trend
        expect(result.totalAssurance).toBeLessThan(result.totalMonths * 1000);
        expect(result.totalAssurance).toBeGreaterThan(result.totalMonths * 100); // Should be a significant amount
      });

      it('treats fixedMonthlyPayment as GROSS (inclusive of fees and insurance)', () => {
        const grossInputs: LoanInputs = {
          ...defaultInputs,
          monthlyServiceFee: 100,
          monthlyInsurance: 400,
          monthlyAssurance: 500 // Total fees = R1000 at R1M balance
        };
        
        // Set fixed payment to R15,000
        const fixedScenario: Scenario = {
          ...baselineScenario,
          fixedMonthlyPayment: 15000
        };
        
        const result = calculateLoanSchedule(grossInputs, fixedScenario);
        
        // In the first month:
        // Gross Payment = 15000
        // Fees = 100 + 400 + 500 = 1000
        // Net Payment to Loan = 14000
        // Interest (1% of R1M) = 10000
        // Principal = 14000 - 10000 = 4000
        expect(result.schedule[0].payment).toBe(14000);
        expect(result.schedule[0].principal).toBe(4000);
      });

      it('extends the term when interest rates rise but installment is fixed', () => {
        // Baseline: R1M, 12%, 240 months => PMT ~11011
        const initialResult = calculateLoanSchedule(defaultInputs, baselineScenario);
        const initialPayment = initialResult.schedule[0].payment;

        // Rate hike to 15%
        const hikedInputs = { ...defaultInputs, interestRate: 15 };
        
        // If we let the bank recalculate, payment would go to ~13167
        // But if we FORCE a fixed payment of the old 11011:
        const fixedScenario: Scenario = {
          ...baselineScenario,
          fixedMonthlyPayment: initialPayment
        };
        
        const result = calculateLoanSchedule(hikedInputs, fixedScenario);
        
        // The loan should take much longer than 240 months
        expect(result.totalMonths).toBeGreaterThan(240);
        // At 15%, R11011 is barely enough to cover interest (R12500), 
        // so this loan would actually never be paid off (hit safety break)
        expect(result.totalMonths).toBe(12 * 50); // Max months safety break
      });
    });
  });

  describe('calculateTargetExtraPayment', () => {
    const defaultInputs: LoanInputs = {
      loanAmount: 1000000,
      currentOutstanding: 1000000,
      interestRate: 12,
      interestRateHike: 0,
      remainingTermYears: 20,
      remainingTermMonths: 0,
      startDate: new Date(2024, 0, 1),
      interestMethod: 'Monthly'
    };

    const baseScenario: Scenario = {
      id: 'target',
      name: 'Target',
      lumpSums: [],
      extraMonthlyPayment: 0
    };

    it('solves for extra payment to hit a 10-year target', () => {
      const targetDate = addMonths(defaultInputs.startDate, 120);
      const requiredExtra = calculateTargetExtraPayment(defaultInputs, targetDate, baseScenario, 'extraMonthlyPayment');
      
      const result = calculateLoanSchedule(defaultInputs, { ...baseScenario, extraMonthlyPayment: requiredExtra });
      expect(result.totalMonths).toBeLessThanOrEqual(120);
      expect(result.totalMonths).toBeGreaterThan(118); 
    });

    it('solves for fixed monthly premium to hit a 15-year target', () => {
      const targetDate = addMonths(defaultInputs.startDate, 180);
      const requiredFixed = calculateTargetExtraPayment(defaultInputs, targetDate, baseScenario, 'fixedMonthlyPayment');
      
      const result = calculateLoanSchedule(defaultInputs, { ...baseScenario, fixedMonthlyPayment: requiredFixed });
      expect(result.totalMonths).toBeLessThanOrEqual(180);
      expect(result.totalMonths).toBeGreaterThan(178);
      // Fixed premium should be higher than the base installment (~R11010)
      expect(requiredFixed).toBeGreaterThan(11010);
    });

    it('solves for annual percentage increase to hit a target', () => {
      const targetDate = addMonths(defaultInputs.startDate, 150);
      // Start with a small extra payment so the percentage has something to work with
      const scenarioWithBase = { ...baseScenario, extraMonthlyPayment: 500 };
      const requiredIncr = calculateTargetExtraPayment(defaultInputs, targetDate, scenarioWithBase, 'annualExtraIncrement');
      
      const result = calculateLoanSchedule(defaultInputs, { ...scenarioWithBase, annualExtraIncrement: requiredIncr });
      expect(result.totalMonths).toBeLessThanOrEqual(150);
      expect(result.totalMonths).toBeGreaterThan(145); // Percentages can be coarser
      expect(requiredIncr).toBeGreaterThan(0);
    });
  });
});
