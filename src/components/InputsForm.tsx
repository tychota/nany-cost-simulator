import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  ActionIcon,
  Alert,
  Button,
  Group,
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
import {
  IconCalculator,
  IconInfoCircle,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { FAMILY_BLUEPRINT } from "../domain/constants";
import { SimulationInputs, FamilyInput } from "../domain/types";
import { FoyerFiscalModal } from "./FoyerFiscalModal";

interface InputsFormProps {
  value: SimulationInputs;
  onChange: (value: SimulationInputs) => void;
}

const HOURS_WARNING =
  "La convention FEPEM limite la garde à 50 h hebdomadaires et 48 h en moyenne sur 12 semaines. Prévoyez des récupérations si vous dépassez 48 h.";

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

  const handleAddFamily = () => {
    if (value.families.length >= 2) return;
    const idx = value.families.length + 1;
    const newFamily: FamilyInput = {
      id: `fam-${Date.now()}`,
      label: `Famille ${idx}`,
      share: FAMILY_BLUEPRINT.share,
      taxableIncome: FAMILY_BLUEPRINT.taxableIncome,
      otherHouseholdEmploymentPerYear:
        FAMILY_BLUEPRINT.otherHouseholdEmploymentPerYear,
      childrenCount: FAMILY_BLUEPRINT.childrenCount,
      singleParent: FAMILY_BLUEPRINT.singleParent,
      firstYearEmployment: FAMILY_BLUEPRINT.firstYearEmployment,
    };
    const families = [...value.families, newFamily];
    onChange({ ...value, families });
    setActiveFamilyId(newFamily.id);
  };

  const handleRemoveFamily = (id: string) => {
    if (value.families.length <= 1) return;
    const families = value.families.filter((fam) => fam.id !== id);
    onChange({ ...value, families });
    if (activeFamilyId === id) {
      setActiveFamilyId(families[0]?.id ?? "");
    }
  };

  const activeFamily = useMemo(
    () => value.families.find((fam) => fam.id === activeFamilyId),
    [activeFamilyId, value.families]
  );

  return (
    <Stack gap="lg">
      <section>
        <Title order={5}>Contrat demandé par la nounou</Title>
        <Text size="sm" c="dimmed" mb="sm">
          Ces valeurs proviennent directement du contrat ou de la fiche de paie
          : elles servent à mensualiser les heures (52/12) et à calculer les
          aides.
        </Text>
        <SimpleGrid cols={{ base: 1 }} spacing="md">
          <NumberInput
            label={
              <FieldLabel
                label="Taux horaire net"
                info="Utilisé pour plafonner le CMG à 15 € nets/heure (Décret 2025-515)."
              />
            }
            suffix=" €/h"
            min={9}
            max={30}
            step={0.1}
            value={value.netHourlyWage}
            onChange={(val) =>
              updateGlobal({ netHourlyWage: typeof val === "number" ? val : 0 })
            }
          />
          <NumberInput
            label={
              <FieldLabel
                label="Heures hebdomadaires déclarées"
                info="Base de la mensualisation (52/12) et des majorations +25 % / +50 % au-dessus de 40 h."
              />
            }
            suffix=" h/sem"
            min={1}
            max={50}
            value={value.weeklyHours}
            onChange={(val) =>
              updateGlobal({ weeklyHours: typeof val === "number" ? val : 0 })
            }
          />
        </SimpleGrid>
        {value.weeklyHours > 48 && (
          <Alert mt="md" color="yellow" title="Attention à la durée légale">
            {HOURS_WARNING}
          </Alert>
        )}
      </section>

      <section>
        <div>
          <Title order={5}>Ressources familiales (CAF & impôts)</Title>
          <Text size="sm" c="dimmed">
            Ces montants proviennent de l'avis d'impôt N-2 et de votre
            déclaration 2042. Ils conditionnent le CMG et le crédit d'impôt.
          </Text>
        </div>

        <Tabs
          value={activeFamilyId}
          onChange={(val) => val && setActiveFamilyId(val)}
          keepMounted={false}
          variant="outline"
        >
          <Group
            justify="space-between"
            align="center"
            gap="xs"
            wrap="nowrap"
            mt="sm"
          >
            <div style={{ flex: 1 }}>
              <Tabs.List>
                {value.families.map((fam, index) => (
                  <Tabs.Tab key={fam.id} value={fam.id}>
                    {fam.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </div>

            <Button
              variant="light"
              size="xs"
              color={value.families.length >= 2 ? "red" : undefined}
              leftSection={
                value.families.length >= 2 ? (
                  <IconTrash size={14} />
                ) : (
                  <IconPlus size={14} />
                )
              }
              onClick={() => {
                if (value.families.length >= 2) {
                  const secondFam = value.families[1];
                  if (secondFam) handleRemoveFamily(secondFam.id);
                } else {
                  handleAddFamily();
                }
              }}
            >
              {value.families.length >= 2 ? "Supprimer" : "Ajouter"}
            </Button>
          </Group>

          {value.families.map((fam, index) => (
            <Tabs.Panel key={fam.id} value={fam.id} pt="md">
              <Paper radius="md" p="md">
                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1 }} spacing="md">
                    <NumberInput
                      label={
                        <FieldLabel
                          label="Revenu fiscal de référence (avis d'impôt N-2)"
                          info="Les caisses CAF utilisent l'avis d'impôt N-2 pour calculer les ressources CMG."
                        />
                      }
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
                        <Tooltip label="Estimer le revenu fiscal si votre foyer est récent">
                          <ActionIcon
                            variant="subtle"
                            aria-label="Calculer"
                            onClick={() => openRfrModal(index)}
                          >
                            <IconCalculator size={16} />
                          </ActionIcon>
                        </Tooltip>
                      }
                      rightSectionPointerEvents="auto"
                    />
                    <NumberInput
                      label={
                        <FieldLabel
                          label="Autres emplois à domicile déclarés (lignes 7DB/7DF)"
                          info="Ces dépenses sont prises en compte dans le crédit d'impôt de 50 % (Service-Public)."
                        />
                      }
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

                  <Accordion variant="contained" radius="md">
                    <Accordion.Item value={`advanced-${fam.id}`}>
                      <Accordion.Control>Options détaillées</Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="md">
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Stack gap={6}>
                              <FieldLabel
                                label="Part du salaire supportée"
                                info="Répartition contractuelle entre cofamilles (0-100 %)."
                              />
                              <NumberInput
                                label={undefined}
                                suffix="%"
                                min={0}
                                max={100}
                                step={5}
                                value={Math.round(fam.share * 1000) / 10}
                                onChange={(val) =>
                                  updateFamily(index, {
                                    share:
                                      typeof val === "number"
                                        ? val / 100
                                        : fam.share,
                                  })
                                }
                              />
                            </Stack>
                            <Stack gap={6}>
                              <FieldLabel
                                label="Nombre d'enfants à charge"
                                info="Le décret 2025-515 applique un taux d'effort plus favorable quand la fratrie augmente."
                              />
                              <NumberInput
                                label={undefined}
                                min={0}
                                max={8}
                                value={fam.childrenCount}
                                onChange={(val) =>
                                  updateFamily(index, {
                                    childrenCount:
                                      typeof val === "number" ? val : 0,
                                  })
                                }
                              />
                            </Stack>
                          </SimpleGrid>
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Stack gap={4}>
                              <Switch
                                label="Parent isolé"
                                description="Donne droit à un CMG jusqu'aux 12 ans de l'enfant."
                                checked={fam.singleParent}
                                onChange={(event) =>
                                  updateFamily(index, {
                                    singleParent: event.currentTarget.checked,
                                  })
                                }
                              />
                            </Stack>
                            <Stack gap={4}>
                              <Switch
                                label="1re année d'emploi à domicile"
                                description="Majore le plafond du crédit d'impôt à 15 000 € (18 000 € max)."
                                checked={fam.firstYearEmployment}
                                onChange={(event) =>
                                  updateFamily(index, {
                                    firstYearEmployment:
                                      event.currentTarget.checked,
                                  })
                                }
                              />
                            </Stack>
                          </SimpleGrid>
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Stack>
              </Paper>
            </Tabs.Panel>
          ))}
        </Tabs>
      </section>

      <FoyerFiscalModal
        opened={rfrModalOpened}
        onClose={() => setRfrModalOpened(false)}
        currentRFR={activeFamily?.taxableIncome}
        onCalculated={(rfr) => {
          updateFamily(rfrModalFamilyIndex, { taxableIncome: rfr });
        }}
      />
    </Stack>
  );
}

interface FieldLabelProps {
  label: string;
  info?: string;
}

function FieldLabel({ label, info }: FieldLabelProps) {
  return (
    <Group gap={4} align="center">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {info && (
        <Tooltip label={info} multiline maw={260}>
          <ActionIcon variant="subtle" radius="xl" size="sm" component="span">
            <IconInfoCircle size={14} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
