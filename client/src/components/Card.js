import React from 'react';
import './Card.css';

const Card = ({ card, onPlay, onInspect, isPlayable = false, zone }) => {
  if (!card) {
    return null;
  }

  const isHandZone = zone === 'hand';
  const isPreview = zone === 'preview';
  const isInteractive = !isPreview && ((isHandZone && (onPlay || onInspect)) || (!isHandZone && Boolean(onInspect)));

  const handleClick = () => {
    if (isHandZone && isPlayable && onPlay) {
      onPlay(card.instanceId);
    } else if (onInspect) {
      onInspect(card);
    }
  };

  return (
    <article
      className={`card ${card.faction || 'neutral'} ${isPlayable && isHandZone ? 'card-playable' : ''}`}
      onClick={isInteractive ? handleClick : undefined}
      onMouseEnter={isInteractive && onInspect ? () => onInspect(card) : undefined}
      role={isInteractive ? 'button' : 'group'}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={(event) => {
        if (!isInteractive) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      aria-pressed={isInteractive ? false : undefined}
    >
      <header className="card-header">
        <span className="card-cost" aria-label={`Cost ${card.cost}`}>
          {card.cost}
        </span>
        <h3 className="card-name">{card.name}</h3>
        <span className="card-sigil" aria-hidden="true">
          {card.sigil}
        </span>
      </header>
      <div className="card-art" aria-hidden="true">
        <div className="card-symbol">{card.sigil}</div>
      </div>
      <div className="card-body">
        <p className="card-type">{card.type}</p>
        {card.trait && <p className="card-trait">{card.trait}</p>}
        <p className="card-ability">{card.ability}</p>
        {typeof card.power === 'number' && typeof card.toughness === 'number' && (
          <p className="card-stats" aria-label={`${card.power} power ${card.toughness} toughness`}>
            {card.power}/{card.toughness}
          </p>
        )}
        {zone === 'hand' && (
          <p className="card-instruction">
            {isPlayable ? 'Click to play' : 'Need more mana'}
          </p>
        )}
      </div>
      <footer className="card-footer">
        <span className="card-rarity">{card.rarity}</span>
        {card.flavor && <q className="card-flavor">{card.flavor}</q>}
      </footer>
    </article>
  );
};

export default Card;
