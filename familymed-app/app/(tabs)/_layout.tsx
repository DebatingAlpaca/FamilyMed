import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import AppHeader from '../../src/components/AppHeader';
import { useTheme } from '../../src/ThemeContext';
import { useColors } from '../../src/ThemeContext';

const icon = (name: any) => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={name} size={size} color={color} />
);

export default function TabsLayout() {
  const colors = useColors();
  useTheme();
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="medicacoes" options={{ title: 'Medicações', tabBarIcon: icon('medkit-outline') }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Família', tabBarIcon: icon('people-outline') }} />
    </Tabs>
  );
}
