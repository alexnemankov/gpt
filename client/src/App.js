import React from 'react';
import './App.css';
import GameBoard from './components/GameBoard';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Canine Conflux</h1>
        <p>
          Command a pack of legendary dogs, weave spells, and outwit your rival in this
          turn-based fantasy card duel.
        </p>
      </header>
      <main>
        <GameBoard />
      </main>
      <footer className="app-footer">
        <p>
          Inspired by trading card classics. Built for showcasing interactions and playful UI
          storytelling.
        </p>
      </footer>
    </div>
  );
}

export default App;
