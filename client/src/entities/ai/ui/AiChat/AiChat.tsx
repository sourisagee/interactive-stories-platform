import { AiApi } from "../../aiApi";
import "./AiChat.css";
import { useState, type FormEvent } from "react";
import type { AiAuthorPrompt } from "../../types/index";

function AIChat() {
  const [prompt, setPrompt] = useState<AiAuthorPrompt["prompt"]>("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const serverResponse = await AiApi.generateText(prompt.trim());
      // data может быть null, поэтому подстраховываемся
      setResponse(serverResponse.data ?? "");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat">
      <form onSubmit={handleSubmit}>
        {/* Поле, куда автор пишет запрос к AI (идею / задачу) */}
        <textarea
          className="ai-chat-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опиши, какую интерактивную новеллу или сюжет тебе нужно придумать..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Загрузка..." : "Попросить AI помочь с историей"}
        </button>
      </form>

      {response && (
        <div className="response">
          <h3>Ответ AI:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default AIChat;
