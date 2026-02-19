'use client';

import React from 'react';
import { BattleState, BattleUnit, BattleLogEntry } from '@/lib/types';
import { COLORS, BATTLE_CONFIG, BACKGROUND_IMAGES } from '@/lib/constants';
import { BattleSpeed, BattleAnimState } from '@/hooks/useGameState';
import CharacterAvatar from '@/components/ui/CharacterAvatar';

interface BattleScreenProps {
  battleState: BattleState | null;
  currentStage: number;
  battleSpeed: BattleSpeed;
  onToggleSpeed: () => void;
  battleLogs: BattleLogEntry[];
  acquiredSkills: string[];
  battleAnim: BattleAnimState;
  stageType?: 'normal' | 'elite' | 'boss';
}

function HpBar({ current, max }: { current: number; max: number }) {
  const ratio = Math.max(0, current / max);
  const color = ratio > 0.5 ? COLORS.success : ratio > 0.25 ? '#FFA500' : COLORS.danger;
  return (
    <div className="w-full h-1.5 bg-[#2A2A3A] rounded-full border border-[#555] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${ratio * 100}%`, backgroundColor: color }} />
    </div>
  );
}

function UltimateBar({ gauge }: { gauge: number }) {
  const ratio = Math.min(1, gauge / BATTLE_CONFIG.ultimateGaugeMax);
  return (
    <div className="w-full h-1 bg-[#2A2A3A] rounded-full overflow-hidden mt-0.5">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${ratio * 100}%`, backgroundColor: ratio >= 1 ? '#FFD700' : '#6366F1' }} />
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
    <div className="flex gap-0.5 justify-center">
      {buffs.slice(0, 3).map((b, i) => (
        <span key={`${b.type}_${i}`} className="text-[7px]" title={`${b.type} (${b.remainingTurns}t)`}>
          {buffEmojis[b.type] || '✦'}
        </span>
      ))}
    </div>
  );
}

function UnitCard({
  unit, isActing, isHit, hitLog, side, posLabel, skillName, isUltimate,
}: {
  unit: BattleUnit; isActing: boolean;
  isHit: boolean; hitLog: BattleLogEntry | null; side: 'ally' | 'enemy'; posLabel: string;
  skillName?: string; isUltimate?: boolean;
}) {
  if (!unit.isAlive) {
    return (
      <div className="w-[4.2rem] h-[6.5rem] flex flex-col items-center justify-center rounded-lg border border-[#333] animate-unit-death"
        style={{ backgroundColor: 'rgba(10,10,20,0.6)' }}>
        <span className="text-xl">💀</span>
        <span className="text-[7px]" style={{ color: '#666' }}>{unit.nameKo}</span>
      </div>
    );
  }

  // Enemy type border colors for elite/boss
  const isEliteEnemy = side === 'enemy' && unit.definitionId && ['dark_mage', 'orc_berserker', 'vampire_lord'].includes(unit.definitionId);
  const isBossEnemy = side === 'enemy' && unit.definitionId === 'dungeon_lord';
  const eliteBorderColor = isBossEnemy ? '#FF4500' : isEliteEnemy ? '#9C27B0' : '';

  // Ultimate gauge ready indicator
  const ultReady = unit.ultimateGauge >= BATTLE_CONFIG.ultimateGaugeMax;

  let animClass = '';
  if (isActing) {
    animClass = side === 'ally' ? 'animate-attack-right' : 'animate-attack-left';
  } else if (isHit) {
    animClass = 'animate-hit-shake';
  }

  const dmgNum = hitLog?.targets?.[0]?.damage;
  const healNum = hitLog?.targets?.[0]?.heal;
  const killed = hitLog?.targets?.[0]?.killed;
  const effectsApplied = hitLog?.targets?.[0]?.effects;
  const isCritHit = hitLog?.targets?.[0]?.isCritical;

  // Determine acting border/glow style
  const isActingUltimate = isActing && isUltimate;

  return (
    <div className="relative">
      {/* Skill name display above acting unit */}
      {isActing && skillName && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap animate-fade-in-up">
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: isUltimate ? 'rgba(255,215,0,0.9)' : 'rgba(0,191,255,0.8)',
              color: isUltimate ? '#000' : '#fff',
              textShadow: isUltimate ? '0 0 4px rgba(255,215,0,0.5)' : '0 1px 2px rgba(0,0,0,0.5)',
            }}>
            {isUltimate ? '⭐ ' : ''}{skillName}
          </span>
        </div>
      )}
      <div
        className={`w-[4.2rem] h-[6.5rem] rounded-lg border-2 flex flex-col items-center justify-between py-1 px-0.5 transition-all duration-200 ${
          isActingUltimate
            ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.7)] scale-115 z-10'
            : isActing
            ? 'border-[#00BFFF] shadow-[0_0_10px_rgba(0,191,255,0.6)] scale-110 z-10'
            : eliteBorderColor ? '' : 'border-[#444]'
        } ${animClass}`}
        style={{
          backgroundColor: isBossEnemy ? 'rgba(60,15,15,0.9)' : isEliteEnemy ? 'rgba(40,15,50,0.9)' : 'rgba(22,33,62,0.9)',
          borderColor: isActingUltimate ? '#FFD700' : isActing ? '#00BFFF' : eliteBorderColor || undefined,
          boxShadow: isActingUltimate ? '0 0 15px rgba(255,215,0,0.7)' : isActing ? '0 0 10px rgba(0,191,255,0.6)' : !isActing && isBossEnemy ? '0 0 8px rgba(255,69,0,0.4)' : !isActing && isEliteEnemy ? '0 0 6px rgba(156,39,176,0.3)' : undefined,
        }}
      >
        <span className="text-[6px] px-1 rounded-sm" style={{
          color: isBossEnemy ? '#FF6B35' : isEliteEnemy ? '#CE93D8' : '#888',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
          {isBossEnemy ? '👿BOSS' : isEliteEnemy ? '⚡엘리트' : posLabel}
        </span>
        <div className="relative">
          <CharacterAvatar definitionId={unit.definitionId} emoji={unit.emoji} size="sm" />
          {/* Ultimate ready glow ring */}
          {ultReady && !isActing && (
            <div className="absolute -inset-1 rounded-full border border-[#FFD700] animate-pulse opacity-60" />
          )}
        </div>
        <div className="w-full px-0.5">
          <p className="text-[7px] text-center truncate" style={{ color: COLORS.textPrimary }}>{unit.nameKo}</p>
          <HpBar current={unit.hp} max={unit.maxHp} />
          <p className="text-[6px] text-center" style={{ color: COLORS.textSecondary }}>{unit.hp}/{unit.maxHp}</p>
          <UltimateBar gauge={unit.ultimateGauge} />
          <BuffIcons buffs={unit.buffs} />
        </div>
      </div>
      {/* Ultimate flash overlay for acting unit */}
      {isActingUltimate && (
        <div className="absolute inset-0 rounded-lg animate-hit-flash pointer-events-none z-20"
          style={{ backgroundColor: 'rgba(255,215,0,0.3)' }} />
      )}
      {isHit && <div className="absolute inset-0 rounded-lg bg-red-500/40 animate-hit-flash pointer-events-none z-20" />}
      {isHit && (dmgNum || healNum || effectsApplied) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-damage-popup pointer-events-none z-30 whitespace-nowrap">
          {isCritHit && <span className="text-[8px] font-black" style={{ color: '#FFD700', textShadow: '0 0 6px rgba(255,215,0,0.8)' }}>CRIT! </span>}
          {dmgNum && <span className={`font-black ${isCritHit ? 'text-base' : 'text-sm'}`} style={{
            color: isCritHit ? '#FF6B35' : COLORS.danger,
            textShadow: isCritHit ? '0 0 8px rgba(255,107,53,0.8)' : '0 1px 3px rgba(0,0,0,0.9)',
          }}>-{dmgNum}</span>}
          {healNum && <span className="text-sm font-black" style={{ color: COLORS.success, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>+{healNum}</span>}
          {killed && <span className="text-sm"> 💀</span>}
          {effectsApplied && effectsApplied.map((e, i) => {
            const effectEmojis: Record<string, string> = { bleed: '🩸', stun: '💫', atk_down: '⬇️', def_down: '🔽', atk_up: '⚔️', def_up: '🛡️', regen: '💚', taunt: '🎯' };
            return <span key={i} className="text-[8px]"> {effectEmojis[e] || '✦'}</span>;
          })}
        </div>
      )}
    </div>
  );
}

function TurnOrderBar({ battleState }: { battleState: BattleState }) {
  const allUnits = [...battleState.allies, ...battleState.enemies].filter((u) => u.isAlive);
  const currentUnit = battleState.turnOrder[battleState.currentTurnIndex];
  return (
    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-[#0D0D1A]/80 rounded-lg">
      <span className="text-[8px] mr-0.5" style={{ color: COLORS.textSecondary }}>턴:</span>
      {battleState.turnOrder.slice(0, 8).map((unitId, i) => {
        const unit = allUnits.find((u) => u.id === unitId);
        if (!unit) return null;
        return (
          <div key={`${unitId}_${i}`}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] border ${
              unitId === currentUnit ? 'border-[#FFD700] bg-[#FFD700]/20' : 'border-[#444] bg-[#1A1A2E]'
            }`}>
            {unit.emoji}
          </div>
        );
      })}
    </div>
  );
}

