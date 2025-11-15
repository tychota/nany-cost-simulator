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
        <Container h="100%" size="xl">
          <Group justify="space-between" align="center" h="100%">
            <div>
              <Title order={3}>Simulateur de coût – Nounou en garde partagée</Title>
              <Text size="sm" c="dimmed">
                Calcule le reste à charge 2025 en respectant les barèmes CAF & impôts.
              </Text>
            </div>
            <Anchor
              href="https://github.com/tychota"
              target="_blank"
              rel="noreferrer"
              size="sm"
              c="dimmed"
            >
              Vibecoded by Tycho Tatitscheff
            </Anchor>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl" py="md">
          <Layout
            left={<InputsForm value={inputs} onChange={setInputs} />}
            right={<ResultsSidebar result={result} />}
          />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
