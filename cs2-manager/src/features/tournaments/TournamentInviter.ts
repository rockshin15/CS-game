// src/features/tournaments/TournamentInviter.ts
import type{ TeamAttributes } from "../../core/types/TeamTypes";
import type{ CalendarEvent } from "../../core/types/CalendarTypes";

export class TournamentInviter {

  /**
   * Gera a lista final de participantes para um evento.
   * Leva em conta a escolha do Player (userTeam) e o Rank dos bots.
   */
  static getParticipants(
    allTeams: TeamAttributes[], 
    event: CalendarEvent,
    userTeamId: string
  ): TeamAttributes[] {
    
    const participants: TeamAttributes[] = [];
    const needed = event.totalTeams;

    // 1. Verificar o Time do Jogador (User)
    // Se o evento estiver 'ACCEPTED' e o time for elegível (ou convidado), ele entra garantido.
    const userTeam = allTeams.find(t => t.id === userTeamId);
    let userSlotTaken = false;

    if (userTeam && event.status === 'ACCEPTED') {
      // Verifica elegibilidade básica (Tier)
      if (this.isEligible(userTeam, event.minTeamTier)) {
        participants.push(userTeam);
        userSlotTaken = true;
      }
    } else if (event.status === 'DECLINED') {
      // Jogador explicitamente recusou, não incluir.
    }

    // 2. Filtrar Bots Elegíveis
    // Remove o time do jogador da lista de candidatos para não duplicar
    let candidates = allTeams.filter(t => t.id !== userTeamId);

    // Filtra pelo Tier Mínimo exigido pelo evento
    candidates = candidates.filter(t => this.isEligible(t, event.minTeamTier));

    // 3. Ordenar por "Ranking" (Prestige ou Tier)
    // Como realTeams.json não tem 'elo' numérico explícito fora do array de players,
    // vamos ordenar por Tier (S > A > B) e desempate por Prestige/Budget (simulado).
    candidates.sort((a, b) => {
      const tierWeight: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
      const scoreA = tierWeight[a.tier] || 0;
      const scoreB = tierWeight[b.tier] || 0;
      return scoreB - scoreA; // Maior primeiro
    });

    // 4. Preencher as vagas restantes
    const slotsRemaining = userSlotTaken ? needed - 1 : needed;
    
    // Pega os melhores candidatos
    const invitedBots = candidates.slice(0, slotsRemaining);
    participants.push(...invitedBots);

    // Fallback: Se faltar time (ex: campeonato Tier S mas só tem 2 times S),
    // completa com Tier inferior para não crashar o jogo.
    if (participants.length < needed) {
      const remainingNeeded = needed - participants.length;
      const lowerTierCandidates = allTeams
        .filter(t => !participants.includes(t) && t.id !== userTeamId)
        .slice(0, remainingNeeded);
      participants.push(...lowerTierCandidates);
    }

    return participants;
  }

  // Helper simples para checar Tier
  private static isEligible(team: TeamAttributes, minTier: string): boolean {
    // CORREÇÃO 1: Removida a declaração 'const tiers = ...' que não era usada.
    
    // Se minTier for 'B', aceita 'S', 'A' e 'B'.
    // Implementação simplificada:
    if (minTier === 'Qualify') return true; // Aceita todos (simulação)
    
    const teamTierVal = this.getTierValue(team.tier);
    
    // CORREÇÃO 2: Removido o 'as any'. Como 'minTier' já é string e a função aceita string, o cast era desnecessário e perigoso.
    const minTierVal = this.getTierValue(minTier);
    
    return teamTierVal >= minTierVal;
  }

  private static getTierValue(tier: string): number {
    switch(tier) {
      case 'S': return 4;
      case 'A': return 3;
      case 'B': return 2;
      case 'C': return 1;
      default: return 0;
    }
  }
}