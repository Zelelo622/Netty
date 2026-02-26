import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';

export default function Profile() {
  return (
    <View className="bg-background flex-1 items-center justify-center px-6">
      <Text className="text-foreground mb-4 text-3xl font-bold">Профиль</Text>

      <Text className="text-muted-foreground mb-8 text-center">
        Чтобы увидеть личный кабинет и настройки — войдите в аккаунт
      </Text>

      <Link href="/(auth)" asChild>
        <Button className="bg-primary rounded-full px-12 py-4">
          <Text className="text-primary-foreground text-lg font-semibold">
            Войти / Зарегистрироваться
          </Text>
        </Button>
      </Link>
    </View>
  );
}
