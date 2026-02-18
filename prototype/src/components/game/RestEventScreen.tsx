'use client';

import React from 'react';
import { BattleUnit } from '@/lib/types';
import { COLORS, REST_CHOICES } from '@/lib/constants';

interface RestEventScreenProps {
  currentStage: number;
  party: BattleUnit[];
  onSelectChoice: (choice: 'heal_30' | 'random_skill') => void;
}

export default function RestEventScreen({
  currentStage,
  party,
  onSelectChoice,
}: RestEventScreenProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(to bottom, #0F0A1A, #2C1810 60%, #1A1A2E)`,
      }}
    >
      {/* Title */}
      <div className="mb-6 text-center">
        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
          스테이지 {currentStage}
        </p>
        <h2 className="text-xl font-bold mt-1" style={{ color: COLORS.warmGlow }}>
          🔥 쉼터
        </h2>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          잠시 쉬어가세요
        </p>
      </div>

      {/* Party HP status */}
      <div className="flex gap-3 mb-6">
        {party.filter((u) => u.isAlive).map((unit) => (
          <div
            key={unit.id}
            className="flex flex-col items-center p-2 rounded-lg border"
            style={{ borderColor: '#444', backgroundColor: 'rgba(22,33,62,0.8)' }}
          >
            <span className="text-xl">{unit.emoji}</span>
            <p className="text-[10px]" style={{ color: COLORS.textPrimary }}>
              {unit.nameKo}
            </p>
            <div className="w-16 h-1.5 bg-[#2A2A3A] rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(unit.hp / unit.maxHp) * 100}%`,
                  backgroundColor:
                    unit.hp / unit.maxHp > 0.5
                      ? COLORS.success
                      : unit.hp / unit.maxHp > 0.25
                      ? '#FFA500'
                      : COLORS.danger,
                }}
              />
            </div>
            <p className="text-[9px]" style={{ color: COLORS.textSecondary }}>
              {unit.hp}/{unit.maxHp}
            </p>
          </div>
        ))}
      </div>

      {/* Choices */}
      <div className="flex gap-4">
        {REST_CHOICES.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onSelectChoice(choice.effect)}
            className="w-48 p-4 rounded-xl border-2 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95"
            style={{
              borderColor: COLORS.primary,
              backgroundColor: 'rgba(22,33,62,0.9)',
            }}
          >
            <span className="text-3xl">{choice.emoji}</span>
            <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
              {choice.nameKo}
            </p>
            <p className="text-xs text-center" style={{ color: COLORS.textSecondary }}>
              {choice.descriptionKo}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
