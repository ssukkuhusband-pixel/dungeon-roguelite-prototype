'use client';

import React, { useMemo } from 'react';
import { BattleState, BattleUnit, BattleLogEntry } from '@/lib/types';
import { COLORS, BATTLE_CONFIG, BACKGROUND_IMAGES } from '@/lib/constants';
import { BattleSpeed } from '@/hooks/useGameState';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface BattleScreenProps {
  battleState: BattleState | null;
  currentStage: number;
  battleSpeed: BattleSpeed;
  onToggleSpeed: () => void;
  battleLogs: BattleLogEntry[];
  acquiredSkills: string[];
}

function HpBar({ current, max }: { current: number; max: number }) {
  const ratio = Math.max(0, current / max);
  const color = ratio > 0.5 ? COLORS.success : ratio > 0.25 ? '#FFA500' : COLORS.danger;

  return (
    <div className="w-full h-2 bg-[#2A2A3A] rounded-full border border-[#555] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${ratio * 100}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function UltimateBar({ gauge }: { gauge: number }) {
  const ratio = Math.min(1, gauge / BATTLE_CONFIG.ultimateGaugeMax);
  return (
    <div className="w-full h-1 bg-[#2A2A3A] rounded-full overflow-hidden mt-0.5">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${ratio * 100}%`,
          backgroundColor: ratio >= 1 ? '#FFD700' : '#6366F1',
        }}
      />
    </div>
  );
}

function BuffIcons({ buffs }: { buffs: BattleUnit['buffs'] }) {
  if (buffs.length === 0) return null;
  const buffEmojis: Record<string, string> = {
    atk_up: '⚔️', def_up: '🛡️', spd_up: '💨', atk_down: '⬇️',
    def_down: '🔽', regen: '💚', bleed: '🩸', stun: '💫', taunt: '🎯',
  };
  return (
    <div className="flex gap-0.5 justify-center mt-0.5">
      {buffs.map((b, i) => (
        <span key={`${b.type}_${i}`} className="text-[10px]" title={`${b.type} (${b.remainingTurns}t)`}>
          {buffEmojis[b.type] || '✦'}
        </span>
      ))}
    </div>
  );
}

function UnitCard({
  unit,
  isCurrentTurn,
  side,
}: {
  unit: BattleUnit;
  isCurrentTurn: boolean;
  side: 'ally' | 'enemy';
}) {
  if (!unit.isAlive) {
    return (
      <div className="w-20 h-28 flex items-center justify-center opacity-30">
        <span className="text-2xl">💀</span>
      </div>
    );
  }

  return (
    <div
      className={`w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-between p-1 transition-all duration-200 ${
        isCurrentTurn
          ? 'border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] scale-105'
          : 'border-[#444]'
      }`}
      style={{ backgroundColor: 'rgba(22,33,62,0.9)' }}
    >
      <CharacterAvatar definitionId={unit.definitionId} emoji={unit.emoji} size="md" />
      <div className="w-full">
        <p className="text-[10px] text-center truncate" style={{ color: COLORS.textPrimary }}>
          {unit.nameKo}
        </p>
        <HpBar current={unit.hp} max={unit.maxHp} />
        <UltimateBar gauge={unit.ultimateGauge} />
        <p className="text-[9px] text-center" style={{ color: COLORS.textSecondary }}>
          {unit.hp}/{unit.maxHp}
        </p>
        <BuffIcons buffs={unit.buffs} />
      </div>
    </div>
  );
}

function TurnOrderBar({ battleState }: { battleState: BattleState }) {
  const allUnits = [...battleState.allies, ...battleState.enemies].filter((u) => u.isAlive);
  const currentUnit = battleState.turnOrder[battleState.currentTurnIndex];

  return (
    <div className="flex items-center gap-1 px-4 py-1 bg-[#0D0D1A]/80 rounded-lg">
      <span className="text-[10px] mr-1" style={{ color: COLORS.textSecondary }}>
        턴순서:
      </span>
      {battleState.turnOrder.slice(0, 8).map((unitId, i) => {
        const unit = allUnits.find((u) => u.id === unitId);
        if (!unit) return null;
        return (
          <div
            key={`${unitId}_${i}`}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
              unitId === currentUnit ? 'border-[#FFD700] bg-[#FFD700]/20' : 'border-[#444] bg-[#1A1A2E]'
            }`}
          >
            {unit.emoji}
          </div>
        );
      })}
    </div>
  );
}

