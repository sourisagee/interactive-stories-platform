import { useMemo } from "react";
import "./SceneElements.css";

export type SceneTheme =
  | "forest_entrance"
  | "forest"
  | "river_bridge"
  | "cave_dragon"
  | "victory"
  | "defeat"
  | "neon_city"
  | "corp_server"
  | "escape"
  | "mystic";

const FOREST = /лес|лесн|дерев|чащ|троп|забыт/i;
const ENTRANCE = /вход|край|начал|тропинк|дорог/i;
const RIVER_BRIDGE = /река|мост|берег|переход|перейти/i;
const CAVE_DRAGON = /пещера|логово|дракон|сокровищ|спящ/i;
const VICTORY = /победа|победил|сокровищ/i;
const DEFEAT = /поражение|потерп|слишком сильн/i;
const NEON = /неон|город|улиц|ночь|2077/i;
const CORP = /корпораци|сервер|штаб|охран|взлом/i;
const ESCAPE = /побег|скрыва|задание выполн/i;

export function getSceneTheme(title: string, content: string): SceneTheme {
  const t = `${title} ${content}`.toLowerCase();
  if (DEFEAT.test(t)) return "defeat";
  if (VICTORY.test(t) && !CAVE_DRAGON.test(t)) return "victory";
  if (CAVE_DRAGON.test(t)) return "cave_dragon";
  if (ESCAPE.test(t)) return "escape";
  if (RIVER_BRIDGE.test(t)) return "river_bridge";
  if (CORP.test(t)) return "corp_server";
  if (NEON.test(t)) return "neon_city";
  if (FOREST.test(t) && ENTRANCE.test(t)) return "forest_entrance";
  if (FOREST.test(t)) return "forest";
  return "mystic";
}

type SceneBackgroundProps = { title: string; content: string };

export default function SceneBackground({ title, content }: SceneBackgroundProps) {
  const theme = useMemo(() => getSceneTheme(title, content), [title, content]);

  return (
    <div className="scene-background" data-theme={theme} role="img" aria-label={title}>
      <div className="scene-sky" />
      <div className="scene-elements">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`scene-tree scene-tree-${i}`} />
        ))}
        <div className="scene-path" />
        <div className="scene-water" />
        <div className="scene-bridge" />
        <div className="scene-cave" />
        <div className="scene-cave-glow" />
        <div className="scene-dragon-eyes" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`scene-building scene-building-${i}`} />
        ))}
        <div className="scene-mist" />
        <div className="scene-victory-glow" />
        <div className="scene-defeat-void" />
        <div className="scene-escape-light" />
        <div className="scene-mystic-orb" />
      </div>
    </div>
  );
}
