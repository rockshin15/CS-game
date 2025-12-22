import realTeams from '../../data/realTeams.json';
import { Team } from '../classes/Team';
import { Player } from '../classes/Player';
import type { TeamTier, TeamStrategy, TeamPlayStyle, TeamColors } from '../types/TeamTypes';
import type { PlayerRole } from '../types/PlayerTypes';

// === 1. DEFININDO A "CARA" DO SEU JSON (DTOs) ===
// Isso ensina ao TypeScript o que esperar dentro do arquivo .json

interface RealPlayerStats {
    aim: number;
    reflexes: number;
    spray: number;
    sense: number;
    util: number;
    disc: number;
}

interface RealPlayerData {
    nickname: string;
    country: string;
    role: string;
    age: number;
    stats: RealPlayerStats;
}

interface RealTeamData {
    name: string;
    shortName: string;
    region: string;
    tier: string; 
    colors: TeamColors;
    strategy: string;
    playStyle: string;
    roster: RealPlayerData[];
}

// === 2. A FUNÇÃO DE CARREGAMENTO ===

export const loadRealTeams = (): Team[] => {
    // Aqui fazemos o "cast" (conversão) para avisar que realTeams segue a interface acima
    const teamsData = realTeams as RealTeamData[];

    return teamsData.map((data) => {
        // Casting seguro das strings do JSON para os tipos literais do sistema
        const tier = data.tier as TeamTier;
        const strategy = data.strategy as TeamStrategy;
        const playStyle = data.playStyle as TeamPlayStyle;

        // 1. Instanciamos o time
        // Passamos [] no segundo argumento pois não precisamos verificar nomes duplicados aqui
        const team = new Team(tier, []);
        
        // 2. Sobrescrevemos os dados aleatórios com os dados REAIS
        team.name = data.name;
        team.shortName = data.shortName;
        team.region = data.region;
        team.colors = data.colors;
        team.strategy = strategy;
        team.playStyle = playStyle;
        
        // Limpamos o elenco gerado pelo construtor
        team.roster = [];
        team.activeLineup = [];

        // 3. Criamos e configuramos cada jogador
        data.roster.forEach((pData) => {
            const player = new Player();
            
            player.nickname = pData.nickname;
            player.country = pData.country;
            player.age = pData.age;
            player.role = pData.role as PlayerRole;
            
            // Mapeamento manual dos stats do JSON para os atributos da Classe
            // (Note que os nomes no JSON são curtos: 'util', 'disc', etc.)
            player.attributes = {
                aim: pData.stats.aim,
                reflexes: pData.stats.reflexes,
                sprayControl: pData.stats.spray,
                gameSense: pData.stats.sense,
                utility: pData.stats.util,
                discipline: pData.stats.disc
            };
            
            // Recalculamos o Overall manualmente já que alteramos os atributos na força bruta
            const values = Object.values(player.attributes);
            const sum = values.reduce((a, b) => a + b, 0);
            player.overall = Math.round(sum / values.length);
            
            team.addPlayer(player);
        });

        return team;
    });
};