/* eslint-disable @typescript-eslint/no-explicit-any */
import { CellTowerLte, CellTowerNr } from '../gen/apple_pb';

/**
 * Type guard for CellTowerNr
 * @param x CellTowerLte | CellTowerNr
 * @returns boolean
 */
export function isCellTowerLte(x: any): x is CellTowerLte {
  if (!x || typeof x !== 'object') return false;

  return typeof x.cellId === 'number' && typeof x.tacId === 'number';
}

/**
 * Type guard for CellTowerNr
 * @param x CellTowerLte | CellTowerNr
 * @returns boolean
 */
export function isCellTowerNr(x: any): x is CellTowerNr {
  if (!x || typeof x !== 'object') return false;

  return typeof x.cellId === 'bigint' && typeof x.tacId === 'bigint';
}
