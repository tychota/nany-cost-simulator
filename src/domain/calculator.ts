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

  // Référence : Droit-Finances – mensualisation des heures = hebdo × 52 ÷ 12
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

  // Cotisations employeur (brutes) – barème détaillé Parent Employeur Zen (2025)
  const employerChargesGross = monthlyGrossShare * EMPLOYER_SOCIAL_RATE;

  // Contribution santé au travail (2,7% plafonnée à 5 €, cf. actualité 2025)
  const healthContribution = Math.min(
    monthlyGrossShare * HEALTH_CONTRIBUTION_RATE,
    HEALTH_CONTRIBUTION_CAP
  );

  // Déduction forfaitaire de 2 €/h (économie.gouv.fr)
  const deduction = EMPLOYER_SOCIAL_DEDUCTION_PER_HOUR * monthlyHoursShare;
  const employerChargesAfterDeduction = Math.max(
    0,
    employerChargesGross + healthContribution - deduction
  );

  // CMG "rémunération"
  const eligibleHourlyCost = Math.min(netHourlyWage, CMG_HOURLY_CAP);
  const eligibleGuardCost = eligibleHourlyCost * monthlyHoursShare;

  // Ressources CAF encadrées par le décret (plancher RSA parent isolé, plafond 8 500 €)
  const monthlyResourcesCAF = clamp(
    family.taxableIncome / 12,
    CMG_MIN_MONTHLY_RESOURCES,
    CMG_MAX_MONTHLY_RESOURCES
  );
  const effortRate = getEffortRate(family.childrenCount);

  // Formule linéaire 2025-515 : Coût × (1 - revenus × taux d'effort ÷ coût horaire de référence)
  const cmgScale = clamp(
    1 - (monthlyResourcesCAF * effortRate) / CMG_REFERENCE_HOURLY_COST,
    0,
    1
  );
  const cmgRemuneration = eligibleGuardCost * cmgScale;
  const cmgCotisations =
    employerChargesAfterDeduction * CMG_COTIS_RATE * cmgScale;
  const cmgTotal = cmgCotisations + cmgRemuneration;

  const monthlyCostBeforeCMG = monthlyNetShare + employerChargesAfterDeduction;
  const monthlyCostAfterCMG = monthlyCostBeforeCMG - cmgTotal;

  const annualGrossCostBeforeCMG = monthlyCostBeforeCMG * 12;
  const annualCmgTotal = cmgTotal * 12;

  const annualNannyNetExpenses = Math.max(
    0,
    annualGrossCostBeforeCMG - annualCmgTotal
  );
  const annualEligibleExpensesTotal = Math.max(
    0,
    annualNannyNetExpenses + family.otherHouseholdEmploymentPerYear
  );

  const taxCreditCap = computeTaxCreditCap(family);
  // Crédit d'impôt 50 % des dépenses (Service-Public) avec plafonds majorés
  const annualTaxCreditBase = Math.min(
    annualEligibleExpensesTotal,
    taxCreditCap
  );
  const annualTaxCreditTotal = 0.5 * annualTaxCreditBase;
  const creditShare =
    annualEligibleExpensesTotal === 0
      ? 0
      : Math.min(1, annualNannyNetExpenses / annualEligibleExpensesTotal);
  const annualTaxCreditNanny = annualTaxCreditTotal * creditShare;

  const monthlyCostAfterTaxCredit =
    monthlyCostAfterCMG - annualTaxCreditNanny / 12;

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
    annualNannyNetExpenses,
    annualEligibleExpensesTotal,
    annualTaxCreditTotal,
    annualTaxCreditNanny,
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
