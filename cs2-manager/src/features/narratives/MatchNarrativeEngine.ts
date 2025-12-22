import { Player } from "../../core/classes/Player";
import { Team } from "../../core/classes/Team";
// CORREÇÃO 1: Separamos o que é Valor (HighlightType) do que é apenas Tipo
import { HighlightType } from "./NarrativeTypes"; 
import type { 
    KillEvent, 
    UtilityEvent, 
    RoundNarrative, 
    PlayerMatchPerformance, 
    TeamMomentum
    // WeaponType e Position removidos pois não eram usados
} from "./NarrativeTypes";

export class MatchNarrativeEngine {
    private teamAPerformance: Map<string, PlayerMatchPerformance> = new Map();
    private teamBPerformance: Map<string, PlayerMatchPerformance> = new Map();
    private roundNarratives: RoundNarrative[] = [];
    private highlights: Array<{ type: HighlightType; round: number; description: string }> = [];

    private momentumTeamA: TeamMomentum = { value: 0, streak: 0, comingBack: false, psychological: 50 };
    private momentumTeamB: TeamMomentum = { value: 0, streak: 0, comingBack: false, psychological: 50 };

    // --- BANCO DE FRASES (Sabor e Variedade) ---
    private openingKillPhrases = [
        "catches them off-guard", "wins the opening duel", "punishes the aggression",
        "finds the first pick", "opens up the round", "clicks heads instantly"
    ];

    private clutchPhrases = [
        "stays ice-cold under pressure", "refuses to lose", "clutches it out masterfully",
        "pulls off the impossible", "silences the crowd with a clutch"
    ];

    private tradePhrases = [
        "immediately trades", "refrags instantly", "avenges their teammate", "closes the gap"
    ];

    // Inicialização
    initializeTracking(teamA: Team, teamB: Team) {
        teamA.activeLineup.forEach(p => this.teamAPerformance.set(p.id, this.createEmptyPerformance(p)));
        teamB.activeLineup.forEach(p => this.teamBPerformance.set(p.id, this.createEmptyPerformance(p)));
    }

    private createEmptyPerformance(player: Player): PlayerMatchPerformance {
        return {
            player, kills: 0, deaths: 0, assists: 0, firstKills: 0, firstDeaths: 0,
            clutchAttempts: 0, clutchWins: 0, multiKills: [], adr: 0,
            utilityDamage: 0, flashAssists: 0, tradesExecuted: 0, tradesReceived: 0, rating: 0
        };
    }

    // --- GERAÇÃO DA NARRATIVA COMPLETA ---
    generateRoundNarrative(
        roundNumber: number,
        killEvents: KillEvent[],
        utilityEvents: UtilityEvent[],
        winnerId: string,
        teamAId: string,
        scoreA: number,
        scoreB: number,
        bombPlanted: boolean,
        isClutch: boolean,
        loadoutWinner: string,
        loadoutLoser: string,
        moneyWinner: number,
        moneyLoser: number
    ): RoundNarrative {

        const segments: string[] = [];
        const currentHighlights: HighlightType[] = [];

        // 1. Contexto Inicial (Match Point?)
        const isMatchPoint = scoreA === 12 || scoreB === 12;
        if (isMatchPoint) segments.push(`🚨 MATCH POINT! Tudo em jogo neste round.`);

        // 2. Análise Econômica (Eco Win?)
        const isEcoWin = (loadoutWinner.includes('Eco') || loadoutWinner.includes('Pistol')) && loadoutLoser.includes('Full Buy');
        if (isEcoWin) {
            currentHighlights.push(HighlightType.ECO_WIN);
            segments.push(`💰 INCRÍVEL! Vitória econômica contra armamento completo!`);
            this.addHighlight(HighlightType.ECO_WIN, roundNumber, "Eco Round Victory");
        }

        // 3. Opening Kills
        const opening = killEvents.find(k => k.context === 'opening');
        if (opening) {
            const phrase = this.randomFrom(this.openingKillPhrases);
            let text = `💥 Opening: ${opening.killer.nickname} ${phrase} contra ${opening.victim.nickname}`;
            if (opening.isHeadshot) text += " (HS!)";
            if (opening.wasFlashed) text += " enquanto cego!";
            segments.push(text);
        }

        // 4. Destaques de Utility
        const flashAssist = utilityEvents.find(u => u.type === 'flash' && u.impact === 'assisted_kill');
        if (flashAssist) {
            segments.push(`✨ Support: ${flashAssist.player.nickname} cega o inimigo para facilitar a kill.`);
        }

        // 5. Trocas (Trades)
        const trades = killEvents.filter(k => k.isTradeKill);
        if (trades.length >= 2) {
            segments.push(`⚔️ Trocas rápidas! ${trades.length} kills em resposta imediata.`);
        }

        // 6. MultiKills
        const multiKills = this.detectMultiKills(killEvents);
        multiKills.forEach(mk => {
            if (mk.count >= 3) {
                const type = mk.count === 5 ? HighlightType.ACE : (mk.count === 4 ? HighlightType.QUAD_KILL : HighlightType.TRIPLE_KILL);
                currentHighlights.push(type);
                segments.push(`🔥 ${mk.player.nickname} garante um ${type.replace('_', ' ')}!`);
                this.addHighlight(type, roundNumber, `${mk.player.nickname} ${type}`);
            }
        });

        // 7. Clutch e Fechamento
        if (isClutch) {
            const clutchPlayer = killEvents[killEvents.length - 1].killer;
            // CORREÇÃO 2: Removi a variável 'enemies' que não era usada.
            // Se quiser usar no futuro, calcule: const enemies = 5 - (totalKillsTeamA);
            const phrase = this.randomFrom(this.clutchPhrases);
            
            currentHighlights.push(HighlightType.CLUTCH_1V2);
            segments.push(`👑 CLUTCH: ${clutchPlayer.nickname} ${phrase}!`);
            this.addHighlight(HighlightType.CLUTCH_1V2, roundNumber, `Clutch by ${clutchPlayer.nickname}`);
        } else if (bombPlanted && winnerId === teamAId) { 
            segments.push(`💣 Bomba explodida! TRs garantem o ponto.`);
        } else if (!bombPlanted && winnerId !== teamAId) { 
            segments.push(`🛡️ Defesa sólida elimina todos os atacantes.`);
        }

        // Atualiza Stats e Momentum
        this.updateMomentum(winnerId, teamAId, isEcoWin ? 30 : 15); 
        killEvents.forEach(k => this.updateKillStats(k));

        const narrative: RoundNarrative = {
            roundNumber,
            phase: 'end',
            keyMoments: segments,
            killFeed: killEvents,
            utilityEvents,
            highlights: currentHighlights,
            mvp: this.selectRoundMVP(killEvents, isClutch),
            economyImpact: this.generateEconomyNarrative(moneyWinner, moneyLoser),
            tacticalSummary: segments.length > 0 ? segments[0] : "Round padrão",
            finalNarrative: segments.join('\n'),
            momentum: winnerId === teamAId ? this.momentumTeamA.value : -this.momentumTeamB.value,
            tension: this.calculateTension(scoreA, scoreB, roundNumber),
            intelAdvantage: 'Neutral',
            synergyScore: 50 + (trades.length * 10)
        };

        this.roundNarratives.push(narrative);
        return narrative;
    }

