import React, { createContext, useState } from 'react';

type GameState = {
  day: number;
};

export const GameContext = createContext<{
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({ day: 1 });
  return <GameContext.Provider value={{ state, setState }}>{children}</GameContext.Provider>;
}
