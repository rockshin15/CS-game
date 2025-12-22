import type { Player } from "../classes/Player";

// Cores da Organização
export interface TeamColors {
    primary: string;
    secondary: string;
}

// Níveis de organização
export type TeamTier = 'S' | 'A' | 'B' | 'C';

// Estratégias de contratação
export type TeamStrategy = 'Superteam' | 'Moneyball' | 'Academy' | 'Balanced';

// NOVO: Estilos de jogo (Personalidade do time)
export type TeamPlayStyle = 'Aggressive' | 'Tactical' | 'Chaos' | 'Clutch Kings';

// Conhecimento de mapa
export interface MapPoolKnowledge {
    [mapId: string]: number;
}

// A FICHA TÉCNICA UNIFICADA DO TIME
export interface TeamAttributes {
  id: string;
  name: string;
  shortName: string;
  region: string;
  
  // Visual
  colors: TeamColors;

  // Economia e Status
  tier: TeamTier;
  budget: number;
  prestige: number; 
  
  // Tático e Comportamental
  mapPool: MapPoolKnowledge;
  strategy: TeamStrategy;
  playStyle: TeamPlayStyle; // A propriedade obrigatória nova
}

// Estado do time (Elenco)
export interface TeamState {
  roster: Player[];
  activeLineup: Player[];
}