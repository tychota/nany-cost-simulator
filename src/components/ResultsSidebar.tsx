import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
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
import { SimulationInputs, SimulationResult } from "../domain/types";
import {
  formatCurrencyDetailed,
  formatHours,
  formatPercent,
} from "../domain/format";
import { EMPLOYEE_SOCIAL_RATE } from "../domain/constants";

interface ResultsSidebarProps {
  inputs: SimulationInputs;
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
    label: "CAF - Réforme du CMG (FAQ)",
    description:
      "Confirme que 50 % des cotisations patronales sont prises en charge pour une garde à domicile et rappelle le plafond horaire CAF.",
    url: "https://www.caf.fr/allocataires/actualites/actualites-nationales/reforme-du-cmg-la-foire-aux-questions",
  },
  {
    id: "mensu",
    label: "Droit-Finances - Mensualisation",
    description:
      "La mensualisation se fait sur 52 semaines divisées par 12 mois pour les gardes en année complète.",
    url: "https://droit-finances.commentcamarche.com/salaries/guide-salaries/1551-salaire-d-une-assistante-maternelle-taux-horaire-et-indemnites",
  },
  {
    id: "cotis",
    label: "Parent Employeur Zen - Cotisations 2025",
    description:
      "Tableau des taux 2025 (≈47,4 % patronal / 22 % salarial) et contribution santé au travail (2,7 % plafonnée à 5 €).",
    url: "https://parent-employeur-zen.com/actualites/garde-a-domicile-changements-2025",
  },
  {
    id: "credit",
    label: "Service-Public - Crédit d'impôt",
    description:
      "Les dépenses d'emploi à domicile sont retenues à 50 % : 12 000 € + majorations (15 000 € la première année, 18 000 € max).",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12?lang=en",
  },
  {
    id: "deduction",
    label: "Économie.gouv - Emploi à domicile",
    description:
      "Rappelle la déduction forfaitaire de 2 € par heure sur les cotisations des particuliers employeurs.",
    url: "https://www.economie.gouv.fr/emploi-domicile-ce-quil-faut-savoir-sur-le-statut-de-particulier-employeur",
  },
];

