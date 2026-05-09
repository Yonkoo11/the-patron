# The Patron - Progress

## Status: LIVE ON BASE MAINNET

### Contract
- **Address:** `0x96b25437FCd0B14576bA1ce5ec732aaA0d17CFC6`
- **Owner:** `0x15545100bf579a5a6492499126E2b076a6890b98`
- **Chain:** Base (8453)
- **Verified:** Sourcify (exact match). NOT yet verified on Basescan (need API key).
- **Treasury balance:** 0 ETH (unfunded)

### Frontend
- **URL:** https://yonkoo11.github.io/the-patron
- **Hosting:** GitHub Pages (moved from Netlify)
- **Status:** Live, reading from mainnet contract

### Agent
- **Config:** `NETWORK=base` in .env, grant amounts 0.001-0.005 ETH
- **Status:** CLI tested against mainnet (`status` command works)
- **Not running autonomously yet** — needs treasury funding first

### Remaining TODOs
1. Get Basescan API key (placeholder at ~/.zshenv line 13), verify contract on Basescan
2. Fund treasury with ETH
3. Start agent autonomous loop (`npx tsx src/index.ts`)
4. Rotate leaked API keys (Anthropic, OpenAI, ElevenLabs, Gemini, Figma) — exposed in session, hooks now fixed
5. BUILDING.md still has Sepolia references (build journal, non-blocking)

### Previous state (Base Sepolia)
- Contract: `0xb5C65e983e013ea2249EB8Fc44A316C641c21c38` on chain 84532
- 8 grants disbursed across 6 rounds
- Dashboard was on Netlify (the-patron.netlify.app)
