import {
  NumberInput,
  Stack,
  Title,
  Text,
  Divider,
  Group,
  Switch,
} from "@mantine/core";
import { SimulationInputs, FamilyInput } from "../domain/types";

interface InputsFormProps {
  value: SimulationInputs;
  onChange: (value: SimulationInputs) => void;
}

export function InputsForm({ value, onChange }: InputsFormProps) {
  const updateGlobal = (patch: Partial<SimulationInputs>) => {
    onChange({ ...value, ...patch });
  };

  const updateFamily = (index: number, patch: Partial<FamilyInput>) => {
    const families = [...value.families];
    families[index] = { ...families[index], ...patch };
    onChange({ ...value, families });
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={4}>Paramètres généraux</Title>
        <Text size="sm" c="dimmed">
          Renseigne le taux horaire net, le nombre d&apos;heures par semaine et
          la répartition entre les deux cofamilles.
        </Text>
      </div>

      <Group grow align="flex-end">
        <NumberInput
          label="Taux horaire net"
          description="Salaire net de base de la nounou (hors majorations)"
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
          label="Heures par semaine"
          description="Heures contractuelles de garde (toutes familles confondues)"
          suffix=" h/sem"
          min={1}
          max={50}
          value={value.weeklyHours}
          onChange={(val) =>
            updateGlobal({ weeklyHours: typeof val === "number" ? val : 0 })
          }
        />
      </Group>

      <Divider label="Cofamilles" labelPosition="center" my="sm" />

      {value.families.map((fam, index) => (
        <Stack
          key={fam.id}
          gap="xs"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(0,0,0,0.05)",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <Group justify="space-between" align="center">
            <Title order={5}>{fam.label}</Title>
            <Text size="xs" c="dimmed">
              Employeur {index + 1}
            </Text>
          </Group>

          <Group grow align="flex-end">
            <NumberInput
              label="Quote-part de la garde"
              description="Part du salaire et des heures (0–1, ex: 0.5 = 50 %)"
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
              label="RFR annuel (impôt)"
              description="Revenu fiscal de référence du foyer"
              suffix=" €"
              min={0}
              step={1000}
              value={fam.taxableIncome}
              onChange={(val) =>
                updateFamily(index, {
                  taxableIncome: typeof val === "number" ? val : 0,
                })
              }
            />
          </Group>

          <Group grow align="flex-end">
            <NumberInput
              label="Enfants à charge"
              description="Nombre total d'enfants à charge pour ce foyer"
              min={0}
              max={8}
              value={fam.childrenCount}
              onChange={(val) =>
                updateFamily(index, {
                  childrenCount: typeof val === "number" ? val : 0,
                })
              }
            />
            <NumberInput
              label="Autres emplois à domicile"
              description="Dépenses annuelles éligibles (ménage, jardinage, ...)"
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
          </Group>

          <Group grow>
            <Switch
              label="Parent isolé"
              checked={fam.singleParent}
              onChange={(event) =>
                updateFamily(index, {
                  singleParent: event.currentTarget.checked,
                })
              }
            />
            <Switch
              label="1ʳᵉ année d'emploi à domicile"
              checked={fam.firstYearEmployment}
              onChange={(event) =>
                updateFamily(index, {
                  firstYearEmployment: event.currentTarget.checked,
                })
              }
            />
          </Group>
        </Stack>
      ))}
    </Stack>
  );
}
