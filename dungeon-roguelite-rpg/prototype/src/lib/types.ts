// === Unit Types ===
export type HeroId = 'ironclad' | 'blade' | 'silvana' | 'ignis' | 'lumina' | 'shadow';
export type HeroClass = 'tank' | 'warrior' | 'ranger' | 'mage' | 'healer' | 'assassin';
export type Position = 'front' | 'back';
export type Team = 'ally' | 'enemy';

// === Skill Types ===
export type SkillTargetType = 'single' | 'aoe' | 'front_row' | 'back_row';
export type SkillTargetTeam = 'enemy' | 'ally';
export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff' | 'damage_heal';

export interface Skill {
  id: string;
  name: string;
  nameKo: string;
  type: SkillType;
  targetType: SkillTargetType;
  targetTeam: SkillTargetTeam;
  multiplier: number;
  effects?: SkillEffect[];
  description: string;
  isUltimate: boolean;
  // Special targeting (for assassin/archer)
  targetLowestHp?: boolean;
}

export interface SkillEffect {
  type: BuffType;
  value: number;
  duration: number;
  chance?: number; // 0-1, default 1
}

// === Buff/Debuff Types ===
export type BuffType = 'atk_up' | 'def_up' | 'spd_up' | 'atk_down' | 'def_down' | 'regen' | 'bleed' | 'stun' | 'taunt';

export interface ActiveBuff {
  type: BuffType;
  value: number;
  remainingTurns: number;
  sourceId: string;
}

// === Hero Definition ===
export interface HeroDefinition {
  id: HeroId;
  name: string;
  nameKo: string;
  class: HeroClass;
  stars: number; // 1-5
  position: Position; // recommended position
  baseStats: BaseStats;
  basicSkill: Skill;
  ultimateSkill: Skill;
  emoji: string; // fallback
}

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

// === Enemy Types ===
export type EnemyType = 'minion' | 'elite' | 'boss';

export interface EnemyDefinition {
  id: string;
  name: string;
  nameKo: string;
  type: EnemyType;
  baseStats: BaseStats;
  basicSkill: Skill;
  ultimateSkill?: Skill;
  emoji: string;
  specialAbility?: string;
}

// === Battle State ===
export interface BattleUnit {
  id: string; // unique instance id
  definitionId: string;
  name: string;
  nameKo: string;
  team: Team;
  position: Position;
  slot: number; // 1-8
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  ultimateGauge: number;
  isAlive: boolean;
  buffs: ActiveBuff[];
  emoji: string;
  basicSkill: Skill;
  ultimateSkill: Skill;
}

export interface BattleState {
  allies: BattleUnit[];
  enemies: BattleUnit[];
  turnOrder: string[];
  currentTurnIndex: number;
  round: number;
  battleLog: BattleLogEntry[];
  isFinished: boolean;
  result: 'victory' | 'defeat' | null;
}

export interface BattleLogEntry {
  round: number;
  actorId: string;
  actorName: string;
  action: 'skill' | 'buff_tick' | 'debuff_tick' | 'death' | 'stun_skip';
  skillName?: string;
  targets: {
    id: string;
    name: string;
    damage?: number;
    heal?: number;
    effects?: BuffType[];
    killed?: boolean;
    isCritical?: boolean;
  }[];
  timestamp: number;
}

// === Roguelite Skill ===
export type SkillTier = 'common' | 'rare' | 'legendary';

export interface RogueliteSkill {
  id: string;
  name: string;
  nameKo: string;
  tier: SkillTier;
  description: string;
  descriptionKo: string;
  effect: RogueliteEffect;
  emoji: string;
}

export type RogueliteEffect =
  | { type: 'stat_boost'; stat: 'hp' | 'atk' | 'def' | 'spd'; value: number; target: 'all' | 'front' | 'back' }
  | { type: 'battle_start_heal'; value: number }
  | { type: 'ultimate_gauge_start'; value: number }
  | { type: 'lifesteal'; value: number }
  | { type: 'counter_attack'; chance: number; multiplier: number }
  | { type: 'execute_bonus'; hpThreshold: number; damageBonus: number }
  | { type: 'battle_start_buff'; buffType: BuffType; duration: number }
  | { type: 'ultimate_damage_bonus'; value: number }
  | { type: 'thorns'; value: number }
  | { type: 'revive'; hpPercent: number }
  | { type: 'low_hp_boost'; hpThreshold: number; atkBonus: number; spdBonus: number }
  | { type: 'extra_turn_chance'; chance: number }
  | { type: 'on_kill_heal'; healPercent: number; gaugeBonus: number };

// === Stage Types ===
export type StageType = 'normal' | 'elite' | 'boss' | 'rest';

export interface StageDefinition {
  stageNumber: number;
  type: StageType;
  enemies: { enemyId: string; position: Position }[];
  scaling: { hp: number; atk: number; def: number };
}

// === Run State (Roguelite session) ===
export interface RunState {
  currentStage: number;
  acquiredSkills: string[];
  party: BattleUnit[];
  isActive: boolean;
  rewards: { gold: number; soulStones: number; exp: number };
}

// === Meta/Save State ===
export interface HeroSaveData {
  id: HeroId;
  level: number;
  exp: number;
  owned: boolean;
}

export interface GameSaveData {
  gold: number;
  soulStones: number;
  soulFragments: number;
  heroes: HeroSaveData[];
  party: {
    frontLine: [string | null, string | null];
    backLine: [string | null, string | null];
  };
  chapter1Cleared: boolean;
  totalRuns: number;
}

// === Game Screen ===
export type GameScreen = 'main' | 'battle' | 'skill_select' | 'rest_event' | 'heroes' | 'gacha' | 'formation' | 'result';

// === Rest Event Choice ===
export interface RestEventChoice {
  id: string;
  nameKo: string;
  descriptionKo: string;
  effect: 'heal_30' | 'random_skill';
  emoji: string;
}
