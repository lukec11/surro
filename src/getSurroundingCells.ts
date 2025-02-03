import { CellTower } from './gen/apple_pb';
import queryCell from './queryCell';
import coordFromBigInt from './util/coordFromBigInt';

type CustomAdds = {
  eNB: number;
  latitude: number;
  longitude: number;
  accuracy: number;
};
export type SurroundingTower = CellTower & CustomAdds;

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export default async function getSurroundingCells(
  mcc: number,
  mnc: number,
  cid: number,
  lac: number,
): Promise<ApiResponse<SurroundingTower[]>> {
  try {
    // Get result from API
    const result = await queryCell(mcc, mnc, cid, lac);

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

      // Ensure that cell is valid (filter junk data)
      const MAX_INT = Math.pow(2, 32) - 1;
      if (polyResponse.cellId >= MAX_INT) {
        continue;
      }

      // Set extra parameters on response
      const enbId = Math.trunc(polyResponse.cellId / 256);
      const latitude = coordFromBigInt(polyResponse.location.latitude);
      const longitude = coordFromBigInt(polyResponse.location.longitude);
      const accuracy = Number(polyResponse.location.horizontalAccuracy);

      const customParams: CustomAdds = {
        eNB: enbId,
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
      };

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
