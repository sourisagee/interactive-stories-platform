import { useEffect, useState } from "react";
import type { NodeWithChoices } from "../../entities/story/model";
import "./GamePlayPage.css";

type GamePlayStatsProps = {
  currentNode: NodeWithChoices;
  restartKey: number;
};

export default function GamePlayStats({ currentNode, restartKey }: GamePlayStatsProps) {
  const [health, setHealth] = useState<number>(2);
  const [courage, setCourage] = useState<number>(0);
  const [ingenuity, setIngenuity] = useState<number>(0);
  const [respect, setRespect] = useState<number>(0);

  const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

  // Сброс при рестарте
  useEffect(() => {
    setHealth(2);
    setCourage(0);
    setIngenuity(0);
    setRespect(0);
  }, [restartKey]);

  // Обновление статусов при переходе в новый узел
  useEffect(() => {
    // На стартовом узле показатели остаются базовыми (смелость/находчивость/уважение = 0)
    if (currentNode.isStart) return;

    const text = `${currentNode.title} ${currentNode.content}`.toLowerCase();
    const isEnd = currentNode.isEnd;

    const isBadEnd =
      isEnd &&
      /смерт|умира|погиб|поражени|проигрыш|полное стирание|провал|тюрьм|катастроф/i.test(
        text,
      );

    const isGoodEnd =
      isEnd &&
      /побед|счастлив|новый мир|надежд|успех|спасен|спасён|свободен|хранител/i.test(
        text,
      );

    setHealth((prev) => {
      if (isBadEnd) return prev - 1;
      if (isGoodEnd) return prev + 1;
      return prev;
    });

    // Смелость: рискованные или самоотверженные решения
    const braveKeywords =
      /сразить|сразиться|атак|напасть|остаться|жертв|пожертв|защитить|щит|страж/i;
    const cowardKeywords =
      /убежать|сбежать|спрятаться|спряч|избежать боя|отступить|отступлени/i;

    setCourage((prev) => {
      if (braveKeywords.test(text)) return prev + 1;
      if (cowardKeywords.test(text)) return prev - 1;
      return prev;
    });

    // Находчивость: хитрость, взлом, нестандартные решения
    const ingenuityGood =
      /взлом|хак|обойти|перехитрить|хитрость|обмануть|обман|головоломк|загадк/i;
    const ingenuityBad =
      /ошибка расчета|просчёт|просчет|план провален|не удалось/i;

    setIngenuity((prev) => {
      if (ingenuityGood.test(text)) return prev + 1;
      if (ingenuityBad.test(text)) return prev - 1;
      return prev;
    });

    // Уважение: серьёзные, жертвенные выборы, влияние на репутацию
    const respectPlus =
      /спасти|защитить|выбрать других|пожертвовать собой|пожертвовать силой|спасён город|ордена|герой/i;
    const respectMinus =
      /предал|предательство|бросить|оставить умирать|продать|продал|предать/i;

    setRespect((prev) => {
      if (respectPlus.test(text)) return prev + 1;
      if (respectMinus.test(text)) return prev - 1;
      return prev;
    });
  }, [currentNode]);

  const healthPercent = clampPercent(health * 10);
  const couragePercent = clampPercent(Math.abs(courage) * 10);
  const ingenuityPercent = clampPercent(Math.abs(ingenuity) * 10);
  const respectPercent = clampPercent(Math.abs(respect) * 10);

  const outcome: string | null = currentNode.isEnd
    ? health <= 0
      ? "трагической развязке"
      : respect >= 3
        ? "уважаемому и вдохновляющему финалу"
        : courage >= 2 && ingenuity >= 2
          ? "смелому и находчивому финалу"
          : respect <= -2
            ? "спорной репутации и неоднозначному финалу"
            : "неоднозначному, но запоминающемуся финалу"
    : null;

  return (
    <>
      <aside className="game-play-stats" aria-label="Статус персонажа">
        <h3 className="game-play-stats-title">Статус героя</h3>

        <div className="game-play-health">
          <div className="game-play-health-header">
            <span className="game-play-health-label">Здоровье</span>
            <span className="game-play-health-value">{health}</span>
          </div>
          <div className="game-play-health-bar">
            <div
              className="game-play-health-bar-fill"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        <div className="game-play-stats-list">
          <div className="game-play-stat-block">
            <div className="game-play-stat-row">
              <span className="game-play-stat-name">Смелость</span>
              <span className="game-play-stat-value">{courage}</span>
            </div>
            <div className="game-play-stat-bar">
              <div className="game-play-health-bar">
                <div
                  className="game-play-health-bar-fill"
                  style={{ width: `${couragePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="game-play-stat-block">
            <div className="game-play-stat-row">
              <span className="game-play-stat-name">Находчивость</span>
              <span className="game-play-stat-value">{ingenuity}</span>
            </div>
            <div className="game-play-stat-bar">
              <div className="game-play-health-bar">
                <div
                  className="game-play-health-bar-fill"
                  style={{ width: `${ingenuityPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="game-play-stat-block">
            <div className="game-play-stat-row">
              <span className="game-play-stat-name">Уважение</span>
              <span className="game-play-stat-value">{respect}</span>
            </div>
            <div className="game-play-stat-bar">
              <div className="game-play-health-bar">
                <div
                  className="game-play-health-bar-fill"
                  style={{ width: `${respectPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {outcome && (
        <div className="game-play-outcome-card">
          <p className="game-play-outcome-label">Ваши решения привели вас к:</p>
          <p className="game-play-outcome-text">{outcome}</p>
        </div>
      )}
    </>
  );
}