    // --- HELPERS E LÓGICA INTERNA ---

    private generateEconomyNarrative(winnerMoney: number, loserMoney: number): string {
        if (loserMoney < 2000) return "Perdedores quebrados (Hard Eco no próximo).";
        if (loserMoney < 3800) return "Perdedores forçados a meia-compra.";
        if (winnerMoney > 10000) return "Vencedores nadando em dinheiro.";
        return "Economias estáveis.";
    }

    private updateKillStats(kill: KillEvent) {
        const kStats = this.getPlayerPerformance(kill.killer.id);
        const vStats = this.getPlayerPerformance(kill.victim.id);
        if (kStats) {
            kStats.kills++;
            if (kill.isHeadshot) kStats.rating += 0.05; 
        } 
        if (vStats) vStats.deaths++;
    }

    private getPlayerPerformance(id: string) {
        return this.teamAPerformance.get(id) || this.teamBPerformance.get(id);
    }

    private detectMultiKills(kills: KillEvent[]) {
        const counts = new Map<string, { player: Player, count: number }>();
        kills.forEach(k => {
            const current = counts.get(k.killer.id) || { player: k.killer, count: 0 };
            current.count++;
            counts.set(k.killer.id, current);
        });
        return Array.from(counts.values()).filter(x => x.count >= 3);
    }

    private selectRoundMVP(kills: KillEvent[], isClutch: boolean): Player | null {
        if (kills.length === 0) return null;
        if (isClutch) return kills[kills.length - 1].killer;
        const counts = this.detectMultiKills(kills);
        return counts.length > 0 ? counts[0].player : kills[0].killer;
    }

    // CORREÇÃO 3: Agora usamos o 'round' para adicionar tensão em jogos longos
    private calculateTension(scoreA: number, scoreB: number, round: number): number {
        let t = 50;
        const diff = Math.abs(scoreA - scoreB);
        
        // Jogo apertado
        if (diff <= 2) t += 30;
        
        // Final de jogo (perto do 13)
        if (scoreA >= 11 || scoreB >= 11) t += 20;

        // Overtime ou jogo muito longo aumenta a tensão naturalmente
        if (round > 20) t += 10; 

        return Math.min(100, t);
    }

    private updateMomentum(winnerId: string, teamAId: string, amount: number) {
        if (winnerId === teamAId) {
            this.momentumTeamA.value = Math.min(100, this.momentumTeamA.value + amount);
            this.momentumTeamB.value = Math.max(-100, this.momentumTeamB.value - amount);
        } else {
            this.momentumTeamB.value = Math.min(100, this.momentumTeamB.value + amount);
            this.momentumTeamA.value = Math.max(-100, this.momentumTeamA.value - amount);
        }
    }

    private addHighlight(type: HighlightType, round: number, description: string) {
        this.highlights.push({ type, round, description });
    }

    private randomFrom<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}