function BattleLog({ logs }: { logs: BattleLogEntry[] }) {
  const recentLogs = logs.slice(-4).reverse();
  return (
    <div className="h-12 overflow-hidden px-3 py-0.5">
      {recentLogs.map((log, i) => {
        const hasCrit = log.targets?.some(t => t.isCritical);
        return (
          <div key={`${log.timestamp}_${log.action}_${log.actorName}_${i}`} className="text-[9px] leading-3"
            style={{ color: COLORS.textSecondary, opacity: 1 - i * 0.25 }}>
            {log.action === 'skill' && (
              <span>
                <span style={{ color: COLORS.primary }}>{log.actorName}</span>
                {' → '}<span style={{ color: COLORS.accent }}>{log.skillName}</span>
                {log.targets.map((t, j) => (
                  <span key={j}>
                    {t.isCritical && <span style={{ color: '#FFD700' }}> 💥</span>}
                    {t.damage && <span style={{ color: t.isCritical ? '#FF6B35' : COLORS.danger }}> -{t.damage}</span>}
                    {t.heal && <span style={{ color: COLORS.success }}> +{t.heal}</span>}
                    {t.killed && <span> 💀</span>}
                  </span>
                ))}
              </span>
            )}
            {log.action === 'death' && <span style={{ color: COLORS.danger }}>💀 {log.actorName} 사망</span>}
            {log.action === 'stun_skip' && <span>💫 {log.actorName} 기절!</span>}
          </div>
        );
      })}
    </div>
  );
}

