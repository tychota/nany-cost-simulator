import {
  Accordion,
  Badge,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { SimulationInputs, SimulationResult } from "../domain/types";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatHours,
  formatPercent,
} from "../domain/format";

interface ResultsSidebarProps {
  inputs: SimulationInputs;
  result: SimulationResult;
}

export function ResultsSidebar({ result }: ResultsSidebarProps) {
  const totalMonthlyCostAfterCMG = result.families.reduce(
    (sum, fam) => sum + fam.monthlyCostAfterCMG,
    0
  );
  const totalMonthlyCostAfterTax = result.families.reduce(
    (sum, fam) => sum + fam.monthlyCostAfterTaxCredit,
    0
  );

  return (
    <Stack gap="sm">
      <div>
        <Title order={4}>Résultats</Title>
        <Text size="sm" c="dimmed">
          Les calculs sont faits pour les deux cofamilles à partir des entrées
          de gauche. Tout se passe dans le navigateur.
        </Text>
      </div>

      <Stack gap={4} p="xs">
        <Text size="sm" fw={500}>
          Nounou (contrat global)
        </Text>

        <Accordion variant="subtle" radius="sm">
          <Accordion.Item value="mensualisation">
            <Accordion.Control>
              <Text size="sm">
                Heures mensualisées :{" "}
                <Badge variant="light" size="sm">
                  {formatHours(result.hours.monthlyTotal)}
                </Badge>
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  <strong>Détail de la mensualisation (année complète)</strong>
                </Text>
                <Text size="xs">
                  Heures normales : {formatHours(result.hours.weeklyNormal)}/sem × 52 ÷ 12 = {formatHours(result.hours.monthlyNormal)}/mois
                </Text>
                {result.hours.weeklyPlus25 > 0 && (
                  <Text size="xs">
                    Heures +25% : {formatHours(result.hours.weeklyPlus25)}/sem × 52 ÷ 12 = {formatHours(result.hours.monthlyPlus25)}/mois
                  </Text>
                )}
                {result.hours.weeklyPlus50 > 0 && (
                  <Text size="xs">
                    Heures +50% : {formatHours(result.hours.weeklyPlus50)}/sem × 52 ÷ 12 = {formatHours(result.hours.monthlyPlus50)}/mois
                  </Text>
                )}
                <Text size="xs" fw={500}>
                  Total : {formatHours(result.hours.monthlyTotal)}/mois
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Text size="sm">
          Salaire mensuel brut :{" "}
          <Badge variant="light" size="sm">
            {formatCurrencyDetailed(result.totalGrossMonthly)}
          </Badge>
        </Text>
        <Text size="sm">
          Salaire mensuel net (approx.) :{" "}
          <Badge variant="light" size="sm">
            {formatCurrencyDetailed(result.totalNetMonthly)}
          </Badge>
          {" "}
          <Text span size="xs" c="dimmed">
            (cotisations salariales: 21,88%)
          </Text>
        </Text>
      </Stack>

      <Divider my="xs" />

      <Stack gap="xs">
        {result.families.map((fam) => (
          <FamilyCard key={fam.family.id} fam={fam} />
        ))}
      </Stack>

      <Divider my="xs" />

      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Coût total (2 cofamilles)
        </Text>
        <Text size="sm">
          Coût mensuel après CMG :{" "}
          <Badge color="blue" variant="light">
            {formatCurrencyDetailed(totalMonthlyCostAfterCMG)}
          </Badge>
        </Text>
        <Text size="sm">
          Coût mensuel après CMG + crédit d&apos;impôt{" "}
          <Text span size="xs" c="dimmed">
            (moyenne sur l&apos;année)
          </Text>{" "}
          :{" "}
          <Badge color="teal" variant="light">
            {formatCurrencyDetailed(totalMonthlyCostAfterTax)}
          </Badge>
        </Text>
      </Stack>

      <Divider my="sm" />

      <Accordion variant="separated" radius="md" defaultValue="formules">
        <Accordion.Item value="formules">
          <Accordion.Control>
            Détails des calculs (formules principales)
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="xs" c="dimmed">
              <strong>Mensualisation des heures</strong> : heures hebdo → heures
              mensuelles = h × 52 / 12 avec arrondi au supérieur, séparées en
              heures normales, +25 % et +50 % selon la convention.
              <br />
              <strong>Salaire brut mensuel</strong> : brut = taux net converti
              en brut × heures, en appliquant les majorations.
              <br />
              <strong>Cotisations patronales</strong> : taux global × brut,
              moins la déduction forfaitaire par heure.
              <br />
              <strong>CMG</strong> : deux volets – prise en charge d&apos;une
              partie de la rémunération (taux d&apos;effort) et d&apos;une
              partie des cotisations, plafonnés.
              <br />
              <strong>Crédit d&apos;impôt</strong> : 50 % des dépenses annuelles
              d&apos;emploi à domicile (nounou + autres emplois), après
              déduction des aides, dans la limite du plafond du foyer.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
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
    <Stack
      gap={4}
      p="xs"
      style={{
        borderRadius: "0.75rem",
        border: "1px solid rgba(0,0,0,0.05)",
        background: "rgba(255,255,255,0.8)",
      }}
    >
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          {fam.family.label}
        </Text>
        <Badge size="sm" variant="dot">
          Part {Math.round(fam.family.share * 100)} %
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        Ressources CAF estimées :{" "}
        {formatCurrencyDetailed(fam.monthlyResourcesCAF)}/mois –{" "}
        {fam.family.childrenCount} enfant(s) à charge
      </Text>

      <Text size="sm">
        Coût mensuel avant aides :{" "}
        <Badge variant="light" size="sm">
          {formatCurrencyDetailed(fam.monthlyCostBeforeCMG)}
        </Badge>
      </Text>

      <Accordion variant="subtle" radius="sm">
        <Accordion.Item value="cmg">
          <Accordion.Control>
            <Text size="sm">
              CMG total :{" "}
              <Badge variant="light" size="sm" color="blue">
                {formatCurrencyDetailed(fam.cmgTotal)}
              </Badge>{" "}
              <Text span size="xs" c="dimmed">
                ({formatPercent(cmgRatio)} du coût brut)
              </Text>
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">
                <strong>Détail du CMG (formule 2025)</strong>
              </Text>
              <Text size="xs">
                Taux d'effort : {formatPercent(fam.effortRate)} ({fam.family.childrenCount} enfant(s))
              </Text>
              <Text size="xs">
                Part rémunération : {formatCurrencyDetailed(fam.cmgRemuneration)}/mois
              </Text>
              <Text size="xs" c="dimmed" style={{ paddingLeft: "1rem" }}>
                = Coût garde éligible × (1 - (revenu mensuel × taux d'effort ÷ 10,38€))
              </Text>
              <Text size="xs">
                Part cotisations patronales : {formatCurrencyDetailed(fam.cmgCotisations)}/mois
              </Text>
              <Text size="xs" c="dimmed" style={{ paddingLeft: "1rem" }}>
                = 50% des cotisations après déduction (garde à domicile)
              </Text>
              <Text size="xs" fw={500}>
                Total CMG : {formatCurrencyDetailed(fam.cmgTotal)}/mois
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Text size="sm">
        Coût mensuel après CMG :{" "}
        <Badge variant="light" size="sm" color="blue">
          {formatCurrencyDetailed(fam.monthlyCostAfterCMG)}
        </Badge>
      </Text>

      <Text size="sm">
        Crédit d&apos;impôt annuel :{" "}
        <Badge size="sm" variant="light" color="teal">
          {formatCurrencyDetailed(fam.annualTaxCredit)}
        </Badge>{" "}
        <Text span size="xs" c="dimmed">
          (~{formatCurrencyDetailed(fam.annualTaxCredit / 12)}/mois,{" "}
          {formatPercent(taxRatio)} du coût net après CMG)
        </Text>
      </Text>

      <Text size="sm">
        Coût mensuel après CMG + crédit d&apos;impôt :{" "}
        <Badge size="sm" variant="filled" color="teal">
          {formatCurrencyDetailed(fam.monthlyCostAfterTaxCredit)}
        </Badge>
      </Text>
    </Stack>
  );
}
