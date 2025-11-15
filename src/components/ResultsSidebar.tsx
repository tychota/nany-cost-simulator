import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { SimulationResult } from "../domain/types";
import {
  formatCurrencyDetailed,
  formatHours,
  formatPercent,
} from "../domain/format";
import { EMPLOYEE_SOCIAL_RATE, EMPLOYER_SOCIAL_RATE } from "../domain/constants";

interface ResultsSidebarProps {
  result: SimulationResult;
}

const references = [
  {
    id: "decret",
    label: "Décret n° 2025-515",
    description:
      "Fixe la formule du CMG, son plafond horaire (15 €) et les taux d'effort par enfant.",
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051714530",
  },
  {
    id: "caf",
    label: "CAF – Réforme du CMG (FAQ)",
    description:
      "Précise que 50 % des cotisations patronales sont prises en charge pour une garde à domicile.",
    url: "https://www.caf.fr/allocataires/actualites/actualites-nationales/reforme-du-cmg-la-foire-aux-questions",
  },
  {
    id: "mensu",
    label: "Droit-Finances – Mensualisation 52/12",
    description:
      "Rappelle la mensualisation heures semaine × 52 ÷ 12 pour les gardes en année complète.",
    url: "https://droit-finances.commentcamarche.com/salaries/guide-salaries/1551-salaire-d-une-assistante-maternelle-taux-horaire-et-indemnites",
  },
  {
    id: "cotis",
    label: "Parent Employeur Zen – Cotisations 2025",
    description:
      "Tableau des taux 2025 (~22 % salarié / ~47 % employeur) et contribution santé au travail.",
    url: "https://parent-employeur-zen.com/actualites/garde-a-domicile-changements-2025",
  },
  {
    id: "credit",
    label: "Service-Public – Crédit d'impôt 50 %",
    description:
      "Décrit les plafonds (12 000 € + majorations ou 18 000 € la 1re année) pour l'emploi à domicile.",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12?lang=en",
  },
  {
    id: "deduction",
    label: "Économie.gouv – Déduction forfaitaire",
    description:
      "Confirme la déduction de 2 € par heure travaillée sur les cotisations patronales.",
    url: "https://www.economie.gouv.fr/emploi-domicile-ce-quil-faut-savoir-sur-le-statut-de-particulier-employeur",
  },
];

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
    () => familiesForDisplay.reduce((sum, fam) => sum + fam.monthlyCostAfterCMG, 0),
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
    <Stack gap="md">
      <div>
        <Title order={4}>Résultats</Title>
        <Text size="sm" c="dimmed">
          Choisis un foyer pour détailler sa part, consulte les formules et les sources
          officielles dans les onglets.
        </Text>
      </div>

      <Tabs defaultValue="synthese" variant="pills" keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="synthese">Synthèse</Tabs.Tab>
          <Tabs.Tab value="mensualisation">Mensualisation</Tabs.Tab>
          <Tabs.Tab value="formules">Formules</Tabs.Tab>
          <Tabs.Tab value="references">Références</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="synthese" pt="md">
          <Stack gap="md">
            <Paper withBorder radius="lg" p="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Nounou (contrat global)</Text>
                    <Text size="xs" c="dimmed">
                      Brut et net estimés avec les taux URSSAF 2025.
                    </Text>
                  </div>
                  <Badge variant="light" color="violet">
                    {formatHours(result.hours.monthlyTotal)} / mois
                  </Badge>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <StatCell
                    label="Salaire mensuel brut"
                    value={formatCurrencyDetailed(result.totalGrossMonthly)}
                    hint="Inclut les majorations +25%/+50% au-delà de 40 h."
                  />
                  <StatCell
                    label="Salaire mensuel net"
                    value={formatCurrencyDetailed(result.totalNetMonthly)}
                    hint={`Retenue salariale ≈ ${formatPercent(EMPLOYEE_SOCIAL_RATE)}.`}
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <StatCell
                    label="Cotisations salariales"
                    value={formatCurrencyDetailed(
                      result.totalGrossMonthly * EMPLOYEE_SOCIAL_RATE
                    )}
                    hint="Retenues estimées (Parent Employeur Zen – cotisations 2025)."
                  />
                  <StatCell
                    label="Cotisations employeur"
                    value={formatCurrencyDetailed(
                      result.totalGrossMonthly * EMPLOYER_SOCIAL_RATE
                    )}
                    hint="Inclut la contribution santé au travail plafonnée à 5 €."
                  />
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper withBorder radius="lg" p="md">
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text fw={500}>Famille à détailler</Text>
                  <SegmentedControl
                    size="xs"
                    value={activeFamily?.family.id}
                    onChange={setFamilyTab}
                    data={familiesForDisplay.map((fam) => ({
                      label: fam.family.label,
                      value: fam.family.id,
                    }))}
                  />
                </Group>
                {usesSyntheticSecondFamily && (
                  <Alert color="blue" variant="light">
                    Aucun deuxième foyer n'est configuré : la Famille 2 reprend les
                    mêmes données que la Famille 1. Ajoute une cofamille dans le
                    formulaire pour personnaliser la répartition.
                  </Alert>
                )}
                {activeFamily && <FamilyCard fam={activeFamily} />}
              </Stack>
            </Paper>

            <Paper withBorder radius="lg" p="md">
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Coût total (toutes familles)
                </Text>
                <Text size="sm">
                  Après CMG :{" "}
                  <Badge color="blue" variant="light">
                    {formatCurrencyDetailed(totalMonthlyCostAfterCMG)}
                  </Badge>
                </Text>
                <Text size="sm">
                  Après CMG + crédit d'impôt (moyenne annuelle) :{" "}
                  <Badge color="teal" variant="light">
                    {formatCurrencyDetailed(totalMonthlyCostAfterTax)}
                  </Badge>
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mensualisation" pt="md">
          <Paper withBorder radius="lg" p="md">
            <Stack gap="sm">
              <div>
                <Text fw={500}>Détail des heures mensualisées</Text>
                <Text size="xs" c="dimmed">
                  Méthode année complète : heures hebdo × 52 ÷ 12.
                </Text>
              </div>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <MensuLine
                  label="Heures normales"
                  weekly={result.hours.weeklyNormal}
                  monthly={result.hours.monthlyNormal}
                />
                <MensuLine
                  label="Heures majorées +25 %"
                  weekly={result.hours.weeklyPlus25}
                  monthly={result.hours.monthlyPlus25}
                />
                <MensuLine
                  label="Heures majorées +50 %"
                  weekly={result.hours.weeklyPlus50}
                  monthly={result.hours.monthlyPlus50}
                />
                <Stack gap={2}>
                  <Text size="sm" fw={500}>
                    Total contractualisé
                  </Text>
                  <Badge color="violet">{formatHours(result.hours.monthlyTotal)}</Badge>
                </Stack>
              </SimpleGrid>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="formules" pt="md">
          <Stack gap="md">
            <Paper withBorder radius="lg" p="md">
              <Text fw={500}>CMG (Décret 2025-515)</Text>
              <Text size="sm">
                Complément = coût mensuel éligible × (1 - revenus mensuels × taux
                d'effort ÷ 10,38 €). Le coût est plafonné à 15 € nets/heure. Les
                cotisations patronales sont prises en charge à 50 % après déduction de
                2 €/h.
              </Text>
            </Paper>
            <Paper withBorder radius="lg" p="md">
              <Text fw={500}>Crédit d'impôt emploi à domicile (Service-Public)</Text>
              <Text size="sm">
                Crédit = 50 % des dépenses annuelles (nounou + autres emplois) après
                déduction du CMG. Plafond de 12 000 € + 1 500 € par enfant (max 18 000 €
                la 1re année d'emploi déclaré).
              </Text>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="references" pt="md">
          <Paper withBorder radius="lg" p="md">
            <Stack gap="md">
              {references.map((ref) => (
                <Stack key={ref.id} gap={2}>
                  <Text size="sm" fw={500}>
                    {ref.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {ref.description}{" "}
                    <Anchor href={ref.url} target="_blank" rel="noreferrer" size="xs">
                      Consulter
                    </Anchor>
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

interface FamilyCardProps {
  fam: SimulationResult["families"][number];
}

function FamilyCard({ fam }: FamilyCardProps) {
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
      <Paper withBorder radius="md" p="md" style={{ background: "rgba(248,250,252,0.85)" }}>
        <Stack gap={6}>
          <Group justify="space-between">
            <div>
              <Text fw={500}>{fam.family.label}</Text>
              <Text size="xs" c="dimmed">
                Part de garde : {Math.round(fam.family.share * 100)} %
              </Text>
            </div>
            <Badge size="sm" variant="light">
              {formatCurrencyDetailed(fam.monthlyCostBeforeCMG)} brut
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            Revenus mensuels pris en compte :{" "}
            {formatCurrencyDetailed(fam.monthlyResourcesCAF)} – taux d&apos;effort{" "}
            {formatPercent(fam.effortRate)}.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <StatCell
              label="CMG total"
              value={formatCurrencyDetailed(fam.cmgTotal)}
              hint={`${formatPercent(cmgRatio)} du coût avant aides`}
            />
            <StatCell
              label="Coût après CMG"
              value={formatCurrencyDetailed(fam.monthlyCostAfterCMG)}
            />
            <StatCell
              label="Crédit d'impôt (part nounou)"
              value={formatCurrencyDetailed(fam.annualTaxCreditNanny)}
              hint={`≈ ${formatCurrencyDetailed(
                fam.annualTaxCreditNanny / 12
              )} / mois · Crédit foyer total : ${formatCurrencyDetailed(
                fam.annualTaxCreditTotal
              )}`}
            />
            <StatCell
              label="Coût après CMG + crédit"
              value={formatCurrencyDetailed(fam.monthlyCostAfterTaxCredit)}
              hint={`${formatPercent(taxRatio)} du coût net compensé`}
            />
          </SimpleGrid>
          <Text size="xs" c="dimmed">
            Dépenses prises en compte : {formatCurrencyDetailed(fam.annualNannyNetExpenses)} pour la nounou et{" "}
            {formatCurrencyDetailed(
              Math.max(0, fam.annualEligibleExpensesTotal - fam.annualNannyNetExpenses)
            )} pour les autres emplois déclarés (total {formatCurrencyDetailed(fam.annualEligibleExpensesTotal)}
            , crédit global plafonné à {formatCurrencyDetailed(fam.annualTaxCreditTotal * 2)}).
          </Text>
        </Stack>
      </Paper>

      <Accordion variant="contained" radius="md">
        <Accordion.Item value="cmg-details">
          <Accordion.Control>Comprendre le calcul</Accordion.Control>
          <Accordion.Panel>
            <Stack gap={4}>
              <Text size="xs">
                Part rémunération : {formatCurrencyDetailed(fam.cmgRemuneration)} = coût
                éligible × (1 - revenus × taux d&apos;effort ÷ 10,38 €).
              </Text>
              <Text size="xs">
                Part cotisations : {formatCurrencyDetailed(fam.cmgCotisations)} = 50 % des
                cotisations patronales restantes après la déduction de 2 €/h.
              </Text>
              <Text size="xs">
                Crédit d'impôt : 50 % des dépenses nettes d'aides, plafonné selon la
                situation du foyer.
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

interface StatCellProps {
  label: string;
  value: string;
  hint?: string;
}

function StatCell({ label, value, hint }: StatCellProps) {
  return (
    <Paper radius="md" withBorder p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600}>{value}</Text>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  );
}
