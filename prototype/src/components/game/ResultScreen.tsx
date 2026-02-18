'use client';

import React from 'react';
import { COLORS, ROGUELITE_SKILLS } from '@/lib/constants';

interface ResultScreenProps {
  result: {
    cleared: boolean;
    stagesCleared: number;
    rewards: { gold: number; soulStones: number; exp: number };
    acquiredSkills?: string[];
  };
  onReturn: () => void;
}

export default function ResultScreen({ result, onReturn }: ResultScreenProps) {
  return (
    <div
      className="h-full flex items-center justify-center gap-8"
      style={{
        background: result.cleared
          ? `linear-gradient(to right, #0F0A1A, #2C1810 50%, #1A1A2E)`
          : `linear-gradient(to right, #0F0A1A, #1A0A0A 50%, #1A1A2E)`,
      }}
    >
      {/* Left: Result */}
      <div className="text-center">
        <div className="text-5xl mb-3">{result.cleared ? '🏆' : '💀'}</div>
        <h1 className="text-2xl font-bold" style={{ color: result.cleared ? COLORS.primary : COLORS.danger }}>
          {result.cleared ? '챕터 클리어!' : '런 실패...'}
        </h1>
        <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
          {result.cleared ? '모든 스테이지를 정복했습니다!' : `스테이지 ${result.stagesCleared}까지 진행`}
        </p>
      </div>

      {/* Right: Rewards + button */}
      <div className="flex flex-col items-center">
        <div className="w-56 rounded-xl border p-3 mb-4" style={{ borderColor: COLORS.primary, backgroundColor: 'rgba(22,33,62,0.9)' }}>
          <h3 className="text-sm font-bold mb-2 text-center" style={{ color: COLORS.primary }}>획득 보상</h3>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: COLORS.textPrimary }}>🪙 골드</span>
              <span className="text-xs font-bold" style={{ color: COLORS.primary }}>+{result.rewards.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: COLORS.textPrimary }}>💎 소울스톤</span>
              <span className="text-xs font-bold" style={{ color: '#9C27B0' }}>+{result.rewards.soulStones.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: COLORS.textPrimary }}>⭐ 경험치</span>
              <span className="text-xs font-bold" style={{ color: COLORS.success }}>+{result.rewards.exp.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {result.acquiredSkills && result.acquiredSkills.length > 0 && (
          <div className="w-56 rounded-xl border p-2 mb-3" style={{ borderColor: '#444', backgroundColor: 'rgba(22,33,62,0.9)' }}>
            <h3 className="text-[10px] font-bold mb-1 text-center" style={{ color: COLORS.textSecondary }}>획득한 스킬</h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {result.acquiredSkills.map((skillId) => {
                const skill = ROGUELITE_SKILLS.find(s => s.id === skillId);
                if (!skill) return null;
                const tierColor = COLORS.tierColors[skill.tier] || '#9E9E9E';
                return (
                  <span key={skillId} className="text-[8px] px-1.5 py-0.5 rounded-full border"
                    style={{ borderColor: tierColor, color: tierColor }}
                    title={skill.descriptionKo}>
                    {skill.emoji} {skill.nameKo}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <button
          onClick={onReturn}
          className="px-6 py-2 rounded-lg font-bold text-base border-2 hover:scale-105 transition-all active:scale-95"
          style={{ backgroundColor: COLORS.accent, borderColor: COLORS.primary, color: '#fff' }}
        >
          캠프로 돌아가기
        </button>
      </div>
    </div>
  );
}
