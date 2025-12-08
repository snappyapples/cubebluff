# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cube Bluff is an online multiplayer bluffing dice game built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. Players roll dice secretly, make claims about their rolls, and try to catch each other bluffing.

**Tech Stack:**
- Next.js 16.0.7 (App Router with Turbopack)
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 3.4.18
- Supabase (PostgreSQL for persistence)
- Vercel (deployment)

## Development Commands

```bash
npm run dev      # Start development server (Turbopack, port 3005)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linting
```

**Clearing Turbopack Cache:** `rm -rf .next && npm run dev`

**Note:** This project shares a Supabase database with Bank It but uses a separate table (`cb_rooms`).

## Architecture

### Game State Management

Server-authoritative state management with polling-based synchronization. All dice rolls are generated server-side to prevent cheating. Game logic operates on a single `GameState` object stored in Supabase.

```
User Action → API Route → Server Game Logic → New State → Supabase → Poll (2s) → React Re-render
```

**Core Functions** (`lib/gameLogic.ts`):
- `initGame()` - Initialize game with players and turn order
- `generateRoll()` - Server generates random dice (anti-cheat)
- `applyRoll()` - Apply roll to state, handle 21 detection
- `makeClaim()` - Process player claim (preserves currentRoll for bluff reveal)
- `callBluff()` - Reveal actual roll, determine loser, deduct tokens
- `handleTwentyOneChoice()` - Process double stakes or pass choice
- `startNewRound()` - Reset round state, advance to next player
- `checkAutoTransitions()` - Handle timed phase transitions

**Game Store** (`lib/gameStore.ts`):
- `createRoom()` - Create room with fun word code (e.g., "BANANA"), initialize host
- `joinRoom()` - Add player (checks duplicate names, max 8 players)
- `getRoom()` - Fetch room state and player mapping
- `startGame()` - Initialize game (host only, min 2 players)
- `updateGameState()` - Save state to Supabase
- `restartRoom()` - Reset to lobby with new host

### Game Rules

**Dice Format:**
- 2 dice rolled secretly
- Arranged into two-digit number (higher die first)
- Example: 5 & 3 = 53

**Roll Ranking (Highest to Lowest):**
1. 21 (rank 1 - absolute highest, special)
2. 66, 55, 44, 33, 22, 11 (ranks 2-7 - doubles)
3. 65, 64, 63, 62, 61, 54, 53, 52, 51, 43, 42, 41, 32, 31 (ranks 8-21 - non-doubles)

**Turn Flow:**
1. Player rolls secretly (server generates)
2. Player claims a value ≥ previous claim (can lie)
3. Next player: roll-to-beat OR call bluff
4. If bluff called: reveal, loser loses token(s)
5. Round ends, next round starts

**Special 21 Rule:**
- When a player CLAIMS 21 (whether true or bluff), the next player must choose:
  - "Accept Challenge" = double stakes (2 tokens at risk), then respond normally
  - "Pass" = pay 1 token, fresh round starts with the next player

### Multiplayer Architecture

**Database** (`lib/supabase.ts`, `lib/gameStore.ts`):
- Supabase PostgreSQL stores room/player state in `cb_rooms` table
- Server-side dice rolls stored in `currentRoll` field
- Player mapping: `_players` field maps localStorage `playerId` to game player ID
- Players assigned IDs like `player-0`, `player-1`, etc.

**API Routes** (`app/api/rooms/`):
- `POST /api/rooms` - Create room
- `POST /api/rooms/[roomId]/join` - Join room
- `GET /api/rooms/[roomId]` - Get state (handles auto-transitions)
- `POST /api/rooms/[roomId]/start` - Start game (host only)
- `POST /api/rooms/[roomId]/roll` - Request roll (server generates)
- `POST /api/rooms/[roomId]/claim` - Make claim
- `POST /api/rooms/[roomId]/bluff` - Call bluff (uses `gameState.currentRoll`)
- `POST /api/rooms/[roomId]/roll-to-beat` - Roll to beat claim
- `POST /api/rooms/[roomId]/twenty-one` - Handle 21 choice
- `POST /api/rooms/[roomId]/vote` - Submit bluff/truth vote (crowd feature)
- `POST /api/rooms/[roomId]/restart` - Restart game in same room

