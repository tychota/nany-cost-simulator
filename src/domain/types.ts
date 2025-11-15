export interface FamilyInput {
  id: string;
  label: string;
  /** Part de la garde (0–1), ex: 0.5 pour 50 % */
  share: number;
  /** Revenu fiscal de référence annuel (€) */
  taxableIncome: number;
  /** Dépenses annuelles autres emplois à domicile (ménage, jardinage...) */
  otherHouseholdEmploymentPerYear: number;
  /** Nombre d'enfants à charge au sens CAF */
  childrenCount: number;
  /** Parent isolé (pour info / future évolution) */
  singleParent: boolean;
  /** Première année d'emploi à domicile ? (impact plafond crédit d'impôt) */
  firstYearEmployment: boolean;
}

export interface SimulationInputs {
  netHourlyWage: number;
  weeklyHours: number;
  families: FamilyInput[];
}

export interface HoursBreakdown {
  weeklyNormal: number;
  weeklyPlus25: number;
  weeklyPlus50: number;
  monthlyNormal: number;
  monthlyPlus25: number;
  monthlyPlus50: number;
  monthlyTotal: number;
}

export interface FamilyResult {
  family: FamilyInput;
  monthlyGrossShare: number;
  monthlyNetShare: number;
  monthlyHoursShare: number;

  employerChargesGross: number;
  employerChargesAfterDeduction: number;

  cmgCotisations: number;
  cmgRemuneration: number;
  cmgTotal: number;

  monthlyCostBeforeCMG: number;
  monthlyCostAfterCMG: number;

  annualGrossCostBeforeCMG: number;
  annualCmgTotal: number;
  annualEligibleExpensesForTaxCredit: number;
  annualTaxCredit: number;
  monthlyCostAfterTaxCredit: number;

  monthlyResourcesCAF: number;
}

export interface SimulationResult {
  inputs: SimulationInputs;
  hours: HoursBreakdown;
  totalGrossMonthly: number;
  totalNetMonthly: number;
  families: FamilyResult[];
}