function sortUnitsForDisplay(units: BattleUnit[], side: 'ally' | 'enemy'): BattleUnit[] {
  if (side === 'ally') {
    const back = units.filter(u => u.position === 'back').sort((a, b) => b.slot - a.slot);
    const front = units.filter(u => u.position === 'front').sort((a, b) => b.slot - a.slot);
    return [...back, ...front];
  } else {
    const front = units.filter(u => u.position === 'front').sort((a, b) => a.slot - b.slot);
    const back = units.filter(u => u.position === 'back').sort((a, b) => a.slot - b.slot);
    return [...front, ...back];
  }
}

export default function BattleScreen({
  battleState, currentStage, battleSpeed, onToggleSpeed, battleLogs, acquiredSkills, battleAnim, stageType,
}: BattleScreenProps) {
  if (!battleState) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: COLORS.bgBase }}>
        <p style={{ color: COLORS.textPrimary }}>전투 준비 중...</p>
      </div>
    );
  }

  const hitLogForUnit = (unitId: string): BattleLogEntry | null => {
    if (!battleAnim.lastLog || !battleAnim.hitUnitIds.includes(unitId)) return null;
    const targetInfo = battleAnim.lastLog.targets?.find((t) => t.id === unitId);
    if (!targetInfo) return null;
    return { ...battleAnim.lastLog, targets: [targetInfo] };
  };

  // Get skill name and ultimate status for acting unit
  const actingSkillName = battleAnim.lastLog?.skillName || undefined;
  // Check if the acting skill is an ultimate by checking if gauge was just consumed
  const actingUnit = battleAnim.actingUnitId
    ? [...battleState.allies, ...battleState.enemies].find(u => u.id === battleAnim.actingUnitId)
    : null;
  // Simple heuristic: after ultimate, gauge resets to 0
  const isUltimateAction = actingUnit ? actingUnit.ultimateGauge === 0 && battleAnim.lastLog?.action === 'skill' : false;

  // Screen shake on heavy hits (kill or critical)
  const hasKill = battleAnim.lastLog?.targets?.some(t => t.killed);
  const hasCrit = battleAnim.lastLog?.targets?.some(t => t.isCritical);
  const shouldShake = battleAnim.hitUnitIds.length > 0 && (hasKill || hasCrit || isUltimateAction);

  const sortedAllies = sortUnitsForDisplay(battleState.allies, 'ally');
  const sortedEnemies = sortUnitsForDisplay(battleState.enemies, 'enemy');

  // Stage type label
  const stageLabel = stageType === 'boss' ? '🔥 보스전' : stageType === 'elite' ? '⚡ 엘리트전' : `Stage ${currentStage}/10`;

  return (
    <div className="h-full flex flex-col relative bg-cover bg-center"
      style={{ backgroundColor: COLORS.dungeonDark, backgroundImage: `url(${BACKGROUND_IMAGES.dungeon_battle})` }}>
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="flex items-center justify-between px-3 py-1 bg-[#0D0D1A]/90 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: stageType === 'boss' ? COLORS.danger : stageType === 'elite' ? '#9C27B0' : COLORS.primary }}>{stageLabel}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
            backgroundColor: battleState.isFinished ? (battleState.result === 'victory' ? COLORS.success : COLORS.danger) : COLORS.bgSurface,
            color: COLORS.textPrimary
          }}>
            {battleState.isFinished ? (battleState.result === 'victory' ? '승리!' : '패배...') : `R${battleState.round}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TurnOrderBar battleState={battleState} />
          <button onClick={onToggleSpeed} className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
            style={{ borderColor: COLORS.primary, color: COLORS.primary, backgroundColor: 'rgba(200,168,78,0.1)' }}>
            {battleSpeed}
          </button>
        </div>
      </div>

      <div className="h-0.5 bg-[#2A2A3A] relative z-10">
        <div className="h-full transition-all duration-500" style={{ width: `${(currentStage / 10) * 100}%`, backgroundColor: COLORS.primary }} />
      </div>

      {/* Darkest Dungeon style: ○○○○ vs ○○○○ in single row */}
      <div className={`flex-1 flex items-center justify-center px-4 relative z-10 ${shouldShake ? 'animate-screen-shake' : ''}`}>
        <div className="flex gap-1 items-end">
          {sortedAllies.map((unit) => (
            <UnitCard key={unit.id} unit={unit}
              isActing={unit.id === battleAnim.actingUnitId}
              isHit={battleAnim.hitUnitIds.includes(unit.id)}
              hitLog={hitLogForUnit(unit.id)} side="ally"
              posLabel={unit.position === 'front' ? '전열' : '후열'}
              skillName={unit.id === battleAnim.actingUnitId ? actingSkillName : undefined}
              isUltimate={unit.id === battleAnim.actingUnitId ? isUltimateAction : false} />
          ))}
        </div>

        <div className="mx-3 flex flex-col items-center">
          <span className="text-lg" style={{ color: COLORS.accent }}>⚔️</span>
          <span className="text-[8px] font-bold" style={{ color: COLORS.textSecondary }}>R{battleState.round}</span>
        </div>

        <div className="flex gap-1 items-end">
          {sortedEnemies.map((unit) => (
            <UnitCard key={unit.id} unit={unit}
              isActing={unit.id === battleAnim.actingUnitId}
              isHit={battleAnim.hitUnitIds.includes(unit.id)}
              hitLog={hitLogForUnit(unit.id)} side="enemy"
              posLabel={unit.position === 'front' ? '전열' : '후열'}
              skillName={unit.id === battleAnim.actingUnitId ? actingSkillName : undefined}
              isUltimate={unit.id === battleAnim.actingUnitId ? isUltimateAction : false} />
          ))}
        </div>
      </div>

      {acquiredSkills.length > 0 && (
        <div className="px-3 py-0.5 flex items-center gap-1 bg-[#0D0D1A]/60 relative z-10">
          <span className="text-[8px]" style={{ color: COLORS.textSecondary }}>스킬:</span>
          {acquiredSkills.slice(-8).map((skillId) => {
            const skill = require('@/lib/constants').ROGUELITE_SKILLS.find((s: any) => s.id === skillId);
            return skill ? <span key={skillId} className="text-[9px]" title={skill.nameKo}>{skill.emoji}</span> : null;
          })}
        </div>
      )}

      <div className="relative z-10"><BattleLog logs={battleLogs} /></div>

      {/* Battle end overlay */}
      {battleState.isFinished && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fade-in-up"
          style={{ backgroundColor: battleState.result === 'victory' ? 'rgba(0,0,0,0.6)' : 'rgba(30,0,0,0.7)' }}>
          <div className="text-center">
            <div className="text-4xl mb-1">
              {battleState.result === 'victory' ? '🏆' : '💀'}
            </div>
            <h2 className="text-xl font-black" style={{
              color: battleState.result === 'victory' ? COLORS.primary : COLORS.danger,
              textShadow: battleState.result === 'victory' ? '0 0 20px rgba(200,168,78,0.5)' : '0 0 20px rgba(239,68,68,0.5)',
            }}>
              {battleState.result === 'victory' ? '승리!' : '패배...'}
            </h2>
            <p className="text-[10px] mt-0.5" style={{ color: COLORS.textSecondary }}>
              {battleState.result === 'victory' ? `스테이지 ${currentStage} 클리어` : '다음에 다시 도전하세요'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
