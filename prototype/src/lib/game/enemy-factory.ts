import { BattleUnit, StageDefinition } from '../types';
import { ENEMIES, STAGES } from '../constants';

let enemyCounter = 0;

export function createEnemyUnits(stage: StageDefinition): BattleUnit[] {
  const units: BattleUnit[] = [];
  let frontSlot = 5;
  let backSlot = 7;

  stage.enemies.forEach((enemyDef) => {
    const def = ENEMIES[enemyDef.enemyId];
    if (!def) return;

    const slot = enemyDef.position === 'front' ? frontSlot++ : backSlot++;
    enemyCounter++;

    units.push({
      id: `enemy_${def.id}_${enemyCounter}`,
      definitionId: def.id,
      name: def.name,
      nameKo: def.nameKo,
      team: 'enemy',
      position: enemyDef.position,
      slot,
      hp: Math.floor(def.baseStats.hp * stage.scaling.hp),
      maxHp: Math.floor(def.baseStats.hp * stage.scaling.hp),
      atk: Math.floor(def.baseStats.atk * stage.scaling.atk),
      def: Math.floor(def.baseStats.def * stage.scaling.def),
      spd: def.baseStats.spd,
      ultimateGauge: 0,
      isAlive: true,
      buffs: [],
      emoji: def.emoji,
      basicSkill: def.basicSkill,
      ultimateSkill: def.ultimateSkill || def.basicSkill,
    });
  });

  return units;
}

export function getStageDefinition(stageNumber: number): StageDefinition | undefined {
  return STAGES.find((s) => s.stageNumber === stageNumber);
}
