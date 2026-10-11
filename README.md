# Zinch

**Non-custodial escrow for crypto work agreements, built on Solana.**

Live: [zinch.app](https://zinch.app) · Program (devnet): [`3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP`](https://explorer.solana.com/address/3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP?cluster=devnet) · Stats: [zinch.app/stats](https://zinch.app/stats)

## The problem

Crypto freelancers get ghosted or scammed, and clients get burned by workers who take a deposit and vanish. Most deals run on DMs and trust. Existing escrow is either a custodial middleman or a "trusted mod" in a Telegram group.

## What Zinch does

A client and a worker agree on a deal. The client funds a program-owned escrow PDA. The worker delivers, the client approves, and funds release to the worker in seconds. No middleman ever holds the money.

- **Non-custodial:** funds sit in a PDA controlled only by the program (seeds `["deal", deal_id]`).
- **Auto-release:** if the client goes silent after delivery, the worker can trigger release after the timer (default 72h).
- **Dispute without arbiters:** either party can freeze a deal; both propose a resolution (release / refund / split) and the program executes when they match.
- **Flat 1.5% fee**, paid by the client on top. The worker receives the full agreed amount.
- **No token.** Revenue is real fees, not speculation.
- **Wallet optional:** sign in with Google or email (Privy creates an embedded Solana wallet), or connect Phantom.

## Traction (devnet tester round)

Live numbers from [zinch.app/stats](https://zinch.app/stats), computed from on-chain data and our database:

| Metric | Value |
|---|---|
| Total deals created | **33** |
| Completed deals | **15** |
| Volume settled | **32.94 SOL** (devnet) |
| Fees collected | 0.4941 SOL (devnet) |
| Users | **47** |
| Refunds | 3 |
| Disputes | 0 |
| Success rate | 83% (completed / settled) |

These come from a public tester round run through the Superteam Nigeria community. Testers paid out of their own devnet wallets, found bugs, and posted feedback on X; the top five received cash rewards for the most honest feedback. Volume is **devnet SOL, not real funds**. Mainnet launch is planned after the changes below.

## Program

Anchor program with 11 instructions:

`create_deal` · `accept_deal` · `fund_deal` · `submit_work` · `approve_and_release` · `auto_release` · `refund` · `open_dispute` · `propose_resolution` · `accept_resolution` · `cancel_deal`

- Program ID (devnet): `3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP`
- Source: [`zinch_escrow/`](./zinch_escrow)
- IDL: [`web/src/lib/idl/zinch_escrow.json`](./web/src/lib/idl/zinch_escrow.json)

## Stack

Next.js (App Router) · TypeScript · Tailwind · Anchor/Rust · Solana Wallet Adapter (Phantom) · Privy (social login + embedded wallets) · Supabase (indexing, profiles) · Resend (email notifications) · PostHog · Vercel

## Run locally

```bash
git clone https://github.com/peace-dapps/zinch.git
cd zinch/web
pnpm install
cp .env.example .env.local   # fill in values below
pnpm dev                     # http://localhost:3000
```

See [`web/.env.example`](./web/.env.example) for all required variables (Privy, Supabase, Resend, PostHog, RPC, program ID, admin wallets, and the auto-release keypair).

## Roadmap

1. Privy embedded-wallet signing, so social-login users never need to connect Phantom
2. Independent security review
3. Mainnet launch with USDC + SOL
4. Cold treasury wallet for fee collection

## Author

Built solo by [Peace](https://x.com/Peace_Onchain) ([@peace-dapps](https://github.com/peace-dapps)).
