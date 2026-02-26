import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)/(tabs)',
};

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Drawer
          screenOptions={{
            drawerStyle: {
              width: 300,
              backgroundColor: 'var(--color-sidebar)',
            },
            drawerType: 'front',
            swipeEnabled: true,
            headerShown: false,
            overlayColor: 'rgba(0,0,0,0.4)',
          }}>
          <Drawer.Screen
            name="(app)/(tabs)"
            options={{
              drawerLabel: 'Главная',
              title: 'Home',
            }}
          />
          <Drawer.Screen
            name="(app)/settings"
            options={{ drawerLabel: 'Настройки', title: 'Settings' }}
          />
        </Drawer>

        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
