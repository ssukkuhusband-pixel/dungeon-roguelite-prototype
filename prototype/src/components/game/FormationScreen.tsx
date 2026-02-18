'use client';

import React, { useState } from 'react';
import { GameSaveData } from '@/lib/types';
import { COLORS, HEROES } from '@/lib/constants';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface FormationScreenProps {
  save: GameSaveData;
  onUpdateParty: (
    frontLine: [string | null, string | null],
    backLine: [string | null, string | null]
  ) => void;
  onBack: () => void;
}

export default function FormationScreen({
  save,
  onUpdateParty,
  onBack,
}: FormationScreenProps) {
  const [frontLine, setFrontLine] = useState<[string | null, string | null]>([
    ...save.party.frontLine,
  ]);
  const [backLine, setBackLine] = useState<[string | null, string | null]>([
    ...save.party.backLine,
  ]);
  const [selectedSlot, setSelectedSlot] = useState<{
    line: 'front' | 'back';
    index: number;
  } | null>(null);

  const ownedHeroes = save.heroes.filter((h) => h.owned);
  const currentPartyIds = [...frontLine, ...backLine].filter(Boolean);

  const handleSlotClick = (line: 'front' | 'back', index: number) => {
    setSelectedSlot({ line, index });
  };

  const handleHeroSelect = (heroId: string) => {
    if (!selectedSlot) return;

    // Remove hero from any existing slot
    const newFront: [string | null, string | null] = [...frontLine];
    const newBack: [string | null, string | null] = [...backLine];

    newFront.forEach((id, i) => {
      if (id === heroId) newFront[i] = null;
    });
    newBack.forEach((id, i) => {
      if (id === heroId) newBack[i] = null;
    });

    // Place in selected slot
    if (selectedSlot.line === 'front') {
      newFront[selectedSlot.index] = heroId;
    } else {
      newBack[selectedSlot.index] = heroId;
    }

    setFrontLine(newFront);
    setBackLine(newBack);
    setSelectedSlot(null);
  };

  const handleRemoveFromSlot = () => {
    if (!selectedSlot) return;
    if (selectedSlot.line === 'front') {
      const newFront: [string | null, string | null] = [...frontLine];
      newFront[selectedSlot.index] = null;
      setFrontLine(newFront);
    } else {
      const newBack: [string | null, string | null] = [...backLine];
      newBack[selectedSlot.index] = null;
      setBackLine(newBack);
    }
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    onUpdateParty(frontLine, backLine);
    onBack();
  };

  const renderSlot = (
    heroId: string | null,
    line: 'front' | 'back',
    index: number,
    label: string
  ) => {
    const isSelected =
      selectedSlot?.line === line && selectedSlot?.index === index;
    const hero = heroId ? HEROES[heroId] : null;

    return (
      <button
        onClick={() => handleSlotClick(line, index)}
        className={`w-20 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
          isSelected ? 'scale-105' : 'hover:scale-102'
        }`}
        style={{
          borderColor: isSelected
            ? COLORS.accent
            : hero
            ? COLORS.primary
            : '#444',
          backgroundColor: isSelected
            ? 'rgba(233,69,96,0.15)'
            : 'rgba(22,33,62,0.8)',
        }}
      >
        {hero ? (
          <>
            <CharacterAvatar definitionId={hero.id} emoji={hero.emoji} size="md" />
            <p className="text-[10px] mt-1" style={{ color: COLORS.textPrimary }}>
              {hero.nameKo}
            </p>
          </>
        ) : (
          <>
            <span className="text-xl" style={{ color: '#555' }}>
              +
            </span>
            <p className="text-[10px]" style={{ color: '#555' }}>
              빈 슬롯
            </p>
          </>
        )}
        <p className="text-[8px] mt-0.5" style={{ color: COLORS.textSecondary }}>
          {label}
        </p>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: COLORS.bgBase }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#333' }}>
        <button
          onClick={onBack}
          className="text-sm px-3 py-1 rounded border"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        >
          ← 뒤로
        </button>
        <h2 className="text-base font-bold" style={{ color: COLORS.primary }}>
          편성
        </h2>
        <button
          onClick={handleConfirm}
          className="text-sm px-3 py-1 rounded border font-bold"
          style={{
            borderColor: COLORS.accent,
            color: '#fff',
            backgroundColor: COLORS.accent,
          }}
        >
          확인
        </button>
      </div>

      {/* Formation slots */}
      <div className="p-4">
        <p className="text-xs mb-2" style={{ color: COLORS.textSecondary }}>
          슬롯을 클릭하여 영웅을 배치하세요
        </p>

        <div className="flex justify-center gap-8 mb-4">
          {/* Front line */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold" style={{ color: COLORS.primary }}>
              전열 (앞줄)
            </p>
            <div className="flex gap-2">
              {renderSlot(frontLine[0], 'front', 0, '전열 1')}
              {renderSlot(frontLine[1], 'front', 1, '전열 2')}
            </div>
          </div>

          {/* Back line */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold" style={{ color: COLORS.primary }}>
              후열 (뒷줄)
            </p>
            <div className="flex gap-2">
              {renderSlot(backLine[0], 'back', 0, '후열 1')}
              {renderSlot(backLine[1], 'back', 1, '후열 2')}
            </div>
          </div>
        </div>

        {selectedSlot && (
          <div className="text-center mb-2">
            <button
              onClick={handleRemoveFromSlot}
              className="text-xs px-3 py-1 rounded border"
              style={{ borderColor: COLORS.danger, color: COLORS.danger }}
            >
              슬롯 비우기
            </button>
          </div>
        )}
      </div>

      {/* Hero selection grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-xs mb-2" style={{ color: COLORS.textSecondary }}>
          보유 영웅 ({ownedHeroes.length}명)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ownedHeroes.map((heroSave) => {
            const heroDef = HEROES[heroSave.id];
            if (!heroDef) return null;
            const isInParty = currentPartyIds.includes(heroSave.id);
            const starColor = COLORS.starColors[heroDef.stars] || '#9E9E9E';

            return (
              <button
                key={heroSave.id}
                onClick={() => selectedSlot && handleHeroSelect(heroSave.id)}
                disabled={!selectedSlot}
                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                  selectedSlot ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                } ${isInParty ? 'opacity-50' : ''}`}
                style={{
                  borderColor: starColor,
                  backgroundColor: 'rgba(22,33,62,0.8)',
                }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: heroDef.stars }).map((_, i) => (
                    <span key={i} className="text-[8px]" style={{ color: starColor }}>★</span>
                  ))}
                </div>
                <CharacterAvatar definitionId={heroDef.id} emoji={heroDef.emoji} size="md" />
                <p className="text-[10px]" style={{ color: COLORS.textPrimary }}>
                  {heroDef.nameKo}
                </p>
                <p className="text-[9px]" style={{ color: COLORS.textSecondary }}>
                  Lv.{heroSave.level} |{' '}
                  {{ tank: '탱커', warrior: '전사', ranger: '궁수', mage: '마법사', healer: '힐러', assassin: '암살자' }[heroDef.class]}
                </p>
                {isInParty && (
                  <span className="text-[8px]" style={{ color: COLORS.accent }}>
                    편성됨
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
