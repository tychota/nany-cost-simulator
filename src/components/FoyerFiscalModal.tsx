import { useState } from "react";
import {
  Modal,
  Stack,
  Text,
  NumberInput,
  Button,
  Group,
  Alert,
  Title,
  Divider,
} from "@mantine/core";

interface FoyerFiscalModalProps {
  opened: boolean;
  onClose: () => void;
  onCalculated: (rfrEstime: number) => void;
  currentRFR?: number;
}

export function FoyerFiscalModal({
  opened,
  onClose,
  onCalculated,
  currentRFR,
}: FoyerFiscalModalProps) {
  // Revenus avant mariage
  const [revenuPerson1, setRevenuPerson1] = useState<number>(0);
  const [revenuPerson2, setRevenuPerson2] = useState<number>(0);
  const [nbPartsPerson1, setNbPartsPerson1] = useState<number>(1);
  const [nbPartsPerson2, setNbPartsPerson2] = useState<number>(1);

  // Revenus après mariage/PACS
  const [nbPartsCouple, setNbPartsCouple] = useState<number>(2);
  const [nbEnfants, setNbEnfants] = useState<number>(0);

  const calculateRFR = () => {
    // Reconstitution approximative du RFR du couple
    // On suppose que le RFR est proportionnel aux parts fiscales

    // RFR individuel estimé = revenu déclaré × (parts du couple / parts individuelles)
    const rfrPerson1Adjusted = revenuPerson1 * (nbPartsCouple / 2) / nbPartsPerson1;
    const rfrPerson2Adjusted = revenuPerson2 * (nbPartsCouple / 2) / nbPartsPerson2;

    // On ajuste pour les enfants (0.5 part par enfant pour les 2 premiers, 1 part à partir du 3ème)
    let partsEnfants = 0;
    if (nbEnfants >= 1) partsEnfants += 0.5;
    if (nbEnfants >= 2) partsEnfants += 0.5;
    if (nbEnfants >= 3) partsEnfants += (nbEnfants - 2) * 1;

    const totalPartsAvecEnfants = 2 + partsEnfants;

    // RFR estimé du couple avec enfants
    const rfrEstime = (rfrPerson1Adjusted + rfrPerson2Adjusted) * (totalPartsAvecEnfants / nbPartsCouple);

    return Math.round(rfrEstime);
  };

  const handleCalculate = () => {
    const rfr = calculateRFR();
    onCalculated(rfr);
    onClose();
  };

  const rfrEstime = calculateRFR();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4}>
          Calculer le Revenu Fiscal de Référence (RFR) du foyer
        </Title>
      }
      size="lg"
    >
      <Stack gap="md">
        <Alert color="blue" title="À quoi sert ce calculateur ?">
          <Text size="sm">
            Si vous déclariez vos impôts séparément avant votre mariage ou PACS,
            ce calculateur vous aide à estimer le Revenu Fiscal de Référence
            (RFR) de votre nouveau foyer fiscal en tenant compte de l'effet des
            parts fiscales (quotient familial).
          </Text>
        </Alert>

        <Divider label="Vos déclarations avant mariage/PACS" />

        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Personne 1
          </Text>
          <NumberInput
            label="Revenu fiscal de référence (RFR) de votre dernière déclaration individuelle"
            description="Trouvé sur votre avis d'imposition N-2"
            suffix=" €"
            min={0}
            step={1000}
            value={revenuPerson1}
            onChange={(val) => setRevenuPerson1(typeof val === "number" ? val : 0)}
          />
          <NumberInput
            label="Nombre de parts fiscales"
            description="1 part pour une personne seule, 1.5 pour parent isolé avec 1 enfant, etc."
            min={1}
            max={5}
            step={0.5}
            value={nbPartsPerson1}
            onChange={(val) => setNbPartsPerson1(typeof val === "number" ? val : 1)}
          />
        </Stack>

        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Personne 2
          </Text>
          <NumberInput
            label="Revenu fiscal de référence (RFR) de votre dernière déclaration individuelle"
            description="Trouvé sur votre avis d'imposition N-2"
            suffix=" €"
            min={0}
            step={1000}
            value={revenuPerson2}
            onChange={(val) => setRevenuPerson2(typeof val === "number" ? val : 0)}
          />
          <NumberInput
            label="Nombre de parts fiscales"
            description="1 part pour une personne seule, 1.5 pour parent isolé avec 1 enfant, etc."
            min={1}
            max={5}
            step={0.5}
            value={nbPartsPerson2}
            onChange={(val) => setNbPartsPerson2(typeof val === "number" ? val : 1)}
          />
        </Stack>

        <Divider label="Votre situation actuelle (foyer commun)" />

        <NumberInput
          label="Nombre de parts fiscales du couple"
          description="2 parts pour un couple marié/pacsé sans enfant"
          min={2}
          max={8}
          step={0.5}
          value={nbPartsCouple}
          onChange={(val) => setNbPartsCouple(typeof val === "number" ? val : 2)}
        />

        <NumberInput
          label="Nombre d'enfants à charge"
          description="Enfants comptabilisés dans votre quotient familial"
          min={0}
          max={8}
          value={nbEnfants}
          onChange={(val) => setNbEnfants(typeof val === "number" ? val : 0)}
        />

        <Alert color="green" title="RFR estimé de votre foyer">
          <Text size="lg" fw={700}>
            {rfrEstime.toLocaleString("fr-FR")} €
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Cette estimation tient compte de l'effet des parts fiscales. Pour
            une valeur exacte, référez-vous à votre avis d'imposition commun de
            l'année N-2.
          </Text>
        </Alert>

        {currentRFR && Math.abs(rfrEstime - currentRFR) > 1000 && (
          <Alert color="orange">
            <Text size="xs">
              La valeur estimée ({rfrEstime.toLocaleString("fr-FR")} €) diffère
              de la valeur actuelle ({currentRFR.toLocaleString("fr-FR")} €).
              Voulez-vous mettre à jour ?
            </Text>
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleCalculate}>
            Utiliser cette valeur ({rfrEstime.toLocaleString("fr-FR")} €)
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
