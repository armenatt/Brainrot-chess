import type { ISynergy } from "./synergy";

export interface ICharacter {
  name: string;
  code: string;
  baseHealth: number;
  maxHealth: number;
  baseMana: number;
  baseDamage: number;
  maxMana: number;
  attackType: "range" | "melee";
  behavior: any; // for later
  model: string;
  synergy: ISynergy["name"];
  criticalHitChance: number;
  criticalHitCoef: number;
}
