# Cube Bluff

A multiplayer online bluffing dice game. Roll secretly, make claims, and catch your friends lying!

## Quick Start

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Settings → API and copy your URL and anon key

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The game will be available at **http://localhost:3001**

## Game Rules

### The Dice
- Roll 2 dice secretly
- Arrange them into a two-digit number (higher die first)
- Examples: 5 & 3 = **53**, 4 & 4 = **44**, 2 & 1 = **21**

### Roll Rankings (Highest to Lowest)
1. **21** - Special highest roll!
2. Doubles: 66, 55, 44, 33, 22, 11
3. Non-doubles: 65 → 31 (lowest)

### Gameplay
1. Roll your dice secretly
2. Claim a roll (can be truth or a lie!)
3. Your claim must be ≥ the previous claim
4. Next player chooses:
   - **Roll to beat** - Accept the claim and continue
   - **Call bluff** - Challenge the claim!

### Calling Bluff
- If claimer was lying → They lose a token
- If claimer was truthful → You lose a token

### Special: Rolling 21
When you actually roll 21, choose:
- **"Twenty-one!"** - Double stakes (2 tokens at risk)
- **"Pass"** - Pay 1 token, skip round safely

### Winning
- Players are eliminated when they run out of tokens
- Last player standing wins!

## Project Structure

```
cube-bluff-starter/
├── app/
│   ├── api/rooms/          # API routes
│   ├── room/[roomId]/      # Game room page
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/             # React components
├── lib/
│   ├── types.ts           # TypeScript types + roll utilities
│   ├── gameLogic.ts       # Pure game logic functions
│   ├── gameStore.ts       # Database operations
│   └── supabase.ts        # Supabase client
├── hooks/
│   └── useSounds.ts       # Sound effects hook
└── supabase/
    └── schema.sql         # Database schema
```

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 3**
- **Supabase** (PostgreSQL + Realtime)

## Development

```bash
npm run dev      # Start dev server (port 3001)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
