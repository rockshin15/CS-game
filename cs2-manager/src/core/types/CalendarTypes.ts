// src/core/types/CalendarTypes.ts

export type Month = 'Jan' | 'Fev' | 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov' | 'Dez';

export type SeasonPhase = 
  | 'PRE_SEASON'   // Jan: Treinos, Bootcamps
  | 'SPLIT_1'      // Fev-Mai: Circuitos
  | 'MID_SEASON'   // Jun: Major 1 / Transferências
  | 'SPLIT_2'      // Jul-Out: Circuitos
  | 'WORLD_FINALS' // Nov-Dez: Major 2 / Finals
  | 'OFF_SEASON';  // Dez: Férias

export type EventTier = 'S' | 'A' | 'B' | 'Qualify';

export type EventType = 
  | 'League'       // Longa duração (ex: ESL Pro League)
  | 'Tournament'   // Tiro curto (ex: IEM Katowice)
  | 'Major'        // O mais importante
  | 'Qualifier'    // Classificatório
  | 'Bootcamp'     // Treino (Reduz fadiga futura, aumenta skill)
  | 'Break';       // Descanso obrigatório

export interface GameDate {
  week: number; // 1 a 4
  month: Month;
  year: number;
}

export interface CalendarEvent {
  id: string;
  name: string;
  type: EventType;
  tier: EventTier;
  
  // Quando acontece?
  startMonth: Month;
  startWeek: number;
  durationWeeks: number;

  // Mecânicas do seu Doc
  prestige: number;     // Define se vale a pena jogar
  fatigueCost: number;  // Quanto cansa o time
  prizePool: number;
  
  // Requisitos
  minTeamTier: string;  // Ex: Só times Tier S recebem convite

  
}
export type EventStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

export interface CalendarEvent {
  id: string;
  name: string;
  type: EventType;
  tier: EventTier;
  
  startMonth: Month;
  startWeek: number;
  durationWeeks: number;

  prestige: number;
  fatigueCost: number;
  prizePool: number;
  minTeamTier: string;

  // NOVO CAMPO:
  status: EventStatus; 
}