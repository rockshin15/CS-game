import type { Player } from "../classes/Player";
// ... imports anteriores

export interface TeamColors {
    primary: string;
    secondary: string;
}

export interface TeamAttributes {
  id: string;
  name: string;
  shortName: string;
  region: string;
  
  // NOVO: Cores da Org
  colors: TeamColors;

  // Economia e Status
  tier: TeamTier;
  budget: number;
  prestige: number; 
  
  // Tático
  mapPool: MapPoolKnowledge;
  strategy: TeamStrategy;
}

// ... resto do arquivo
// Níveis de organização: S (Mundial) até C (Amador)
export type TeamTier = 'S' | 'A' | 'B' | 'C';

// Estrutura do conhecimento de mapa (0-100 para cada mapa)
export interface MapPoolKnowledge {
  [mapId: string]: number;
}

// Estratégias da IA para montar times
export type TeamStrategy = 'Superteam' | 'Moneyball' | 'Academy' | 'Balanced';

// A "Ficha Técnica" do time
export interface TeamAttributes {
  id: string;
  name: string;
  shortName: string; // Ex: "FUR", "NAVI"
  region: string;
  
  // Economia e Status
  tier: TeamTier;
  budget: number;
  prestige: number; // 0-100
  
  // Tático
  mapPool: MapPoolKnowledge;
  strategy: TeamStrategy;
}

// O estado atual do time (jogadores)
export interface TeamState {
  roster: Player[];
  activeLineup: Player[]; // Os 5 titulares
}
