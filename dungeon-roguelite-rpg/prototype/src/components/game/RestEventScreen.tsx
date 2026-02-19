'use client';

import React from 'react';
import { BattleUnit } from '@/lib/types';
import { COLORS, REST_CHOICES, BACKGROUND_IMAGES } from '@/lib/constants';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface RestEventScreenProps {
  currentStage: number;
  party: BattleUnit[];
  onSelectChoice: (choice: 'heal_30' | 'random_skill') => void;
}

export default function RestEventScreen({ currentStage, party, onSelectChoice }: RestEventScreenProps) {
  const aliveParty = party.filter((u) => u.isAlive);
  const avgHpPercent = aliveParty.length > 0 ? Math.round(aliveParty.reduce((sum, u) => sum + (u.hp / u.maxHp), 0) / aliveParty.length * 100) : 0;

  return (
    <div
      className="h-full flex items-center justify-center gap-8 px-6 relative bg-cover bg-center"
      style={{ background: `linear-gradient(to bottom, rgba(15,10,26,0.8), rgba(44,24,16,0.7) 60%, rgba(26,26,46,0.9)), url(${BACKGROUND_IMAGES.campfire}) center/cover` }}
    >
      {/* Left: info + party HP */}
      <div className="flex flex-col items-center">
        <p className="text-[10px]" style={{ color: COLORS.textSecondary }}>스테이지 {currentStage} / 10</p>
        <h2 className="text-lg font-bold mt-0.5" style={{ color: COLORS.warmGlow }}>🔥 쉼터</h2>
        <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>잠시 쉬어가세요</p>
        <p className="text-[9px] mb-2" style={{ color: avgHpPercent > 60 ? COLORS.success : avgHpPercent > 30 ? '#FFA500' : COLORS.danger }}>
          파티 평균 HP: {avgHpPercent}%
        </p>
        <div className="flex gap-2">
          {aliveParty.map((unit) => {
            const hpRatio = unit.hp / unit.maxHp;
            return (
              <div key={unit.id} className="flex flex-col items-center p-1.5 rounded-lg border" style={{ borderColor: '#444', backgroundColor: 'rgba(22,33,62,0.8)' }}>
                <CharacterAvatar definitionId={unit.definitionId} emoji={unit.emoji} size="sm" />
                <p className="text-[9px]" style={{ color: COLORS.textPrimary }}>{unit.nameKo}</p>
                <div className="w-14 h-1.5 bg-[#2A2A3A] rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${hpRatio * 100}%`,
                    backgroundColor: hpRatio > 0.5 ? COLORS.success : hpRatio > 0.25 ? '#FFA500' : COLORS.danger,
                  }} />
                </div>
                <p className="text-[8px]" style={{ color: COLORS.textSecondary }}>{unit.hp}/{unit.maxHp}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Choices */}
      <div className="flex gap-3">
        {REST_CHOICES.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onSelectChoice(choice.effect)}
            className="w-40 p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 hover:scale-105 transition-all active:scale-95"
            style={{ borderColor: COLORS.primary, backgroundColor: 'rgba(22,33,62,0.9)' }}
          >
            <span className="text-2xl">{choice.emoji}</span>
            <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{choice.nameKo}</p>
            <p className="text-[10px] text-center" style={{ color: COLORS.textSecondary }}>{choice.descriptionKo}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
