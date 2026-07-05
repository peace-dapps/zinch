import { AnchorProvider, Program, Idl, BN, web3 } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import idl from "./idl/zinch_escrow.json";

// Solana devnet RPC (or Helius if you set that env var)
export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

// Your deployed program ID
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ZINCH_PROGRAM_ID ||
    "3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP"
);

// Fee recipient (platform wallet) — for now, same as deployer wallet
// Later replace with dedicated fee recipient wallet
export const FEE_RECIPIENT = new PublicKey(
  "5wfAAN9cZLC4L52ik2hycfXWCSpaf39GDyFa7jpimxqa"
);

/**
 * Create a Solana connection
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC, "confirmed");
}

/**
 * Get the Anchor program instance
 * Wallet must be a signer (Privy embedded wallet or Phantom, etc.)
 */
export function getProgram(wallet: any): Program {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program(idl as Idl, provider);
}

/**
 * Generate a 16-byte deal ID
 */
export function generateDealId(): Uint8Array {
  const bytes = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

/**
 * Convert 16-byte deal ID to hex string (for URLs and DB)
 */
export function dealIdToHex(dealId: Uint8Array): string {
  return Array.from(dealId)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string back to 16-byte deal ID
 */
export function hexToDealId(hex: string): Uint8Array {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Derive the deal PDA (Program Derived Address)
 */
export function getDealPDA(dealId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("deal"), Buffer.from(dealId)],
    PROGRAM_ID
  );
}

/**
 * Create a new deal on-chain
 */
export async function createDealOnChain(params: {
  wallet: any;                    // Signer (Privy embedded wallet)
  dealId: Uint8Array;              // 16-byte deal ID
  amountLamports: number;          // Amount in lamports (SOL * 1e9)
  counterpartyWallet: string;      // Other party's Solana address
  autoReleaseSeconds: number;      // 3600 - 2592000 (1 hour to 30 days)
  acceptanceDeadline: number;      // Unix timestamp
  kind: "workerInitiated" | "clientInitiated";
}): Promise<{ signature: string; dealPubkey: string }> {
  const {
    wallet,
    dealId,
    amountLamports,
    counterpartyWallet,
    autoReleaseSeconds,
    acceptanceDeadline,
    kind,
  } = params;

  const program = getProgram(wallet);
  const [dealPDA] = getDealPDA(dealId);
  const counterpartyPubkey = new PublicKey(counterpartyWallet);

  const kindEnum =
    kind === "workerInitiated"
      ? { workerInitiated: {} }
      : { clientInitiated: {} };

  const signature = await program.methods
    .createDeal(
      Array.from(dealId),
      new BN(amountLamports),
      counterpartyPubkey,
      autoReleaseSeconds,
      new BN(acceptanceDeadline),
      kindEnum as any
    )
    .accounts({
      creator: wallet.publicKey,
      deal: dealPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return {
    signature,
    dealPubkey: dealPDA.toBase58(),
  };
}

/**
 * Format lamports as human-readable SOL amount
 */
export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4) + " SOL";
}

/**
 * Parse SOL string to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}