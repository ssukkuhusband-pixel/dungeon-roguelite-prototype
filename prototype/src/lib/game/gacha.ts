import { HeroId, HeroSaveData, GameSaveData } from '../types';
import { HEROES, GACHA_CONFIG, STAR_MULTIPLIER } from '../constants';

export interface GachaResult {
  heroId: HeroId;
  stars: number;
  isNew: boolean;
  fragments?: number;
  nameKo: string;
  emoji: string;
}

const HERO_POOL: { heroId: HeroId; stars: number }[] = [
  { heroId: 'ironclad', stars: 2 },
  { heroId: 'lumina', stars: 2 },
  { heroId: 'blade', stars: 3 },
  { heroId: 'silvana', stars: 3 },
  { heroId: 'ignis', stars: 4 },
  { heroId: 'shadow', stars: 5 },
];

function rollStarRating(): number {
  const roll = Math.random();
  let cumulative = 0;
  for (const [stars, rate] of Object.entries(GACHA_CONFIG.rates)) {
    cumulative += rate;
    if (roll < cumulative) return parseInt(stars);
  }
  return 1;
}

function getHeroByStars(stars: number): { heroId: HeroId; stars: number } {
  const candidates = HERO_POOL.filter((h) => h.stars === stars);
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  // If no hero exists at this star rating, find closest
  const sorted = [...HERO_POOL].sort(
    (a, b) => Math.abs(a.stars - stars) - Math.abs(b.stars - stars)
  );
  return sorted[0];
}

export function performSinglePull(save: GameSaveData): GachaResult | null {
  if (save.soulStones < GACHA_CONFIG.singleCost) return null;

  save.soulStones -= GACHA_CONFIG.singleCost;
  const stars = rollStarRating();
  const heroInfo = getHeroByStars(stars);
  const heroDef = HEROES[heroInfo.heroId];
  const heroSave = save.heroes.find((h) => h.id === heroInfo.heroId);

  if (!heroSave) return null;

  if (heroSave.owned) {
    // Duplicate - convert to fragments
    const fragments = GACHA_CONFIG.duplicateFragments[heroInfo.stars] || 10;
    save.soulFragments += fragments;
    return {
      heroId: heroInfo.heroId,
      stars: heroInfo.stars,
      isNew: false,
      fragments,
      nameKo: heroDef.nameKo,
      emoji: heroDef.emoji,
    };
  } else {
    // New hero
    heroSave.owned = true;
    return {
      heroId: heroInfo.heroId,
      stars: heroInfo.stars,
      isNew: true,
      nameKo: heroDef.nameKo,
      emoji: heroDef.emoji,
    };
  }
}

export function performTenPull(save: GameSaveData): GachaResult[] | null {
  if (save.soulStones < GACHA_CONFIG.tenPullCost) return null;

  save.soulStones -= GACHA_CONFIG.tenPullCost;
  const results: GachaResult[] = [];

  for (let i = 0; i < 10; i++) {
    const stars = rollStarRating();
    const heroInfo = getHeroByStars(stars);
    const heroDef = HEROES[heroInfo.heroId];
    const heroSave = save.heroes.find((h) => h.id === heroInfo.heroId);

    if (!heroSave) continue;

    if (heroSave.owned) {
      const fragments = GACHA_CONFIG.duplicateFragments[heroInfo.stars] || 10;
      save.soulFragments += fragments;
      results.push({
        heroId: heroInfo.heroId,
        stars: heroInfo.stars,
        isNew: false,
        fragments,
        nameKo: heroDef.nameKo,
        emoji: heroDef.emoji,
      });
    } else {
      heroSave.owned = true;
      results.push({
        heroId: heroInfo.heroId,
        stars: heroInfo.stars,
        isNew: true,
        nameKo: heroDef.nameKo,
        emoji: heroDef.emoji,
      });
    }
  }

  // Guarantee at least ★3
  const hasMinStars = results.some(
    (r) => r.stars >= GACHA_CONFIG.tenPullGuaranteeMinStars
  );
  if (!hasMinStars && results.length > 0) {
    // Replace last result with a guaranteed ★3+
    const guaranteedHero = getHeroByStars(3);
    const heroDef = HEROES[guaranteedHero.heroId];
    const heroSave = save.heroes.find((h) => h.id === guaranteedHero.heroId);
    if (heroSave) {
      const lastIdx = results.length - 1;
      if (heroSave.owned) {
        const fragments = GACHA_CONFIG.duplicateFragments[3] || 50;
        save.soulFragments += fragments;
        results[lastIdx] = {
          heroId: guaranteedHero.heroId,
          stars: 3,
          isNew: false,
          fragments,
          nameKo: heroDef.nameKo,
          emoji: heroDef.emoji,
        };
      } else {
        heroSave.owned = true;
        results[lastIdx] = {
          heroId: guaranteedHero.heroId,
          stars: 3,
          isNew: true,
          nameKo: heroDef.nameKo,
          emoji: heroDef.emoji,
        };
      }
    }
  }

  return results;
}
