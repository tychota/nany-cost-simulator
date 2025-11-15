import { describe, it, expect } from "vitest";
import { computeHoursBreakdown, computeSimulation } from "../domain/calculator";
import { DEFAULT_INPUTS } from "../domain/constants";

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
    expect(result.families).toHaveLength(2);

    const sumShares = result.families.reduce(
      (sum, f) => sum + f.family.share,
      0
    );
    expect(sumShares).toBeCloseTo(1, 5);
  });
});
