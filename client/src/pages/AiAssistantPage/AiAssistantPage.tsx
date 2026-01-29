import { useState, useRef, useEffect, type FormEvent } from "react";
import { AiApi } from "../../entities/ai/aiApi";
import type { AiGenerateResponse } from "../../entities/ai/types";
import "./AiAssistantPage.css";

const OFF_TOPIC_REPLY =
  "Я не могу помочь в этом вопросе. Я могу подробно рассказывать про сюжеты, идеи и помогать с написанием интерактивных историй — задайте вопрос по этой теме.";

const STORY_TOPIC_KEYWORDS = [
  "сюжет",
  "идея",
  "истори",
  "интерактив",
  "новелл",
  "сценари",
  "персонаж",
  "концовк",
  "ветвлен",
  "написать",
  "придумать",
  "сгенерировать",
  "помочь",
  "придумай",
  "сгенерируй",
  "напиши",
  "создай",
  "придумай",
  "сюжет",
  "завязк",
  "развити",
  "кульминац",
  "развязк",
  "жанр",
  "атмосфер",
  "текст",
  "диалог",
  "описани",
];

function isLikelyStoryRelated(text: string): boolean {
  const lower = text.trim().toLowerCase();
  if (lower.length < 3) return false;
  return STORY_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

const STORAGE_KEY = "aiAssistantChat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function loadStoredChat(): { messages: ChatMessage[]; input: string } {
  if (typeof window === "undefined") return { messages: [], input: "" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], input: "" };
    const parsed = JSON.parse(raw) as {
      messages?: ChatMessage[];
      input?: string;
    };
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      input: typeof parsed.input === "string" ? parsed.input : "",
    };
  } catch {
    return { messages: [], input: "" };
  }
}

function saveStoredChat(messages: ChatMessage[], input: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, input }),
    );
  } catch {
    //
  }
}

export default function AiAssistantPage() {
  const stored = useRef<{ messages: ChatMessage[]; input: string } | null>(
    null,
  );
  if (stored.current === null) stored.current = loadStoredChat();
  const [messages, setMessages] = useState<ChatMessage[]>(
    stored.current.messages,
  );
  const [input, setInput] = useState(stored.current.input);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveStoredChat(messages, input);
  }, [messages, input]);

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      //
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      if (!isLikelyStoryRelated(text)) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: OFF_TOPIC_REPLY },
        ]);
        setLoading(false);
        return;
      }

      const response = (await AiApi.generateText(text)) as AiGenerateResponse;
      const assistantText = response?.data ?? "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText || OFF_TOPIC_REPLY },
      ]);
    } catch (err) {
      const errMessage =
        err instanceof Error
          ? err.message
          : "Ошибка при обращении к ассистенту";
      setError(errMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Не удалось получить ответ. Попробуйте позже или переформулируйте запрос.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-page">
      <header className="ai-assistant-page-header">
        <h1 className="ai-assistant-page-title">AI-ассистент</h1>
        <p className="ai-assistant-page-description">
          Задайте вопрос по сюжетам, идеям или написанию интерактивных историй —
          ассистент подскажет и сгенерирует текст.
        </p>
      </header>

      <div className="ai-assistant-chat">
        <div className="ai-assistant-messages">
          {messages.length === 0 && (
            <div className="ai-assistant-placeholder">
              Напишите, например: «Придумай идею для интерактивной истории в
              жанре фэнтези» или «Помоги с сюжетом про детектива».
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`ai-assistant-message ai-assistant-message--${msg.role}`}
            >
              <span className="ai-assistant-message-label">
                {msg.role === "user" ? "Вы" : "Ассистент"}
              </span>
              <div className="ai-assistant-message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-assistant-message ai-assistant-message--assistant">
              <span className="ai-assistant-message-label">Ассистент</span>
              <div className="ai-assistant-message-content ai-assistant-typing">
                Думаю…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="ai-assistant-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ai-assistant-form">
          <textarea
            className="ai-assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите идею, сюжет или попросите сгенерировать текст для интерактивной истории..."
            rows={3}
            disabled={loading}
          />
          <div className="ai-assistant-form-actions">
            <button
              type="button"
              className="ai-assistant-clear-btn"
              onClick={handleClearChat}
              disabled={loading}
            >
              Очистить чат
            </button>
            <button
              type="submit"
              className="ai-assistant-submit"
              disabled={loading || !input.trim()}
            >
              {loading ? "Отправка…" : "Отправить"}
            </button>
          </div>
        </form>
      </div>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Интерактивные новеллы</h4>
              <p>
                Платформа для создания и чтения интерактивных историй нового
                поколения.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; 2026 Интерактивные новеллы. Создано с ❤️ для любителей
              хороших историй.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
