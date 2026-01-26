/** Базовый URL сервера для статики (обложки, картинки узлов). API отдаёт пути вида "covers/...". */
export const getServerBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return "http://localhost:4000";
  return apiUrl.replace(/\/api$/, "");
};
