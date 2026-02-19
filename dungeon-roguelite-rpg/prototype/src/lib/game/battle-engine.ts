import {
  BattleUnit,
  BattleState,
  BattleLogEntry,
  Skill,
  ActiveBuff,
  BuffType,
  RogueliteSkill,
  RogueliteEffect,
} from '../types';
import { BATTLE_CONFIG } from '../constants';

// ===== TURN ORDER =====
export function calculateTurnOrder(units: BattleUnit[]): BattleUnit[] {
  return units
    .filter((u) => u.isAlive)
    .sort((a, b) => {
      if (b.spd !== a.spd) return b.spd - a.spd;
      if (a.team !== b.team) return a.team === 'ally' ? -1 : 1;
      return a.slot - b.slot;
    });
}

// ===== SKILL SELECTION =====
export function selectSkill(unit: BattleUnit): Skill {
  if (unit.ultimateGauge >= BATTLE_CONFIG.ultimateGaugeMax && unit.ultimateSkill) {
    return unit.ultimateSkill;
  }
  return unit.basicSkill;
}

// ===== TARGET SELECTION =====
export function selectTargets(
  unit: BattleUnit,
  skill: Skill,
  allies: BattleUnit[],
  enemies: BattleUnit[]
): BattleUnit[] {
  const targetPool = skill.targetTeam === 'enemy'
    ? (unit.team === 'ally' ? enemies : allies)
    : (unit.team === 'ally' ? allies : enemies);
  const alive = targetPool.filter((t) => t.isAlive);
  if (alive.length === 0) return [];

  // Handle heal targeting for ally team
  if (skill.type === 'heal' || (skill.targetTeam === 'ally' && skill.type === 'buff')) {
    const selfTeam = unit.team === 'ally' ? allies : enemies;
    const selfAlive = selfTeam.filter((t) => t.isAlive);
    if (selfAlive.length === 0) return [];

    switch (skill.targetType) {
      case 'single':
        if (skill.targetLowestHp) {
          return [selfAlive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
        }
        return [selfAlive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
      case 'aoe':
        return selfAlive;
      default:
        return [selfAlive[0]];
    }
  }

  // Handle self-buff (like Orc Berserker)
  if (skill.type === 'buff' && skill.targetTeam === 'ally') {
    const selfTeam = unit.team === 'ally' ? allies : enemies;
    const selfAlive = selfTeam.filter((t) => t.isAlive);
    if (skill.targetType === 'single') return [unit];
    return selfAlive;
  }

  switch (skill.targetType) {
    case 'single': {
      if (skill.targetLowestHp) {
        // Assassin/Sniper: target lowest HP regardless of position
        return [alive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
      }
      // Default: Front row priority, then lowest HP ratio within front row
      const frontRow = alive.filter((t) => t.position === 'front');
      const pool = frontRow.length > 0 ? frontRow : alive;
      return [pool.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
    }
    case 'aoe':
      return alive;
    case 'front_row': {
      const front = alive.filter((t) => t.position === 'front');
      return front.length > 0 ? front : alive.filter((t) => t.position === 'back');
    }
    case 'back_row': {
      // Target back row first (mages, archers), fall back to front if none
      const back = alive.filter((t) => t.position === 'back');
      return back.length > 0 ? back : alive.filter((t) => t.position === 'front');
    }
    default:
      return [alive[0]];
  }
}

// ===== DAMAGE CALCULATION =====
export function calculateDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  skill: Skill,
  acquiredSkills: RogueliteSkill[]
): { damage: number; isCritical: boolean } {
  let atk = attacker.atk;
  // Apply ATK buffs
  const atkBuffs = attacker.buffs.filter((b) => b.type === 'atk_up');
  const atkDebuffs = attacker.buffs.filter((b) => b.type === 'atk_down');
  atkBuffs.forEach((b) => (atk = Math.floor(atk * (1 + b.value))));
  atkDebuffs.forEach((b) => (atk = Math.floor(atk * (1 - b.value))));

  let def = target.def;
  // Front row DEF bonus
  if (target.position === 'front') {
    def = Math.floor(def * (1 + BATTLE_CONFIG.frontRowDefBonus));
  }
  // Apply DEF buffs
  const defBuffs = target.buffs.filter((b) => b.type === 'def_up');
  const defDebuffs = target.buffs.filter((b) => b.type === 'def_down');
  defBuffs.forEach((b) => (def = Math.floor(def * (1 + b.value))));
  defDebuffs.forEach((b) => (def = Math.floor(def * (1 - b.value))));

  let baseDamage = atk * skill.multiplier;

  // Critical hit: 10% chance, 1.5x damage
  const isCritical = Math.random() < 0.1;
  if (isCritical) {
    baseDamage *= 1.5;
  }

  // Ultimate damage bonus from roguelite skills
  if (skill.isUltimate) {
    const ultiBonus = acquiredSkills.find((s) => s.effect.type === 'ultimate_damage_bonus');
    if (ultiBonus && ultiBonus.effect.type === 'ultimate_damage_bonus') {
      baseDamage *= 1 + ultiBonus.effect.value;
    }
  }

  const defReduction = def / (def + 100);
  let finalDamage = Math.floor(baseDamage * (1 - defReduction));

  // Execute bonus
  const execSkill = acquiredSkills.find((s) => s.effect.type === 'execute_bonus');
  if (execSkill && execSkill.effect.type === 'execute_bonus') {
    if (target.hp / target.maxHp <= execSkill.effect.hpThreshold) {
      finalDamage = Math.floor(finalDamage * (1 + execSkill.effect.damageBonus));
    }
  }

  // Low HP boost for attacker
  const berserkSkill = acquiredSkills.find((s) => s.effect.type === 'low_hp_boost');
  if (berserkSkill && berserkSkill.effect.type === 'low_hp_boost') {
    if (attacker.hp / attacker.maxHp <= berserkSkill.effect.hpThreshold) {
      finalDamage = Math.floor(finalDamage * (1 + berserkSkill.effect.atkBonus));
    }
  }

  return { damage: Math.max(1, finalDamage), isCritical };
}

// ===== HEAL CALCULATION =====
export function calculateHeal(healer: BattleUnit, skill: Skill, acquiredSkills: RogueliteSkill[]): number {
  let healAmount = Math.floor(healer.atk * skill.multiplier);
  if (skill.isUltimate) {
    const ultiBonus = acquiredSkills.find((s) => s.effect.type === 'ultimate_damage_bonus');
    if (ultiBonus && ultiBonus.effect.type === 'ultimate_damage_bonus') {
      healAmount = Math.floor(healAmount * (1 + ultiBonus.effect.value));
    }
  }
  return healAmount;
}

// ===== APPLY BUFFS =====
function applySkillEffects(skill: Skill, targets: BattleUnit[], sourceId: string): BuffType[] {
  const applied: BuffType[] = [];
  if (!skill.effects) return applied;

  skill.effects.forEach((effect) => {
    const chance = effect.chance ?? 1;
    targets.forEach((target) => {
      if (Math.random() < chance) {
        // Check for existing buff of same type
        const existing = target.buffs.findIndex((b) => b.type === effect.type);
        if (effect.type === 'bleed') {
          // Bleed stacks up to 2
          const bleeds = target.buffs.filter((b) => b.type === 'bleed');
          if (bleeds.length < 2) {
            target.buffs.push({
              type: effect.type,
              value: effect.value,
              remainingTurns: effect.duration,
              sourceId,
            });
          } else {
            // Refresh longest remaining
            const oldest = bleeds.sort((a, b) => a.remainingTurns - b.remainingTurns)[0];
            oldest.remainingTurns = effect.duration;
          }
        } else if (existing >= 0) {
          // Refresh existing
          target.buffs[existing].remainingTurns = effect.duration;
          target.buffs[existing].value = effect.value;
        } else {
          target.buffs.push({
            type: effect.type,
            value: effect.value,
            remainingTurns: effect.duration,
            sourceId,
          });
        }
        applied.push(effect.type);
      }
    });
  });
  return applied;
}

// ===== TURN START EFFECTS (DOT/HOT) =====
function applyTurnStartEffects(unit: BattleUnit): { damage: number; heal: number } {
  let totalDamage = 0;
  let totalHeal = 0;

  unit.buffs.forEach((buff) => {
    if (buff.type === 'bleed') {
      const dmg = Math.floor(unit.maxHp * buff.value);
      unit.hp = Math.max(0, unit.hp - dmg);
      totalDamage += dmg;
    }
    if (buff.type === 'regen') {
      const heal = Math.floor(unit.maxHp * buff.value);
      unit.hp = Math.min(unit.maxHp, unit.hp + heal);
      totalHeal += heal;
    }
  });

  return { damage: totalDamage, heal: totalHeal };
}

// ===== DECREASE BUFF DURATIONS =====
function decreaseBuffDurations(unit: BattleUnit): void {
  unit.buffs = unit.buffs
    .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
    .filter((b) => b.remainingTurns > 0);
}

// ===== CHECK TEAM WIPED =====
function isTeamWiped(units: BattleUnit[]): boolean {
  return units.every((u) => !u.isAlive);
}

// ===== CHECK TAUNT =====
function getTauntTarget(enemies: BattleUnit[]): BattleUnit | null {
  const taunter = enemies.find((e) => e.isAlive && e.buffs.some((b) => b.type === 'taunt'));
  return taunter || null;
}

// ===== EXECUTE SINGLE TURN =====
export interface TurnResult {
  log: BattleLogEntry;
  killedUnits: string[];
  lifestealHeal?: number;
  thornsReflect?: { targetId: string; damage: number }[];
}

export function executeTurn(
  unit: BattleUnit,
  state: BattleState,
  acquiredSkills: RogueliteSkill[],
  round: number
): TurnResult | null {
  if (!unit.isAlive) return null;

  // Turn start: DOT/HOT
  const tickEffects = applyTurnStartEffects(unit);
  if (unit.hp <= 0) {
    unit.isAlive = false;
    return {
      log: {
        round,
        actorId: unit.id,
        actorName: unit.nameKo,
        action: 'death',
        targets: [],
        timestamp: Date.now(),
      },
      killedUnits: [unit.id],
    };
  }

  // Stun check
  const stunBuff = unit.buffs.find((b) => b.type === 'stun');
  if (stunBuff) {
    unit.buffs = unit.buffs.filter((b) => b.type !== 'stun');
    return {
      log: {
        round,
        actorId: unit.id,
        actorName: unit.nameKo,
        action: 'stun_skip',
        targets: [],
        timestamp: Date.now(),
      },
      killedUnits: [],
    };
  }

  // Select skill
  const skill = selectSkill(unit);
  const isUltimate = skill.isUltimate;

  // Consume/charge ultimate gauge
  if (isUltimate) {
    unit.ultimateGauge = 0;
  } else {
    unit.ultimateGauge = Math.min(
      BATTLE_CONFIG.ultimateGaugeMax,
      unit.ultimateGauge + BATTLE_CONFIG.ultimateGaugeOnBasicSkill
    );
  }

  const allies = unit.team === 'ally' ? state.allies : state.enemies;
  const enemies = unit.team === 'ally' ? state.enemies : state.allies;

  // Select targets - check for taunt on damage skills targeting enemies
  let targets: BattleUnit[];
  if (
    (skill.type === 'damage' || skill.type === 'damage_heal') &&
    skill.targetType === 'single'
  ) {
    const taunter = getTauntTarget(
      unit.team === 'ally' ? state.enemies : state.allies
    );
    if (taunter) {
      targets = [taunter];
    } else {
      targets = selectTargets(unit, skill, state.allies, state.enemies);
    }
  } else {
    targets = selectTargets(unit, skill, state.allies, state.enemies);
  }

  if (targets.length === 0) return null;

  const logEntry: BattleLogEntry = {
    round,
    actorId: unit.id,
    actorName: unit.nameKo,
    action: 'skill',
    skillName: skill.nameKo,
    targets: [],
    timestamp: Date.now(),
  };

  const killedUnits: string[] = [];
  let totalLifesteal = 0;
  const thornsReflections: { targetId: string; damage: number }[] = [];

  targets.forEach((target) => {
    const targetResult: BattleLogEntry['targets'][0] = {
      id: target.id,
      name: target.nameKo,
    };

    if (skill.type === 'damage' || skill.type === 'damage_heal') {
      const { damage, isCritical } = calculateDamage(unit, target, skill, acquiredSkills);
      target.hp = Math.max(0, target.hp - damage);
      targetResult.damage = damage;
      if (isCritical) targetResult.isCritical = true;

      // Charge target's ultimate gauge on hit
      target.ultimateGauge = Math.min(
        BATTLE_CONFIG.ultimateGaugeMax,
        target.ultimateGauge + BATTLE_CONFIG.ultimateGaugeOnHit
      );

      // Lifesteal from skill (vampire)
      if (skill.type === 'damage_heal') {
        const healAmount = Math.floor(damage * 0.3);
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
        totalLifesteal += healAmount;
      }

      // Roguelite lifesteal
      const lifestealSkill = acquiredSkills.find((s) => s.effect.type === 'lifesteal');
      if (lifestealSkill && lifestealSkill.effect.type === 'lifesteal' && unit.team === 'ally') {
        const healAmount = Math.floor(damage * lifestealSkill.effect.value);
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
        totalLifesteal += healAmount;
      }

      // Thorns reflection
      const thornsSkill = acquiredSkills.find((s) => s.effect.type === 'thorns');
      if (thornsSkill && thornsSkill.effect.type === 'thorns' && target.team === 'ally') {
        const reflectDmg = Math.floor(damage * thornsSkill.effect.value);
        unit.hp = Math.max(0, unit.hp - reflectDmg);
        thornsReflections.push({ targetId: unit.id, damage: reflectDmg });
      }

      // Apply skill effects (bleed etc)
      const effects = applySkillEffects(skill, [target], unit.id);
      if (effects.length > 0) targetResult.effects = effects;

      // Death check
      if (target.hp <= 0) {
        target.isAlive = false;
        targetResult.killed = true;
        killedUnits.push(target.id);

        // On-kill effects
        const soulHarvest = acquiredSkills.find((s) => s.effect.type === 'on_kill_heal');
        if (soulHarvest && soulHarvest.effect.type === 'on_kill_heal' && unit.team === 'ally') {
          const shEffect = soulHarvest.effect;
          allies.filter((a) => a.isAlive).forEach((a) => {
            const heal = Math.floor(a.maxHp * shEffect.healPercent);
            a.hp = Math.min(a.maxHp, a.hp + heal);
            a.ultimateGauge = Math.min(BATTLE_CONFIG.ultimateGaugeMax, a.ultimateGauge + shEffect.gaugeBonus);
          });
        }
      }
    } else if (skill.type === 'heal') {
      const heal = calculateHeal(unit, skill, acquiredSkills);
      target.hp = Math.min(target.maxHp, target.hp + heal);
      targetResult.heal = heal;
    } else if (skill.type === 'buff') {
      // For Ironclad's Iron Fortress - self heal
      if (skill.id === 'iron_fortress') {
        const selfHeal = Math.floor(unit.maxHp * skill.multiplier);
        unit.hp = Math.min(unit.maxHp, unit.hp + selfHeal);
      }
      const effects = applySkillEffects(skill, [target], unit.id);
      if (effects.length > 0) targetResult.effects = effects;
    } else if (skill.type === 'debuff') {
      const effects = applySkillEffects(skill, [target], unit.id);
      if (effects.length > 0) targetResult.effects = effects;
    }

    logEntry.targets.push(targetResult);
  });

  // Decrease buff durations
  decreaseBuffDurations(unit);

  // Check attacker death from thorns
  if (unit.hp <= 0 && unit.isAlive) {
    unit.isAlive = false;
    killedUnits.push(unit.id);
  }

  return {
    log: logEntry,
    killedUnits,
    lifestealHeal: totalLifesteal > 0 ? totalLifesteal : undefined,
    thornsReflect: thornsReflections.length > 0 ? thornsReflections : undefined,
  };
}

// ===== EXECUTE ONE FULL ROUND =====
export function executeRound(
  state: BattleState,
  acquiredSkills: RogueliteSkill[]
): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  const turnOrder = calculateTurnOrder([...state.allies, ...state.enemies]);
  state.turnOrder = turnOrder.map((u) => u.id);

  for (const unitRef of turnOrder) {
    // Find actual unit in state (not the sorted copy)
    const unit = [...state.allies, ...state.enemies].find((u) => u.id === unitRef.id);
    if (!unit || !unit.isAlive) continue;

    const result = executeTurn(unit, state, acquiredSkills, state.round);
    if (result) {
      logs.push(result.log);
      state.battleLog.push(result.log);
    }

    // Check battle end
    if (isTeamWiped(state.enemies)) {
      state.isFinished = true;
      state.result = 'victory';
      return logs;
    }
    if (isTeamWiped(state.allies)) {
      state.isFinished = true;
      state.result = 'defeat';
      return logs;
    }

    // Extra turn chance
    const extraTurnSkill = acquiredSkills.find((s) => s.effect.type === 'extra_turn_chance');
    if (
      extraTurnSkill &&
      extraTurnSkill.effect.type === 'extra_turn_chance' &&
      unit.team === 'ally' &&
      unit.isAlive &&
      Math.random() < extraTurnSkill.effect.chance
    ) {
      const extraResult = executeTurn(unit, state, acquiredSkills, state.round);
      if (extraResult) {
        logs.push(extraResult.log);
        state.battleLog.push(extraResult.log);
      }

      if (isTeamWiped(state.enemies)) {
        state.isFinished = true;
        state.result = 'victory';
        return logs;
      }
      if (isTeamWiped(state.allies)) {
        state.isFinished = true;
        state.result = 'defeat';
        return logs;
      }
    }
  }

  state.round++;

  // Max rounds safety
  if (state.round > BATTLE_CONFIG.maxRounds) {
    state.isFinished = true;
    state.result = 'defeat';
  }

  return logs;
}

// ===== APPLY ROGUELITE SKILL STAT BOOSTS =====
export function applyRogueliteStatBoosts(
  party: BattleUnit[],
  skills: RogueliteSkill[]
): void {
  skills.forEach((skill) => {
    const effect = skill.effect;
    if (effect.type === 'stat_boost') {
      party.forEach((unit) => {
        if (!unit.isAlive) return;
        const matchPosition =
          effect.target === 'all' ||
          (effect.target === 'front' && unit.position === 'front') ||
          (effect.target === 'back' && unit.position === 'back');
        if (!matchPosition) return;

        switch (effect.stat) {
          case 'hp': {
            const boost = Math.floor(unit.maxHp * effect.value);
            unit.maxHp += boost;
            unit.hp += boost;
            break;
          }
          case 'atk':
            unit.atk = Math.floor(unit.atk * (1 + effect.value));
            break;
          case 'def':
            unit.def = Math.floor(unit.def * (1 + effect.value));
            break;
          case 'spd':
            unit.spd = Math.floor(unit.spd * (1 + effect.value));
            break;
        }
      });
    } else if (effect.type === 'ultimate_gauge_start') {
      party.forEach((unit) => {
        if (unit.isAlive) {
          unit.ultimateGauge = Math.min(
            BATTLE_CONFIG.ultimateGaugeMax,
            unit.ultimateGauge + effect.value
          );
        }
      });
    }
  });
}

// ===== APPLY BATTLE START EFFECTS =====
export function applyBattleStartEffects(
  party: BattleUnit[],
  skills: RogueliteSkill[]
): void {
  skills.forEach((skill) => {
    const effect = skill.effect;
    if (effect.type === 'battle_start_heal') {
      party.forEach((unit) => {
        if (unit.isAlive) {
          const heal = Math.floor(unit.maxHp * effect.value);
          unit.hp = Math.min(unit.maxHp, unit.hp + heal);
        }
      });
    } else if (effect.type === 'battle_start_buff') {
      party.forEach((unit) => {
        if (unit.isAlive) {
          unit.buffs.push({
            type: effect.buffType,
            value: 0.3,
            remainingTurns: effect.duration,
            sourceId: 'roguelite',
          });
        }
      });
    }
  });
}

// ===== CREATE INITIAL BATTLE STATE =====
export function createBattleState(
  allies: BattleUnit[],
  enemies: BattleUnit[]
): BattleState {
  return {
    allies,
    enemies,
    turnOrder: [],
    currentTurnIndex: 0,
    round: 1,
    battleLog: [],
    isFinished: false,
    result: null,
  };
}

// ===== SKILL SELECTION (Roguelite) =====
export function presentSkillChoices(
  acquiredSkillIds: string[],
  allSkills: RogueliteSkill[],
  isElite: boolean = false
): RogueliteSkill[] {
  const available = allSkills.filter((s) => !acquiredSkillIds.includes(s.id));
  const choices: RogueliteSkill[] = [];

  for (let i = 0; i < 3 && available.length > 0; i++) {
    const roll = Math.random() * 100;
    let tier: 'common' | 'rare' | 'legendary';
    if (isElite) {
      // Elite: +10% rare chance
      if (roll < 10) tier = 'legendary';
      else if (roll < 50) tier = 'rare';
      else tier = 'common';
    } else {
      if (roll < 10) tier = 'legendary';
      else if (roll < 40) tier = 'rare';
      else tier = 'common';
    }

    const tierSkills = available.filter(
      (s) => s.tier === tier && !choices.some((c) => c.id === s.id)
    );
    if (tierSkills.length > 0) {
      const selected = tierSkills[Math.floor(Math.random() * tierSkills.length)];
      choices.push(selected);
      // Remove from available for next iteration
      const idx = available.findIndex((s) => s.id === selected.id);
      if (idx >= 0) available.splice(idx, 1);
    } else {
      // Fallback: any available skill
      const anySkills = available.filter((s) => !choices.some((c) => c.id === s.id));
      if (anySkills.length > 0) {
        const selected = anySkills[Math.floor(Math.random() * anySkills.length)];
        choices.push(selected);
        const idx = available.findIndex((s) => s.id === selected.id);
        if (idx >= 0) available.splice(idx, 1);
      }
    }
  }

  return choices;
}
