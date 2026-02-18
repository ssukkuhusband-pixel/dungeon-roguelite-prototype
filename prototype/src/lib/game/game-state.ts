import { GameSaveData, BattleUnit, HeroId } from '../types';
import { INITIAL_SAVE, HEROES, STAR_MULTIPLIER, LEVEL_CONFIG } from '../constants';

const SAVE_KEY = 'dungeon_roguelite_save';

export function loadGameSave(): GameSaveData {
  if (typeof window === 'undefined') return { ...INITIAL_SAVE };
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load save:', e);
  }
  return { ...INITIAL_SAVE, heroes: INITIAL_SAVE.heroes.map(h => ({ ...h })) };
}

export function saveGame(data: GameSaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

export function resetGame(): GameSaveData {
  const fresh = { ...INITIAL_SAVE, heroes: INITIAL_SAVE.heroes.map(h => ({ ...h })) };
  saveGame(fresh);
  return fresh;
}

export function getHeroStats(heroId: HeroId, level: number) {
  const hero = HEROES[heroId];
  if (!hero) return null;
  const starMult = STAR_MULTIPLIER[hero.stars] || 1;
  const levelMult = 1 + LEVEL_CONFIG.statGrowthPerLevel * (level - 1);
  return {
    hp: Math.floor(hero.baseStats.hp * starMult * levelMult),
    atk: Math.floor(hero.baseStats.atk * starMult * levelMult),
    def: Math.floor(hero.baseStats.def * starMult * levelMult),
    spd: Math.floor(hero.baseStats.spd * starMult * levelMult),
  };
}

export function createPartyUnits(save: GameSaveData): BattleUnit[] {
  const units: BattleUnit[] = [];
  const positions = [
    { line: save.party.frontLine, position: 'front' as const, slots: [1, 2] },
    { line: save.party.backLine, position: 'back' as const, slots: [3, 4] },
  ];

  positions.forEach(({ line, position, slots }) => {
    line.forEach((heroId, index) => {
      if (!heroId) return;
      const heroDef = HEROES[heroId];
      const heroSave = save.heroes.find(h => h.id === heroId);
      if (!heroDef || !heroSave || !heroSave.owned) return;

      const stats = getHeroStats(heroId as HeroId, heroSave.level);
      if (!stats) return;

      units.push({
        id: `ally_${heroId}`,
        definitionId: heroId,
        name: heroDef.name,
        nameKo: heroDef.nameKo,
        team: 'ally',
        position,
        slot: slots[index],
        hp: stats.hp,
        maxHp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        spd: stats.spd,
        ultimateGauge: 0,
        isAlive: true,
        buffs: [],
        emoji: heroDef.emoji,
        basicSkill: heroDef.basicSkill,
        ultimateSkill: heroDef.ultimateSkill,
      });
    });
  });

  return units;
}
