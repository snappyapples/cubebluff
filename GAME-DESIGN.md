# Cube Bluff - Complete Product Design

## Game Rules (Final)

### Dice Format
- 2 dice, rolled secretly
- Dice are arranged into a two-digit number, higher die first
- Example: 5 & 3 = 53
- Example: 4 & 4 = 44
- Example: 3 & 1 = 31

### Roll Ranking (Highest to Lowest)

| Rank | Roll | Type |
|------|------|------|
| 1 | 21 | Special (absolute highest) |
| 2 | 66 | Double |
| 3 | 55 | Double |
| 4 | 44 | Double |
| 5 | 33 | Double |
| 6 | 22 | Double |
| 7 | 11 | Double |
| 8 | 65 | Non-double |
| 9 | 64 | Non-double |
| 10 | 63 | Non-double |
| 11 | 62 | Non-double |
| 12 | 61 | Non-double |
| 13 | 54 | Non-double |
| 14 | 53 | Non-double |
| 15 | 52 | Non-double |
| 16 | 51 | Non-double |
| 17 | 43 | Non-double |
| 18 | 42 | Non-double |
| 19 | 41 | Non-double |
| 20 | 32 | Non-double |
| 21 | 31 | Non-double (absolute lowest) |

**Summary:** 21 > all doubles > all non-doubles (65 → 31)

### Gameplay Flow

1. Players start with **5 tokens**
2. A room host starts the game; others join
3. Each round proceeds turn-by-turn around the circle

**On a player's turn:**
- They roll secretly
- They see their number privately
- They must make a claim ≥ previous claim
- They may lie

**On the next player's turn, they choose:**
- Roll to beat the claim, OR
- Call Bluff

### Calling Bluff
- Reveal the claimer's number
- If the real roll is **lower** than claimed → claimer loses 1 token
- If the real roll is **equal/higher** → caller loses 1 token
- Start a new round

### Special Rule: Rolling 21

If a player actually rolls 21, they must choose:

**Option A: Double Stakes**
- Say "Twenty-one"
- Round becomes worth 2 tokens

**Option B: Pay & Pass**
- Say "Passing the twenty-one"
- They pay 1 token immediately
- They skip the round safely

### Elimination
- 0 tokens = out of the game
- Last remaining player wins

---

## 1. Mobile-First UX/UI Layout

### Screen Flow
```
Landing → Create Room → Lobby → Game → End Game
           ↓
        Join Room → Lobby → Game → End Game
```

### 1.1 Landing Screen
```
┌─────────────────────────────┐
│                             │
│         🎲 CUBE BLUFF       │
│                             │
│    ┌───────────────────┐    │
│    │   CREATE ROOM     │    │
│    └───────────────────┘    │
│                             │
│    ┌───────────────────┐    │
│    │    JOIN ROOM      │    │
│    └───────────────────┘    │
│                             │
│         How to Play →       │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Logo/title with dice animation
- Two primary CTA buttons (thumb-reachable at bottom)
- Optional "How to Play" link to rules modal

### 1.2 Create Room Screen
```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│      CREATE A ROOM          │
│                             │
│   Your Name                 │
│   ┌───────────────────┐     │
│   │ Justin            │     │
│   └───────────────────┘     │
│                             │
│   Starting Tokens           │
│   [3] [5] [7] [10]          │
│                             │
│    ┌───────────────────┐    │
│    │   CREATE ROOM     │    │
│    └───────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Name input (required)
- Token count selector (default: 5)
- Create button

### 1.3 Join Room Screen
```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│       JOIN A ROOM           │
│                             │
│   Your Name                 │
│   ┌───────────────────┐     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   Room Code                 │
│   ┌───────────────────┐     │
│   │ ABC123            │     │
│   └───────────────────┘     │
│                             │
│    ┌───────────────────┐    │
│    │    JOIN ROOM      │    │
│    └───────────────────┘    │
│                             │
└─────────────────────────────┘
```

