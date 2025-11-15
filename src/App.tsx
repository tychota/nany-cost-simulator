import { useMemo, useState } from "react";
import { AppShell, Container, Group, Title, Text, Anchor } from "@mantine/core";
import { Layout } from "./components/Layout";
import { InputsForm } from "./components/InputsForm";
import { ResultsSidebar } from "./components/ResultsSidebar";
import { DEFAULT_INPUTS } from "./domain/constants";
import { SimulationInputs } from "./domain/types";
import { computeSimulation } from "./domain/calculator";

function App() {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => computeSimulation(inputs), [inputs]);

  return (
    <AppShell
      header={{ height: 64 }}
      padding="md"
      styles={{
        main: {
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        },
      }}
    >
      <AppShell.Header>
        <Container h="100%" size="lg">
          <Group justify="space-between" align="center" h="100%">
            <div>
              <Title order={3}>
                Simulateur de coût – Nounou en garde partagée
              </Title>
              <Text size="sm" c="dimmed">
                Frontend statique – calculs locaux, règles 2025 paramétrables.
              </Text>
            </div>
            <Text size="xs" c="dimmed">
              Made with React + Vite + Mantine
            </Text>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Layout
            left={<InputsForm value={inputs} onChange={setInputs} />}
            right={<ResultsSidebar inputs={inputs} result={result} />}
          />
          <Text mt="md" size="xs" c="dimmed" ta="right">
            ⚠️ Ce simulateur simplifie certains paramètres (taux URSSAF, barèmes
            CMG, plafonds). Adapte les constantes dans{" "}
            <code>domain/constants.ts</code> pour coller aux textes officiels.
          </Text>
          <Text mt={4} size="xs" c="dimmed" ta="right">
            Déployable tel quel sur Vercel / GitHub Pages (build statique).
          </Text>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
