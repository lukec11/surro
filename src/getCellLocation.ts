import queryCell from './queryCell';
import coordFromBigInt from './util/coordFromBigInt';

type IchneaLocationInformation = {
  lat: number;
  lon: number;
  range: number;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export default async function getCellLocation(
  mcc: number,
  mnc: number,
  cid: number,
  lac: number,
): Promise<ApiResponse<IchneaLocationInformation>> {
  try {
    // Get result from API
    const result = await queryCell(mcc, mnc, cid, lac);

    if (result.length === 0) {
      throw new Error('No data found');
    }

    const polyResponse = result[0];

    // Ensure that location is valid integer
    if (!polyResponse.location?.latitude || !polyResponse.location?.longitude) {
      throw new Error('Invalid location data');
    }

    // Ensure that location is valid location
    if (
      coordFromBigInt(polyResponse?.location?.latitude) == -180 ||
      coordFromBigInt(polyResponse?.location?.longitude) == -180
    ) {
      throw new Error('Invalid location coordinates');
    }

    // Ensure that cell is valid (filter junk data)
    const MAX_INT = Math.pow(2, 32) - 1;
    if (polyResponse.cellId >= MAX_INT) {
      throw new Error('Invalid cell ID');
    }

    // Set extra parameters on response
    const latitude = coordFromBigInt(polyResponse.location.latitude);
    const longitude = coordFromBigInt(polyResponse.location.longitude);
    const accuracy = Number(polyResponse.location.horizontalAccuracy);

    const response: IchneaLocationInformation = {
      lat: latitude,
      lon: longitude,
      range: accuracy,
    };

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
