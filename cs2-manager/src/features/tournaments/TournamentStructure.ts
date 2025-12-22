// src/features/tournaments/TournamentStructure.ts
import type{ TeamAttributes } from "../../core/types/TeamTypes";

export interface MatchPairing {
  teamA: TeamAttributes;
  teamB: TeamAttributes;
  stage: string; // 'Round 1', 'Upper Final', 'Elimination'
}

export class TournamentStructure {

  // === SISTEMA SUÍÇO (Major) ===
  // Input: Lista de times e seus scores atuais { wins, losses }
  static generateSwissPairings(
    teams: TeamAttributes[], 
    standings: Record<string, { wins: number, losses: number, played: string[] }>
  ): MatchPairing[] {
    const pairings: MatchPairing[] = [];
    const pool = [...teams];

    // Agrupa times por Score (Ex: Grupo dos "1-0", Grupo dos "0-2")
    const scoreGroups: Record<string, TeamAttributes[]> = {};
    
    pool.forEach(team => {
      const record = standings[team.id] || { wins: 0, losses: 0 };
      // Se já classificou (3 wins) ou eliminou (3 losses), ignora
      if (record.wins >= 3 || record.losses >= 3) return;

      const key = `${record.wins}-${record.losses}`;
      if (!scoreGroups[key]) scoreGroups[key] = [];
      scoreGroups[key].push(team);
    });

    // Gera confrontos dentro de cada grupo
    Object.values(scoreGroups).forEach(group => {
      // Embaralha para não ser sempre os mesmos
      const shuffled = group.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          pairings.push({
            teamA: shuffled[i],
            teamB: shuffled[i+1],
            stage: `Swiss Round (${standings[shuffled[i].id].wins}-${standings[shuffled[i].id].losses})`
          });
        } else {
          // Bye (sobrou um time impar), vitória automática
          console.log(`Bye para ${shuffled[i].name}`);
        }
      }
    });

    return pairings;
  }

  // === GRUPOS GSL (IEM/Blast) ===
  // Gera apenas a rodada de Abertura para um grupo de 4 times
  static generateGSLOpening(groupTeams: TeamAttributes[]): MatchPairing[] {
    if (groupTeams.length < 4) return [];
    
    // Seed simples: 1vs4, 2vs3
    return [
      { teamA: groupTeams[0], teamB: groupTeams[3], stage: 'Opening Match A' },
      { teamA: groupTeams[1], teamB: groupTeams[2], stage: 'Opening Match B' }
    ];
  }

  // === MATA-MATA (Playoffs) ===
  static generatePlayoffs(teams: TeamAttributes[]): MatchPairing[] {
    const pairings: MatchPairing[] = [];
    const n = teams.length;
    // Assume que 'teams' já vem ordenado por seed (1º vs 8º)
    for (let i = 0; i < n / 2; i++) {
      pairings.push({
        teamA: teams[i],
        teamB: teams[n - 1 - i],
        stage: 'Quarter-Final' // Exemplo genérico
      });
    }
    return pairings;
  }
}