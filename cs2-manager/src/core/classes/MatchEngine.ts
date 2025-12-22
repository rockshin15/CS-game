import { Team } from "./Team";
import { Player } from "./Player";
import type { MatchResult, Side, RoundLog, LoadoutType } from "../types/MatchTypes";
import mapsData from '../../data/maps.json'; 
import { getRandomInt } from "../utils/rng";

// Configurações Econômicas (CS2 MR12)
const START_MONEY = 800;
const MAX_MONEY = 16000;
const WIN_REWARD = 3250; 
const BASE_LOSS_BONUS = 1400;
const MAX_LOSS_BONUS_COUNT = 4;

// CORREÇÃO 1: Substituição de 'enum' por 'const object'
const EconState = {
    ECO: "Eco",
    HALF_BUY: "Half Buy",
    FORCE: "Force Buy",
    FULL: "Full Buy",
    PISTOL: "Pistol"
} as const;

const RoundEndReason = {
    ELIMINATION: "Elimination",
    BOMB_EXPLODED: "Target Bombed",
    BOMB_DEFUSED: "Bomb Defused",
    TIME_EXPIRED: "Time Expired"
} as const;

// Cria um tipo auxiliar baseado nos valores do objeto
type RoundEndReasonType = typeof RoundEndReason[keyof typeof RoundEndReason];

export class MatchEngine {
    
    static simulateMatch(teamA: Team, teamB: Team, mapId: string): MatchResult {
        let scoreA = 0, scoreB = 0;
        const rounds: RoundLog[] = []; 
        
        let moneyA = START_MONEY, moneyB = START_MONEY;
        let lossBonusCountA = 0, lossBonusCountB = 0;
        let momentumA = 0, momentumB = 0;

        let sideA: Side = Math.random() > 0.5 ? 'CT' : 'TR';
        let sideB: Side = sideA === 'CT' ? 'TR' : 'CT'; 
        let roundNumber = 1;

        const mapData = mapsData.find(m => m.id === mapId) || { name: 'Unknown', ctBias: 0.5 };
        
        // --- LOOP PRINCIPAL (MR12) ---
        // Alterado: O jogo continua até alguém fazer 13 pontos.
        // Isso permite vitória por 13-0, 13-11, ou o decisivo 13-12.
        while (scoreA < 13 && scoreB < 13) {

            // --- HALFTIME (Troca de lados e reset) ---
            if (roundNumber === 13) {
                moneyA = START_MONEY; moneyB = START_MONEY;
                lossBonusCountA = 0; lossBonusCountB = 0;
                momentumA = 0; momentumB = 0;
                sideA = sideA === 'CT' ? 'TR' : 'CT';
                sideB = sideB === 'CT' ? 'TR' : 'CT';
                
                rounds.push({
                    roundNumber: 0, winnerId: 'SYSTEM', sideWinner: 'CT', 
                    message: `🔄 HALFTIME! Reset Econômico & Troca de Lados.`,
                    loadoutA: 'Full Buy', loadoutB: 'Full Buy', moneyA: moneyA, moneyB: moneyB
                });
            }

            // --- 1. DECISÃO DE COMPRA ---
            const buyA = this.decideSmartLoadout(moneyA, lossBonusCountA, scoreA, scoreB, roundNumber);
            const buyB = this.decideSmartLoadout(moneyB, lossBonusCountB, scoreB, scoreA, roundNumber);
            
            moneyA -= buyA.cost;
            moneyB -= buyB.cost;

            // --- 2. SIMULAÇÃO DO ROUND ---
            const roundResult = this.playRoundTactical(
                teamA, teamB, 
                sideA, mapData.ctBias,
                buyA.powerMultiplier, buyB.powerMultiplier,
                buyA.type, buyB.type,
                momentumA, momentumB
            );
            
            const winnerId = roundResult.winnerId;
            
            // --- 3. PÓS-ROUND ---
            let message = "";
            let sideWinner: Side = 'CT';

            if (winnerId === teamA.id) {
                scoreA++;
                sideWinner = sideA;
                
                momentumA = Math.min(0.25, momentumA + 0.05);
                momentumB = Math.max(0, momentumB - 0.1);

                moneyA = Math.min(MAX_MONEY, moneyA + WIN_REWARD);
                moneyB = Math.min(MAX_MONEY, moneyB + BASE_LOSS_BONUS + (lossBonusCountB * 500));
                
                lossBonusCountA = Math.max(0, lossBonusCountA - 1);
                lossBonusCountB = Math.min(MAX_LOSS_BONUS_COUNT, lossBonusCountB + 1);
            } else {
                scoreB++;
                sideWinner = sideB;
                
                momentumB = Math.min(0.25, momentumB + 0.05);
                momentumA = Math.max(0, momentumA - 0.1);

                moneyB = Math.min(MAX_MONEY, moneyB + WIN_REWARD);
                moneyA = Math.min(MAX_MONEY, moneyA + BASE_LOSS_BONUS + (lossBonusCountA * 500));
                
                lossBonusCountB = Math.max(0, lossBonusCountB - 1);
                lossBonusCountA = Math.min(MAX_LOSS_BONUS_COUNT, lossBonusCountA + 1);
            }

            const reasonIcons: Record<string, string> = {
                [RoundEndReason.ELIMINATION]: "💀",
                [RoundEndReason.BOMB_EXPLODED]: "💥",
                [RoundEndReason.BOMB_DEFUSED]: "✂️",
                [RoundEndReason.TIME_EXPIRED]: "⏱️"
            };
            const icon = reasonIcons[roundResult.reason] || "🏳️";
            message = `${icon} ${roundResult.duelLog}`;

            rounds.push({
                roundNumber, winnerId, sideWinner, message,
                loadoutA: buyA.type, loadoutB: buyB.type,
                moneyA: moneyA, moneyB: moneyB
            });

            roundNumber++;
        }

        return {
            winnerId: scoreA > scoreB ? teamA.id : teamB.id,
            loserId: scoreA > scoreB ? teamB.id : teamA.id,
            scoreA, scoreB, mapName: mapData.name, rounds
        };
    }

