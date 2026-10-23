import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import PatientSwitcher from '../../src/components/PatientSwitcher';
import { colors } from '../../src/theme';

const icon = (name: any) => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={name} size={size} color={color} />
);

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <PatientSwitcher />,
        headerTitleAlign: 'left',
        tabBarActiveTintColor: colors.primary,
        headerRight: () => (
          <Pressable onPress={() => router.push('/alertas')} style={{ marginRight: 16 }}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="medicacoes" options={{ title: 'Medicações', tabBarIcon: icon('medkit-outline') }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Família', tabBarIcon: icon('people-outline') }} />
    </Tabs>
  );
}
