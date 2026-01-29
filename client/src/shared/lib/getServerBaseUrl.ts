/** Базовый URL сервера для статики (обложки, картинки узлов). API отдаёт пути вида "covers/...". */
export const getServerBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return "http://localhost:4000";
  return apiUrl.replace(/\/api$/, "");
};

/**
 * Возвращает URL для отображения обложки истории.
 * Если в форме указан полный URL (http/https) — используется как есть.
 * Иначе к относительному пути добавляется базовый URL сервера (файлы из public/covers и т.д.).
 */
export const getCoverImageSrc = (cover: string | undefined | null): string => {
  const base = getServerBaseUrl();
  if (!cover || !cover.trim()) return `${base}/default-cover.jpg`;
  const trimmed = cover.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${base}/${trimmed.replace(/^\//, "")}`;
};
