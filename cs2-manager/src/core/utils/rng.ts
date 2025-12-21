// src/core/utils/rng.ts
import names from '../../data/names.json';
import countries from '../../data/countries.json';
// Importamos o Tipo apenas para garantir que o retorno bata com a definição
import type { PlayerRole } from '../types/PlayerTypes';

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getWeightedCountry = (): string => {
  const countryList = Object.keys(countries) as Array<keyof typeof countries>;
  const totalWeight = Object.values(countries).reduce((sum, weight) => sum + weight, 0);

  let randomNum = Math.random() * totalWeight;

  for (const country of countryList) {
    const weight = countries[country];
    if (randomNum < weight) {
      return country;
    }
    randomNum -= weight;
  }

  return "BR";
};

export const generateNick = (): string => {
    let nick = getRandomItem(names);
    if (Math.random() < 0.1) {
        nick += getRandomInt(1, 99);
    }
    return nick;
}

// NOVA FUNÇÃO: Gera funções garantindo diversidade no mercado
export const getRandomRole = (): PlayerRole => {
    const rand = Math.random();
    
    // Distribuição de Mercado (Baseado em um time padrão de 5)
    // 15% IGL (Raro e valioso)
    // 15% AWPer (Sniper dedicado)
    // 20% Entry (Bucha de canhão)
    // 20% Support (Granadeiros)
    // 20% Lurker (Costinha)
    // 10% Rifle (Genérico)

    if (rand < 0.15) return 'IGL';
    if (rand < 0.30) return 'AWPer';
    if (rand < 0.50) return 'Entry';
    if (rand < 0.70) return 'Support';
    if (rand < 0.90) return 'Lurker';
    return 'Rifle';
};