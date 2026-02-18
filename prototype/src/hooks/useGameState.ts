'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameSaveData,
  GameScreen,
  RunState,
  BattleState,
  BattleUnit,
  BattleLogEntry,
  RogueliteSkill,
  HeroId,
} from '../lib/types';
import {
  INITIAL_SAVE,
  STAGES,
  STAGE_REWARDS,
  CHAPTER_CLEAR_BONUS,
  ROGUELITE_SKILLS,
  HEROES,
  BATTLE_CONFIG,
} from '../lib/constants';
import { loadGameSave, saveGame, resetGame, createPartyUnits } from '../lib/game/game-state';
import {
  createBattleState,
  executeRound,
  applyRogueliteStatBoosts,
  applyBattleStartEffects,
  presentSkillChoices,
} from '../lib/game/battle-engine';
import { createEnemyUnits, getStageDefinition } from '../lib/game/enemy-factory';

export type BattleSpeed = '1x' | '2x';

export interface GameStateHook {
  // State
  save: GameSaveData;
  screen: GameScreen;
  runState: RunState | null;
  battleState: BattleState | null;
  battleSpeed: BattleSpeed;
  skillChoices: RogueliteSkill[];
  battleLogs: BattleLogEntry[];
  isBattling: boolean;
  runResult: { cleared: boolean; stagesCleared: number; rewards: { gold: number; soulStones: number; exp: number } } | null;

  // Actions
  setScreen: (screen: GameScreen) => void;
  startRun: () => void;
  startBattle: () => void;
  selectSkill: (skill: RogueliteSkill) => void;
  selectRestChoice: (choice: 'heal_30' | 'random_skill') => void;
  toggleBattleSpeed: () => void;
  updateParty: (frontLine: [string | null, string | null], backLine: [string | null, string | null]) => void;
  performGacha: (type: 'single' | 'ten') => import('../lib/game/gacha').GachaResult[] | null;
  returnToMain: () => void;
  resetSave: () => void;
}

