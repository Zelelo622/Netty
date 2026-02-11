import { FirebaseError } from "firebase/app";

export const getFirebaseErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Этот email уже используется";

    case "auth/invalid-email":
      return "Некорректный email";

    case "auth/user-not-found":
      return "Пользователь не найден";

    case "auth/wrong-password":
      return "Неверный пароль";

    case "auth/invalid-credential":
      return "Неверный логин или пароль";

    case "auth/weak-password":
      return "Пароль слишком слабый (минимум 6 символов)";

    case "auth/too-many-requests":
      return "Слишком много попыток. Попробуйте позже";

    default:
      return "Произошла ошибка. Попробуйте снова";
  }
};
