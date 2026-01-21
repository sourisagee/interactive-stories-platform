import bcrypt from "bcrypt";

/**
 * Количество раундов для генерации соли
 * Рекомендуется использовать 10-12 для хорошего баланса безопасности и производительности
 */
const SALT_ROUNDS = 12;

/**
 * Хэширует пароль с использованием bcrypt
 * @param password - Пароль в открытом виде
 * @returns Promise с хэшированным паролем
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Ошибка при хэшировании пароля: ${error}`);
  }
};

/**
 * Сравнивает пароль в открытом виде с хэшированным паролем
 * @param password - Пароль в открытом виде
 * @param hashedPassword - Хэшированный пароль из базы данных
 * @returns Promise<boolean> - true если пароли совпадают, false если нет
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Ошибка при сравнении паролей: ${error}`);
  }
};

/**
 * Проверяет, является ли строка валидным bcrypt хэшем
 * @param hash - Строка для проверки
 * @returns boolean - true если строка является валидным bcrypt хэшем
 */
export const isValidHash = (hash: string): boolean => {
  // Bcrypt хэш имеет формат: $2a$10$... или $2b$10$... и длину 60 символов
  const bcryptRegex = /^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/;
  return bcryptRegex.test(hash);
};

/**
 * Генерирует случайную соль
 * @param rounds - Количество раундов (по умолчанию SALT_ROUNDS)
 * @returns Promise<string> - Сгенерированная соль
 */
export const generateSalt = async (
  rounds: number = SALT_ROUNDS
): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(rounds);
    return salt;
  } catch (error) {
    throw new Error(`Ошибка при генерации соли: ${error}`);
  }
};
