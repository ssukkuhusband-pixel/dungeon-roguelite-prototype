'use client';

import React from 'react';
import { COLORS } from '@/lib/constants';

interface ResultScreenProps {
  result: {
    cleared: boolean;
    stagesCleared: number;
    rewards: { gold: number; soulStones: number; exp: number };
  };
  onReturn: () => void;
}

export default function ResultScreen({ result, onReturn }: ResultScreenProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center"
      style={{
        background: result.cleared
          ? `linear-gradient(to bottom, #0F0A1A, #2C1810 40%, #1A1A2E)`
          : `linear-gradient(to bottom, #0F0A1A, #1A0A0A 40%, #1A1A2E)`,
      }}
    >
      {/* Result title */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">
          {result.cleared ? '🏆' : '💀'}
        </div>
        <h1
          className="text-3xl font-bold"
          style={{
            color: result.cleared ? COLORS.primary : COLORS.danger,
          }}
        >
          {result.cleared ? '챕터 클리어!' : '런 실패...'}
        </h1>
        <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
          {result.cleared
            ? '모든 스테이지를 정복했습니다!'
            : `스테이지 ${result.stagesCleared}까지 진행`}
        </p>
      </div>

      {/* Rewards */}
      <div
        className="w-72 rounded-xl border p-4 mb-8"
        style={{
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(22,33,62,0.9)',
        }}
      >
        <h3 className="text-sm font-bold mb-3 text-center" style={{ color: COLORS.primary }}>
          획득 보상
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: COLORS.textPrimary }}>
              🪙 골드
            </span>
            <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
              +{result.rewards.gold.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: COLORS.textPrimary }}>
              💎 소울스톤
            </span>
            <span className="text-sm font-bold" style={{ color: '#9C27B0' }}>
              +{result.rewards.soulStones.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: COLORS.textPrimary }}>
              ⭐ 경험치
            </span>
            <span className="text-sm font-bold" style={{ color: COLORS.success }}>
              +{result.rewards.exp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Return button */}
      <button
        onClick={onReturn}
        className="px-8 py-3 rounded-lg font-bold text-lg border-2 hover:scale-105 transition-all active:scale-95"
        style={{
          backgroundColor: COLORS.accent,
          borderColor: COLORS.primary,
          color: '#fff',
        }}
      >
        캠프로 돌아가기
      </button>
    </div>
  );
}