    private static decideSmartLoadout(money: number, lossBonusCount: number, myScore: number, enemyScore: number, roundNum: number): { type: LoadoutType, cost: number, powerMultiplier: number } {
        const FULL_BUY_COST = 4100; // Valor médio para M4/AK + Colete + Utility
        const NEXT_ROUND_INCOME = BASE_LOSS_BONUS + (lossBonusCount * 500);
        
        // 1. ROUNDS CRÍTICOS (Match Point ou Pistol Rounds)
        if (enemyScore === 12 || roundNum === 1 || roundNum === 13 || roundNum === 24) {
             const isPistol = roundNum === 1 || roundNum === 13;
             return { 
                 type: (isPistol ? EconState.PISTOL : EconState.FORCE) as LoadoutType, 
                 cost: money, 
                 powerMultiplier: isPistol ? 1.0 : (money >= 3500 ? 1.0 : 0.85) 
             };
        }

        // 2. META: FORCE BUY NO 2º ROUND
        // Se perdemos o pistol, no CS2 quase sempre se força no 2º round para tentar quebrar o ímpeto.
        if ((roundNum === 2 || roundNum === 14) && money < FULL_BUY_COST) {
            return { type: EconState.FORCE as LoadoutType, cost: money, powerMultiplier: 0.80 };
        }

        // 3. FULL BUY (Se tem dinheiro, compra)
        if (money >= FULL_BUY_COST) {
            return { type: EconState.FULL as LoadoutType, cost: Math.min(money, 5500), powerMultiplier: 1.0 };
        }
        
        // 4. DECISÃO ENTRE ECO E FORCE (AQUI ESTAVA O PROBLEMA)
        const canBuyNextRound = (money + NEXT_ROUND_INCOME) >= FULL_BUY_COST;

        if (canBuyNextRound) {
            // Antes: Se dava pra comprar no próximo, SEMPRE economizava.
            // Agora: Se o time está perdendo muito (loss bonus alto) ou tem um "dinheiro que sobra" ($3000+),
            // existe uma chance de arriscar um "Hero Buy" ou Force tático.
            
            // Se temos $3300, dá pra comprar uma AK/M4 sem colete ou com pouca utility. 
            // 30% de chance de forçar nesse cenário (Hero Buy).
            if (money >= 3300 && Math.random() < 0.30) {
                return { type: EconState.FORCE as LoadoutType, cost: money, powerMultiplier: 0.85 };
            }
            
            // Caso padrão: Economiza para vir forte no próximo.
            return { type: EconState.ECO as LoadoutType, cost: 0, powerMultiplier: 0.20 };
        }
        
        // 5. SEM DINHEIRO NEM PRO PRÓXIMO (FORCE OBRIGATÓRIO OU DUPLO ECO)
        // Se estamos tão pobres que nem economizando agora teremos Full Buy no próximo,
        // geralmente vale mais a pena forçar o que der agora (Force Desesperado) 
        // ou fazer um Eco seco.
        
        // Se tiver mais de $2000, força (Galil/Famas/SMG). Menos que isso, Eco seco.
        return money > 2000 
            ? { type: EconState.FORCE as LoadoutType, cost: money, powerMultiplier: 0.75 } 
            : { type: EconState.ECO as LoadoutType, cost: 0, powerMultiplier: 0.20 };
    }

