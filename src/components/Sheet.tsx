import { ReactNode } from "react";
import { Badge, Divider, Group, Stack, Text } from "@mantine/core";

interface SheetSectionProps {
  title: string;
  description?: string;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SheetSection({
  title,
  description,
  badge,
  action,
  children,
}: SheetSectionProps) {
  return (
    <Stack
      gap="sm"
      p="md"
      style={{ background: "rgba(248,250,252,0.9)", borderRadius: 16 }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={700}>{title}</Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        <Group gap="xs">
          {badge && (
            <Badge variant="light" color="violet">
              {badge}
            </Badge>
          )}
        </Group>
      </Group>
      {action}
      <Divider />
      <Stack gap="sm">{children}</Stack>
    </Stack>
  );
}

interface SectionRowProps {
  label: string;
  value: string;
  hint?: string;
}

export function SectionRow({ label, value, hint }: SectionRowProps) {
  return (
    <div>
      <Group justify="space-between" align="flex-start" gap="md">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Text size="md" fw={700}>
          {value}
        </Text>
      </Group>
      {hint && (
        <Text size="xs" c="dimmed" mt={-4}>
          {hint}
        </Text>
      )}
    </div>
  );
}
