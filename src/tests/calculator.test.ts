import { describe, it, expect } from "vitest";
import { computeHoursBreakdown, computeSimulation } from "../domain/calculator";
import { DEFAULT_INPUTS } from "../domain/constants";
import { SimulationInputs } from "../domain/types";

describe("computeHoursBreakdown", () => {
  it("décompose correctement 45 h/semaine", () => {
    const res = computeHoursBreakdown(45);
    expect(res.weeklyNormal).toBe(40);
    expect(res.weeklyPlus25).toBe(5);
    expect(res.weeklyPlus50).toBe(0);
    expect(res.monthlyTotal).toBeGreaterThan(0);
  });
});

describe("computeSimulation", () => {
  it("retourne un résultat cohérent avec les valeurs par défaut", () => {
    const result = computeSimulation(DEFAULT_INPUTS);

    expect(result.totalGrossMonthly).toBeGreaterThan(0);
    expect(result.totalNetMonthly).toBeGreaterThan(0);
    expect(result.families.length).toBeGreaterThanOrEqual(1);

    const sumShares = result.families.reduce(
      (sum, f) => sum + f.family.share,
      0
    );
    expect(sumShares).toBeGreaterThan(0);
    expect(sumShares).toBeLessThanOrEqual(1);
  });

  it("annule le CMG pour un foyer aux ressources URSSAF élevées", () => {
    const richInputs: SimulationInputs = {
      netHourlyWage: 11.2,
      weeklyHours: 48,
      families: [
        {
          id: "fam",
          label: "Famille",
          share: 1,
          taxableIncome: 180000, // ressources N-2 très élevées
          otherHouseholdEmploymentPerYear: 0,
          childrenCount: 1,
          singleParent: false,
          firstYearEmployment: false,
        },
      ],
    };

    const result = computeSimulation(richInputs);
    const family = result.families[0];

    expect(family.monthlyResourcesCAF).toBeGreaterThan(0);
    expect(family.cmgTotal).toBeCloseTo(0, 2);
  });

  it("prorate le crédit d'impôt entre nounou et autres emplois", () => {
    const inputs: SimulationInputs = {
      netHourlyWage: 10,
      weeklyHours: 35,
      families: [
        {
          id: "fam",
          label: "Famille",
          share: 1,
          taxableIncome: 40000,
          otherHouseholdEmploymentPerYear: 4000,
          childrenCount: 1,
          singleParent: false,
          firstYearEmployment: false,
        },
      ],
    };

    const result = computeSimulation(inputs);
    const family = result.families[0];

    expect(family.annualTaxCreditTotal).toBeGreaterThan(0);
    expect(family.annualEligibleExpensesTotal).toBeGreaterThan(
      family.annualNannyNetExpenses
    );

    const expectedShare =
      family.annualTaxCreditTotal *
      (family.annualNannyNetExpenses / family.annualEligibleExpensesTotal);

    expect(family.annualTaxCreditNanny).toBeCloseTo(expectedShare, 6);
  });
});