### 1.4 Lobby Screen
```
┌─────────────────────────────┐
│  ROOM: ABC123    [📋 Copy]  │
├─────────────────────────────┤
│                             │
│   PLAYERS (3/8)             │
│                             │
│   👑 Justin      Ready      │
│      Sarah       Ready      │
│      Mark        Waiting    │
│                             │
│   Starting with 5 tokens    │
│                             │
├─────────────────────────────┤
│   [Share Link]              │
│                             │
│   ┌───────────────────┐     │
│   │   START GAME      │     │  ← Host only
│   └───────────────────┘     │
└─────────────────────────────┘
```

**Elements:**
- Room code with copy button
- Player list with ready status
- Host crown indicator
- Settings display
- Start button (host only, min 2 players)

### 1.5 In-Game Screen

```
┌─────────────────────────────┐
│  Round 3        Tokens: 4   │
├─────────────────────────────┤
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Justin│ │Sarah│ │Mark │   │
│  │  4   │ │  3  │ │  5  │   │
│  │ 🎯  │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘   │
│                             │
├─────────────────────────────┤
│                             │
│      LAST CLAIM: 55         │
│      by Sarah               │
│                             │
├─────────────────────────────┤
│                             │
│   YOUR ROLL (secret)        │
│     ┌───┐ ┌───┐             │
│     │ 4 │ │ 3 │  = 43       │
│     └───┘ └───┘             │
│                             │
├─────────────────────────────┤
│                             │
│  ┌───────────┐ ┌──────────┐ │
│  │ROLL TO    │ │  CALL    │ │
│  │BEAT 55    │ │  BLUFF   │ │
│  └───────────┘ └──────────┘ │
│                             │
└─────────────────────────────┘
```

**Alternative - It's Your Turn to Claim:**
```
├─────────────────────────────┤
│                             │
│   YOUR ROLL (secret)        │
│     ┌───┐ ┌───┐             │
│     │ 5 │ │ 3 │  = 53       │
│     └───┘ └───┘             │
│                             │
│   CLAIM (must be ≥ 43):     │
│   ┌─────────────────────┐   │
│   │    [Select Claim]   │   │
│   └─────────────────────┘   │
│                             │
│    ┌───────────────────┐    │
│    │   MAKE CLAIM      │    │
│    └───────────────────┘    │
│                             │
└─────────────────────────────┘
```

**21 Special Modal:**
```
┌─────────────────────────────┐
│                             │
│      🎲 YOU ROLLED 21! 🎲   │
│                             │
│   This is the highest roll! │
│   Choose your action:       │
│                             │
│  ┌───────────────────────┐  │
│  │  "TWENTY-ONE!"        │  │
│  │  Double stakes (2 tok) │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  "PASS THE 21"        │  │
│  │  Pay 1 token, skip    │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### 1.6 Resolution Animations

**Bluff Called - Reveal:**
```
┌─────────────────────────────┐
│                             │
│     BLUFF CALLED!           │
│                             │
│   Sarah claimed: 55         │
│                             │
│   Actual roll:              │
│     ┌───┐ ┌───┐             │
│     │ 4 │ │ 2 │  = 42       │
│     └───┘ └───┘             │
│                             │
│     ❌ SARAH LIED!          │
│     Sarah loses 1 token     │
│                             │
│    [Continue]               │
│                             │
└─────────────────────────────┘
```

### 1.7 End Game Screen
```
┌─────────────────────────────┐
│                             │
│      🏆 WINNER! 🏆          │
│                             │
│         JUSTIN              │
│                             │
│   Final Standings:          │
│   1. Justin - 6 tokens      │
│   2. Mark - eliminated R7   │
│   3. Sarah - eliminated R5  │
│                             │
│    ┌───────────────────┐    │
│    │   PLAY AGAIN      │    │
│    └───────────────────┘    │
│                             │
│    ┌───────────────────┐    │
│    │   NEW ROOM        │    │
│    └───────────────────┘    │
│                             │
└─────────────────────────────┘
```

---

## 2. Turn State Machine

### 2.1 Game States

```
LOBBY → PLAYING → FINISHED
           ↓
    ┌──────────────────────────────────────────┐
    │              ROUND LOOP                  │
    │                                          │
    │  ROUND_START                             │
    │       ↓                                  │
    │  AWAITING_ROLL (first player)            │
    │       ↓                                  │
    │  ROLLED_AWAITING_CLAIM                   │
    │       ↓                                  │
    │  CLAIM_MADE → next player                │
    │       ↓                                  │
    │  AWAITING_RESPONSE (roll or bluff?)      │
    │       ↓                                  │
    │  ┌─────────┴─────────┐                   │
    │  ↓                   ↓                   │
    │  ROLLING_TO_BEAT   BLUFF_CALLED          │
    │  ↓                   ↓                   │
    │  ROLLED_AWAITING    RESOLVING_BLUFF      │
    │  _CLAIM             ↓                    │
    │  ↓                  ROUND_END            │
    │  (loop)                                  │
    │                                          │
    └──────────────────────────────────────────┘
