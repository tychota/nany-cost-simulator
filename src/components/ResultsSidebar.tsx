import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Alert,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { SimulationResult } from "../domain/types";
import {
  formatCurrencyDetailed,
  formatHours,
  formatPercent,
} from "../domain/format";
import {
  EMPLOYEE_SOCIAL_RATE,
  EMPLOYER_SOCIAL_RATE,
} from "../domain/constants";
import { SectionRow, SheetSection } from "./Sheet";

interface ResultsSidebarProps {
  result: SimulationResult;
}

export function ResultsSidebar({ result }: ResultsSidebarProps) {
  const usesSyntheticSecondFamily = result.families.length === 1;

  const familiesForDisplay = useMemo(() => {
    if (!usesSyntheticSecondFamily) {
      return result.families;
    }
    const first = result.families[0];
    return [
      first,
      {
        ...first,
        family: {
          ...first.family,
          id: `${first.family.id}-mirror`,
          label: "Famille 2 (identique par défaut)",
        },
      },
    ];
  }, [result.families, usesSyntheticSecondFamily]);

  const [familyTab, setFamilyTab] = useState(
    familiesForDisplay[0]?.family.id ?? ""
  );

  useEffect(() => {
    if (!familiesForDisplay.find((fam) => fam.family.id === familyTab)) {
      setFamilyTab(familiesForDisplay[0]?.family.id ?? "");
    }
  }, [familiesForDisplay, familyTab]);

  const activeFamily =
    familiesForDisplay.find((fam) => fam.family.id === familyTab) ??
    familiesForDisplay[0];

  const totalMonthlyCostAfterCMG = useMemo(
    () =>
      familiesForDisplay.reduce((sum, fam) => sum + fam.monthlyCostAfterCMG, 0),
    [familiesForDisplay]
  );
  const totalMonthlyCostAfterTax = useMemo(
    () =>
      familiesForDisplay.reduce(
        (sum, fam) => sum + fam.monthlyCostAfterTaxCredit,
        0
      ),
    [familiesForDisplay]
  );

  return (
    <Paper withBorder radius="xl" p="lg">
      <Stack gap="lg">
        <SheetSection
          title="Nounou – synthèse paie"
          description="Montants moyens mensualisés (heures hebdo × 52 ÷ 12)."
          badge={formatHours(result.hours.monthlyTotal) + " / mois"}
        >
          <SectionRow
            label="Salaire mensuel brut"
            value={formatCurrencyDetailed(result.totalGrossMonthly)}
            hint="Inclut les majorations +25%/+50% au-delà de 40 h hebdo."
          />
          <SectionRow
            label="Salaire mensuel net"
            value={formatCurrencyDetailed(result.totalNetMonthly)}
            hint={`Retenues salariales estimées : ${formatPercent(
              EMPLOYEE_SOCIAL_RATE
            )}.`}
          />
          <SectionRow
            label="Cotisations salariales"
            value={formatCurrencyDetailed(
              result.totalGrossMonthly * EMPLOYEE_SOCIAL_RATE
            )}
            hint="Côté salarié – tableau Urssaf particuliers 2025."
          />
          <SectionRow
            label="Cotisations employeur"
            value={formatCurrencyDetailed(
              result.totalGrossMonthly * EMPLOYER_SOCIAL_RATE
            )}
            hint="Comprend la contribution santé au travail (2,7% plafonnée à 5 €)."
          />
          <Accordion variant="contained" radius="md">
            <Accordion.Item value="mensu">
              <Accordion.Control>Mensualisation</Accordion.Control>
              <Accordion.Panel>
                <Text size="xs" c="dimmed">
                  Méthode année complète : heures hebdo × 52 ÷ 12.
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" mt="xs">
                  <MensuLine
                    label="Heures normales"
                    weekly={result.hours.weeklyNormal}
                    monthly={result.hours.monthlyNormal}
                  />
                  <MensuLine
                    label="Heures +25 %"
                    weekly={result.hours.weeklyPlus25}
                    monthly={result.hours.monthlyPlus25}
                  />
                  <MensuLine
                    label="Heures +50 %"
                    weekly={result.hours.weeklyPlus50}
                    monthly={result.hours.monthlyPlus50}
                  />
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </SheetSection>

        <SheetSection
          title="Famille – reste à charge"
          action={
            result.families.length > 1 && (
              <SegmentedControl
                size="xs"
                value={activeFamily?.family.id}
                onChange={setFamilyTab}
                data={familiesForDisplay.map((fam) => ({
                  label: fam.family.label,
                  value: fam.family.id,
                }))}
              />
            )
          }
        >
          {usesSyntheticSecondFamily && (
            <Alert color="blue" variant="light" mb="sm">
              Aucun deuxième foyer n'est configuré : ajoute une cofamille pour
              personnaliser la répartition.
            </Alert>
          )}
          {activeFamily && <FamilySheet fam={activeFamily} />}
        </SheetSection>

        <SheetSection title="Total cofamilles" description="Somme des parts.">
          <SectionRow
            label="Coût mensuel après CMG"
            value={formatCurrencyDetailed(totalMonthlyCostAfterCMG)}
          />
          <SectionRow
            label="Coût mensuel après CMG + crédit d'impôt"
            value={formatCurrencyDetailed(totalMonthlyCostAfterTax)}
            hint="Crédit d'impôt proratisé sur la part nounou."
          />
        </SheetSection>
      </Stack>
    </Paper>
  );
}

