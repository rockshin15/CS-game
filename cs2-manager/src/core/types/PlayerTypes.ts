// src/core/types/PlayerTypes.ts

// 1. Exportando a lista de funções
export type PlayerRole = 'AWPer' | 'Entry' | 'Support' | 'IGL' | 'Lurker' | 'Rifle';

// 2. Exportando os atributos (O ERRO ESTAVA AQUI PROVAVELMENTE)
export interface PlayerAttributes {
  // Físicos / Mecânicos
  aim: number;          
  reflexes: number;     
  sprayControl: number; 

  // Mentais / Táticos
  gameSense: number;    
  utility: number;      
  discipline: number;   
}

// 3. Exportando as estatísticas
export interface PlayerStats {
    kills: number;
    deaths: number;
    rating: number;
}