```

### 2.2 State Definitions

```typescript
type GamePhase =
  | 'lobby'
  | 'round_start'
  | 'awaiting_roll'           // Player must roll
  | 'awaiting_21_choice'      // Player rolled 21, must choose
  | 'awaiting_claim'          // Player has rolled, must claim
  | 'awaiting_response'       // Next player must roll-to-beat or call bluff
  | 'resolving_bluff'         // Showing bluff resolution
  | 'round_end'               // Brief pause before next round
  | 'player_eliminated'       // Showing elimination
  | 'finished'                // Game over
```

### 2.3 Events

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ hostName, tokenCount }` | Host creates room |
| `join_room` | `{ roomCode, playerName }` | Player joins |
| `player_joined` | `{ player }` | Broadcast new player |
| `start_game` | `{}` | Host starts game |
| `game_started` | `{ players, firstPlayer }` | Game begins |
| `roll` | `{}` | Player requests roll |
| `roll_result` | `{ roll, playerId }` | Private to roller |
| `choice_21` | `{ choice: 'double' \| 'pass' }` | 21 decision |
| `claim` | `{ claimedRoll }` | Player makes claim |
| `claim_made` | `{ playerId, claim }` | Broadcast claim |
| `call_bluff` | `{}` | Player calls bluff |
| `roll_to_beat` | `{}` | Player rolls to beat |
| `bluff_resolved` | `{ actualRoll, claim, loser }` | Reveal result |
| `token_lost` | `{ playerId, newCount }` | Token update |
| `player_eliminated` | `{ playerId }` | Player out |
| `round_end` | `{ nextStarter }` | Round complete |
| `game_over` | `{ winner, standings }` | Game finished |

### 2.4 Turn Flow Diagram

```
Round Start
    │
    ▼
┌─────────────────────────────────────┐
│ Player A: AWAITING_ROLL             │
│   └─→ rolls secretly                │
│   └─→ if 21: AWAITING_21_CHOICE     │
│   └─→ else: AWAITING_CLAIM          │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Player A: AWAITING_CLAIM            │
│   └─→ selects claim (≥ minimum)     │
│   └─→ broadcasts claim              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Player B: AWAITING_RESPONSE         │
│   └─→ Option 1: ROLL_TO_BEAT        │
│       └─→ rolls secretly            │
│       └─→ AWAITING_CLAIM            │
│       └─→ (loop continues)          │
│                                     │
│   └─→ Option 2: CALL_BLUFF          │
│       └─→ RESOLVING_BLUFF           │
│       └─→ reveal A's actual roll    │
│       └─→ determine loser           │
│       └─→ ROUND_END                 │
└─────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Component Tree

```
<App>
├── <LandingPage />
├── <CreateRoomPage />
├── <JoinRoomPage />
├── <LobbyPage />
│   ├── <RoomHeader />
│   ├── <PlayerList />
│   └── <LobbyActions />
├── <GamePage />
│   ├── <GameHeader />
│   ├── <PlayerStrip />
│   ├── <ClaimDisplay />
│   ├── <PrivateRollView />
│   ├── <ActionPanel />
│   │   ├── <RollButton />
│   │   ├── <ClaimSelector />
│   │   ├── <RollToBeatButton />
│   │   ├── <CallBluffButton />
│   │   └── <TwentyOneModal />
│   └── <ResolutionOverlay />
└── <EndGamePage />
    ├── <WinnerDisplay />
    ├── <Standings />
    └── <PlayAgainActions />
