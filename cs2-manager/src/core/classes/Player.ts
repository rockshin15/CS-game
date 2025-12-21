// src/core/classes/Player.ts

import type { PlayerAttributes, PlayerRole, PlayerStats } from '../types/PlayerTypes';
import { generateNick, getRandomInt, getWeightedCountry, getRandomRole } from '../utils/rng';

export class Player {
  id: string;
  nickname: string;
  country: string;
  age: number;
  role: PlayerRole;
  
  attributes: PlayerAttributes;
  potential: number;
  overall: number;
  stats: PlayerStats;

  constructor() {
    this.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    this.nickname = generateNick();
    this.country = getWeightedCountry();
    this.age = this.generateAge();
    
    // 1. O Mercado define a função (Sorteio)
    this.role = getRandomRole(); 

    // 2. A Biologia define os atributos (Curva de Idade)
    this.attributes = this.generateAttributesByAge(this.age);
    
    // 3. O Jogo calcula o valor geral
    this.overall = this.calculateOverall();
    this.potential = this.calculatePotential();
    
    this.stats = { kills: 0, deaths: 0, rating: 0.0 };
  }

  // Ajustei a probabilidade para garantir que você veja todos os estágios no teste
  private generateAge(): number {
    const rand = Math.random();
    if (rand < 0.20) return getRandomInt(16, 18); // Wonderkids
    if (rand < 0.50) return getRandomInt(19, 23); // Pico Mecânico (A maioria)
    if (rand < 0.75) return getRandomInt(24, 27); // Prime
    if (rand < 0.90) return getRandomInt(28, 31); // Veteranos
    return getRandomInt(32, 36);                  // Lendas
  }

  private generateAttributesByAge(age: number): PlayerAttributes {
    // Base Genética (Talento natural independente da idade)
    // Começamos mais baixo para que os bônus de idade façam diferença real
    let aim = getRandomInt(50, 85);
    let reflex = getRandomInt(50, 85);
    const spray = getRandomInt(50, 85);
    
    let sense = getRandomInt(40, 80);
    let util = getRandomInt(40, 80);
    let disc = getRandomInt(30, 75);

    // === A CURVA DA VIDA ===

    // FASE 1: O WONDERKID (16-18)
    // Muito rápidos, muito crus.
    if (age <= 18) {
        reflex += getRandomInt(15, 25);   // Reflexo sobre-humano
        aim += getRandomInt(5, 15);       // Mira instintiva
        
        sense -= getRandomInt(15, 30);    // "Burro" taticamente
        util -= getRandomInt(10, 20);     // Erra granadas
        disc -= getRandomInt(20, 30);     // Afobado (W-Key)
    }
    
    // FASE 2: O PICO MECÂNICO (19-23) [Foco do seu pedido]
    // O auge físico. Onde a mira encontra a confiança.
    else if (age <= 23) {
        reflex += getRandomInt(10, 20);   // Ainda muito rápido
        aim += getRandomInt(10, 25);      // No auge da precisão (Muscle Memory)
        
        sense -= getRandomInt(5, 15);     // Ainda cometem erros
        disc -= getRandomInt(5, 15);      // Ainda agressivos demais
    }

    // FASE 3: O PRIME (24-27)
    // O equilíbrio. Perde um pouco de velocidade, ganha consistência.
    else if (age <= 27) {
        reflex += getRandomInt(0, 5);     // Estagnou
        aim += getRandomInt(5, 10);       // Mira consistente
        
        sense += getRandomInt(5, 15);     // Começa a ler o jogo bem
        disc += getRandomInt(5, 15);      // Disciplinado
    }

    // FASE 4: O DECLÍNIO MECÂNICO (28-31)
    // O corpo sente, a mente compensa.
    else if (age <= 31) {
        reflex -= getRandomInt(10, 20);   // Queda visível de reação
        aim -= getRandomInt(0, 10);       // Mira "cansada"
        
        sense += getRandomInt(15, 25);    // Leitura de jogo avançada
        util += getRandomInt(10, 20);     // Mestre das utilities
        disc += getRandomInt(15, 25);     // Joga pro time (Clutch player)
    }

    // FASE 5: A LENDA / PROFESSOR (32+)
    // Só joga no cérebro.
    else {
        reflex -= getRandomInt(20, 35);   // Lento para trocação direta
        aim -= getRandomInt(10, 20);      // Perde duelos de mira pura
        
        sense += getRandomInt(25, 40);    // Um computador humano
        util += getRandomInt(20, 30);     // Pixel perfect
        disc += getRandomInt(25, 35);     // Gelo nas veias
    }

    // Função auxiliar para manter entre 1 e 99
    const clamp = (num: number) => Math.min(99, Math.max(1, num));

    return {
        aim: clamp(aim),
        reflexes: clamp(reflex),
        sprayControl: clamp(spray),
        gameSense: clamp(sense),
        utility: clamp(util),
        discipline: clamp(disc)
    };
  }

  private calculateOverall(): number {
    const values = Object.values(this.attributes) as number[];
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / 6);
  }

  private calculatePotential(): number {
    const volatility = getRandomInt(0, 10); // Fator "Sorte"

    // 16-19: O céu é o limite (Crescem muito)
    if (this.age < 19) return Math.min(99, this.overall + getRandomInt(15, 25) + volatility);
    
    // 19-23: Ainda evoluem, mas menos (Polimento)
    if (this.age <= 23) return Math.min(99, this.overall + getRandomInt(5, 15) + volatility);
    
    // 24-27: Auge (Pouca evolução, foco em manter)
    if (this.age <= 27) return Math.min(99, this.overall + getRandomInt(0, 5));

    // 28+: O Potencial é o que sobrou (Eles não evoluem mais, só tentam não cair)
    return this.overall;
  }
}