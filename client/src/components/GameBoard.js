import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from './Card';
import CardDetails from './CardDetails';
import cards from '../data/cards';

const INITIAL_HAND_SIZE = 5;
const MAX_MANA = 12;

const buildDeck = () => {
  let counter = 0;
  const deck = [];
  cards.forEach((card) => {
    const copies = card.copies ?? 1;
    for (let index = 0; index < copies; index += 1) {
      counter += 1;
      deck.push({ ...card, instanceId: `${card.id}-${counter}` });
    }
  });
  return deck;
};

const shuffle = (list) => {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const GameBoard = () => {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [battlefield, setBattlefield] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [mana, setMana] = useState(3);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState([]);
  const [focusedCard, setFocusedCard] = useState(null);
  const [vitality, setVitality] = useState(20);

  const addLog = useCallback((entry) => {
    setLog((previous) => [entry, ...previous].slice(0, 12));
  }, []);

  const freshDeck = useMemo(() => shuffle(buildDeck()), []);

  useEffect(() => {
    const openingHand = freshDeck.slice(0, INITIAL_HAND_SIZE);
    setDeck(freshDeck.slice(INITIAL_HAND_SIZE));
    setHand(openingHand);
    setFocusedCard(openingHand[0] ?? null);
    addLog('You cut the deck and draw a fresh paw of five cards.');
    addLog('Welcome to Canine Conflux!');
  }, [freshDeck, addLog]);

  const drawCard = useCallback(
    (reason = 'Drew a card') => {
      setDeck((previousDeck) => {
        if (previousDeck.length === 0) {
          addLog('The pack is exhausted. No cards remain in your deck.');
          return previousDeck;
        }
        const [topCard, ...rest] = previousDeck;
        setHand((previousHand) => [...previousHand, topCard]);
        setFocusedCard(topCard);
        addLog(`${reason}: ${topCard.name}`);
        return rest;
      });
    },
    [addLog]
  );

  const handlePlayCard = useCallback(
    (instanceId) => {
      const card = hand.find((item) => item.instanceId === instanceId);
      if (!card) {
        return;
      }

      if (card.cost > mana) {
        addLog(`Not enough mana bones to play ${card.name}.`);
        return;
      }

      const updatedHand = hand.filter((item) => item.instanceId !== instanceId);
      setHand(updatedHand);
      setMana((prevMana) => Math.max(0, prevMana - card.cost));
      setFocusedCard(card);

      if (card.type.startsWith('Spell')) {
        setDiscard((prevDiscard) => [card, ...prevDiscard]);
        addLog(`You cast ${card.name}. Its magic surges then fades.`);
        if (card.id === 'howl-of-the-pack') {
          addLog('Allies gain +2/+0 for the turn — a devastating howl!');
        }
        if (card.id === 'runic-bone-charm') {
          addLog('The charm hums. Choose the boon that suits your strategy.');
        }
        return;
      }

      setBattlefield((prevField) => [...prevField, { ...card, summonedOnTurn: turn }]);
      addLog(`Summoned ${card.name} to the battlefield.`);

      if (card.id === 'aurora-wardens') {
        setVitality((prevVitality) => prevVitality + 1);
        addLog('Your pack feels protected under the wardens. Vitality +1.');
      }

      if (card.id === 'river-retriever' && discard.length > 0) {
        const [recovered, ...restDiscard] = discard;
        setDiscard(restDiscard);
        setHand((prevHand) => [...prevHand, recovered]);
        addLog(`${card.name} retrieves ${recovered.name} from the tide.`);
      }
    },
    [hand, mana, addLog, turn, discard]
  );

  const endTurn = useCallback(() => {
    const nextTurn = turn + 1;
    const refreshedMana = Math.min(MAX_MANA, 2 + nextTurn);
    setTurn(nextTurn);
    setMana(refreshedMana);
    addLog(`Turn ${nextTurn} begins. Mana refreshed to ${refreshedMana}.`);
    drawCard('Start of turn draw');
  }, [turn, addLog, drawCard]);

  return (
    <div className="game-board">
      <section className="board-status" aria-label="player status">
        <div>
          <span className="label">Turn</span>
          <span className="value">{turn}</span>
        </div>
        <div>
          <span className="label">Mana Bones</span>
          <span className="value">{mana}</span>
        </div>
        <div>
          <span className="label">Vitality</span>
          <span className="value">{vitality}</span>
        </div>
        <div>
          <span className="label">Deck</span>
          <span className="value">{deck.length}</span>
        </div>
        <div>
          <span className="label">Discard</span>
          <span className="value">{discard.length}</span>
        </div>
      </section>

      <section className="board-actions" aria-label="actions">
        <button type="button" onClick={() => drawCard('You draw eagerly')} disabled={deck.length === 0}>
          Draw Card
        </button>
        <button type="button" onClick={endTurn}>
          End Turn
        </button>
      </section>

      <section className="board-field" aria-label="battlefield">
        <div className="zone-header">
          <h2>Battlefield</h2>
          <p>Creatures you have summoned prowl here.</p>
        </div>
        <div className="card-row">
          {battlefield.length === 0 && <p className="zone-placeholder">No hounds have taken the field yet.</p>}
          {battlefield.map((card) => (
            <Card key={card.instanceId} card={card} zone="battlefield" onInspect={setFocusedCard} />
          ))}
        </div>
      </section>

      <section className="board-hand" aria-label="hand">
        <div className="zone-header">
          <h2>Your Hand</h2>
          <p>Cards outlined in gold can be played with your current mana.</p>
        </div>
        <div className="card-row">
          {hand.length === 0 && <p className="zone-placeholder">Your hand is empty. Draw to refill.</p>}
          {hand.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              zone="hand"
              onPlay={handlePlayCard}
              onInspect={setFocusedCard}
              isPlayable={card.cost <= mana}
            />
          ))}
        </div>
      </section>

      <aside className="board-details" aria-label="card details">
        <h2>Card Focus</h2>
        <CardDetails card={focusedCard} />
      </aside>

      <section className="board-log" aria-label="battle log">
        <h2>Battle Log</h2>
        <ul>
          {log.map((entry, index) => (
            <li key={entry + index}>{entry}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default GameBoard;
