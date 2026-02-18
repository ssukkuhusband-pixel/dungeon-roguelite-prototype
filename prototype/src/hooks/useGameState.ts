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
  executeTurn,
  calculateTurnOrder,
  applyRogueliteStatBoosts,
  applyBattleStartEffects,
  presentSkillChoices,
  TurnResult,
} from '../lib/game/battle-engine';
import { createEnemyUnits, getStageDefinition } from '../lib/game/enemy-factory';

export type BattleSpeed = '1x' | '2x';

// Animation state for battle visuals
export interface BattleAnimState {
  actingUnitId: string | null;
  hitUnitIds: string[];
  lastLog: BattleLogEntry | null;
}

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
  runResult: { cleared: boolean; stagesCleared: number; rewards: { gold: number; soulStones: number; exp: number }; acquiredSkills?: string[] } | null;
  battleAnim: BattleAnimState;

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
  const [battleAnim, setBattleAnim] = useState<BattleAnimState>({
    actingUnitId: null,
    hitUnitIds: [],
    lastLog: null,
  });
  const battleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const turnQueueRef = useRef<{ unitId: string; index: number }[]>([]);
  const roundRef = useRef(1);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (battleTimeoutRef.current) {
        clearTimeout(battleTimeoutRef.current);
      }
    };
  }, []);

  // ===== TURN-BY-TURN BATTLE SYSTEM =====
  const processNextTurn = useCallback((
    state: BattleState,
    acquiredSkillObjects: RogueliteSkill[],
    speed: BattleSpeed,
  ) => {
    // If battle is finished, stop
    if (state.isFinished) return;

    // If turn queue is empty, start a new round
    if (turnQueueRef.current.length === 0) {
      const allUnits = [...state.allies, ...state.enemies];
      const ordered = calculateTurnOrder(allUnits);
      state.turnOrder = ordered.map((u) => u.id);
      state.currentTurnIndex = 0;
      turnQueueRef.current = ordered.map((u, i) => ({ unitId: u.id, index: i }));
    }

    // Get next unit from queue
    const next = turnQueueRef.current.shift();
    if (!next) return;

    const allUnits = [...state.allies, ...state.enemies];
    const unit = allUnits.find((u) => u.id === next.unitId);
    if (!unit || !unit.isAlive) {
      // Skip dead units, process next immediately
      processNextTurn(state, acquiredSkillObjects, speed);
      return;
    }

    // Update currentTurnIndex
    state.currentTurnIndex = state.turnOrder.indexOf(unit.id);

    // Execute this single turn
    const result = executeTurn(unit, state, acquiredSkillObjects, state.round);

    if (!result) {
      // No result (shouldn't happen), move to next
      processNextTurn(state, acquiredSkillObjects, speed);
      return;
    }

    // Add log
    state.battleLog.push(result.log);

    // Collect target IDs for hit animation
    const hitIds = result.log.targets?.map((t) => t.id).filter(Boolean) || [];

    // Set animation state: acting unit + hit targets
    setBattleAnim({
      actingUnitId: unit.id,
      hitUnitIds: hitIds as string[],
      lastLog: result.log,
    });
    setBattleLogs((prev) => [...prev, result.log]);

    // Update battle state (triggers re-render with new HP, etc.)
    setBattleState({ ...state });

    // Check if team is wiped
    const alliesWiped = state.allies.every((u) => !u.isAlive);
    const enemiesWiped = state.enemies.every((u) => !u.isAlive);

    if (enemiesWiped) {
      state.isFinished = true;
      state.result = 'victory';
      setBattleState({ ...state });
      // Clear animation after a moment, then handle victory
      const delay = speed === '1x' ? 600 : 300;
      battleTimeoutRef.current = setTimeout(() => {
        setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
        setIsBattling(false);
        handleVictory(state);
      }, delay);
      return;
    }

    if (alliesWiped) {
      state.isFinished = true;
      state.result = 'defeat';
      setBattleState({ ...state });
      const delay = speed === '1x' ? 600 : 300;
      battleTimeoutRef.current = setTimeout(() => {
        setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
        setIsBattling(false);
        handleDefeat();
      }, delay);
      return;
    }

    // If turn queue is empty, increment round
    if (turnQueueRef.current.length === 0) {
      state.round++;
      if (state.round > BATTLE_CONFIG.maxRounds) {
        state.isFinished = true;
        state.result = 'defeat';
        setBattleState({ ...state });
        battleTimeoutRef.current = setTimeout(() => {
          setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
          setIsBattling(false);
          handleDefeat();
        }, 600);
        return;
      }
    }

    // Schedule next turn with delay
    const turnDelay = speed === '1x' ? 1000 : 500;
    battleTimeoutRef.current = setTimeout(() => {
      // Clear hit animation, keep acting unit briefly
      setBattleAnim((prev) => ({ ...prev, hitUnitIds: [] }));
      // Small extra delay then clear acting unit and process next
      battleTimeoutRef.current = setTimeout(() => {
        setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
        processNextTurn(state, acquiredSkillObjects, speed);
      }, speed === '1x' ? 200 : 100);
    }, turnDelay);
  }, []);

  // Start the turn-by-turn loop
  const startTurnLoop = useCallback((state: BattleState, acquiredSkillIds: string[], speed: BattleSpeed) => {
    turnQueueRef.current = [];
    roundRef.current = state.round;

    const acquiredSkillObjects = acquiredSkillIds
      .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
      .filter(Boolean) as RogueliteSkill[];

    // Small initial delay before first turn
    battleTimeoutRef.current = setTimeout(() => {
      processNextTurn(state, acquiredSkillObjects, speed);
    }, 500);
  }, [processNextTurn]);

  // Restart loop when speed changes
  useEffect(() => {
    if (!isBattling || !battleState || battleState.isFinished) return;
    // When speed changes mid-battle, the next scheduled timeout will use the old speed.
    // We don't interrupt - the new speed takes effect on the next turn naturally.
  }, [battleSpeed]);

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
    setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });

    // Check first stage type
    const stage = getStageDefinition(1);
    if (stage?.type === 'rest') {
      setScreen('rest_event');
    } else if (stage) {
      const enemies = createEnemyUnits(stage);
      const partyClone = partyUnits.map((u) => ({ ...u, buffs: [...u.buffs] }));
      const newBattle = createBattleState(partyClone, enemies);
      setBattleState(newBattle);
      setIsBattling(true);
      setScreen('battle');
      startTurnLoop(newBattle, [], battleSpeed);
    }
  }, [save, battleSpeed, startTurnLoop]);

  // Start battle for current stage
  const startBattle = useCallback(() => {
    if (!runState) return;

    const stageDef = getStageDefinition(runState.currentStage);
    if (!stageDef || stageDef.type === 'rest') return;

    const enemies = createEnemyUnits(stageDef);
    const partyClone = runState.party.map((u) => ({ ...u, buffs: [...u.buffs] }));

    const acquiredSkillObjects = runState.acquiredSkills
      .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
      .filter(Boolean) as RogueliteSkill[];

    applyBattleStartEffects(partyClone, acquiredSkillObjects);

    const newBattle = createBattleState(partyClone, enemies);
    setBattleState(newBattle);
    setBattleLogs([]);
    setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
    setIsBattling(true);
    setScreen('battle');
    startTurnLoop(newBattle, runState.acquiredSkills, battleSpeed);
  }, [runState, battleSpeed, startTurnLoop]);

  const handleVictory = useCallback(
    (finalBattle: BattleState) => {
      if (!runState) return;

      const currentStage = runState.currentStage;
      const stageReward = STAGE_REWARDS[currentStage] || { gold: 0, soulStones: 0, exp: 0 };

      const newRewards = {
        gold: runState.rewards.gold + stageReward.gold,
        soulStones: runState.rewards.soulStones + stageReward.soulStones,
        exp: runState.rewards.exp + stageReward.exp,
      };

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

      if (currentStage === 10) {
        const isFirstClear = !save.chapter1Cleared;
        const finalRewards = {
          gold: newRewards.gold + (isFirstClear ? CHAPTER_CLEAR_BONUS.gold : 0),
          soulStones: newRewards.soulStones + (isFirstClear ? CHAPTER_CLEAR_BONUS.soulStones : 0),
          exp: newRewards.exp,
        };

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
          acquiredSkills: runState.acquiredSkills,
        });
        setRunState(null);
        setScreen('result');
        return;
      }

      setRunState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStage: currentStage + 1,
          party: updatedParty,
          rewards: newRewards,
        };
      });

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
      acquiredSkills: runState.acquiredSkills,
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
        const updatedParty = prev.party.map((u) => ({ ...u }));
        if (skill.effect.type === 'stat_boost') {
          applyRogueliteStatBoosts(updatedParty, [skill]);
        }

        const nextStage = prev.currentStage;
        const nextStageDef = getStageDefinition(nextStage);

        setTimeout(() => {
          if (nextStageDef?.type === 'rest') {
            setScreen('rest_event');
          } else {
            const enemies = createEnemyUnits(nextStageDef!);
            const partyClone = updatedParty.map((u) => ({ ...u, buffs: [...u.buffs] }));

            const acquiredSkillObjects = newAcquiredSkills
              .map((id) => ROGUELITE_SKILLS.find((s) => s.id === id))
              .filter(Boolean) as RogueliteSkill[];

            applyBattleStartEffects(partyClone, acquiredSkillObjects);

            const newBattle = createBattleState(partyClone, enemies);
            setBattleState(newBattle);
            setBattleLogs([]);
            setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
            setIsBattling(true);
            setScreen('battle');
            startTurnLoop(newBattle, newAcquiredSkills, battleSpeed);
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
    [runState, battleSpeed, startTurnLoop]
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

        const stageReward = STAGE_REWARDS[prev.currentStage] || { gold: 0, soulStones: 0, exp: 0 };
        const nextStage = prev.currentStage + 1;

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
            setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
            setIsBattling(true);
            setScreen('battle');
            startTurnLoop(newBattle, newAcquiredSkills, battleSpeed);
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
    [runState, battleSpeed, startTurnLoop]
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
    if (battleTimeoutRef.current) {
      clearTimeout(battleTimeoutRef.current);
      battleTimeoutRef.current = null;
    }
    turnQueueRef.current = [];
    setRunState(null);
    setBattleState(null);
    setIsBattling(false);
    setSkillChoices([]);
    setBattleLogs([]);
    setRunResult(null);
    setBattleAnim({ actingUnitId: null, hitUnitIds: [], lastLog: null });
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
    battleAnim,
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
