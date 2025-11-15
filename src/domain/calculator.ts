import {
  EMPLOYEE_SOCIAL_RATE,
  EMPLOYER_SOCIAL_DEDUCTION_PER_HOUR,
  EMPLOYER_SOCIAL_RATE,
  HEALTH_CONTRIBUTION_RATE,
  HEALTH_CONTRIBUTION_CAP,
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
  CMG_HOURLY_CAP,
  CMG_COTIS_RATE,
  CMG_REFERENCE_HOURLY_COST,
  CMG_MIN_MONTHLY_RESOURCES,
  CMG_MAX_MONTHLY_RESOURCES,
  computeTaxCreditCap,
  getEffortRate,
} from "./constants";
import {
  FamilyInput,
  HoursBreakdown,
  SimulationInputs,
  SimulationResult,
  FamilyResult,
} from "./types";

/**
 * Décomposition des heures hebdomadaires selon la convention :
 * - jusqu'à 40 h : taux normal
 * - 40–48 h : +25 %
 * - 48–50 h : +50 %
 */
export function computeHoursBreakdown(weeklyHours: number): HoursBreakdown {
  const weeklyNormal = Math.min(weeklyHours, 40);
  const weeklyPlus25 = Math.min(Math.max(weeklyHours - 40, 0), 8);
  const weeklyPlus50 = Math.min(Math.max(weeklyHours - 48, 0), 2);

  const factor = WEEKS_PER_YEAR / MONTHS_PER_YEAR;

  const monthlyNormal = Math.ceil(weeklyNormal * factor);
  const monthlyPlus25 = Math.ceil(weeklyPlus25 * factor);
  const monthlyPlus50 = Math.ceil(weeklyPlus50 * factor);

  const monthlyTotal = monthlyNormal + monthlyPlus25 + monthlyPlus50;

  return {
    weeklyNormal,
    weeklyPlus25,
    weeklyPlus50,
    monthlyNormal,
    monthlyPlus25,
    monthlyPlus50,
    monthlyTotal,
  };
}

/**
 * Approximation brut -> net & net -> brut.
 * Pour une vraie exactitude, remplacer par un simulateur URSSAF / Pajemploi
 * ou des tables de taux plus fines.
 */
export function netToGross(netHourly: number): number {
  const factor = 1 / (1 - EMPLOYEE_SOCIAL_RATE);
  return netHourly * factor;
}

export function grossToNet(grossMonthly: number): number {
  return grossMonthly * (1 - EMPLOYEE_SOCIAL_RATE);
}

function computeFamilyResult(
  family: FamilyInput,
  netHourlyWage: number,
  hours: HoursBreakdown,
  totalGrossMonthly: number,
  totalNetMonthly: number
): FamilyResult {
  const share = family.share;

  const monthlyGrossShare = totalGrossMonthly * share;
  const monthlyNetShare = totalNetMonthly * share;
  const monthlyHoursShare = hours.monthlyTotal * share;

  // Cotisations employeur (brutes)
  const employerChargesGross = monthlyGrossShare * EMPLOYER_SOCIAL_RATE;

  // Contribution santé au travail (2,7% plafonné à 5€)
  const healthContribution = Math.min(
    monthlyGrossShare * HEALTH_CONTRIBUTION_RATE,
    HEALTH_CONTRIBUTION_CAP
  );

  // Déduction forfaitaire par heure
  const deduction = EMPLOYER_SOCIAL_DEDUCTION_PER_HOUR * monthlyHoursShare;
  const employerChargesAfterDeduction = Math.max(
    0,
    employerChargesGross + healthContribution - deduction
  );

  // CMG "cotisations" – simplifié : 50 % de ces charges (sans plafond mensuel)
  const cmgCotisations = employerChargesAfterDeduction * CMG_COTIS_RATE;

  // CMG "rémunération"
  const eligibleHourlyCost = Math.min(netHourlyWage, CMG_HOURLY_CAP);
  const eligibleGuardCost = eligibleHourlyCost * monthlyHoursShare;

  const monthlyResourcesCAF = clamp(
    family.taxableIncome / 12,
    CMG_MIN_MONTHLY_RESOURCES,
    CMG_MAX_MONTHLY_RESOURCES
  );
  const effortRate = getEffortRate(family.childrenCount);

  const cmgRemuTheoretical =
    eligibleGuardCost *
    (1 - (monthlyResourcesCAF * effortRate) / CMG_REFERENCE_HOURLY_COST);

  const cmgRemuneration = clamp(cmgRemuTheoretical, 0, eligibleGuardCost);

  const cmgTotal = cmgCotisations + cmgRemuneration;

  const monthlyCostBeforeCMG = monthlyNetShare + employerChargesAfterDeduction;
  const monthlyCostAfterCMG = monthlyCostBeforeCMG - cmgTotal;

  const annualGrossCostBeforeCMG = monthlyCostBeforeCMG * 12;
  const annualCmgTotal = cmgTotal * 12;

  const annualEligibleExpensesForTaxCredit = Math.max(
    0,
    annualGrossCostBeforeCMG +
      family.otherHouseholdEmploymentPerYear -
      annualCmgTotal
  );

  const taxCreditCap = computeTaxCreditCap(family);
  const annualTaxCredit =
    0.5 * Math.min(annualEligibleExpensesForTaxCredit, taxCreditCap);

  const monthlyCostAfterTaxCredit = monthlyCostAfterCMG - annualTaxCredit / 12;

  return {
    family,
    monthlyGrossShare,
    monthlyNetShare,
    monthlyHoursShare,
    employerChargesGross,
    healthContribution,
    employerChargesAfterDeduction,
    cmgCotisations,
    cmgRemuneration,
    cmgTotal,
    monthlyCostBeforeCMG,
    monthlyCostAfterCMG,
    annualGrossCostBeforeCMG,
    annualCmgTotal,
    annualEligibleExpensesForTaxCredit,
    annualTaxCredit,
    monthlyCostAfterTaxCredit,
    monthlyResourcesCAF,
    effortRate,
  };
}

export function computeSimulation(inputs: SimulationInputs): SimulationResult {
  const hours = computeHoursBreakdown(inputs.weeklyHours);

  const grossHourly = netToGross(inputs.netHourlyWage);

  const grossNormal = grossHourly * hours.monthlyNormal;
  const grossPlus25 = grossHourly * 1.25 * hours.monthlyPlus25;
  const grossPlus50 = grossHourly * 1.5 * hours.monthlyPlus50;

  const totalGrossMonthly = grossNormal + grossPlus25 + grossPlus50;
  const totalNetMonthly = grossToNet(totalGrossMonthly);

  const families: FamilyResult[] = inputs.families.map((fam) =>
    computeFamilyResult(
      fam,
      inputs.netHourlyWage,
      hours,
      totalGrossMonthly,
      totalNetMonthly
    )
  );

  return {
    inputs,
    hours,
    totalGrossMonthly,
    totalNetMonthly,
    families,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
