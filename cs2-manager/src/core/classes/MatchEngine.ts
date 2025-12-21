import { Team } from "./Team";
import { Player } from "./Player";
import type { MatchResult, Side, RoundLog, LoadoutType } from "../types/MatchTypes";
import mapsData from '../../data/maps.json'; 
import { getRandomInt } from "../utils/rng";

// Configurações Econômicas
const START_MONEY = 800;
const MAX_MONEY = 16000;
const WIN_REWARD = 3250; 
const BASE_LOSS_BONUS = 1400;
const MAX_LOSS_BONUS_COUNT = 4;

export class MatchEngine {
    
    static simulateMatch(teamA: Team, teamB: Team, mapId: string): MatchResult {
        let scoreA = 0;
        let scoreB = 0;
        const rounds: RoundLog[] = []; 
        
        let moneyA = START_MONEY;
        let moneyB = START_MONEY;
        let lossBonusCountA = 0;
        let lossBonusCountB = 0;

        let sideA: Side = Math.random() > 0.5 ? 'CT' : 'TR';
        let sideB: Side = sideA === 'CT' ? 'TR' : 'CT'; 
        let roundNumber = 1;

        const mapData = mapsData.find(m => m.id === mapId) || { name: 'Unknown', ctBias: 0.5 };
        
        while (scoreA < 13 && scoreB < 13) {
            
            // --- HALFTIME ---
            if (roundNumber === 13) {
                moneyA = START_MONEY; moneyB = START_MONEY;
                lossBonusCountA = 0; lossBonusCountB = 0;
                sideA = sideA === 'CT' ? 'TR' : 'CT';
                sideB = sideB === 'CT' ? 'TR' : 'CT';
                rounds.push({
                    roundNumber: 0, winnerId: 'SYSTEM', sideWinner: 'CT', 
                    message: `🔄 HALFTIME! Reset Econômico.`,
                    loadoutA: 'Full Buy', loadoutB: 'Full Buy', moneyA: 800, moneyB: 800
                });
            }

            // --- FASE DE COMPRA ---
            const buyA = this.decideLoadout(moneyA, scoreA, scoreB);
            const buyB = this.decideLoadout(moneyB, scoreB, scoreA);
            moneyA -= buyA.cost;
            moneyB -= buyB.cost;

            // --- FASE DE COMBATE (WIPE MODE) ---
            const roundResult = this.playRoundWipeMode(
                teamA, teamB, 
                sideA, mapData.ctBias,
                buyA.powerMultiplier, buyB.powerMultiplier
            );
            
            const winnerId = roundResult.winnerId;
            
            // --- PÓS-ROUND ---
            let message = "";
            let sideWinner: Side = 'CT';

            if (winnerId === teamA.id) {
                scoreA++;
                sideWinner = sideA;
                const prefix = (buyA.type === 'Eco' && buyB.type === 'Full Buy') ? "🔥 ECO WIN! " : "";
                message = `${prefix}${roundResult.duelLog}`; 
                
                moneyA = Math.min(MAX_MONEY, moneyA + WIN_REWARD);
                moneyB = Math.min(MAX_MONEY, moneyB + BASE_LOSS_BONUS + (lossBonusCountB * 500));
                lossBonusCountA = Math.max(0, lossBonusCountA - 1);
                lossBonusCountB = Math.min(MAX_LOSS_BONUS_COUNT, lossBonusCountB + 1);
            } else {
                scoreB++;
                sideWinner = sideB; // CORREÇÃO: Usamos sideB visual aqui (definido no escopo do simulateMatch)
                const prefix = (buyB.type === 'Eco' && buyA.type === 'Full Buy') ? "🔥 ECO WIN! " : "";
                message = `${prefix}${roundResult.duelLog}`; 

                moneyB = Math.min(MAX_MONEY, moneyB + WIN_REWARD);
                moneyA = Math.min(MAX_MONEY, moneyA + BASE_LOSS_BONUS + (lossBonusCountA * 500));
                lossBonusCountB = Math.max(0, lossBonusCountB - 1);
                lossBonusCountA = Math.min(MAX_LOSS_BONUS_COUNT, lossBonusCountA + 1);
            }

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

    // --- NOVA LÓGICA DE ROUND: WIPE MODE (5v5 até o fim) ---

    private static playRoundWipeMode(
        teamA: Team, teamB: Team, 
        sideA: Side, ctBias: number,
        multA: number, multB: number
    ): { winnerId: string, duelLog: string } {
        
        // CORREÇÃO: Definimos sideB explicitamente aqui
        const sideB: Side = sideA === 'CT' ? 'TR' : 'CT';

        // 1. Clonar os times para controlar quem está vivo
        let aliveA = [...teamA.activeLineup];
        let aliveB = [...teamB.activeLineup];
        
        const logs: string[] = [];
        let firstDuel = true;

        // Multiplicadores de Lado (Bias do Mapa)
        const ctBonus = (ctBias - 0.5) * 20; 
        const biasA = sideA === 'CT' ? ctBonus : 0;
        const biasB = sideB === 'CT' ? ctBonus : 0; // Agora sideB existe!

        // --- LOOP DE COMBATE ---
        while (aliveA.length > 0 && aliveB.length > 0) {
            
            // Escolher Combatentes
            let fighterA: Player;
            let fighterB: Player;

            if (firstDuel) {
                const attackers = sideA === 'TR' ? aliveA : aliveB;
                const defenders = sideA === 'CT' ? aliveA : aliveB;
                
                const entry = attackers.find(p => p.role === 'Entry') || attackers[0];
                const anchor = defenders.find(p => p.role === 'Support') || defenders[0];
                
                fighterA = sideA === 'TR' ? entry : anchor;
                fighterB = sideA === 'TR' ? anchor : entry;
                firstDuel = false;
            } else {
                fighterA = aliveA[Math.floor(Math.random() * aliveA.length)];
                fighterB = aliveB[Math.floor(Math.random() * aliveB.length)];
            }

            // Calcular Força do Duelo
            const awpBonusA = fighterA.role === 'AWPer' && multA >= 1 ? 15 : 0;
            const awpBonusB = fighterB.role === 'AWPer' && multB >= 1 ? 15 : 0;

            const scoreA = (fighterA.attributes.aim * multA) + (fighterA.attributes.reflexes * 0.5) + awpBonusA + biasA + getRandomInt(-20, 20);
            const scoreB = (fighterB.attributes.aim * multB) + (fighterB.attributes.reflexes * 0.5) + awpBonusB + biasB + getRandomInt(-20, 20);

            // Resolver Duelo
            if (scoreA >= scoreB) {
                aliveB = aliveB.filter(p => p.id !== fighterB.id);
                logs.push(this.getKillMessage(fighterA, fighterB, multA));
            } else {
                aliveA = aliveA.filter(p => p.id !== fighterA.id);
                logs.push(this.getKillMessage(fighterB, fighterA, multB));
            }
        }

        // Definir Vencedor
        const winnerId = aliveA.length > 0 ? teamA.id : teamB.id;
        
        // Formatar o Log
        let finalLog = logs.join(". ") + ".";
        
        // Adiciona situação final (Clutch?)
        const survivors = aliveA.length > 0 ? aliveA.length : aliveB.length;
        if (survivors === 1) finalLog += " (CLUTCH 1vX!)";

        return { winnerId, duelLog: finalLog };
    }

    private static getKillMessage(killer: Player, victim: Player, killerMult: number): string {
        const weapon = killerMult < 0.6 ? "Glock" : (killer.role === 'AWPer' ? "AWP" : "AK/M4");
        
        const narratives = [
            `${killer.nickname} eliminou ${victim.nickname}`,
            `${killer.nickname} pegou ${victim.nickname}`,
            `${killer.nickname} deitou ${victim.nickname}`,
            `${killer.nickname} (${weapon}) > ${victim.nickname}`
        ];

        if (killerMult < 0.5) {
            return `🔫 ${killer.nickname} DEAGLE EM ${victim.nickname}`;
        }

        return narratives[Math.floor(Math.random() * narratives.length)];
    }

    private static decideLoadout(money: number, myScore: number, enemyScore: number): { type: LoadoutType, cost: number, powerMultiplier: number } {
        if (money === 800) return { type: 'Force Buy', cost: 700, powerMultiplier: 0.8 };
        if (enemyScore === 12) return { type: 'Force Buy', cost: money, powerMultiplier: money >= 3500 ? 1.0 : 0.8 };
        if (money >= 4000) return { type: 'Full Buy', cost: 3900, powerMultiplier: 1.0 };
        if (money < 3800 && money >= 2000) return { type: 'Eco', cost: 300, powerMultiplier: 0.45 };
        if (money < 2000) return { type: 'Eco', cost: 0, powerMultiplier: 0.4 };
        return { type: 'Force Buy', cost: money, powerMultiplier: 0.75 };
    }
}