interface FamilySheetProps {
  fam: SimulationResult["families"][number];
}

function FamilySheet({ fam }: FamilySheetProps) {
  const cmgRatio =
    fam.monthlyCostBeforeCMG === 0
      ? 0
      : fam.cmgTotal / fam.monthlyCostBeforeCMG;

  const taxRatio =
    fam.monthlyCostAfterCMG === 0
      ? 0
      : fam.annualTaxCreditNanny / 12 / fam.monthlyCostAfterCMG;

  return (
    <Stack gap="sm">
      <SectionRow
        label="Part de garde"
        value={`${Math.round(fam.family.share * 100)} %`}
        hint={`Ressources CAF prises en compte : ${formatCurrencyDetailed(
          fam.monthlyResourcesCAF
        )} – taux d'effort ${formatPercent(fam.effortRate)}.`}
      />
      <SectionRow
        label="Coût avant aides"
        value={formatCurrencyDetailed(fam.monthlyCostBeforeCMG)}
      />
      <SectionRow
        label="CMG total"
        value={formatCurrencyDetailed(fam.cmgTotal)}
        hint={`${formatPercent(cmgRatio)} du coût avant aides.`}
      />
      <SectionRow
        label="Coût après CMG"
        value={formatCurrencyDetailed(fam.monthlyCostAfterCMG)}
      />
      <SectionRow
        label="Crédit d'impôt (part nounou)"
        value={formatCurrencyDetailed(fam.annualTaxCreditNanny)}
        hint={`≈ ${formatCurrencyDetailed(
          fam.annualTaxCreditNanny / 12
        )} / mois · Crédit foyer total : ${formatCurrencyDetailed(
          fam.annualTaxCreditTotal
        )}.`}
      />
      <SectionRow
        label="Coût après CMG + crédit"
        value={formatCurrencyDetailed(fam.monthlyCostAfterTaxCredit)}
        hint={`${formatPercent(taxRatio)} du coût net compensé.`}
      />
      <Text size="xs" c="dimmed">
        Dépenses retenues : {formatCurrencyDetailed(fam.annualNannyNetExpenses)}{" "}
        pour la nounou et{" "}
        {formatCurrencyDetailed(
          Math.max(
            0,
            fam.annualEligibleExpensesTotal - fam.annualNannyNetExpenses
          )
        )}{" "}
        pour les autres emplois déclarés (enveloppe totale{" "}
        {formatCurrencyDetailed(fam.annualEligibleExpensesTotal)}, plafond
        Service-Public {formatCurrencyDetailed(fam.annualTaxCreditTotal * 2)}).
      </Text>

      <Accordion variant="contained" radius="md">
        <Accordion.Item value="cmg-details">
          <Accordion.Control>Comprendre le calcul</Accordion.Control>
          <Accordion.Panel>
            <Stack gap={4}>
              <Text size="xs">
                Part rémunération :{" "}
                {formatCurrencyDetailed(fam.cmgRemuneration)} = coût éligible ×
                (1 - revenus × taux d&apos;effort ÷ 10,38 €).
              </Text>
              <Text size="xs">
                Part cotisations : {formatCurrencyDetailed(fam.cmgCotisations)}{" "}
                = 50 % des cotisations patronales restantes après la déduction
                de 2 €/h.
              </Text>
              <Text size="xs">
                Crédit d'impôt : 50 % des dépenses nettes d'aides, plafonné
                selon la situation du foyer.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

interface MensuLineProps {
  label: string;
  weekly: number;
  monthly: number;
}

function MensuLine({ label, weekly, monthly }: MensuLineProps) {
  return (
    <Stack gap={2}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {weekly === 0 ? (
        <Text size="xs" c="dimmed">
          Non concerné.
        </Text>
      ) : (
        <Text size="xs">
          {formatHours(weekly)} / sem × 52 ÷ 12 = {formatHours(monthly)} / mois
        </Text>
      )}
    </Stack>
  );
}
