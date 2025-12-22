// src/features/calendar/CalendarGenerator.ts
import type { CalendarEvent, Month } from "../../core/types/CalendarTypes";

// Ordem dos meses para lógica de progressão
export const MONTHS: Month[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export class CalendarGenerator {
  
  static generateYearlySchedule(year: number): CalendarEvent[] {
    const schedule: CalendarEvent[] = [];
    const suffix = year.toString().slice(-2); // Ex: "25" para 2025

    // === 🟦 1. PRÉ-TEMPORADA (JANEIRO) ===
    // Foco: Bootcamps e Qualifiers pequenos
    schedule.push({
      id: `bootcamp_jan_${suffix}`,
      name: "Pre-Season Bootcamp",
      type: 'Bootcamp',
      tier: 'B',
      status: 'PENDING',
      startMonth: 'Jan',
      startWeek: 1,
      durationWeeks: 2,
      prestige: 0,
      fatigueCost: 10, // Baixo custo, alto ganho de XP
      prizePool: 0,
      minTeamTier: 'C',
      format: 'SINGLE_ELIMINATION',
      totalTeams: 32,
    }); // <--- CORREÇÃO 1: Faltava fechar o objeto e o método push aqui

    schedule.push({
      id: `iem_katowice_qualifier_${suffix}`,
      name: "Katowice Play-Ins",
      type: 'Qualifier',
      tier: 'A',
      status: 'PENDING',
      startMonth: 'Jan',
      startWeek: 3,
      durationWeeks: 1,
      prestige: 10,
      fatigueCost: 20,
      prizePool: 0,
      minTeamTier: 'B',
      format: 'GSL_GROUPS',
      totalTeams: 16
    });

    // === 🟩 2. SPLIT 1 (FEV - MAI) ===
    
    // Tier S: Evento Elite (Tipo Katowice)
    schedule.push({
      id: `iem_katowice_${suffix}`,
      name: "IEM Katowice", // O "Cologne-like" do começo do ano
      type: 'Tournament',
      tier: 'S',
      status: 'PENDING',
      startMonth: 'Fev',
      startWeek: 1,
      durationWeeks: 2,
      prestige: 100,
      fatigueCost: 50, // Cansa muito
      prizePool: 1000000,
      minTeamTier: 'A',
      format: 'SWISS',
      totalTeams: 16
    });

    // Tier A: Pro League (Liga longa)
    schedule.push({
      id: `pro_league_s1_${suffix}`,
      name: "ESL Pro League S1",
      type: 'League',
      tier: 'A',
      status: 'PENDING',
      startMonth: 'Mar',
      startWeek: 1,
      durationWeeks: 4, // Dura o mês todo
      prestige: 60,
      fatigueCost: 40,
      prizePool: 750000,
      minTeamTier: 'B',
      format: 'SINGLE_ELIMINATION',
      totalTeams: 24,
    });

    // Tier B: Regionais (Para quem não foi pra Pro League)
    schedule.push({
      id: `cct_online_1_${suffix}`,
      name: "CCT Online Series 1",
      type: 'Tournament',
      tier: 'B',
      status: 'PENDING',
      startMonth: 'Mar',
      startWeek: 2,
      durationWeeks: 2,
      prestige: 20,
      fatigueCost: 15,
      prizePool: 50000,
      minTeamTier: 'C',
      format: 'SINGLE_ELIMINATION',
      totalTeams: 16
    });

    // === 🟨 3. MID-SEASON (JUNHO - O MAJOR) ===
    schedule.push({
      id: `major_copenhagen_${suffix}`,
      name: "PGL Major Copenhagen",
      type: 'Major',
      tier: 'S',
      status: 'PENDING',
      startMonth: 'Jun',
      startWeek: 1,
      durationWeeks: 3,
      prestige: 200, // O máximo
      fatigueCost: 80, // Burnout quase certo se não descansou antes
      prizePool: 1250000,
      minTeamTier: 'Qualifier', // Precisa ter passado no RMR (Lógica futura)
      format: 'SWISS',
      totalTeams: 24
    });

    // Player Break pós-major (Obrigatório)
    schedule.push({
      id: `player_break_summer_${suffix}`,
      name: "Player Break (Summer)",
      type: 'Break',
      tier: 'B',
      status: 'PENDING',
      startMonth: 'Jun',
      startWeek: 4,
      durationWeeks: 4, // Pega Julho tbm na vida real, mas simplifiquei
      prestige: 0,
      fatigueCost: -100, // Recupera TUDO
      prizePool: 0,
      minTeamTier: 'C',
      format: 'SINGLE_ELIMINATION',
      totalTeams: 24
    });

    // === 🟧 4. SPLIT 2 (JUL - OUT) ===
    schedule.push({
      id: `iem_cologne_${suffix}`,
      name: "IEM Cologne", // A Catedral
      type: 'Tournament',
      tier: 'S',
      status: 'PENDING',
      startMonth: 'Ago',
      startWeek: 1,
      durationWeeks: 2,
      prestige: 100,
      fatigueCost: 50,
      prizePool: 1000000,
      minTeamTier: 'A',
      format: 'GSL_GROUPS', // <--- Ajuste: Corrigi de GGL para GSL (assumindo typo)
      totalTeams: 24
    });

    // === 🟥 5. WORLD FINALS (NOV - DEZ) ===
    schedule.push({
      id: `blast_world_final_${suffix}`,
      name: "BLAST World Final",
      type: 'Tournament',
      tier: 'S',
      status: 'PENDING',
      startMonth: 'Nov',
      startWeek: 3,
      durationWeeks: 1,
      prestige: 90,
      fatigueCost: 40,
      prizePool: 1000000,
      minTeamTier: 'S', // <--- CORREÇÃO 2: Faltava a vírgula aqui
      format: 'SINGLE_ELIMINATION',
      totalTeams: 8
    });

    // Major 2 (Shanghai/Paris/Rio)
    schedule.push({
      id: `major_shanghai_${suffix}`,
      name: "Perfect World Major",
      type: 'Major',
      tier: 'S',
      status: 'PENDING',
      startMonth: 'Dez',
      startWeek: 1,
      durationWeeks: 2,
      prestige: 200,
      fatigueCost: 90,
      prizePool: 1250000,
      minTeamTier: 'Qualifier',
      format: 'SWISS',
      totalTeams: 24
    });

    return schedule;
  }
}
// <--- CORREÇÃO 3: Removida a terceira chave que estava sobrando