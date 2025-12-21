import React from 'react';
import type { Player } from '../../core/types/PlayerTypes';

export function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="player-card">
      <div className="player-name">{player.name}</div>
      <div className="player-rating">Rating: {player.rating}</div>
    </div>
  );
}
