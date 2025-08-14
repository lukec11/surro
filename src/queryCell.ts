import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  AppleWLocSchema,
  CellTowerLte,
  CellTowerLteSchema,
  CellTowerNr,
  CellTowerNrSchema,
} from './gen/apple_pb';
import { device, RAT } from './util/constants';
import { apple_api_url } from './util/appleApiUrl';

/**
 * @internal
 * @param mcc
 * @param mnc
 * @param cid
 * @param lac
 * @returns
 */
export default async function queryCell(
  mcc: number,
  mnc: number,
  cid: number | bigint,
  lac: number | bigint,
  rat: RAT,
): Promise<CellTowerLte[] | CellTowerNr[]> {
  // Get appropriate request body
  const requestBody = (function () {
    switch (rat) {
      case RAT.LTE: {
        if (typeof cid !== 'number' || typeof lac !== 'number') {
          throw new Error('LTE requires numeric cid and lac');
        }
        const cellToPass = create(CellTowerLteSchema, {
          mcc: mcc,
          mnc: mnc,
          cellId: cid,
          tacId: lac,
        });

        return create(AppleWLocSchema, {
          numCellResults: 10000000,
          cellTowerRequestLte: cellToPass,
          deviceType: {
            operatingSystem: device.operatingSystem,
            model: device.deviceModel,
          },
        });
      }
      case RAT.NR: {
        const cellToPass = create(CellTowerNrSchema, {
          mcc: mcc,
          mnc: mnc,
          cellId: BigInt(cid), // convert CID and LAC to uint64 for NR, if they're passed as 32bit (which is possible on most carriers)
          tacId: BigInt(lac),
        });

        return create(AppleWLocSchema, {
          numCellResults: 10000000,
          cellTowerRequestNr: cellToPass,
          deviceType: {
            operatingSystem: device.operatingSystem,
            model: device.deviceModel,
          },
        });
      }
    }
  })();

  // Generate binary request payload
  const protoPayload: Uint8Array = toBinary(AppleWLocSchema, requestBody);

  // Add headers
  const headerData = [
    new Uint8Array([0x00, 0x01, 0x00, 0x05]),
    new TextEncoder().encode('en_US'),
    new Uint8Array([0x00, 0x13]),
    new TextEncoder().encode('com.apple.locationd'),
    new Uint8Array([0x00, 0x0a]),
    new TextEncoder().encode('17.5.21F79'),
    new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]),
    new Uint8Array([protoPayload.length]), // length of serializedWloc
  ];

  // Concatenate all header parts
  const header = concatenateUint8Arrays(...headerData);

  // Append serializedWloc to the header
  const requestPayload = concatenateUint8Arrays(header, protoPayload);

  // Set headers to send with HTTP request
  const requestHeaders: { [key: string]: string } = {
    'Content-Type': 'application/x-www-form-urlencoded', // Should be protobuf, but this is what was used in previous implementations
    Accept: '*/*',
    'Accept-Charset': 'utf-8',
    // "Accept-Encoding": "gzip, deflate",
    'Accept-Language': 'en-us',
    'User-Agent': 'locationd/1753.17 CFNetwork/711.1.12 Darwin/14.0.0',
    'Rand-Id': 'true',
  };

  const req = await fetch(apple_api_url, {
    method: 'POST',
    body: requestPayload,
    headers: requestHeaders,
  });

  // Error handling for request failure
  if (!req.ok) {
    throw new Error('HTTP Request Failed');
  }

  // Get response as ArrayBuffer
  const res = await req.arrayBuffer();

  // Slice the first 10 (header) off of response, presumably it's a header of some kind?
  // https://github.com/acheong08/apple-corelocation-experiments/blob/33e543/lib/wloc.go#L72
  const resultAsByteArray = new Uint8Array(res as ArrayBuffer).slice(10);

  // Decode response object using proto schema
  const decodedResponseObject = fromBinary(AppleWLocSchema, resultAsByteArray);

  const ctr: CellTowerLte[] | CellTowerNr[] =
    rat === RAT.LTE
      ? decodedResponseObject.cellTowerResponseLte
      : decodedResponseObject.cellTowerResponseNr;

  // Return raw response
  return ctr;
}

// Function to concatenate multiple Uint8Arrays
function concatenateUint8Arrays(...arrays: Uint8Array[]) {
  // Calculate the total length of the new Uint8Array
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(totalLength);

  // Copy each array into the result
  let offset = 0;
  arrays.forEach((arr) => {
    result.set(arr, offset);
    offset += arr.length;
  });

  return result;
}
