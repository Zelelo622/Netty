import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'expo-router';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // Здесь потом будет API вызов
    console.log(isLogin ? 'LOGIN:' : 'REGISTER:', { email, password, name });

    // После "успеха" — возвращаемся в табы
    router.replace('/(tabs)');
  };

  return (
    <View className="bg-background flex-1 justify-center px-6">
      <Text className="text-foreground mb-2 text-center text-3xl font-bold">
        {isLogin ? 'Вход' : 'Регистрация'}
      </Text>

      <Text className="text-muted-foreground mb-10 text-center">
        {isLogin ? 'Войдите в существующий аккаунт' : 'Создайте аккаунт за минуту'}
      </Text>

      {!isLogin && (
        <>
          <Label className="mb-2 font-medium">Имя</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ваше имя"
            className="bg-card border-border mb-5"
            autoCapitalize="words"
          />
        </>
      )}

      <Label className="mb-2 font-medium">Email</Label>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="example@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-card border-border mb-5"
      />

      <Label className="mb-2 font-medium">Пароль</Label>
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="минимум 6 символов"
        secureTextEntry
        className="bg-card border-border mb-8"
      />

      <Button
        onPress={handleSubmit}
        className="bg-primary mb-6"
        disabled={email.length < 5 || password.length < 6 || (!isLogin && name.length < 2)}>
        <Text className="text-primary-foreground text-base font-semibold">
          {isLogin ? 'Войти' : 'Создать аккаунт'}
        </Text>
      </Button>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="self-center">
        <Text className="text-primary text-base underline">
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже зарегистрированы? Войти'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
