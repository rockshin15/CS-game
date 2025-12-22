import { Team } from "./Team";
import { Player } from "./Player";
import type { MatchResult, Side, RoundLog, LoadoutType } from "../types/MatchTypes";
import mapsData from '../../data/maps.json'; 
import { getRandomInt } from "../utils/rng";
// Certifique-se que estes arquivos existem em src/features/narrative/
import { MatchNarrativeEngine } from "../../features/narratives/MatchNarrativeEngine";
import { WeaponType, Position } from "../../features/narratives/NarrativeTypes";
import type { KillEvent, UtilityEvent } from "../../features/narratives/NarrativeTypes";

const START_MONEY = 800;
const MAX_MONEY = 16000;
const WIN_REWARD = 3250; 
const BASE_LOSS_BONUS = 1400;
const MAX_LOSS_BONUS_COUNT = 4;

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

        const narrativeEngine = new MatchNarrativeEngine();
        narrativeEngine.initializeTracking(teamA, teamB);
    
        const mapData = mapsData.find(m => m.id === mapId) || { name: 'Unknown', ctBias: 0.5 };
        
        while (scoreA < 13 && scoreB < 13) {

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

            const buyA = this.decideSmartLoadout(moneyA, lossBonusCountA, scoreA, scoreB, roundNumber);
            const buyB = this.decideSmartLoadout(moneyB, lossBonusCountB, scoreB, scoreA, roundNumber);
            
            moneyA -= buyA.cost;
            moneyB -= buyB.cost;

            // Correção: Removido roundNumber dos argumentos pois não é usado na lógica tática
            const roundResult = this.playRoundTactical(
                teamA, teamB, 
                sideA, mapData.ctBias,
                buyA.powerMultiplier, buyB.powerMultiplier,
                buyA.type, buyB.type,
                momentumA, momentumB
            );
            
            const winnerId = roundResult.winnerId;

            const narrative = narrativeEngine.generateRoundNarrative(
                roundNumber,
                roundResult.killEvents,
                roundResult.utilityEvents,
                winnerId,
                teamA.id,
                scoreA,
                scoreB,
                roundResult.reason === RoundEndReason.BOMB_EXPLODED || roundResult.reason === RoundEndReason.BOMB_DEFUSED,
                roundResult.killEvents.length > 0 && roundResult.killEvents[roundResult.killEvents.length - 1].context === 'clutch',
                winnerId === teamA.id ? buyA.type : buyB.type,
                winnerId === teamA.id ? buyB.type : buyA.type,
                winnerId === teamA.id ? moneyA : moneyB,
                winnerId === teamA.id ? moneyB : moneyA
            );
            
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

            rounds.push({
                roundNumber, winnerId, sideWinner, 
                message: narrative.finalNarrative,
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
        const FULL_BUY_COST = 4100;
        const NEXT_ROUND_INCOME = BASE_LOSS_BONUS + (lossBonusCount * 500);
        
        if (enemyScore === 12 || roundNum === 1 || roundNum === 13 || roundNum === 24) {
             const isPistol = roundNum === 1 || roundNum === 13;
             return { 
                 type: (isPistol ? EconState.ECO : EconState.FORCE) as LoadoutType, 
                 cost: money, 
                 powerMultiplier: isPistol ? 1.0 : (money >= 3500 ? 1.0 : 0.85) 
             };
        }

        if ((roundNum === 2 || roundNum === 14) && money < FULL_BUY_COST) {
            return { type: EconState.FORCE as LoadoutType, cost: money, powerMultiplier: 0.80 };
        }

        if (money >= FULL_BUY_COST) {
            return { type: EconState.FULL as LoadoutType, cost: Math.min(money, 5500), powerMultiplier: 1.0 };
        }
        
        const canBuyNextRound = (money + NEXT_ROUND_INCOME) >= FULL_BUY_COST;

        if (canBuyNextRound) {
            if (money >= 3300 && Math.random() < 0.30) {
                return { type: EconState.FORCE as LoadoutType, cost: money, powerMultiplier: 0.85 };
            }
            return { type: EconState.ECO as LoadoutType, cost: 0, powerMultiplier: 0.20 };
        }
        
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
        // Correção: Removido roundNumber daqui
    ): { winnerId: string, killEvents: KillEvent[], utilityEvents: UtilityEvent[], reason: RoundEndReasonType } {

        // Correção: Removido 'sideB' pois não estava sendo usado e gerava erro
        let aliveA = [...teamA.activeLineup];
        let aliveB = [...teamB.activeLineup];

        const killEvents: KillEvent[] = [];
        const utilityEvents: UtilityEvent[] = [];

        const trTeamId = sideA === 'TR' ? teamA.id : teamB.id;
        const ctTeamId = sideA === 'CT' ? teamA.id : teamB.id;

        let timeLeft = 115;
        let bombPlanted = false;
        let bombTimer = 0;
        let endReason: RoundEndReasonType | null = null;
        let winnerId = "";
        let isOpeningDuel = true;
        let lastDeathTime = 0;

        while (!endReason) {
            const trsAlive = sideA === 'TR' ? aliveA : aliveB;
            const ctsAlive = sideA === 'CT' ? aliveA : aliveB;

            const timeStep = getRandomInt(4, 8);
            if (bombPlanted) bombTimer -= timeStep;
            else timeLeft -= timeStep;

            if (!bombPlanted && timeLeft <= 0) {
                endReason = RoundEndReason.TIME_EXPIRED; winnerId = ctTeamId; break;
            }
            if (bombPlanted && bombTimer <= 0) {
                endReason = RoundEndReason.BOMB_EXPLODED; winnerId = trTeamId; break;
            }

            if (!bombPlanted && trsAlive.length > 0) {
                const maxTrGameSense = Math.max(...trsAlive.map(p => p.attributes.gameSense));
                const timePressure = timeLeft < 25 ? 40 : 0;
                const numAdvantage = (trsAlive.length - ctsAlive.length) * 15;
                const plantChance = 10 + timePressure + numAdvantage + (maxTrGameSense * 0.5);

                if (getRandomInt(0, 100) < plantChance) {
                    bombPlanted = true;
                    bombTimer = 40;
                    isOpeningDuel = true;
                    ctBias -= 0.15;
                }
            }

            if (aliveA.length > 0 && aliveB.length > 0) {
                let p1: Player, p2: Player;

                const attackers = (!bombPlanted && sideA === 'TR') || (bombPlanted && sideA === 'CT') ? aliveA : aliveB;
                const defenders = attackers === aliveA ? aliveB : aliveA;

                if (isOpeningDuel) {
                    p1 = attackers.find(p => p.role === 'Entry') || attackers[0];
                    // Correção: Trocado 'Support'/'Anchor' por 'IGL'/'Rifle' (roles válidos no seu sistema)
                    p2 = defenders.find(p => p.role === 'IGL' || p.role === 'Rifle') || defenders[defenders.length - 1];
                    isOpeningDuel = false;
                } else {
                    p1 = aliveA[Math.floor(Math.random() * aliveA.length)];
                    p2 = aliveB[Math.floor(Math.random() * aliveB.length)];
                }

                const isP1TeamA = teamA.roster.includes(p1);
                const p1Mult = isP1TeamA ? multA : multB;
                const p2Mult = isP1TeamA ? multB : multA;
                const p1Mom = isP1TeamA ? momA : momB;

                let p2Debuff = 1.0;
                let wasFlashed = false;
                let throughSmoke = false;

                if (Math.random() < 0.3 && (p1Mult > 0.8)) {
                    const utilType = Math.random() > 0.5 ? 'flash' : 'smoke';
                    const success = p1.attributes.gameSense > p2.attributes.gameSense;

                    if (success) {
                        utilityEvents.push({
                            player: p1, type: utilType, impact: 'assisted_kill', value: 50,
                            description: utilType === 'flash' ? 'blinds the enemy' : 'uses smoke cover'
                        });

                        if (utilType === 'flash') {
                            p2Debuff = 0.5;
                            wasFlashed = true;
                        } else {
                            throughSmoke = true;
                        }
                    }
                }

                const calcScore = (player: Player, mult: number, mom: number) => {
                    return ((player.attributes.aim * 0.6 + player.attributes.reflexes * 0.4) * mult) + (mom * 15) + getRandomInt(-20, 20);
                };

                const score1 = calcScore(p1, p1Mult, p1Mom);
                const score2 = calcScore(p2, p2Mult, isP1TeamA ? momB : momA) * p2Debuff;

                let winner: Player, loser: Player;
                if (score1 >= score2) { winner = p1; loser = p2; }
                else { winner = p2; loser = p1; }

                if (teamA.activeLineup.includes(loser)) aliveA = aliveA.filter(p => p.id !== loser.id);
                else aliveB = aliveB.filter(p => p.id !== loser.id);

                const isTrade = (115 - timeLeft) - lastDeathTime < 5;
                lastDeathTime = 115 - timeLeft;

                const winnerLoadout = teamA.activeLineup.includes(winner) ? loadoutA : loadoutB;
                let weapon: WeaponType = WeaponType.RIFLE;
                if (winnerLoadout === 'Eco') weapon = WeaponType.PISTOL;
                else if (winnerLoadout === 'Force Buy') weapon = WeaponType.RIFLE;
                else if (winner.role === 'AWPer' && winnerLoadout === 'Full Buy') weapon = WeaponType.RIFLE;

                killEvents.push({
                    killer: winner,
                    victim: loser,
                    weapon: weapon,
                    isHeadshot: Math.random() < (winner.attributes.aim / 100),
                    isTradeKill: isTrade,
                    tradeTime: isTrade ? 3 : 0,
                    wasFlashed: wasFlashed && winner === p1,
                    throughSmoke: throughSmoke,
                    distance: getRandomInt(2, 40),
                    timeInRound: timeLeft,
                    context: bombPlanted ? 'retake' : (isOpeningDuel ? 'opening' : 'mid'),
                    position: Math.random() > 0.5 ? Position.NEUTRAL : Position.FAVORABLE
                });
            }

            if (aliveA.length === 0 || aliveB.length === 0) {
                if (bombPlanted && aliveB.length === 0 && sideA === 'TR') { 
                    // Correção: Simplificação da lógica de Loadout para evitar erro de tipos "TR" vs "CT"
                    // Se sideA é TR e estamos aqui, o Time B é CT.
                    const ctLoadout = loadoutB; 
                    
                    const hasKit = ctLoadout === 'Full Buy';
                    if (bombTimer >= (hasKit ? 5 : 10)) {
                        endReason = RoundEndReason.BOMB_DEFUSED; winnerId = ctTeamId;
                    } else {
                        endReason = RoundEndReason.BOMB_EXPLODED; winnerId = trTeamId;
                    }
                } else {
                    endReason = RoundEndReason.ELIMINATION;
                    winnerId = aliveA.length > 0 ? teamA.id : teamB.id;
                }
                break;
            }
        }

        return { winnerId, killEvents, utilityEvents, reason: endReason || RoundEndReason.ELIMINATION };
    }
}