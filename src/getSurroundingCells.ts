import { MAX_INT_32, MAX_INT_64, RAT } from './util/constants';
import { CellTowerLte, CellTowerNr } from './gen/apple_pb';
import queryCell from './queryCell';
import coordFromBigInt from './util/coordFromBigInt';
import { isCellTowerLte, isCellTowerNr } from './util/narrowTypes';

type CustomAdds = {
  eNB?: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  isExactTowerLocation: boolean;
};
type CellTower = CellTowerLte | CellTowerNr;
export type SurroundingTower = CellTower & CustomAdds;

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export default async function getSurroundingCells(
  mcc: number,
  mnc: number,
  cid: number | bigint,
  lac: number | bigint,
  rat: keyof typeof RAT,
): Promise<ApiResponse<SurroundingTower[]>> {
  try {
    // Get result from API
    const result = await queryCell(mcc, mnc, cid, lac, RAT[rat]);

    // Setup response
    const responseBuilder: SurroundingTower[] = [];

    // Loop through each item
    for (const polyResponse of result) {
      // Ensure that location is valid integer
      if (
        !polyResponse.location?.latitude ||
        !polyResponse.location?.longitude
      ) {
        // skip to next iteration
        continue;
      }

      // Ensure that location is valid location
      if (
        coordFromBigInt(polyResponse?.location?.latitude) == -180 ||
        coordFromBigInt(polyResponse?.location?.longitude) == -180
      ) {
        continue;
      }

      // Ensure that cell ID is valid (filter junk data)
      if (
        (isCellTowerLte(polyResponse) && polyResponse.cellId >= MAX_INT_32) ||
        (isCellTowerNr(polyResponse) && polyResponse.cellId >= MAX_INT_64)
      ) {
        continue;
      }

      // Set extra parameters on response
      const latitude = coordFromBigInt(polyResponse.location.latitude);
      const longitude = coordFromBigInt(polyResponse.location.longitude);
      const accuracy = Number(polyResponse.location.horizontalAccuracy);
      const isExactTowerLocation: boolean =
        polyResponse?.location?.isExactTowerLocation === 1n || false;

      const customParams: CustomAdds = {
        latitude,
        longitude,
        accuracy,
        isExactTowerLocation,
      };

      if (rat === RAT.LTE && isCellTowerLte(polyResponse)) {
        customParams.eNB = Math.trunc(Number(polyResponse.cellId) / 256);
      }

      // Combine the two types into response
      const response: SurroundingTower = { ...polyResponse, ...customParams };

      responseBuilder.push(response);
    }

    if (responseBuilder.length == 0) {
      throw new Error('No results found!');
    }

    return { success: true, data: responseBuilder };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
