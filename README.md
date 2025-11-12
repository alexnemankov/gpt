# Canine Conflux

Canine Conflux is a browser-based fantasy card game that pays homage to classics like Magic: The Gathering, but replaces wizards and planeswalkers with a pack of legendary dogs. Draw from a curated deck, manage your mana bones, and unleash canine abilities to overwhelm your opponent.

The project currently focuses on a richly themed single-player sandbox that demonstrates card interactions, lore presentation, and dynamic UI behaviors.

## Features

- **Lush, thematic interface** with aurora-soaked backgrounds and bespoke card frames for each elemental faction.
- **Interactive card zones** for hand, battlefield, discard pile, and deck statistics.
- **Lightweight rules engine** that tracks mana, turn flow, vitality, and a flavorful battle log.
- **Lore-first presentation** where every card showcases custom art sigils, traits, and evocative quotes.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd client
npm install
```

> **Note:** If you are developing in an offline or firewalled environment the install step may fail when attempting to reach the public npm registry. In that case, install the dependencies from a networked environment or configure an internal registry mirror.

### Running the game locally

```bash
npm start
```

This launches the React development server at [http://localhost:3000](http://localhost:3000).

### Building for production

```bash
npm run build
```

This bundles the client into static assets located in `client/build`.

## Project Structure

```
client/
  public/          # HTML template and static assets
  src/
    components/    # Reusable UI components and board logic
    data/          # Card definitions and deck curation
    App.js         # App shell that renders the game board
server/
  server.js        # Legacy API placeholder (not used for the card prototype)
```

The server directory is retained from the original project and can be removed if you do not need the previous API example.

## Roadmap Ideas

- Multiplayer matchmaking with WebSockets.
- Expanded deck-building tools and custom card editor.
- Animated attack resolutions and status effect trackers.
- Sound design pass featuring howls, growls, and spell effects.

Feel free to fork the project and shape the next legendary pack!