    private static playRoundTactical(
        teamA: Team, teamB: Team, 
        sideA: Side, ctBias: number,
        multA: number, multB: number,
        loadoutA: LoadoutType, loadoutB: LoadoutType,
        momA: number, momB: number
    ): { winnerId: string, duelLog: string, reason: RoundEndReasonType } {
        
        // CORREÇÃO: Definindo sideB explicitamente
        const sideB: Side = sideA === 'CT' ? 'TR' : 'CT';

        let aliveA = [...teamA.activeLineup];
        let aliveB = [...teamB.activeLineup];
        const logs: string[] = [];
        
        const trTeamId = sideA === 'TR' ? teamA.id : teamB.id;
        const ctTeamId = sideA === 'CT' ? teamA.id : teamB.id;
        
        let timeLeft = 115; // 1:55 min
        let bombPlanted = false;
        let bombTimer = 0;
        let endReason: RoundEndReasonType | null = null;
        let winnerId = "";
        let isOpeningDuel = true;

        while (!endReason) {
            const trsAlive = sideA === 'TR' ? aliveA : aliveB;
            const ctsAlive = sideA === 'CT' ? aliveA : aliveB;

            const timeStep = getRandomInt(5, 12);
            if (bombPlanted) bombTimer -= timeStep;
            else timeLeft -= timeStep;

            if (!bombPlanted && timeLeft <= 0) {
                endReason = RoundEndReason.TIME_EXPIRED;
                winnerId = ctTeamId;
                break;
            }
            if (bombPlanted && bombTimer <= 0) {
                endReason = RoundEndReason.BOMB_EXPLODED;
                winnerId = trTeamId;
                break;
            }

            // Lógica de Plant da Bomba
            if (!bombPlanted && trsAlive.length > 0) {
                const maxTrGameSense = Math.max(...trsAlive.map(p => p.attributes.gameSense));
                const timePressure = timeLeft < 25 ? 40 : 0;
                const numAdvantage = (trsAlive.length - ctsAlive.length) * 15;
                const tacticalSkill = maxTrGameSense * 0.5;
                
                const plantChance = 10 + timePressure + numAdvantage + tacticalSkill;

                if (getRandomInt(0, 100) < plantChance) {
                    bombPlanted = true;
                    bombTimer = 40; 
                    logs.push("💣 Bomb planted!");
                    isOpeningDuel = true; 
                    ctBias -= 0.15; // CTs perdem vantagem posicional no retake
                }
            }

            // Combate
            if (aliveA.length > 0 && aliveB.length > 0) {
                let p1: Player, p2: Player;

                if (isOpeningDuel) {
                    const attackers = (!bombPlanted && sideA === 'TR') || (bombPlanted && sideA === 'CT') ? aliveA : aliveB;
                    const defenders = attackers === aliveA ? aliveB : aliveA;
                    
                    const entry = attackers.find(p => p.role === 'Entry') || attackers[0];
                    const anchor = defenders.find(p => p.role === 'Support') || defenders[defenders.length - 1];

                    p1 = entry; p2 = anchor;
                    isOpeningDuel = false;
                } else {
                    p1 = aliveA[Math.floor(Math.random() * aliveA.length)];
                    p2 = aliveB[Math.floor(Math.random() * aliveB.length)];
                }

                const isCt = (sideA === 'CT' && teamA.roster.includes(p1)) || (sideB === 'CT' && teamB.roster.includes(p1));
                const isDefender = (!bombPlanted && isCt) || (bombPlanted && !isCt);

                const p1Mult = teamA.roster.includes(p1) ? multA : multB;
                const p2Mult = teamA.roster.includes(p2) ? multA : multB;
                const p1Mom = teamA.roster.includes(p1) ? momA : momB;
                const p2Mom = teamA.roster.includes(p2) ? momA : momB;

                let scoreA_val = 0, scoreB_val = 0;

                const calcScore = (player: Player, mult: number, mom: number, role: 'Atk' | 'Def') => {
                    const base = role === 'Def' 
                        ? (player.attributes.gameSense * 0.7 + player.attributes.aim * 0.3) 
                        : (player.attributes.aim * 0.6 + player.attributes.reflexes * 0.4);
                    return (base * mult) + (mom * 20) + getRandomInt(-15, 15);
                };

                if (isDefender) {
                    scoreA_val = calcScore(p1, p1Mult, p1Mom, 'Def') + ((ctBias - 0.5) * 20);
                    scoreB_val = calcScore(p2, p2Mult, p2Mom, 'Atk');
                } else {
                    scoreA_val = calcScore(p1, p1Mult, p1Mom, 'Atk');
                    scoreB_val = calcScore(p2, p2Mult, p2Mom, 'Def') + ((ctBias - 0.5) * 20);
                }

                if (scoreA_val >= scoreB_val) {
                    aliveB = aliveB.filter(p => p.id !== p2.id);
                    logs.push(this.formatKillLog(p1, p2, p1Mult < 0.6));
                } else {
                    aliveA = aliveA.filter(p => p.id !== p1.id);
                    logs.push(this.formatKillLog(p2, p1, p2Mult < 0.6));
                }
            }

            // Verificação de Wipe e Defuse
            if ((sideA === 'TR' ? aliveA : aliveB).length === 0) { 
                if (bombPlanted) {
                    const ctLoadout = sideA === 'CT' ? loadoutA : loadoutB;
                    let kitChance = 0;
                    
                    if (ctLoadout === (EconState.FULL as LoadoutType)) kitChance = 0.9;
                    else if (ctLoadout === (EconState.FORCE as LoadoutType)) kitChance = 0.3;
                    else if (ctLoadout === (EconState.PISTOL as LoadoutType)) kitChance = 0.05;
                    
                    const hasKit = Math.random() < kitChance;
                    const timeNeeded = hasKit ? 5 : 10;
                    
                    if (bombTimer >= timeNeeded) {
                        endReason = RoundEndReason.BOMB_DEFUSED;
                        winnerId = ctTeamId;
                        logs.push(hasKit ? "✂️ Defuse com Kit!" : "😰 Defuse tenso sem Kit!");
                    } else {
                        endReason = RoundEndReason.BOMB_EXPLODED;
                        winnerId = trTeamId; 
                        logs.push("💥 TRs eliminados, mas a bomba explodiu!");
                    }
                } else {
                    endReason = RoundEndReason.ELIMINATION;
                    winnerId = ctTeamId;
                }
                break;
            }

            if ((sideA === 'CT' ? aliveA : aliveB).length === 0) { 
                endReason = bombPlanted ? RoundEndReason.BOMB_EXPLODED : RoundEndReason.ELIMINATION;
                winnerId = trTeamId;
                break;
            }
        }

        let logText = logs.slice(-3).join(", ");
        if (logs.length > 3) logText = `(+${logs.length - 3}) ` + logText;

        return { winnerId, duelLog: logText, reason: endReason || RoundEndReason.ELIMINATION };
    }

    private static formatKillLog(killer: Player, victim: Player, isEco: boolean): string {
        const weapon = isEco ? "🔫" : "💥";
        return `${weapon} ${killer.nickname}`;
    }
}