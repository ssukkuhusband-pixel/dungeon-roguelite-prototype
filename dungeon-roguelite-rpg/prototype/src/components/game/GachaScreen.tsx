'use client';

import React, { useState } from 'react';
import { GameSaveData } from '@/lib/types';
import { COLORS, HEROES, GACHA_CONFIG } from '@/lib/constants';
import { GachaResult } from '@/lib/game/gacha';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface GachaScreenProps {
  save: GameSaveData;
  onPull: (type: 'single' | 'ten') => GachaResult[] | null;
  onBack: () => void;
}

export default function GachaScreen({ save, onPull, onBack }: GachaScreenProps) {
  const [results, setResults] = useState<GachaResult[] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const canSinglePull = save.soulStones >= GACHA_CONFIG.singleCost;
  const canTenPull = save.soulStones >= GACHA_CONFIG.tenPullCost;

  const handlePull = (type: 'single' | 'ten') => {
    setIsAnimating(true);
    setTimeout(() => {
      const pullResults = onPull(type);
      setResults(pullResults);
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div
      className="h-full flex flex-col relative"
      style={{ background: `linear-gradient(to bottom, #0F0A1A, #2D1B4E 50%, #1A1A2E)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0D0D1A]/80">
        <button onClick={onBack} className="text-sm px-3 py-1 rounded border" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
          ← 뒤로
        </button>
        <h2 className="text-base font-bold" style={{ color: COLORS.primary }}>✨ 영웅 소환</h2>
        <span className="text-sm" style={{ color: '#9C27B0' }}>💎 {save.soulStones.toLocaleString()}</span>
      </div>

      {/* Main - horizontal layout */}
      <div className="flex-1 flex items-center justify-center gap-8">
        {/* Summon visual */}
        <div className="relative">
          <div className={`text-6xl transition-all duration-500 ${isAnimating ? 'animate-spin scale-125' : ''}`}>🌟</div>
          {isAnimating && (
            <div className="absolute -inset-12 rounded-full animate-ping opacity-30"
              style={{ background: `radial-gradient(circle, ${COLORS.primary}60, transparent)` }} />
          )}
        </div>

        {/* Right side: rates + buttons */}
        <div className="flex flex-col items-center gap-3">
          <div className="px-4 py-2 rounded-lg border text-center" style={{ borderColor: '#444', backgroundColor: 'rgba(22,33,62,0.8)' }}>
            <p className="text-[10px]" style={{ color: COLORS.textSecondary }}>
              ★5: 2% | ★4: 8% | ★3: 20% | ★2: 30% | ★1: 40%
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: COLORS.primary }}>10연차 시 ★3 이상 1명 보장</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handlePull('single')}
              disabled={!canSinglePull || isAnimating}
              className="px-5 py-2 rounded-lg font-bold border-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                borderColor: COLORS.primary,
                backgroundColor: canSinglePull ? 'rgba(200,168,78,0.2)' : 'rgba(22,33,62,0.5)',
                color: COLORS.textPrimary,
              }}
            >
              <p className="text-sm">1회 소환</p>
              <p className="text-[10px]" style={{ color: '#9C27B0' }}>💎 {GACHA_CONFIG.singleCost}</p>
            </button>
            <button
              onClick={() => handlePull('ten')}
              disabled={!canTenPull || isAnimating}
              className="px-5 py-2 rounded-lg font-bold border-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                borderColor: COLORS.accent,
                backgroundColor: canTenPull ? COLORS.accent : 'rgba(22,33,62,0.5)',
                color: '#fff',
                boxShadow: canTenPull ? `0 0 20px ${COLORS.accent}40` : undefined,
              }}
            >
              <p className="text-sm">10연차</p>
              <p className="text-[10px] opacity-80">💎 {GACHA_CONFIG.tenPullCost}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Results overlay */}
      {results && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{ backgroundColor: 'rgba(13,13,26,0.95)' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: COLORS.primary }}>소환 결과</h3>
          <div className="flex flex-wrap gap-2 justify-center px-4 max-w-2xl">
            {results.map((result, i) => {
              const starColor = COLORS.starColors[result.stars] || '#9E9E9E';
              return (
                <div
                  key={i}
                  className={`w-20 p-1.5 rounded-lg border-2 flex flex-col items-center ${result.isNew ? 'animate-bounce' : ''}`}
                  style={{
                    borderColor: starColor, backgroundColor: 'rgba(22,33,62,0.9)',
                    boxShadow: result.stars >= 4 ? `0 0 15px ${starColor}40` : undefined,
                    animationDelay: `${i * 100}ms`, animationDuration: '0.5s',
                  }}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: result.stars }).map((_, j) => (
                      <span key={j} className="text-[7px]" style={{ color: starColor }}>★</span>
                    ))}
                  </div>
                  <CharacterAvatar definitionId={result.heroId} emoji={result.emoji} size="md" />
                  <p className="text-[9px] font-bold" style={{ color: COLORS.textPrimary }}>{result.nameKo}</p>
                  {result.isNew ? (
                    <span className="text-[8px] px-1 rounded" style={{ backgroundColor: COLORS.accent, color: '#fff' }}>NEW!</span>
                  ) : (
                    <span className="text-[8px]" style={{ color: COLORS.textSecondary }}>파편 +{result.fragments}</span>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => setResults(null)} className="mt-4 px-5 py-1.5 rounded-lg border font-bold"
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
            확인
          </button>
        </div>
      )}
    </div>
  );
}
