import { FamilyInput, SimulationInputs } from "./types";

/**
 * Constantes configurables – à ajuster si les règles changent
 */

// Temps
export const WEEKS_PER_YEAR = 52; // 52 semaines de référence pour la mensualisation
export const MONTHS_PER_YEAR = 12;

// Garde partagée / conventions
export const MAX_WEEKLY_HOURS = 50;

// URSSAF – taux officiels 2025
export const EMPLOYER_SOCIAL_RATE = 0.474; // ≈47,4 % en additionnant les lignes patronales du tableau Parent Employeur Zen (mise à jour 01/2025)
export const EMPLOYEE_SOCIAL_RATE = 0.2205; // ≈22,05 % d'après les lignes salariales hors Alsace-Moselle
export const EMPLOYER_SOCIAL_DEDUCTION_PER_HOUR = 2; // Déduction forfaitaire (économie.gouv.fr)
export const HEALTH_CONTRIBUTION_RATE = 0.027; // contribution santé au travail (2,7 %)
export const HEALTH_CONTRIBUTION_CAP = 5; // plafond mensuel contribution santé au travail (€)

// CMG – paramètres 2025 (décret 2025-515 & communiqués CAF)
export const CMG_HOURLY_CAP = 15; // plafond horaire nounou à domicile (CAF)
export const CMG_REFERENCE_HOURLY_COST = 10.38; // coût horaire de référence 2025
export const CMG_COTIS_RATE = 0.5; // 50% de prise en charge des cotisations sociales
export const CMG_MIN_MONTHLY_RESOURCES = 635; // plancher mensuel encadrant le RFR
export const CMG_MAX_MONTHLY_RESOURCES = 8500; // plafond mensuel encadrant le RFR

// Crédit d'impôt emploi à domicile
export const TAX_CREDIT_BASE_CAP = 12000;
export const TAX_CREDIT_MAX_CAP = 15000;
export const TAX_CREDIT_FIRST_YEAR_BASE_CAP = 15000;
export const TAX_CREDIT_FIRST_YEAR_MAX_CAP = 18000;

// Helpers de barème CMG : taux d'effort en fonction du nombre d'enfants
export function getEffortRate(childrenCount: number): number {
  // Valeurs inspirées de tableaux publics 2025 (simplifiées)
  if (childrenCount <= 1) return 0.001238; // 0,1238 %
  if (childrenCount === 2) return 0.001032; // 0,1032 %
  if (childrenCount === 3) return 0.000826; // 0,0826 %
  if (childrenCount <= 7) return 0.00062; // 0,062 %
  return 0.000412; // 0,0412 %
}

/**
 * Plafond annuel pour le crédit d'impôt emploi à domicile
 * (hors cas invalidité – à ajouter au besoin)
 */
export function computeTaxCreditCap(family: FamilyInput): number {
  const base = family.firstYearEmployment
    ? TAX_CREDIT_FIRST_YEAR_BASE_CAP
    : TAX_CREDIT_BASE_CAP;

  // Majoration: 1500 €/enfant, plafonnée à 2 enfants pour rester simple
  const majorations = Math.min(family.childrenCount, 2) * 1500;

  let cap = base + majorations;
  if (family.firstYearEmployment) {
    cap = Math.min(cap, TAX_CREDIT_FIRST_YEAR_MAX_CAP);
  } else {
    cap = Math.min(cap, TAX_CREDIT_MAX_CAP);
  }

  return cap;
}

// Valeurs par défaut pour la démo
const DEFAULT_FAMILY_1: FamilyInput = {
  id: "fam1",
  label: "Famille 1",
  share: 0.5,
  taxableIncome: 60000, // € / an
  otherHouseholdEmploymentPerYear: 2000,
  childrenCount: 1,
  singleParent: false,
  firstYearEmployment: false,
};

const DEFAULT_FAMILY_2: FamilyInput = {
  id: "fam2",
  label: "Famille 2",
  share: 0.5,
  taxableIncome: 35000,
  otherHouseholdEmploymentPerYear: 1000,
  childrenCount: 1,
  singleParent: false,
  firstYearEmployment: false,
};

export const DEFAULT_INPUTS: SimulationInputs = {
  netHourlyWage: 11, // €/h
  weeklyHours: 40,
  families: [DEFAULT_FAMILY_1, DEFAULT_FAMILY_2],
};
