import React from 'react';

import {BracketScreen} from '@/ui/screens/game/BracketScreen';
import {DuelScreen} from '@/ui/screens/game/DuelScreen';
import {GameEndScreen} from '@/ui/screens/game/GameEndScreen';
import {HostDashboardScreen} from '@/ui/screens/host/HostDashboardScreen';

import {useHostGame} from './HostGameContext';

interface Props {
  onQuit: () => void;
}

export function HostGameFlow({onQuit}: Props) {
  const {state} = useHostGame();

  switch (state.phase) {
    case 'duel':
      return <DuelScreen />;
    case 'tournament':
      return <BracketScreen />;
    case 'finished':
      return <GameEndScreen onQuit={onQuit} />;
    case 'idle':
    case 'lobby':
    default:
      return <HostDashboardScreen />;
  }
}