export function ResultsSidebar({ result }: ResultsSidebarProps) {
  const [familyTab, setFamilyTab] = useState(
    result.families[0]?.family.id ?? ""
  );

  useEffect(() => {
    if (!result.families.find((fam) => fam.family.id === familyTab)) {
      setFamilyTab(result.families[0]?.family.id ?? "");
    }
  }, [familyTab, result.families]);

  const activeFamily =
    result.families.find((fam) => fam.family.id === familyTab) ??
    result.families[0];

  const totalMonthlyCostAfterCMG = useMemo(
    () => result.families.reduce((sum, fam) => sum + fam.monthlyCostAfterCMG, 0),
    [result.families]
  );

  const totalMonthlyCostAfterTax = useMemo(
    () =>
      result.families.reduce(
        (sum, fam) => sum + fam.monthlyCostAfterTaxCredit,
        0
      ),
    [result.families]
  );

  return (
    <Stack gap="md">
      <div>
        <Title order={4}>Résultats</Title>
        <Text size="sm" c="dimmed">
          Synthèse interactive : choisis une famille pour voir sa part, puis
          ouvre l'onglet « Mensualisation » pour comprendre la base de calcul.
        </Text>
      </div>

      <Tabs
        defaultValue="synthese"
        variant="pills"
        radius="md"
        keepMounted={false}
      >
        <Tabs.List grow>
          <Tabs.Tab value="synthese">Synthèse</Tabs.Tab>
          <Tabs.Tab value="mensualisation">Mensualisation</Tabs.Tab>
          <Tabs.Tab value="references">Références</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="synthese" pt="md">
          <Stack gap="md">
            <Paper withBorder radius="lg" p="md">
              <Stack gap={6}>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="sm" fw={500}>
                      Nounou (contrat global)
                    </Text>
                    <Text size="xs" c="dimmed">
                      Brut et net estimés à partir des cotisations 2025.
                    </Text>
                  </div>
                  <Badge variant="light" color="violet">
                    {formatHours(result.hours.monthlyTotal)} / mois
                  </Badge>
                </Group>
                <Text size="sm">
                  Salaire mensuel brut : {" "}
                  <Badge variant="light" size="sm">
                    {formatCurrencyDetailed(result.totalGrossMonthly)}
                  </Badge>
                </Text>
                <Text size="sm">
                  Salaire mensuel net (≈ {formatPercent(EMPLOYEE_SOCIAL_RATE)}) :{" "}
                  <Badge variant="light" size="sm">
                    {formatCurrencyDetailed(result.totalNetMonthly)}
                  </Badge>
                </Text>
              </Stack>
            </Paper>

            {activeFamily ? (
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>
                    Famille à détailler
                  </Text>
                  {result.families.length > 1 && (
                    <SegmentedControl
                      size="xs"
                      value={activeFamily.family.id}
                      onChange={setFamilyTab}
                      data={result.families.map((fam) => ({
                        label: fam.family.label,
                        value: fam.family.id,
                      }))}
                    />
                  )}
                </Group>
                <FamilyCard fam={activeFamily} />
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                Ajoute une famille dans le formulaire pour voir une simulation.
              </Text>
            )}

            <Paper withBorder radius="lg" p="md">
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Coût total (toutes familles)
                </Text>
                <Text size="sm">
                  Après CMG : {" "}
                  <Badge color="blue" variant="light">
                    {formatCurrencyDetailed(totalMonthlyCostAfterCMG)}
                  </Badge>
                </Text>
                <Text size="sm">
                  Après CMG + crédit d'impôt (moyenne annuelle) : {" "}
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
                <Text size="sm" fw={500}>
                  Détail des heures mensualisées
                </Text>
                <Text size="xs" c="dimmed">
                  Basé sur la formule 52 semaines ÷ 12 mois (cf. Droit-Finances).
                </Text>
              </div>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <MensuLine
                  label="Heures normales"
                  weekly={result.hours.weeklyNormal}
                  monthly={result.hours.monthlyNormal}
                  multiplier="× 52 ÷ 12"
                />
                <MensuLine
                  label="Heures majorées +25 %"
                  weekly={result.hours.weeklyPlus25}
                  monthly={result.hours.monthlyPlus25}
                  multiplier="× 52 ÷ 12"
                />
                <MensuLine
                  label="Heures majorées +50 %"
                  weekly={result.hours.weeklyPlus50}
                  monthly={result.hours.monthlyPlus50}
                  multiplier="× 52 ÷ 12"
                />
                <Stack gap={2}>
                  <Text size="sm" fw={500}>
                    Total mensuel contractualisé
                  </Text>
                  <Badge color="violet" radius="sm">
                    {formatHours(result.hours.monthlyTotal)} / mois
                  </Badge>
                </Stack>
              </SimpleGrid>
              <DividerWithLabel label="Cotisations et bases" />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <MensuStat
                  label="Brut estimé"
                  value={formatCurrencyDetailed(result.totalGrossMonthly)}
                  hint="Inclut les majorations 25% / 50%."
                />
                <MensuStat
                  label="Net estimé"
                  value={formatCurrencyDetailed(result.totalNetMonthly)}
                  hint="Basé sur ≈22% de cotisations salariales."
                />
              </SimpleGrid>
            </Stack>
          </Paper>
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
                    <Anchor
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      size="xs"
                    >
                      Consulter la source
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
      : fam.annualTaxCredit / 12 / fam.monthlyCostAfterCMG;

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{ background: "rgba(248, 250, 252, 0.75)" }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" fw={500}>
              {fam.family.label}
            </Text>
            <Text size="xs" c="dimmed">
              Part de garde : {Math.round(fam.family.share * 100)} %
            </Text>
          </div>
          <Badge size="sm" variant="light">
            {formatCurrencyDetailed(fam.monthlyCostBeforeCMG)} brut
          </Badge>
        </Group>

        <Text size="xs" c="dimmed">
          Ressources mensuelles CAF estimées : {" "}
          {formatCurrencyDetailed(fam.monthlyResourcesCAF)} (taux d'effort : {" "}
          {formatPercent(fam.effortRate)}).
        </Text>

        <Accordion variant="contained" radius="md">
          <Accordion.Item value="cmg">
            <Accordion.Control>
              <Text size="sm">
                CMG mensuel : {" "}
                <Badge variant="light" size="sm" color="blue">
                  {formatCurrencyDetailed(fam.cmgTotal)}
                </Badge>{" "}
                <Text span size="xs" c="dimmed">
                  ({formatPercent(cmgRatio)} du coût avant aides)
                </Text>
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Formule décret 2025-515 : coût éligible × [1 - revenus × taux
                  d'effort ÷ 10,38 €].
                </Text>
                <Text size="xs">
                  Part rémunération : {formatCurrencyDetailed(fam.cmgRemuneration)}
                </Text>
                <Text size="xs">
                  Part cotisations (50 % max) : {formatCurrencyDetailed(fam.cmgCotisations)}
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Text size="sm">
          Coût mensuel après CMG : {" "}
          <Badge variant="light" size="sm" color="blue">
            {formatCurrencyDetailed(fam.monthlyCostAfterCMG)}
          </Badge>
        </Text>

        <Accordion variant="contained" radius="md">
          <Accordion.Item value="tax">
            <Accordion.Control>
              <Text size="sm">
                Crédit d'impôt annuel : {" "}
                <Badge size="sm" variant="light" color="teal">
                  {formatCurrencyDetailed(fam.annualTaxCredit)}
                </Badge>{" "}
                <Text span size="xs" c="dimmed">
                  (~{formatCurrencyDetailed(fam.annualTaxCredit / 12)} / mois)
                </Text>
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="xs" c="dimmed">
                Service-Public : 50 % des dépenses nettes d'aides, plafonnées à
                12 000 € + majorations (15 000 € la 1ʳᵉ année).
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Text size="sm" fw={500}>
          Coût mensuel après CMG + crédit d'impôt : {" "}
          <Badge size="sm" variant="filled" color="teal">
            {formatCurrencyDetailed(fam.monthlyCostAfterTaxCredit)}
          </Badge>{" "}
          <Text span size="xs" c="dimmed">
            ({formatPercent(taxRatio)} du coût net est compensé par le crédit)
          </Text>
        </Text>
      </Stack>
    </Paper>
  );
}

interface MensuLineProps {
  label: string;
  weekly: number;
  monthly: number;
  multiplier: string;
}

function MensuLine({ label, weekly, monthly, multiplier }: MensuLineProps) {
  return (
    <Stack gap={2}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {weekly === 0 ? (
        <Text size="xs" c="dimmed">
          Non concerné sur cette plage.
        </Text>
      ) : (
        <Text size="xs">
          {formatHours(weekly)} / sem {multiplier} = {formatHours(monthly)} / mois
        </Text>
      )}
    </Stack>
  );
}

interface MensuStatProps {
  label: string;
  value: string;
  hint?: string;
}

function MensuStat({ label, value, hint }: MensuStatProps) {
  return (
    <Stack gap={2}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Badge variant="light" radius="sm">
        {value}
      </Badge>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Stack>
  );
}

function DividerWithLabel({ label }: { label: string }) {
  return (
    <Group gap="xs" align="center" mt="sm">
      <div style={{ height: 1, flex: 1, background: "var(--mantine-color-gray-3)" }} />
      <Text size="xs" c="dimmed" fw={500}>
        {label}
      </Text>
      <div style={{ height: 1, flex: 1, background: "var(--mantine-color-gray-3)" }} />
    </Group>
  );
}
