/**
 * Convert coordinate from BigInt (as returned) to floating point value
 * https://github.com/acheong08/apple-corelocation-experiments/blob/33e543/lib/wloc.go#L158
 */
export default function coordFromBigInt(num: bigint): number {
  return Number(num) * Math.pow(10, -8);
}
