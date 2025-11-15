import { useEffect, useState } from "react";
import {
  ActionIcon,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { SimulationInputs, FamilyInput } from "../domain/types";
import { FoyerFiscalModal } from "./FoyerFiscalModal";

interface InputsFormProps {
  value: SimulationInputs;
  onChange: (value: SimulationInputs) => void;
}

export function InputsForm({ value, onChange }: InputsFormProps) {
  const [rfrModalOpened, setRfrModalOpened] = useState(false);
  const [rfrModalFamilyIndex, setRfrModalFamilyIndex] = useState<number>(0);
  const [activeFamilyId, setActiveFamilyId] = useState(
    value.families[0]?.id ?? ""
  );

  useEffect(() => {
    if (!value.families.find((fam) => fam.id === activeFamilyId)) {
      setActiveFamilyId(value.families[0]?.id ?? "");
    }
  }, [activeFamilyId, value.families]);

  const updateGlobal = (patch: Partial<SimulationInputs>) => {
    onChange({ ...value, ...patch });
  };

  const updateFamily = (index: number, patch: Partial<FamilyInput>) => {
    const families = [...value.families];
    families[index] = { ...families[index], ...patch };
    onChange({ ...value, families });
  };

  const openRfrModal = (index: number) => {
    setRfrModalFamilyIndex(index);
    setRfrModalOpened(true);
  };

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p="md">
        <Title order={5}>Contrat demandé par la nounou</Title>
        <Text size="sm" c="dimmed" mb="sm">
          Renseigne les éléments visibles sur le bulletin de paie : taux net à
          l'heure et volume hebdomadaire (majorations incluses si &gt; 40 h, cf.
          convention garde d'enfants).
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <NumberInput
            label="Taux horaire net"
            description="Valeur nette figurant sur le bulletin de paie ou l'avenant"
            suffix=" €/h"
            min={8}
            max={30}
            step={0.1}
            value={value.netHourlyWage}
            onChange={(val) =>
              updateGlobal({ netHourlyWage: typeof val === "number" ? val : 0 })
            }
          />
          <NumberInput
            label="Heures hebdomadaires déclarées"
            description="Somme des heures prévues au contrat, toutes familles confondues"
            suffix=" h/sem"
            min={1}
            max={50}
            value={value.weeklyHours}
            onChange={(val) =>
              updateGlobal({ weeklyHours: typeof val === "number" ? val : 0 })
            }
          />
        </SimpleGrid>
      </Paper>

      <Paper withBorder radius="lg" p="md">
        <Stack gap="xs">
          <Title order={5}>Ressources familiales (CAF & impôts)</Title>
          <Text size="sm" c="dimmed">
            Ces champs correspondent aux pièces fiscales : avis d'imposition
            (RFR, parts) et déclaration 2042 (ligne 7DB pour les autres emplois
            à domicile).
          </Text>
        </Stack>

        <Tabs
          value={activeFamilyId}
          onChange={(val) => val && setActiveFamilyId(val)}
          mt="md"
          keepMounted={false}
        >
          <Tabs.List>
            {value.families.map((fam) => (
              <Tabs.Tab key={fam.id} value={fam.id}>
                {fam.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {value.families.map((fam, index) => (
            <Tabs.Panel key={fam.id} value={fam.id} pt="md">
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <NumberInput
                    label="Quote-part de la garde"
                    description="Part du salaire supportée par le foyer (contrat de garde partagée)"
                    min={0}
                    max={1}
                    step={0.05}
                    value={fam.share}
                    onChange={(val) =>
                      updateFamily(index, {
                        share: typeof val === "number" ? val : fam.share,
                      })
                    }
                  />
                  <NumberInput
                    label="Enfants à charge"
                    description="Nombre d'enfants déclarés à la CAF / impôts"
                    min={0}
                    max={8}
                    value={fam.childrenCount}
                    onChange={(val) =>
                      updateFamily(index, {
                        childrenCount: typeof val === "number" ? val : 0,
                      })
                    }
                  />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <NumberInput
                    label="RFR annuel (avis d'impôt)"
                    description="Page 2 de l'avis N-2 - sert de base aux ressources CAF"
                    suffix=" €"
                    min={0}
                    step={1000}
                    value={fam.taxableIncome}
                    onChange={(val) =>
                      updateFamily(index, {
                        taxableIncome: typeof val === "number" ? val : 0,
                      })
                    }
                    rightSection={
                      <Tooltip label="Estimer le RFR pour un nouveau foyer">
                        <ActionIcon
                          variant="subtle"
                          aria-label="Calculer le RFR"
                          onClick={() => openRfrModal(index)}
                        >
                          <IconCalculator size={16} />
                        </ActionIcon>
                      </Tooltip>
                    }
                    rightSectionPointerEvents="auto"
                  />
                  <NumberInput
                    label="Autres emplois à domicile"
                    description="Montant annuel déjà déclaré (ex : ménage - lignes 7DB/7DF)"
                    suffix=" €/an"
                    min={0}
                    step={500}
                    value={fam.otherHouseholdEmploymentPerYear}
                    onChange={(val) =>
                      updateFamily(index, {
                        otherHouseholdEmploymentPerYear:
                          typeof val === "number" ? val : 0,
                      })
                    }
                  />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Switch
                    label="Parent isolé"
                    description="Active l'extension CMG jusqu'aux 12 ans (CAF)"
                    checked={fam.singleParent}
                    onChange={(event) =>
                      updateFamily(index, {
                        singleParent: event.currentTarget.checked,
                      })
                    }
                  />
                  <Switch
                    label="1re année d'emploi à domicile"
                    description="Majore le plafond du crédit d'impôt à 15 000 €"
                    checked={fam.firstYearEmployment}
                    onChange={(event) =>
                      updateFamily(index, {
                        firstYearEmployment: event.currentTarget.checked,
                      })
                    }
                  />
                </SimpleGrid>
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Paper>

      <FoyerFiscalModal
        opened={rfrModalOpened}
        onClose={() => setRfrModalOpened(false)}
        currentRFR={value.families[rfrModalFamilyIndex]?.taxableIncome}
        onCalculated={(rfr) => {
          updateFamily(rfrModalFamilyIndex, { taxableIncome: rfr });
        }}
      />
    </Stack>
  );
}
