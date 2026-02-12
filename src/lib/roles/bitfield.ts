export function parsePermissionBitfield(bitfield: string | number | bigint | null | undefined): bigint {
  if (typeof bitfield === "bigint") return bitfield;
  if (typeof bitfield === "number") return BigInt(Math.max(0, Math.trunc(bitfield)));
  if (typeof bitfield === "string" && bitfield.trim()) {
    try {
      return BigInt(bitfield);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

export function stringifyPermissionBitfield(bitfield: bigint): string {
  return bitfield.toString();
}

export function hasPermissionBit(bitfield: string | number | bigint | null | undefined, bit: bigint): boolean {
  const parsed = parsePermissionBitfield(bitfield);
  return (parsed & bit) === bit;
}

export function setPermissionBit(
  bitfield: string | number | bigint | null | undefined,
  bit: bigint,
  enabled: boolean
): string {
  const parsed = parsePermissionBitfield(bitfield);
  const next = enabled ? parsed | bit : parsed & ~bit;
  return stringifyPermissionBitfield(next);
}
