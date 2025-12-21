// src/core/classes/Team.ts

import type { TeamAttributes, TeamState, TeamTier, MapPoolKnowledge, TeamStrategy, TeamColors } from '../types/TeamTypes';
import { Player } from './Player';
import mapsData from '../../data/maps.json'; 
import { getRandomInt } from '../utils/rng';
import { generateTeamIdentity } from '../utils/teamGenerator';

export class Team implements TeamAttributes {
  // --- 1. Propriedades da Interface TeamAttributes ---
  id: string;
  name: string;
  shortName: string;
  region: string;
  colors: TeamColors; // NOVO: Cores (Primária/Secundária)
  tier: TeamTier;
  strategy: TeamStrategy;
  budget: number;
  prestige: number;
  mapPool: MapPoolKnowledge;

  // --- 2. Propriedades de Estado (Do TeamState) ---
  roster: Player[];
  activeLineup: Player[];

  // O construtor agora é inteligente: Gera identidade baseada no Tier
  constructor(tier: TeamTier, existingNames: string[] = []) {
    this.id = crypto.randomUUID();
    this.tier = tier;
    
    // 1. Gera Identidade (Nome, Tag, Região, Cores) automaticamente
    const identity = generateTeamIdentity(existingNames);
    this.name = identity.name;
    this.shortName = identity.shortName;
    this.region = identity.region;
    this.colors = identity.colors;

    // 2. Define Estratégia baseada no Tier
    this.strategy = this.determineStrategyByTier(tier);

    // 3. Inicializa Listas
    this.roster = [];
    this.activeLineup = []; 

    // 4. Inicializa Economia e Prestígio
    const { budget, prestige } = this.initializeEconomy(tier);
    this.budget = budget;
    this.prestige = prestige;

    // 5. Inicializa Map Pool
    this.mapPool = this.generateInitialMapPool(tier);
  }

  // --- 3. Métodos Auxiliares ---

  get state(): TeamState {
    return {
      roster: this.roster,
      activeLineup: this.activeLineup
    };
  }

  // Define como a IA monta o time baseado no dinheiro/tier
  private determineStrategyByTier(tier: TeamTier): TeamStrategy {
    if (tier === 'S') return Math.random() > 0.7 ? 'Superteam' : 'Balanced';
    if (tier === 'B') return 'Moneyball'; // Times médios buscam custo-benefício
    if (tier === 'C') return Math.random() > 0.5 ? 'Academy' : 'Balanced';
    return 'Balanced';
  }

  private initializeEconomy(tier: TeamTier): { budget: number, prestige: number } {
    switch (tier) {
      case 'S': return { budget: getRandomInt(15_000_000, 25_000_000), prestige: getRandomInt(85, 100) };
      case 'A': return { budget: getRandomInt(8_000_000, 14_000_000), prestige: getRandomInt(70, 84) };
      case 'B': return { budget: getRandomInt(2_000_000, 7_000_000), prestige: getRandomInt(50, 69) };
      case 'C': default: return { budget: getRandomInt(100_000, 1_000_000), prestige: getRandomInt(10, 49) };
    }
  }

  private generateInitialMapPool(tier: TeamTier): MapPoolKnowledge {
    const pool: MapPoolKnowledge = {};
    
    let minBase = 0, maxBase = 0;
    if (tier === 'S') { minBase = 60; maxBase = 90; }
    else if (tier === 'A') { minBase = 50; maxBase = 80; }
    else if (tier === 'B') { minBase = 30; maxBase = 70; }
    else { minBase = 10; maxBase = 50; }

    mapsData.forEach((map) => {
      const variance = getRandomInt(-10, 10);
      pool[map.id] = Math.min(100, Math.max(0, getRandomInt(minBase, maxBase) + variance));
    });

    return pool;
  }

  addPlayer(player: Player): void {
    if (this.roster.length >= 10) return;
    this.roster.push(player);
    
    // Auto-complete: Se tiver espaço na lineup titular (menos de 5), coloca ele lá automaticamente
    if (this.activeLineup.length < 5) {
        this.activeLineup.push(player);
    }
  }

  getAverageOverall(): number {
    if (this.activeLineup.length === 0) return 0;
    // Calcula a força baseada nos TITULARES, não no elenco todo
    return Math.round(this.activeLineup.reduce((acc, p) => acc + p.overall, 0) / this.activeLineup.length);
  }
}