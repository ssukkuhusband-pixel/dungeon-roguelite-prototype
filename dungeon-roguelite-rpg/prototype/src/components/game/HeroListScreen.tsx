'use client';

import React from 'react';
import { GameSaveData, HeroId } from '@/lib/types';
import { COLORS, HEROES, STAR_MULTIPLIER } from '@/lib/constants';
import { getHeroStats } from '@/lib/game/game-state';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface HeroListScreenProps {
  save: GameSaveData;
  onBack: () => void;
}

export default function HeroListScreen({ save, onBack }: HeroListScreenProps) {
  const ownedCount = save.heroes.filter((h) => h.owned).length;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: COLORS.bgBase }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#333' }}>
        <button
          onClick={onBack}
          className="text-sm px-3 py-1 rounded border"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        >
          ← 뒤로
        </button>
        <h2 className="text-base font-bold" style={{ color: COLORS.primary }}>
          영웅 목록
        </h2>
        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
          {ownedCount}/6 보유
        </span>
      </div>

      {/* Hero grid - horizontal scroll for landscape */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-6 gap-2">
          {save.heroes.map((heroSave) => {
            const heroDef = HEROES[heroSave.id];
            if (!heroDef) return null;
            const stats = getHeroStats(heroSave.id as HeroId, heroSave.level);
            const starColor = COLORS.starColors[heroDef.stars] || '#9E9E9E';

            return (
              <div
                key={heroSave.id}
                className={`rounded-xl border-2 p-2 flex flex-col items-center ${
                  heroSave.owned ? '' : 'opacity-40 grayscale'
                }`}
                style={{
                  borderColor: heroSave.owned ? starColor : '#444',
                  backgroundColor: 'rgba(22,33,62,0.8)',
                  boxShadow: heroSave.owned && heroDef.stars >= 4 ? `0 0 10px ${starColor}30` : undefined,
                }}
              >
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: heroDef.stars }).map((_, i) => (
                    <span key={i} className="text-[9px]" style={{ color: starColor }}>★</span>
                  ))}
                </div>
                <div className="mb-0.5">
                  {heroSave.owned ? (
                    <CharacterAvatar definitionId={heroDef.id} emoji={heroDef.emoji} size="md" />
                  ) : (
                    <span className="text-2xl">❓</span>
                  )}
                </div>
                <p className="text-xs font-bold" style={{ color: COLORS.textPrimary }}>
                  {heroSave.owned ? heroDef.nameKo : '???'}
                </p>
                <p className="text-[9px]" style={{ color: COLORS.textSecondary }}>
                  {heroSave.owned
                    ? { tank: '탱커', warrior: '전사', ranger: '궁수', mage: '마법사', healer: '힐러', assassin: '암살자' }[heroDef.class]
                    : '미획득'}
                </p>
                {heroSave.owned && stats && (
                  <div className="w-full mt-1 space-y-0.5">
                    <p className="text-[9px] text-center" style={{ color: COLORS.primary }}>
                      Lv.{heroSave.level}
                    </p>
                    <div className="grid grid-cols-2 gap-x-1 text-[8px]">
                      <span style={{ color: COLORS.textSecondary }}>HP:{stats.hp}</span>
                      <span style={{ color: COLORS.textSecondary }}>ATK:{stats.atk}</span>
                      <span style={{ color: COLORS.textSecondary }}>DEF:{stats.def}</span>
                      <span style={{ color: COLORS.textSecondary }}>SPD:{stats.spd}</span>
                    </div>
                  </div>
                )}
                {heroSave.owned && (
                  <div className="mt-1 w-full">
                    <p className="text-[8px]" style={{ color: COLORS.textSecondary }}>
                      기본: {heroDef.basicSkill.nameKo}
                    </p>
                    <p className="text-[8px]" style={{ color: COLORS.primary }}>
                      궁극기: {heroDef.ultimateSkill.nameKo}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