**Client Synchronization** (`app/room/[roomId]/page.tsx`):
- Polls every 2 seconds (`POLL_INTERVAL = 2000`)
- Player identity stored in localStorage (`playerId`, `nickname`)
- Private roll data sent only to roller via direct API response
- `myGamePlayerId` tracks the game player ID for current user
- `needsToJoin` state determined by matching nickname in player list

### Game Phases

```typescript
type GamePhase =
  | 'lobby'              // Waiting for players
  | 'round_start'        // Brief pause before round (2s)
  | 'awaiting_roll'      // Player must roll
  | 'awaiting_21_choice' // Player rolled 21, must choose
  | 'awaiting_claim'     // Player has rolled, must claim
  | 'awaiting_response'  // Next player must roll-to-beat or call bluff
  | 'resolving_bluff'    // Showing bluff resolution (4s)
  | 'player_eliminated'  // Showing elimination (3s)
  | 'finished'           // Game over
```

**Auto-Transition Delays** (`lib/gameLogic.ts`):
- `RESOLUTION_DELAY = 6000` - Show bluff result
- `ROUND_END_DELAY = 2000` - Pause between rounds
- `ELIMINATION_DELAY = 3000` - Show elimination message

### 3D Dice Animation

`ThreeDDice` component (`components/ThreeDDice.tsx`):
- CSS 3D transforms with `perspective`, `transform-style: preserve-3d`
- Animation duration: 2.5 seconds using Web Animations API
- **Important:** Uses inline `React.CSSProperties` styles (not styled-jsx, which doesn't work in Next.js 15+)
- Dice pips rendered via CSS grid with dot elements
- For private rolls: show to roller only via `PrivateRollView`
- For reveals: show in `BluffResolution` modal

**Critical Animation Stability Pattern:**

The dice animation requires two key fixes to prevent mid-roll restarts (where dice would roll, slow down, restart rolling, then snap to the final value):

1. **Block Polling During Animation** (`page.tsx`):
   ```typescript
   // Use a ref (not state) to track animation status
   const isRollingRef = useRef(false)

   // Skip polling updates while dice are animating
   const fetchState = useCallback(async () => {
     if (isRollingRef.current) return  // Block polling during roll
     // ... fetch logic
   }, [roomId])

   // In handleRoll/handleRollToBeat:
   isRollingRef.current = true   // Block polling before animation
   setIsRolling(true)
   // ... set up animation
   setTimeout(() => {
     isRollingRef.current = false  // Resume polling after animation
     setIsRolling(false)
     // ... update game state
   }, ROLL_DURATION + 100)
   ```

   **Why:** Polling every 2 seconds can update `gameState` mid-animation. If state changes cause a re-render while the dice are rolling, the animation restarts.

2. **Use Inline JSX Instead of Nested Function Components** (`ActionPanel.tsx`):
   ```typescript
   // BAD - causes remounting on every render:
   const DiceDisplay = () => (
     <ThreeDDice value={myRoll?.die1 || 1} isRolling={isRolling} />
   )
   return <div>{showDice && <DiceDisplay />}</div>

   // GOOD - stable in React tree:
   const diceDisplayJSX = (
     <ThreeDDice value={myRoll?.die1 || 1} isRolling={isRolling} />
   )
   return <div>{showDice && diceDisplayJSX}</div>
   ```

   **Why:** When you define a component function inside another component, React sees a NEW function reference on every render. React compares component types by reference equality, so it thinks `DiceDisplay` is a different component each time and unmounts/remounts it - killing any in-progress animation.

3. **Target Value Ref Pattern** (`ThreeDDice.tsx`):
   ```typescript
   // Store target value in a ref so animation can access latest value
   const targetValueRef = useRef(value)
   targetValueRef.current = value

   useEffect(() => {
     if (isRolling) {
       // Use targetValueRef.current instead of value
       const finalRotation = getRotation(targetValueRef.current)
       // ... animation code
     }
   }, [isRolling, delay, duration])  // NO 'value' in dependencies!
   ```

   **Why:** If `value` is in dependencies, the useEffect restarts whenever the value changes - killing the animation. By using a ref, the animation accesses the latest value without triggering a restart.

4. **Roll ID Key Pattern** (`page.tsx` + `ActionPanel.tsx`):
   ```typescript
   // In page.tsx - increment rollId on each roll
   const [rollId, setRollId] = useState(0)

   // In handleRoll/handleRollToBeat:
   setRollId(prev => prev + 1)  // Force dice remount
   setIsRolling(true)

   // In ActionPanel.tsx - use rollId as key
   <ThreeDDice key={`die1-${rollId}`} value={myRoll?.die1 || 1} isRolling={isRolling} />
   ```

   **Why:** If `isRolling` is somehow already `true` when a new roll starts (e.g., fast clicking, state not resetting), the animation won't trigger because `isRolling` didn't change. Using a unique `rollId` as the component key forces React to remount the dice, guaranteeing the animation plays.

### Type System (`lib/types.ts`)

```typescript
interface Roll {
  die1: number
  die2: number
  display: string      // "53", "21", etc.
  rank: number         // 1-21 (1 = highest)
}

interface Resolution {
  type: 'bluff_success' | 'bluff_fail' | 'pass_21'
  actualRoll: Roll
  claim: Roll
  claimerId: string    // Who made the claim that was challenged
  callerId?: string    // Who called the bluff (undefined for pass_21)
  loserId: string
  tokensLost: number
}
```

### Styling

**Custom Colors** (`tailwind.config.js`):
- `brand-blue` (#3b82f6) - Primary color
- `bluff-red` (#dc2626) - Bluff calls, failures
- `truth-green` (#16a34a) - Successful defenses
- `token-gold` (#fbbf24) - Token display
- `game-bg`, `panel-bg`, `card-bg` - Panel backgrounds

**Custom Animations**:
- `fade-in-up` - Floating effect text
- `slide-in` / `slide-out` - Modal transitions
- `shake` - Alert animation
- `bounce-in` - Entry animation
- `token-fall` - Token loss animation

## Environment Setup

Requires `.env.local` with Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel Deployment:** These same environment variables must be configured in Vercel project settings (Settings → Environment Variables) since `.env.local` is gitignored.

Database uses `cb_rooms` table (see `supabase/schema.sql`).

### Room Codes (`lib/roomWords.ts`)

Room codes use fun, memorable words instead of random alphanumeric strings:
- Curated list of ~350 words (animals, food, nature, objects, etc.)
- All 4-8 letters, family-friendly, easy to spell
- Collision checking against active rooms in batches
- Falls back to random alphanumeric if all words taken

### Crowd Voting (`components/BluffVoting.tsx`)

Non-participating players can vote on whether a claim is bluff or truth:
- Available during `awaiting_response` and `awaiting_21_choice` phases
- Claimer and current turn player cannot vote
- Votes stored with timestamps for reliable cross-player toast detection
- Toast notifications appear when other players vote

### Room Rejoin

Players can rejoin rooms after disconnection:
- Room membership stored in localStorage (`room_${roomId}_joined`, `room_${roomId}_nickname`)
- Auto-rejoin attempts on page load via `autoRejoinAttemptedRef`
- "Rejoin Game" button on home page when `activeRoomId` is set
- Join API allows nickname-matching rejoin even after game starts

## Key Implementation Details

**Server-Authoritative Rolls:** Client sends roll request, server generates dice, stores in `currentRoll`, returns only to roller.

**Bluff Resolution:** When bluff called, `gameState.currentRoll` contains the actual roll. The `callBluff()` function compares it to the claim.

**Claim Validation:** `makeClaim()` validates claim ≥ `minimumClaim`. Does NOT clear `currentRoll` (needed for bluff reveal).

**Player Identification:**
- localStorage `playerId` is UUID for API calls
- `_players` mapping in game state converts to game player ID (`player-0`, etc.)
- Room page checks player by nickname match, not just playerId

**21 Choice Handling:** After accepting a 21 challenge, `myRoll` must be set to `null` - the `gameState.currentRoll` is the claimer's roll, not the responder's. The responder hasn't rolled yet.

**Next.js 15+ Gotcha:** `styled-jsx` doesn't work reliably. Use inline styles or Tailwind classes instead.

## Security Considerations

1. Server generates all dice rolls
2. Actual roll stored in `currentRoll` (server-side in Supabase)
3. Roll result sent only to roller via API response
4. Other players see only claims until bluff called
5. All game actions validated server-side
