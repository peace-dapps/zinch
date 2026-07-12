import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import * as borsh from "@coral-xyz/borsh";
import bs58 from "bs58";

export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ZINCH_PROGRAM_ID ||
    "3gm7tTj5meZP1tYjvE49zSzpjMmyywD5wqZ7jxPS7uDP"
);

export const FEE_RECIPIENT = new PublicKey(
  "5wfAAN9cZLC4L52ik2hycfXWCSpaf39GDyFa7jpimxqa"
);

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC, "confirmed");
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

export function dealIdToHex(dealId: Uint8Array): string {
  return Array.from(dealId)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToDealId(hex: string): Uint8Array {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function getDealPDA(dealId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("deal"), Buffer.from(dealId)],
    PROGRAM_ID
  );
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4) + " SOL";
}

/**
 * Anchor uses this discriminator format for instructions:
 * First 8 bytes of SHA-256("global:instruction_name")
 * We hardcode the discriminator for create_deal
 */
// Anchor discriminator: sha256("global:create_deal")[0..8]
async function computeDiscriminator(instructionName: string): Promise<Uint8Array> {
  const preimage = `global:${instructionName}`;
  const data = new TextEncoder().encode(preimage);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer).slice(0, 8);
}

/**
 * Build the raw create_deal instruction manually (without full Anchor client)
 */
export async function buildCreateDealInstruction(params: {
  creatorPubkey: PublicKey;
  dealPDA: PublicKey;
  dealId: Uint8Array;
  amountLamports: number;
  counterpartyPubkey: PublicKey;
  autoReleaseSeconds: number;
  acceptanceDeadline: number;
  kind: "workerInitiated" | "clientInitiated";
}): Promise<TransactionInstruction> {
  const {
    creatorPubkey,
    dealPDA,
    dealId,
    amountLamports,
    counterpartyPubkey,
    autoReleaseSeconds,
    acceptanceDeadline,
    kind,
  } = params;

  // Build instruction data buffer
  const dataLayout = borsh.struct([
    borsh.array(borsh.u8(), 16, "dealId"),
    borsh.u64("amount"),
    borsh.publicKey("counterparty"),
    borsh.u32("autoReleaseSeconds"),
    borsh.i64("acceptanceDeadline"),
    borsh.u8("kind"),
  ]);

  const buffer = Buffer.alloc(1000);
  const len = dataLayout.encode(
    {
      dealId: Array.from(dealId),
      amount: new BN(amountLamports),
      counterparty: counterpartyPubkey,
      autoReleaseSeconds,
      acceptanceDeadline: new BN(acceptanceDeadline),
      kind: kind === "workerInitiated" ? 0 : 1,
    },
    buffer
  );

  const discriminator = await computeDiscriminator("create_deal");
  const data = Buffer.concat([
    Buffer.from(discriminator),
    buffer.slice(0, len),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: creatorPubkey, isSigner: true, isWritable: true },
      { pubkey: dealPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });
}