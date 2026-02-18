'use client';

import React from 'react';
import { GameSaveData } from '@/lib/types';
import { COLORS, HEROES, BACKGROUND_IMAGES } from '@/lib/constants';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface MainScreenProps {
  save: GameSaveData;
  onStartRun: () => void;
  onGoToHeroes: () => void;
  onGoToGacha: () => void;
  onGoToFormation: () => void;
  onResetSave: () => void;
}

export default function MainScreen({
  save,
  onStartRun,
  onGoToHeroes,
  onGoToGacha,
  onGoToFormation,
  onResetSave,
}: MainScreenProps) {
  const partyIds = [
    ...save.party.frontLine,
    ...save.party.backLine,
  ].filter(Boolean) as string[];

  const partyHeroes = partyIds.map((id) => HEROES[id]).filter(Boolean);

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden bg-cover bg-center"
      style={{
        background: `linear-gradient(to bottom, rgba(15,10,26,0.7), rgba(44,24,16,0.5) 40%, rgba(26,26,46,0.8)), url(${BACKGROUND_IMAGES.campfire}) center/cover`,
      }}
    >
      {/* Currency bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0D0D1A]/95 backdrop-blur-sm relative z-10">
        <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
          ⚔️ 던전 로그라이트
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: COLORS.primary }}>
            🪙 {save.gold.toLocaleString()}
          </span>
          <span className="text-sm" style={{ color: '#9C27B0' }}>
            💎 {save.soulStones.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Campfire area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Campfire emoji/visual */}
        <div className="relative mb-4">
          <div className="text-6xl animate-pulse">🔥</div>
          <div
            className="absolute -inset-8 rounded-full opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${COLORS.warmGlow}40, transparent)`,
            }}
          />
        </div>

        {/* Party display */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => {
            const heroId = partyIds[i];
            const hero = heroId ? HEROES[heroId] : null;
            return (
              <div
                key={i}
                className="w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                style={{
                  borderColor: hero ? COLORS.primary : '#444',
                  backgroundColor: hero ? 'rgba(22,33,62,0.9)' : 'rgba(22,33,62,0.4)',
                }}
                onClick={onGoToFormation}
              >
                {hero ? (
                  <CharacterAvatar definitionId={hero.id} emoji={hero.emoji} size="md" />
                ) : (
                  <span className="text-xl" style={{ color: '#555' }}>+</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Chapter info */}
        <div
          className="px-6 py-2 rounded-lg border mb-3"
          style={{
            borderColor: COLORS.primary,
            backgroundColor: 'rgba(22,33,62,0.8)',
          }}
        >
          <p className="text-xs text-center" style={{ color: COLORS.textSecondary }}>
            챕터 1
          </p>
          <p className="text-base font-bold text-center" style={{ color: COLORS.textPrimary }}>
            잊혀진 지하묘지
          </p>
          {save.chapter1Cleared && (
            <p className="text-xs text-center" style={{ color: COLORS.success }}>
              ✅ 클리어 완료
            </p>
          )}
        </div>

        {/* Enter dungeon button */}
        <button
          onClick={onStartRun}
          className="px-8 py-3 rounded-lg font-bold text-lg border-2 hover:scale-105 transition-all active:scale-95"
          style={{
            backgroundColor: COLORS.accent,
            borderColor: COLORS.primary,
            color: '#fff',
            boxShadow: `0 0 20px ${COLORS.accent}40`,
          }}
        >
          던전 입장
        </button>

        <p className="text-xs mt-2" style={{ color: COLORS.textSecondary }}>
          총 런 횟수: {save.totalRuns}
        </p>
      </div>

      {/* Bottom navigation */}
      <div className="flex border-t relative z-10" style={{ borderColor: '#333', backgroundColor: 'rgba(13,13,26,0.95)' }}>
        <button
          onClick={onGoToFormation}
          className="flex-1 flex flex-col items-center py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">📋</span>
          <span className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
            편성
          </span>
        </button>
        <button
          onClick={onGoToHeroes}
          className="flex-1 flex flex-col items-center py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">👥</span>
          <span className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
            영웅
          </span>
        </button>
        <button
          onClick={onGoToGacha}
          className="flex-1 flex flex-col items-center py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">✨</span>
          <span className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
            소환
          </span>
        </button>
        <button
          onClick={onResetSave}
          className="flex-1 flex flex-col items-center py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">🔄</span>
          <span className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
            초기화
          </span>
        </button>
      </div>
    </div>
  );
}
