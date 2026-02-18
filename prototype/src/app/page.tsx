'use client';

import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import MainScreen from '@/components/game/MainScreen';
import BattleScreen from '@/components/game/BattleScreen';
import SkillSelectScreen from '@/components/game/SkillSelectScreen';
import RestEventScreen from '@/components/game/RestEventScreen';
import HeroListScreen from '@/components/game/HeroListScreen';
import FormationScreen from '@/components/game/FormationScreen';
import GachaScreen from '@/components/game/GachaScreen';
import ResultScreen from '@/components/game/ResultScreen';
import { STAGES } from '@/lib/constants';

export default function Home() {
  const game = useGameState();

  const renderScreen = () => {
    switch (game.screen) {
      case 'main':
        return (
          <MainScreen
            save={game.save}
            onStartRun={game.startRun}
            onGoToHeroes={() => game.setScreen('heroes')}
            onGoToGacha={() => game.setScreen('gacha')}
            onGoToFormation={() => game.setScreen('formation')}
            onResetSave={game.resetSave}
          />
        );

      case 'battle': {
        const currentStageNum = game.runState?.currentStage || 1;
        const stageDef = STAGES.find(s => s.stageNumber === currentStageNum);
        return (
          <BattleScreen
            battleState={game.battleState}
            currentStage={currentStageNum}
            battleSpeed={game.battleSpeed}
            onToggleSpeed={game.toggleBattleSpeed}
            battleLogs={game.battleLogs}
            acquiredSkills={game.runState?.acquiredSkills || []}
            battleAnim={game.battleAnim}
            stageType={stageDef?.type as 'normal' | 'elite' | 'boss' | undefined}
          />
        );
      }

      case 'skill_select':
        return (
          <SkillSelectScreen
            choices={game.skillChoices}
            onSelect={game.selectSkill}
            currentStage={game.runState?.currentStage || 1}
          />
        );

      case 'rest_event':
        return (
          <RestEventScreen
            currentStage={game.runState?.currentStage || 1}
            party={game.runState?.party || []}
            onSelectChoice={game.selectRestChoice}
          />
        );

      case 'heroes':
        return (
          <HeroListScreen
            save={game.save}
            onBack={() => game.setScreen('main')}
          />
        );

      case 'formation':
        return (
          <FormationScreen
            save={game.save}
            onUpdateParty={game.updateParty}
            onBack={() => game.setScreen('main')}
          />
        );

      case 'gacha':
        return (
          <GachaScreen
            save={game.save}
            onPull={game.performGacha}
            onBack={() => game.setScreen('main')}
          />
        );

      case 'result':
        return game.runResult ? (
          <ResultScreen
            result={game.runResult}
            onReturn={game.returnToMain}
          />
        ) : (
          <MainScreen
            save={game.save}
            onStartRun={game.startRun}
            onGoToHeroes={() => game.setScreen('heroes')}
            onGoToGacha={() => game.setScreen('gacha')}
            onGoToFormation={() => game.setScreen('formation')}
            onResetSave={game.resetSave}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[100dvh] max-w-[844px] max-h-[390px] mx-auto overflow-hidden relative" style={{ backgroundColor: '#1A1A2E' }}>
      {renderScreen()}
    </div>
  );
}