```

### 3.2 Component Specifications

#### `<PlayerStrip />`
```typescript
interface PlayerStripProps {
  players: Player[]
  currentTurnId: string
  myPlayerId: string
}

// Horizontal scrollable strip showing all players
// Highlights current turn player
// Shows token count as chips/dots
// Shows "YOU" indicator for local player
```

#### `<ClaimDisplay />`
```typescript
interface ClaimDisplayProps {
  currentClaim: Roll | null
  claimerName: string
  isDoubleStakes: boolean
}

// Large centered display of current claim
// Shows "55 by Sarah" format
// Pulses/glows if double stakes
```

#### `<PrivateRollView />`
```typescript
interface PrivateRollViewProps {
  roll: Roll | null
  isRevealed: boolean
}

// Shows dice with 3D animation
// Displays combined number (e.g., "= 43")
// Hidden to other players
```

#### `<ActionPanel />`
```typescript
interface ActionPanelProps {
  phase: GamePhase
  minimumClaim: Roll
  canRoll: boolean
  canClaim: boolean
  canCallBluff: boolean
  canRollToBeat: boolean
  onRoll: () => void
  onClaim: (claim: Roll) => void
  onCallBluff: () => void
  onRollToBeat: () => void
}

// Context-aware action buttons
// Only shows relevant actions for current phase
// Disabled states for invalid actions
```

#### `<ClaimSelector />`
```typescript
interface ClaimSelectorProps {
  minimumClaim: Roll
  onSelect: (claim: Roll) => void
}

// Scrollable list of valid claims
// Shows all rolls >= minimum
// Highlights special rolls (21, doubles)
// Tap to select, then confirm
```

#### `<TwentyOneModal />`
```typescript
interface TwentyOneModalProps {
  isOpen: boolean
  onDoubleStakes: () => void
  onPassTwentyOne: () => void
}

// Full-screen modal for 21 decision
// Two large buttons
// Cannot dismiss without choosing
```

#### `<ResolutionOverlay />`
```typescript
interface ResolutionOverlayProps {
  type: 'bluff_reveal' | 'token_lost' | 'eliminated' | 'round_end'
  data: ResolutionData
  onContinue: () => void
}

// Animated overlay for game events
// Shows dice reveal animation
// Dramatic token loss animation
// Auto-continues after delay or tap
```

### 3.3 Data Flow

```
Server (authoritative)
    │
    ├─── WebSocket Events ───┐
    │                        │
    ▼                        ▼
useGameState() Hook    usePlayers() Hook
    │                        │
    └────────┬───────────────┘
             │
             ▼
      <GamePage />
             │
    ┌────────┼────────┬──────────┐
    │        │        │          │
    ▼        ▼        ▼          ▼
<Header> <Strip> <Actions> <Overlays>
```

---

## 4. Technology Stack

### 4.1 Frontend

**Framework: Next.js 15+ with React 19**

Reasons:
- Server-side rendering for fast initial load
- App Router for clean routing
- TypeScript support out of the box
- Easy Vercel deployment
- React 19 for latest features

**Styling: Tailwind CSS**

Reasons:
- Rapid mobile-first development
- Consistent design tokens
- Small bundle size
- Easy dark mode support

**State Management: React hooks + Context**

- `useGameState()` - WebSocket connection and game state
- `useSound()` - Sound effects
- Local state for UI interactions

### 4.2 Backend Options

**Option A: Supabase (Recommended for simplicity)**

```
Supabase Realtime (WebSocket)
    + PostgreSQL (room/player state)
    + Edge Functions (game logic)
