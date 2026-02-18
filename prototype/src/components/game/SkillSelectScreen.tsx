'use client';

import React from 'react';
import { RogueliteSkill } from '@/lib/types';
import { COLORS } from '@/lib/constants';

interface SkillSelectScreenProps {
  choices: RogueliteSkill[];
  onSelect: (skill: RogueliteSkill) => void;
  currentStage: number;
}

function SkillCard({
  skill,
  onSelect,
}: {
  skill: RogueliteSkill;
  onSelect: () => void;
}) {
  const tierColor = COLORS.tierColors[skill.tier] || COLORS.textSecondary;
  const tierBg = {
    common: 'rgba(158,158,158,0.1)',
    rare: 'rgba(33,150,243,0.15)',
    legendary: 'rgba(200,168,78,0.2)',
  }[skill.tier];

  const tierLabel = {
    common: '일반',
    rare: '희귀',
    legendary: '전설',
  }[skill.tier];

  return (
    <button
      onClick={onSelect}
      className="w-44 p-4 rounded-xl border-2 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95 cursor-pointer"
      style={{
        borderColor: tierColor,
        backgroundColor: tierBg,
        boxShadow: skill.tier === 'legendary' ? `0 0 20px ${tierColor}40` : undefined,
      }}
    >
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
        style={{ backgroundColor: tierColor, color: '#000' }}
      >
        {tierLabel}
      </span>
      <span className="text-3xl">{skill.emoji}</span>
      <p className="text-sm font-bold text-center" style={{ color: COLORS.textPrimary }}>
        {skill.nameKo}
      </p>
      <p className="text-xs text-center leading-4" style={{ color: COLORS.textSecondary }}>
        {skill.descriptionKo}
      </p>
    </button>
  );
}

export default function SkillSelectScreen({
  choices,
  onSelect,
  currentStage,
}: SkillSelectScreenProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center relative"
      style={{
        backgroundColor: 'rgba(13,13,26,0.95)',
      }}
    >
      {/* Title */}
      <div className="mb-8 text-center">
        <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>
          스테이지 {currentStage - 1} 클리어!
        </p>
        <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>
          스킬을 선택하세요
        </h2>
      </div>

      {/* Skill choices */}
      <div className="flex gap-4 px-4">
        {choices.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onSelect={() => onSelect(skill)}
          />
        ))}
      </div>
    </div>
  );
}