function BattleLog({ logs }: { logs: BattleLogEntry[] }) {
  const recentLogs = logs.slice(-5).reverse();

  return (
    <div className="h-24 overflow-hidden px-3 py-1">
      {recentLogs.map((log, i) => (
        <div
          key={`${log.timestamp}_${log.action}_${log.actorName}_${i}`}
          className="text-[11px] leading-4"
          style={{
            color: COLORS.textSecondary,
            opacity: 1 - i * 0.2,
          }}
        >
          {log.action === 'skill' && (
            <span>
              <span style={{ color: COLORS.primary }}>{log.actorName}</span>
              {' → '}
              <span style={{ color: COLORS.accent }}>{log.skillName}</span>
              {log.targets.map((t, j) => (
                <span key={j}>
                  {t.damage && (
                    <span style={{ color: COLORS.danger }}> -{t.damage}</span>
                  )}
                  {t.heal && (
                    <span style={{ color: COLORS.success }}> +{t.heal}</span>
                  )}
                  {t.killed && <span> 💀</span>}
                </span>
              ))}
            </span>
          )}
          {log.action === 'death' && (
            <span style={{ color: COLORS.danger }}>
              💀 {log.actorName} 사망
            </span>
          )}
          {log.action === 'stun_skip' && (
            <span>
              💫 {log.actorName} 기절!
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BattleScreen({
  battleState,
  currentStage,
  battleSpeed,
  onToggleSpeed,
  battleLogs,
  acquiredSkills,
}: BattleScreenProps) {
  if (!battleState) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: COLORS.bgBase }}>
        <p style={{ color: COLORS.textPrimary }}>전투 준비 중...</p>
      </div>
    );
  }

  const currentTurnUnit = battleState.turnOrder[battleState.currentTurnIndex];

  return (
    <div
      className="h-full flex flex-col relative bg-cover bg-center"
      style={{
        backgroundColor: COLORS.dungeonDark,
        backgroundImage: `url(${BACKGROUND_IMAGES.dungeon_battle})`,
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      {/* Top bar: Stage info + speed + turn order */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0D0D1A]/90 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
            스테이지 {currentStage}/10
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{
            backgroundColor: battleState.isFinished
              ? (battleState.result === 'victory' ? COLORS.success : COLORS.danger)
              : COLORS.bgSurface,
            color: COLORS.textPrimary
          }}>
            {battleState.isFinished
              ? (battleState.result === 'victory' ? '승리!' : '패배...')
              : `라운드 ${battleState.round}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TurnOrderBar battleState={battleState} />
          <button
            onClick={onToggleSpeed}
            className="px-2 py-1 rounded text-xs font-bold border"
            style={{
              borderColor: COLORS.primary,
              color: COLORS.primary,
              backgroundColor: 'rgba(200,168,78,0.1)',
            }}
          >
            {battleSpeed}
          </button>
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="h-1 bg-[#2A2A3A] relative z-10">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${(currentStage / 10) * 100}%`,
            backgroundColor: COLORS.primary,
          }}
        />
      </div>

      {/* Battle field */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        {/* Allies (left) */}
        <div className="flex flex-col gap-2 mr-8">
          <div className="flex gap-2">
            {/* Back row slots 3,4 */}
            <div className="flex flex-col gap-2">
              {battleState.allies
                .filter((u) => u.position === 'back')
                .map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentTurnUnit}
                    side="ally"
                  />
                ))}
            </div>
            {/* Front row slots 1,2 */}
            <div className="flex flex-col gap-2">
              {battleState.allies
                .filter((u) => u.position === 'front')
                .map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentTurnUnit}
                    side="ally"
                  />
                ))}
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="mx-4">
          <span className="text-2xl font-bold" style={{ color: COLORS.accent }}>
            VS
          </span>
        </div>

        {/* Enemies (right) */}
        <div className="flex flex-col gap-2 ml-8">
          <div className="flex gap-2">
            {/* Front row slots 5,6 */}
            <div className="flex flex-col gap-2">
              {battleState.enemies
                .filter((u) => u.position === 'front')
                .map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentTurnUnit}
                    side="enemy"
                  />
                ))}
            </div>
            {/* Back row slots 7,8 */}
            <div className="flex flex-col gap-2">
              {battleState.enemies
                .filter((u) => u.position === 'back')
                .map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentTurnUnit}
                    side="enemy"
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acquired skills display */}
      {acquiredSkills.length > 0 && (
        <div className="px-4 py-1 flex items-center gap-1 bg-[#0D0D1A]/60 relative z-10">
          <span className="text-[10px]" style={{ color: COLORS.textSecondary }}>
            스킬:
          </span>
          {acquiredSkills.slice(-6).map((skillId) => {
            const skill = require('@/lib/constants').ROGUELITE_SKILLS.find(
              (s: any) => s.id === skillId
            );
            return skill ? (
              <span key={skillId} className="text-xs" title={skill.nameKo}>
                {skill.emoji}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Battle log */}
      <div className="relative z-10">
        <BattleLog logs={battleLogs} />
      </div>
    </div>
  );
}
