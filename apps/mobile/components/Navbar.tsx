import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { TouchableOpacity, View, Text } from 'react-native';

export default function Navbar() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View className="bg-background border-border flex-row items-center justify-between px-4 py-3">
      <TouchableOpacity onPress={openDrawer}>
        <Menu size={24} color="var(--color-foreground)" />
      </TouchableOpacity>

      <Text className="text-foreground text-xl font-bold">Netty</Text>

      <View className="flex-row gap-4"></View>
    </View>
  );
}
