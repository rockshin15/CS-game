import type { Team, MatchResult } from '../types/PlayerTypes';

export class MatchEngine {
  static simulate(teamA: Team, teamB: Team): MatchResult {
    const scoreA = teamA.players.reduce((s, p) => s + p.rating, 0);
    const scoreB = teamB.players.reduce((s, p) => s + p.rating, 0);
    const a = Math.max(0, Math.round(scoreA / teamA.players.length + (Math.random() * 10 - 5)));
    const b = Math.max(0, Math.round(scoreB / teamB.players.length + (Math.random() * 10 - 5)));
    return {
      winnerTeamId: a >= b ? teamA.id : teamB.id,
      score: [a, b]
    } as MatchResult;
  }
}
