import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text className="text-foreground text-3xl font-bold">Добро пожаловать!</Text>
      <Text className="text-muted-foreground mt-4">Это главный экран</Text>
    </View>
  );
}