```

Pros:
- Built-in realtime subscriptions
- Managed PostgreSQL
- Easy auth if needed later
- Generous free tier

**Option B: Custom Node.js + Socket.IO**

```
Node.js Server
    + Socket.IO (WebSocket)
    + Redis (room state)
```

Pros:
- Full control over logic
- Lower latency
- More flexible

### 4.3 Mobile Considerations

```css
/* Touch-friendly targets */
.action-button {
  min-height: 48px;
  min-width: 48px;
}

/* Safe area handling */
.bottom-panel {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Prevent zoom on input focus */
input {
  font-size: 16px;
}

/* Disable pull-to-refresh during game */
body.in-game {
  overscroll-behavior: none;
}
```

---

## 5. Data Models

### 5.1 Core Types

```typescript
// Roll representation
interface Roll {
  die1: number        // 1-6
  die2: number        // 1-6
  display: string     // "53", "21", etc.
  rank: number        // 1-21 (1 = highest)
}

// Player
interface Player {
  id: string
  name: string
  tokens: number
  isHost: boolean
  isConnected: boolean
  isEliminated: boolean
  eliminatedRound?: number
}

// Room
interface Room {
  code: string        // 6-char code
  hostId: string
  players: Player[]
  settings: {
    startingTokens: number  // 3, 5, 7, or 10
  }
  gameState: GameState | null
  createdAt: Date
}

// Game State
interface GameState {
  phase: GamePhase
  round: number
  currentTurnPlayerId: string
  turnOrder: string[]           // Player IDs in order

  // Current round state
  currentRoll: Roll | null      // Actual roll (server only sends to roller)
  currentClaim: Roll | null     // Claimed roll (public)
  previousClaimerId: string | null
  minimumClaim: Roll | null     // Next claim must be >= this

  // Special states
  isDoubleStakes: boolean       // 21 was called
  pendingTwentyOneChoice: boolean

  // Resolution
  lastResolution: Resolution | null
}

// Resolution (for animations)
interface Resolution {
  type: 'bluff_success' | 'bluff_fail' | 'pass_21'
  actualRoll: Roll
  claim: Roll
  loserId: string
  tokensLost: number
}
```

### 5.2 WebSocket Events Schema

```typescript
// Client → Server
interface ClientEvents {
  create_room: {
    playerName: string
    startingTokens: number
  }

  join_room: {
    roomCode: string
    playerName: string
  }

  start_game: {}

  roll: {}

  choice_21: {
    choice: 'double_stakes' | 'pass'
  }

  claim: {
    claimedRoll: Roll
  }

  roll_to_beat: {}

  call_bluff: {}

  reconnect: {
    roomCode: string
    playerId: string
  }
}

// Server → Client
interface ServerEvents {
  room_created: {
    roomCode: string
    playerId: string
  }

  room_joined: {
    room: Room
    playerId: string
  }

  player_joined: {
    player: Player
  }

  player_left: {
    playerId: string
  }

  game_started: {
    gameState: GameState
  }

  roll_result: {
    roll: Roll              // Only sent to roller
  }

  awaiting_21_choice: {
    playerId: string
  }

  claim_made: {
    playerId: string
    claim: Roll
    nextPlayerId: string
  }

  bluff_called: {
    callerId: string
    targetId: string
  }

  resolution: {
    resolution: Resolution
    updatedPlayers: Player[]
    nextState: GameState
  }

  player_eliminated: {
    playerId: string
    finalRound: number
  }

  game_over: {
    winnerId: string
    standings: Array<{
      playerId: string
      place: number
      eliminatedRound?: number
    }>
  }

  error: {
    code: string
    message: string
  }
}
```

### 5.3 Database Schema (Supabase)

```sql
-- Rooms table
CREATE TABLE rooms (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{"startingTokens": 5}',
  game_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  room_code TEXT REFERENCES rooms(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 5,
  is_host BOOLEAN DEFAULT FALSE,
  is_eliminated BOOLEAN DEFAULT FALSE,
  eliminated_round INTEGER,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for room lookups
CREATE INDEX idx_players_room ON players(room_code);
```

---

## 6. Cheating Prevention

### 6.1 Server-Authoritative Rolls

```typescript
// ❌ WRONG - Client sends roll
socket.emit('roll', { die1: 6, die2: 5 })  // Client could lie!

// ✅ CORRECT - Server generates roll
socket.emit('roll', {})  // Just request
// Server generates and stores roll
// Server sends result only to roller
```

### 6.2 Implementation

```typescript
// Server-side roll handler
function handleRoll(socket: Socket, room: Room) {
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1
  const roll = createRoll(die1, die2)

  // Store in server state (other players can't see)
  room.gameState.currentRoll = roll

  // Send ONLY to the roller
  socket.emit('roll_result', { roll })

  // Tell others someone rolled (but not the value)
  socket.to(room.code).emit('player_rolled', {
    playerId: socket.data.playerId
  })
}
```

### 6.3 Hidden Information

| Data | Who Can See |
|------|-------------|
| Actual roll | Only the roller (until bluff reveal) |
| Claimed roll | Everyone |
| Token counts | Everyone |
| Turn order | Everyone |

### 6.4 Disconnect Handling

```typescript
// On disconnect
function handleDisconnect(socket: Socket) {
  const player = getPlayer(socket)
  player.isConnected = false

  // Start reconnect timeout (30 seconds)
  setTimeout(() => {
    if (!player.isConnected) {
      // Auto-fold: treat as if they called bluff and lost
      if (isTheirTurn(player)) {
        autoForfeitTurn(player)
      }
    }
  }, 30000)
}

// On reconnect
function handleReconnect(socket: Socket, data: { roomCode, playerId }) {
  const player = findPlayer(data.playerId)
  if (player && !player.isEliminated) {
    player.isConnected = true
    socket.join(data.roomCode)
    socket.emit('reconnected', {
      room: getRoom(data.roomCode),
      yourRoll: getCurrentRollIfYours(player)
    })
  }
}
```

---

## 7. Sample Interface Mockups

### 7.1 Lobby (Waiting for Players)

```
┌───────────────────────────────────────┐
│  🎲 CUBE BLUFF         Room: XK7M2P   │
├───────────────────────────────────────┤
│                                       │
│  PLAYERS (3/8)                        │
│  ─────────────────────────────────    │
│  👑 Justin          ●●●●● (5)         │
│     Sarah           ●●●●● (5)         │
│     Mark            ●●●●● (5)         │
│                                       │
│  Waiting for players...               │
│                                       │
├───────────────────────────────────────┤
│  [📋 Copy Code]   [🔗 Share Link]     │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │         START GAME              │  │
│  │         (min 2 players)         │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 7.2 Your Turn to Roll

```
┌───────────────────────────────────────┐
│  Round 4              Your tokens: 4  │
├───────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│ │ You │ │Sarah│ │Mark │ │Alex │      │
│ │ ●●●●│ │ ●●● │ │●●●●●│ │ ●●  │      │
│ │ 🎯  │ │     │ │     │ │     │      │
│ └─────┘ └─────┘ └─────┘ └─────┘      │
├───────────────────────────────────────┤
│                                       │
│           LAST CLAIM                  │
│              54                       │
│           by Sarah                    │
│                                       │
├───────────────────────────────────────┤
│                                       │
│         Your move...                  │
│                                       │
│  ┌───────────────┐ ┌───────────────┐  │
│  │  ROLL TO      │ │     CALL      │  │
│  │  BEAT 54      │ │     BLUFF     │  │
│  └───────────────┘ └───────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

### 7.3 Making a Claim

```
┌───────────────────────────────────────┐
│  Round 4              Your tokens: 4  │
├───────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│ │ You │ │Sarah│ │Mark │ │Alex │      │
│ │ ●●●●│ │ ●●● │ │●●●●●│ │ ●●  │      │
│ │ 🎯  │ │     │ │     │ │     │      │
│ └─────┘ └─────┘ └─────┘ └─────┘      │
├───────────────────────────────────────┤
│                                       │
│   YOUR ROLL (secret)                  │
│      ┌───┐ ┌───┐                      │
│      │ 5 │ │ 2 │   = 52               │
│      └───┘ └───┘                      │
│                                       │
├───────────────────────────────────────┤
│   SELECT CLAIM (must beat 54):        │
│  ┌─────────────────────────────────┐  │
│  │  55  61  62  63  64  65         │  │
│  │  11  22  33  44  55  66    21   │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │         CLAIM  [62]             │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 7.4 Bluff Resolution

```
┌───────────────────────────────────────┐
│                                       │
│         🚨 BLUFF CALLED! 🚨           │
│                                       │
│         Mark called Sarah's bluff     │
│                                       │
│         Sarah claimed: 62             │
│                                       │
│         Revealing...                  │
│                                       │
│            ┌───┐ ┌───┐                │
│            │ 5 │ │ 2 │                │
│            └───┘ └───┘                │
│                                       │
│           Actual: 52                  │
│                                       │
│      ❌ SARAH WAS BLUFFING! ❌        │
│                                       │
│      Sarah loses 1 token              │
│      ●●●● → ●●●                       │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │           CONTINUE              │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 7.5 Twenty-One Choice

```
┌───────────────────────────────────────┐
│                                       │
│      ✨ YOU ROLLED TWENTY-ONE! ✨     │
│                                       │
│            ┌───┐ ┌───┐                │
│            │ 2 │ │ 1 │                │
│            └───┘ └───┘                │
│                                       │
│    The highest possible roll!         │
│                                       │
│    Choose your action:                │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │      "TWENTY-ONE!"              │  │
│  │                                 │  │
│  │   Round becomes DOUBLE STAKES   │  │
│  │   (2 tokens at risk)            │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │    "PASSING THE TWENTY-ONE"     │  │
│  │                                 │  │
│  │   Pay 1 token now               │  │
│  │   Skip this round safely        │  │
│  └─────────────────────────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

---

## 8. Optional Enhancements

### 8.1 Turn Timer
```typescript
// 30 second turn timer
// Visual countdown in UI
// Auto-action on timeout:
//   - If must roll: auto-roll
//   - If must claim: claim actual roll
//   - If responding: auto roll-to-beat
```

### 8.2 Reactions
```typescript
const reactions = ['😂', '😱', '🔥', '👀', '🤔', '👏']
// Floating reactions visible to all
// Rate limited to prevent spam
```

### 8.3 Sound Effects
```typescript
const sounds = {
  roll: 'dice-shake.mp3',
  claim: 'chip-slide.mp3',
  bluffCall: 'dramatic-sting.mp3',
  bluffSuccess: 'success.mp3',
  bluffFail: 'fail.mp3',
  twentyOne: 'jackpot.mp3',
  elimination: 'sad-trombone.mp3',
  victory: 'victory.mp3'
}
```

### 8.4 Shake to Roll
```typescript
// Use DeviceMotion API
window.addEventListener('devicemotion', (e) => {
  if (canRoll && detectShake(e.acceleration)) {
    triggerRoll()
  }
})
```

### 8.5 Statistics Tracking
```typescript
interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  bluffsCalled: number
  bluffsSuccessful: number
  timesCaughtBluffing: number
  twentyOnesRolled: number
}
```

### 8.6 Room Settings
- Private rooms (require code)
- Spectator mode
- Custom token counts
- Turn time limit toggle

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Landing, Create, Join pages
- [ ] Lobby with player list
- [ ] Basic game flow (roll, claim, bluff)
- [ ] Simple UI without animations
- [ ] Supabase integration

### Phase 2: Polish (Week 3)
- [ ] 3D dice animations
- [ ] Resolution overlays
- [ ] Sound effects
- [ ] Responsive design fixes

### Phase 3: Enhancements (Week 4)
- [ ] Turn timer
- [ ] Reactions
- [ ] Statistics
- [ ] Play again flow

### Phase 4: Launch
- [ ] Testing with real users
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Vercel deployment
