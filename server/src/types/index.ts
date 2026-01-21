// import { Model, Optional } from "sequelize";
import { Request, Response, NextFunction } from "express";

// ============================================================================
// Атрибуты моделей базы данных
// ============================================================================

/**
 * Интерфейс для атрибутов модели User
 * Описывает все поля таблицы Users в базе данных
 */
export interface UserAttributes {
  /** Уникальный идентификатор пользователя */
  id: number;
  /** Имя пользователя */
  username: string;
  /** Email пользователя (уникальный) */
  email: string;
  /** Хешированный пароль пользователя */
  password: string;
  /** Дата создания записи */
  role: "user" | "author";
  createdAt?: Date;
  /** Дата последнего обновления записи */
  updatedAt?: Date;
}

/**
 * Интерфейс для создания пользователя
 * id генерируется автоматически, avatar и activationToken опциональны
 */
export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

/**
 * Интерфейс для атрибутов модели Task
 * Описывает все поля таблицы Tasks в базе данных
//  */
// export interface TaskAttributes {
//   /** Уникальный идентификатор задачи */
//   id: number;
//   /** Название задачи */
//   title: string;
//   /** Статус выполнения задачи */
//   status: boolean;
//   /** ID пользователя-владельца задачи */
//   user_id: number;
//   /** Дата создания записи */
//   createdAt?: Date;
//   /** Дата последнего обновления записи */
//   updatedAt?: Date;
// }

/**
 * Интерфейс для создания задачи
 * id генерируется автоматически
 */
// export interface TaskCreationAttributes extends Optional<
//   TaskAttributes,
//   "id"
// > {}

// ============================================================================
// Классы моделей Sequelize
// ============================================================================

/**
 * Класс модели User с типами Sequelize
 * Используется для типизации операций с таблицей Users
//  */
// export class UserModel
//   extends Model<UserAttributes, UserCreationAttributes>
//   implements UserAttributes
// {
//   declare id: number;
//   declare username: string;
//   declare email: string;
//   declare password: string;
//   declare readonly createdAt: Date;
//   declare readonly updatedAt: Date;

//   /** Ассоциации с другими моделями */
//   static associate?: (models: DbModels) => void;
//   /** Валидация email */
//   static validateEmail?: (email: string) => boolean;
//   /** Валидация пароля */
//   static validatePassword?: (password: string) => boolean;
//   /** Валидация данных при входе */
//   static validateSignInData?: (data: SignInData) => ValidationResult;
//   /** Валидация данных при регистрации */
//   static validateSignUpData?: (data: SignUpData) => ValidationResult;
// }

/**
 * Класс модели Task с типами Sequelize
 * Используется для типизации операций с таблицей Tasks
//  */
// export class TaskModel
//   extends Model<TaskAttributes, TaskCreationAttributes>
//   implements TaskAttributes
// {
//   declare id: number;
//   declare title: string;
//   declare status: boolean;
//   declare user_id: number;
//   declare readonly createdAt: Date;
//   declare readonly updatedAt: Date;

//   /** Ассоциации с другими моделями */
//   static associate?: (models: DbModels) => void;
// }

// ============================================================================
// Интерфейсы для API ответов
// ============================================================================

/**
 * Интерфейс для стандартного ответа API
 * Все ответы сервера унифицированы через этот формат
 * @template T - тип данных в поле data
 */
export interface ApiResponse<T = unknown> {
  /** HTTP статус код */
  statusCode: number;
  /** Текстовое сообщение, описывающее статус ответа */
  message: string;
  /** Данные, которые сервер возвращает клиенту */
  data: T | null;
  /** Объект с ошибкой, если она возникла */
  error: unknown;
}

// ============================================================================
// Интерфейсы для аутентификации
// ============================================================================

/**
 * Данные для входа в систему
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Данные для регистрации
 */
export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

/**
 * Результат валидации данных
 */
export interface ValidationResult {
  /** Флаг валидности данных */
  isValid: boolean;
  /** Сообщение об ошибке (если есть) */
  error: string | null;
}

/**
 * Payload для JWT токенов
 */
export interface JwtPayload {
  user: Omit<UserAttributes, "password">;
}

/**
 * Пара JWT токенов (access и refresh)
 */
export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Конфигурация JWT токенов
 */
export interface JwtConfig {
  access: {
    expiresIn: number;
  };
  refresh: {
    expiresIn: number;
  };
}

/**
 * Конфигурация cookies
 */
export interface CookieConfig {
  httpOnly: boolean;
  maxAge: number;
}

// ============================================================================
// Интерфейсы для базы данных
// ============================================================================

/**
 * Типы диалектов Sequelize
//  */
// export type SequelizeDialect =
//   | "mysql"
//   | "postgres"
//   | "sqlite"
//   | "mariadb"
//   | "mssql";

/**
 * Интерфейс для конфигурации базы данных
 */
export interface DatabaseConfig {
  use_env_variable?: string;
  database?: string;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  dialect?: SequelizeDialect;
}

/**
 * Интерфейс для объекта моделей базы данных
 */
// export interface DbModels {
//   User: typeof UserModel;
//   Task: typeof TaskModel;
//   [key: string]: unknown;
// }

// ============================================================================
// Расширения Express типов
// ============================================================================

/**
 * Расширение интерфейса Response.locals для хранения данных пользователя и задачи
 */
export interface CustomLocals {
  user?: Omit<UserAttributes, "password">;
  task?: TaskModel;
}

/**
 * Расширенный тип Response с типизированными locals
 */
export interface TypedResponse extends Response {
  locals: CustomLocals;
}

/**
 * Тип для middleware функций
 */
export type MiddlewareFunction = (
  req: Request,
  res: TypedResponse,
  next: NextFunction,
) => void | Promise<void>;

// ============================================================================
// Интерфейсы для сервисов
// ============================================================================

/**
 * Данные для создания пользователя
 */
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: "user" | "author";
}

/**
 * Данные для обновления профиля пользователя
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
}

/**
 * Данные для создания задачи
//  */
// export interface CreateTaskData {
//   title: string;
//   status?: boolean;
//   user_id: number;
// }

/**
 * Данные для обновления задачи
 */
// export interface UpdateTaskData {
//   title?: string;
//   status?: boolean;
// }

// ============================================================================
// Интерфейсы для Email сервиса
// ============================================================================

/**
 * Результат отправки email
//  */
// export interface MailResult {
//   success: boolean;
//   messageId: string;
// }

// // ============================================================================
// // Расширение типов для Multer
// // ============================================================================

// /**
//  * Request с загруженным файлом
//  */
// export interface RequestWithFile extends Request {
//   file?: Express.Multer.File;
// }