export function useGameState(): GameStateHook {
  const [save, setSave] = useState<GameSaveData>(INITIAL_SAVE);
  const [screen, setScreen] = useState<GameScreen>('main');
  const [runState, setRunState] = useState<RunState | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleSpeed, setBattleSpeed] = useState<BattleSpeed>('1x');
  const [skillChoices, setSkillChoices] = useState<RogueliteSkill[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [runResult, setRunResult] = useState<GameStateHook['runResult']>(null);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load save on mount
  useEffect(() => {
    const loaded = loadGameSave();
    setSave(loaded);
  }, []);

  // Save whenever save changes
  useEffect(() => {
    if (save !== INITIAL_SAVE) {
      saveGame(save);
    }
  }, [save]);

  const updateSave = useCallback((updater: (prev: GameSaveData) => GameSaveData) => {
    setSave((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  // Start a new run
  const startRun = useCallback(() => {
    const partyUnits = createPartyUnits(save);
    if (partyUnits.length === 0) return;

    const newRun: RunState = {
      currentStage: 1,
      acquiredSkills: [],
      party: partyUnits,
      isActive: true,
      rewards: { gold: 0, soulStones: 0, exp: 0 },
    };
    setRunState(newRun);
    setBattleLogs([]);

    // Check first stage type
    const stage = getStageDefinition(1);
    if (stage?.type === 'rest') {
      setScreen('rest_event');
    } else if (stage) {
      // Immediately create battle state for stage 1
      const enemies = createEnemyUnits(stage);
      const partyClone = partyUnits.map((u) => ({ ...u, buffs: [...u.buffs] }));
      const newBattle = createBattleState(partyClone, enemies);
      setBattleState(newBattle);
      setIsBattling(true);
      setScreen('battle');
    }
  }, [save]);

  // Start battle for current stage
  const startBattle = useCallback(() => {
    if (!runState) return;

    const stageDef = getStageDefinition(runState.currentStage);
    if (!stageDef || stageDef.type === 'rest') return;

    const enemies = createEnemyUnits(stageDef);
    const partyClone = runState.party.map((u) => ({ ...u, buffs: [...u.buffs] }));

    // Apply roguelite skill stat boosts
    const acquiredSkillObjects = runState.acquiredSkills
      .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
      .filter(Boolean) as RogueliteSkill[];

    // Apply battle start effects (heal, buffs)
    applyBattleStartEffects(partyClone, acquiredSkillObjects);

    const newBattle = createBattleState(partyClone, enemies);
    setBattleState(newBattle);
    setBattleLogs([]);
    setIsBattling(true);
    setScreen('battle');
  }, [runState]);

  // Auto-battle tick
  useEffect(() => {
    if (!isBattling || !battleState || battleState.isFinished) {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
      return;
    }

    const speed = BATTLE_CONFIG.animationSpeed[battleSpeed];
    const tickInterval = speed.action + speed.turnDelay;

    battleIntervalRef.current = setInterval(() => {
      setBattleState((prev) => {
        if (!prev || prev.isFinished) return prev;

        const stateCopy: BattleState = {
          ...prev,
          allies: prev.allies.map((u) => ({ ...u, buffs: [...u.buffs] })),
          enemies: prev.enemies.map((u) => ({ ...u, buffs: [...u.buffs] })),
          battleLog: [...prev.battleLog],
          turnOrder: [...prev.turnOrder],
        };

        const acquiredSkillObjects = (runState?.acquiredSkills || [])
          .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
          .filter(Boolean) as RogueliteSkill[];

        const logs = executeRound(stateCopy, acquiredSkillObjects);
        setBattleLogs((prevLogs) => [...prevLogs, ...logs]);

        if (stateCopy.isFinished) {
          setIsBattling(false);

          // Handle battle result
          if (stateCopy.result === 'victory') {
            handleVictory(stateCopy);
          } else if (stateCopy.result === 'defeat') {
            handleDefeat();
          }
        }

        return stateCopy;
      });
    }, tickInterval);

    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
    };
  }, [isBattling, battleState?.isFinished, battleSpeed, runState]);

  const handleVictory = useCallback(
    (finalBattle: BattleState) => {
      if (!runState) return;

      const currentStage = runState.currentStage;
      const stageReward = STAGE_REWARDS[currentStage] || { gold: 0, soulStones: 0, exp: 0 };

      // Update run rewards
      const newRewards = {
        gold: runState.rewards.gold + stageReward.gold,
        soulStones: runState.rewards.soulStones + stageReward.soulStones,
        exp: runState.rewards.exp + stageReward.exp,
      };

      // Update party HP state from battle
      const updatedParty = runState.party.map((member) => {
        const battleUnit = finalBattle.allies.find((a) => a.id === member.id);
        if (battleUnit) {
          return {
            ...member,
            hp: battleUnit.hp,
            maxHp: battleUnit.maxHp,
            atk: battleUnit.atk,
            def: battleUnit.def,
            spd: battleUnit.spd,
            ultimateGauge: battleUnit.ultimateGauge,
            isAlive: battleUnit.isAlive,
            buffs: [],
          };
        }
        return member;
      });

      // Check if it's the boss stage (stage 10)
      if (currentStage === 10) {
        // Run cleared!
        const isFirstClear = !save.chapter1Cleared;
        const finalRewards = {
          gold: newRewards.gold + (isFirstClear ? CHAPTER_CLEAR_BONUS.gold : 0),
          soulStones: newRewards.soulStones + (isFirstClear ? CHAPTER_CLEAR_BONUS.soulStones : 0),
          exp: newRewards.exp,
        };

        // Update save
        updateSave((prev) => ({
          ...prev,
          gold: prev.gold + finalRewards.gold,
          soulStones: prev.soulStones + finalRewards.soulStones,
          chapter1Cleared: true,
          totalRuns: prev.totalRuns + 1,
          heroes: prev.heroes.map((h) => {
            const isInParty = updatedParty.some((p) => p.definitionId === h.id);
            if (isInParty) {
              return { ...h, exp: h.exp + Math.floor(finalRewards.exp / updatedParty.length) };
            }
            return h;
          }),
        }));

        setRunResult({
          cleared: true,
          stagesCleared: 10,
          rewards: finalRewards,
        });
        setRunState(null);
        setScreen('result');
        return;
      }

      // Not boss stage - prepare skill selection or next stage
      setRunState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStage: currentStage + 1,
          party: updatedParty,
          rewards: newRewards,
        };
      });

      // Show skill selection
      const stageDef = getStageDefinition(currentStage);
      const isElite = stageDef?.type === 'elite';
      const choices = presentSkillChoices(
        runState.acquiredSkills,
        ROGUELITE_SKILLS,
        isElite
      );
      setSkillChoices(choices);
      setScreen('skill_select');
    },
    [runState, save, updateSave]
  );

  const handleDefeat = useCallback(() => {
    if (!runState) return;

    const failReward = {
      gold: runState.rewards.gold + (runState.currentStage - 1) * 5,
      soulStones: runState.rewards.soulStones,
      exp: runState.rewards.exp,
    };

    updateSave((prev) => ({
      ...prev,
      gold: prev.gold + failReward.gold,
      totalRuns: prev.totalRuns + 1,
      heroes: prev.heroes.map((h) => {
        const isInParty = runState.party.some((p) => p.definitionId === h.id);
        if (isInParty && failReward.exp > 0) {
          return { ...h, exp: h.exp + Math.floor(failReward.exp / runState.party.length) };
        }
        return h;
      }),
    }));

    setRunResult({
      cleared: false,
      stagesCleared: runState.currentStage - 1,
      rewards: failReward,
    });
    setRunState(null);
    setScreen('result');
  }, [runState, updateSave]);

  // Select a roguelite skill
  const handleSelectSkill = useCallback(
    (skill: RogueliteSkill) => {
      if (!runState) return;

      setRunState((prev) => {
        if (!prev) return prev;

        const newAcquiredSkills = [...prev.acquiredSkills, skill.id];

        // If skill is a stat boost, apply it to party
        const updatedParty = prev.party.map((u) => ({ ...u }));
        if (skill.effect.type === 'stat_boost') {
          applyRogueliteStatBoosts(updatedParty, [skill]);
        }

        const nextStage = prev.currentStage;

        // Check next stage type
        const nextStageDef = getStageDefinition(nextStage);

        setTimeout(() => {
          if (nextStageDef?.type === 'rest') {
            setScreen('rest_event');
          } else {
            // Auto-start next battle
            const enemies = createEnemyUnits(nextStageDef!);
            const partyClone = updatedParty.map((u) => ({ ...u, buffs: [...u.buffs] }));

            const acquiredSkillObjects = newAcquiredSkills
              .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
              .filter(Boolean) as RogueliteSkill[];

            applyBattleStartEffects(partyClone, acquiredSkillObjects);

            const newBattle = createBattleState(partyClone, enemies);
            setBattleState(newBattle);
            setBattleLogs([]);
            setIsBattling(true);
            setScreen('battle');
          }
        }, 300);

        return {
          ...prev,
          acquiredSkills: newAcquiredSkills,
          party: updatedParty,
        };
      });

      setSkillChoices([]);
    },
    [runState]
  );

  // Select rest event choice
  const selectRestChoice = useCallback(
    (choice: 'heal_30' | 'random_skill') => {
      if (!runState) return;

      setRunState((prev) => {
        if (!prev) return prev;
        const updatedParty = prev.party.map((u) => ({ ...u }));
        let newAcquiredSkills = [...prev.acquiredSkills];

        if (choice === 'heal_30') {
          updatedParty.forEach((u) => {
            if (u.isAlive) {
              u.hp = Math.min(u.maxHp, u.hp + Math.floor(u.maxHp * 0.3));
            }
          });
        } else if (choice === 'random_skill') {
          const choices = presentSkillChoices(prev.acquiredSkills, ROGUELITE_SKILLS);
          if (choices.length > 0) {
            const randomSkill = choices[Math.floor(Math.random() * choices.length)];
            newAcquiredSkills = [...newAcquiredSkills, randomSkill.id];
            if (randomSkill.effect.type === 'stat_boost') {
              applyRogueliteStatBoosts(updatedParty, [randomSkill]);
            }
          }
        }

        // Add rest stage rewards
        const stageReward = STAGE_REWARDS[prev.currentStage] || { gold: 0, soulStones: 0, exp: 0 };

        const nextStage = prev.currentStage + 1;

        // Move to next stage
        setTimeout(() => {
          const nextStageDef = getStageDefinition(nextStage);
          if (nextStageDef) {
            const enemies = createEnemyUnits(nextStageDef);
            const partyClone = updatedParty.map((u) => ({ ...u, buffs: [...u.buffs] }));

            const acquiredSkillObjects = newAcquiredSkills
              .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
              .filter(Boolean) as RogueliteSkill[];

            applyBattleStartEffects(partyClone, acquiredSkillObjects);

            const newBattle = createBattleState(partyClone, enemies);
            setBattleState(newBattle);
            setBattleLogs([]);
            setIsBattling(true);
            setScreen('battle');
          }
        }, 300);

        return {
          ...prev,
          currentStage: nextStage,
          party: updatedParty,
          acquiredSkills: newAcquiredSkills,
          rewards: {
            gold: prev.rewards.gold + stageReward.gold,
            soulStones: prev.rewards.soulStones + stageReward.soulStones,
            exp: prev.rewards.exp + stageReward.exp,
          },
        };
      });
    },
    [runState]
  );

  const toggleBattleSpeed = useCallback(() => {
    setBattleSpeed((prev) => (prev === '1x' ? '2x' : '1x'));
  }, []);

  const updateParty = useCallback(
    (frontLine: [string | null, string | null], backLine: [string | null, string | null]) => {
      updateSave((prev) => ({
        ...prev,
        party: { frontLine, backLine },
      }));
    },
    [updateSave]
  );

  const performGacha = useCallback(
    (type: 'single' | 'ten') => {
      // Dynamic import to avoid circular deps
      const { performSinglePull, performTenPull } = require('../lib/game/gacha');
      const saveCopy = JSON.parse(JSON.stringify(save)) as GameSaveData;
      let results;
      if (type === 'single') {
        const result = performSinglePull(saveCopy);
        results = result ? [result] : null;
      } else {
        results = performTenPull(saveCopy);
      }
      if (results) {
        setSave(saveCopy);
      }
      return results;
    },
    [save]
  );

  const returnToMain = useCallback(() => {
    setRunState(null);
    setBattleState(null);
    setIsBattling(false);
    setSkillChoices([]);
    setBattleLogs([]);
    setRunResult(null);
    setScreen('main');
  }, []);

  const resetSave = useCallback(() => {
    const fresh = resetGame();
    setSave(fresh);
    returnToMain();
  }, [returnToMain]);

  return {
    save,
    screen,
    runState,
    battleState,
    battleSpeed,
    skillChoices,
    battleLogs,
    isBattling,
    runResult,
    setScreen,
    startRun,
    startBattle,
    selectSkill: handleSelectSkill,
    selectRestChoice,
    toggleBattleSpeed,
    updateParty,
    performGacha,
    returnToMain,
    resetSave,
  };
}
