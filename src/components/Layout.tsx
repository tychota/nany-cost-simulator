import { ReactNode } from "react";
import { Grid, Paper } from "@mantine/core";

interface LayoutProps {
  left: ReactNode;
  leftbottom?: ReactNode;
  right: ReactNode;
}

export function Layout({ left, leftbottom, right }: LayoutProps) {
  return (
    <Grid gutter="md" align="stretch">
      <Grid.Col span={{ base: 12, lg: 5 }}>
        <Paper shadow="sm" p="md" radius="lg" withBorder>
          {left}
        </Paper>
        {leftbottom && (
          <Paper shadow="sm" p="md" radius="lg" withBorder mt="md">
            {leftbottom}
          </Paper>
        )}
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 7 }}>{right}</Grid.Col>
    </Grid>
  );
}
