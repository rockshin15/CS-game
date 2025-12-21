// src/core/utils/teamGenerator.ts

import fakeTeams from '../../data/fakeTeams.json';
import { getRandomInt } from './rng';

// Interface auxiliar para o retorno do gerador
interface TeamIdentity {
    name: string;
    shortName: string;
    region: string;
    colors: { primary: string; secondary: string };
}

// Pesos regionais (Onde estão as orgs?)
const regionWeights: { [key: string]: number } = {
    'Europe': 55,
    'Americas': 25,
    'Asia': 15,
    'Oceania': 5
};

export const generateTeamIdentity = (usedNames: string[] = []): TeamIdentity => {
    // 1. Filtrar nomes que já foram usados para evitar duplicatas
    const availableTeams = fakeTeams.filter(t => !usedNames.includes(t.name));
    
    // Fallback: Se acabarem os nomes, gera um genérico
    let selectedTeam;
    if (availableTeams.length === 0) {
        const id = getRandomInt(100, 999);
        selectedTeam = { 
            name: `Team ${id}`, 
            shortName: `T${id}`, 
            color: '#333333',
            type: 'Generic'
        };
    } else {
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        selectedTeam = availableTeams[randomIndex];
    }

    // 2. Gerar Região Ponderada
    const region = getWeightedRegion();

    // 3. Gerar Cores (Inteligente)
    const primary = selectedTeam.color;
    // AGORA SIM: Usamos a primária para calcular matematicamente a secundária ideal
    const secondary = generateSecondaryColor(primary);

    return {
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        region: region,
        colors: { primary, secondary }
    };
};

const getWeightedRegion = (): string => {
    const rand = Math.random() * 100;
    let sum = 0;
    
    for (const [region, weight] of Object.entries(regionWeights)) {
        sum += weight;
        if (rand <= sum) return region;
    }
    return 'Europe';
};

/**
 * OPÇÃO 2: Lógica sofisticada de Contraste (YIQ)
 * Calcula a luminosidade da cor primária para decidir se a secundária deve ser clara ou escura.
 * Isso garante que uniformes e UI nunca fiquem ilegíveis (ex: Cinza no Preto).
 */
const generateSecondaryColor = (primaryHex: string): string => {
    // 1. Remove o # se houver
    const hex = primaryHex.replace('#', '');
    
    // 2. Converte HEX para RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // 3. Fórmula de Luminosidade YIQ (Padrão W3C de acessibilidade)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // 4. Decisão de Design:
    // Se YIQ >= 128, a cor é CLARA -> Retorna Escuro (Cinza Carvão)
    // Se YIQ < 128, a cor é ESCURA -> Retorna Claro (Branco Puro)
    return (yiq >= 128) ? '#111827' : '#ffffff';
};