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

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden bg-cover bg-center"
      style={{
        background: `linear-gradient(to bottom, rgba(15,10,26,0.7), rgba(44,24,16,0.5) 40%, rgba(26,26,46,0.8)), url(${BACKGROUND_IMAGES.campfire}) center/cover`,
      }}
    >
      {/* Currency bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0D0D1A]/95 backdrop-blur-sm relative z-10">
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

      {/* Main content - horizontal layout for landscape */}
      <div className="flex-1 flex items-center justify-center gap-8 px-6 relative">
        {/* Left: Campfire + Party */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="text-5xl animate-pulse">🔥</div>
            <div
              className="absolute -inset-8 rounded-full opacity-30 animate-pulse"
              style={{
                background: `radial-gradient(circle, ${COLORS.warmGlow}40, transparent)`,
              }}
            />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => {
              const heroId = partyIds[i];
              const hero = heroId ? HEROES[heroId] : null;
              const posLabel = i < 2 ? '전열' : '후열';
              const classLabels: Record<string, string> = { tank: '탱커', warrior: '전사', ranger: '궁수', mage: '마법', healer: '힐러', assassin: '암살' };
              const starColor = hero ? (COLORS.starColors[hero.stars] || '#9E9E9E') : '#444';
              return (
                <div
                  key={i}
                  className="w-14 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform gap-0.5"
                  style={{
                    borderColor: hero ? starColor : '#444',
                    backgroundColor: hero ? 'rgba(22,33,62,0.9)' : 'rgba(22,33,62,0.4)',
                  }}
                  onClick={onGoToFormation}
                >
                  {hero ? (
                    <>
                      <CharacterAvatar definitionId={hero.id} emoji={hero.emoji} size="sm" />
                      <span className="text-[7px]" style={{ color: COLORS.textPrimary }}>{hero.nameKo}</span>
                      <span className="text-[6px]" style={{ color: COLORS.textSecondary }}>{classLabels[hero.class]} · {posLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg" style={{ color: '#555' }}>+</span>
                      <span className="text-[7px]" style={{ color: '#555' }}>{posLabel}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Chapter + Enter button */}
        <div className="flex flex-col items-center">
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
          <button
            onClick={onStartRun}
            className="px-8 py-2.5 rounded-lg font-bold text-lg border-2 hover:scale-105 transition-all active:scale-95"
            style={{
              backgroundColor: COLORS.accent,
              borderColor: COLORS.primary,
              color: '#fff',
              boxShadow: `0 0 20px ${COLORS.accent}40`,
            }}
          >
            던전 입장
          </button>
          <p className="text-xs mt-1.5" style={{ color: COLORS.textSecondary }}>
            총 런 횟수: {save.totalRuns}
          </p>
        </div>
      </div>

      {/* Bottom navigation - compact for landscape */}
      <div className="flex border-t relative z-10" style={{ borderColor: '#333', backgroundColor: 'rgba(13,13,26,0.95)' }}>
        {[
          { icon: '📋', label: '편성', onClick: onGoToFormation },
          { icon: '👥', label: '영웅', onClick: onGoToHeroes },
          { icon: '✨', label: '소환', onClick: onGoToGacha },
          { icon: '🔄', label: '초기화', onClick: onResetSave },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex-1 flex flex-col items-center py-2 hover:bg-white/5 transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] mt-0.5" style={{ color: COLORS.textSecondary }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
