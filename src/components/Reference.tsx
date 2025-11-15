import { Anchor, Divider, Text } from "@mantine/core";
import { SheetSection } from "./Sheet";

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

export function ReferenceSection() {
  return (
    <SheetSection title="Formules & références">
      <Text size="xs">
        <strong>CMG (Décret 2025-515)</strong> : coût mensuel éligible × (1 -
        revenus mensuels × taux d'effort ÷ 10,38 €), plafonné à 15 € nets/heure.
        Les cotisations patronales sont prises en charge à 50 % après la
        déduction de 2 €/h.
      </Text>
      <Text size="xs">
        <strong>Crédit d'impôt (Service-Public)</strong> : 50 % des dépenses
        (nounou + autres emplois) après déduction du CMG, plafonnées à 12 000 €
        + 1 500 € par enfant (18 000 € 1ʳᵉ année).
      </Text>
      <Divider />
      {references.map((ref) => (
        <Text key={ref.id} size="xs" c="dimmed">
          {ref.label} — {ref.description}{" "}
          <Anchor href={ref.url} target="_blank" rel="noreferrer" size="xs">
            Consulter
          </Anchor>
        </Text>
      ))}
    </SheetSection>
  );
}
