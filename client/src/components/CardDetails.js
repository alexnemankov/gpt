import React from 'react';
import Card from './Card';

const CardDetails = ({ card }) => {
  if (!card) {
    return (
      <div className="details-empty">
        <p>Select a card to examine its lore.</p>
      </div>
    );
  }

  return (
    <div className="details-panel">
      <Card card={card} zone="preview" />
      <div className="details-text">
        <h3>{card.name}</h3>
        <p className="details-type">{card.type}</p>
        <p className="details-ability">{card.ability}</p>
        {card.flavor && <p className="details-flavor">{card.flavor}</p>}
      </div>
    </div>
  );
};

export default CardDetails;
