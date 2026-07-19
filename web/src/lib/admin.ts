export function isAdminWallet(wallet: string | null | undefined): boolean {
  if (!wallet) return false;
  const admins = (process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return admins.includes(wallet);
}