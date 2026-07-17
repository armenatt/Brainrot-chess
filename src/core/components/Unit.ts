import type { ICharacter } from "../../types/character";
import { LEVEL_BONUS_COEFF } from "../constants";

export class Unit {
  public health: number;
  public maxHealth: number;
  public damage: number;
  public criticalHitChance: number;
  public criticalHit;
  public mana: number;
  public maxMana: number;

  constructor(public character: ICharacter, public level: number) {
    this.health = character.baseHealth * level * LEVEL_BONUS_COEFF;
    this.maxHealth = character.maxHealth * level * LEVEL_BONUS_COEFF;
    this.mana = character.baseMana * level * LEVEL_BONUS_COEFF;
    this.maxMana = character.maxMana * level * LEVEL_BONUS_COEFF;
    this.damage = character.baseDamage * level * LEVEL_BONUS_COEFF;
    this.criticalHitChance =
      character.criticalHitChance * level * LEVEL_BONUS_COEFF;
    this.criticalHit = character.criticalHitCoef * level * LEVEL_BONUS_COEFF;
  }
}
