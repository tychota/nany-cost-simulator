import { ReactNode } from "react";
import { Grid, Paper } from "@mantine/core";

interface LayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function Layout({ left, right }: LayoutProps) {
  return (
    <Grid gutter="md" align="stretch">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Paper shadow="sm" p="md" radius="lg" withBorder>
          {left}
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Paper shadow="sm" p="md" radius="lg" withBorder>
          {right}
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
