export const apple_api_url = 'https://gs-loc.apple.com/clls/wloc'; // China not supported, they use a different URL

// Based on https://github.com/acheong08/apple-corelocation-experiments/blob/main/lib/wloc.go
export const device = {
  operatingSystem: 'iPhone OS17.5/21F79',
  deviceModel: 'iPhone12,1',
};

export enum RAT {
  LTE = 'LTE',
  NR = 'NR',
}
export type RATstring = keyof RAT;

export const MAX_INT_32 = 2 ** 32 - 1;
export const MAX_INT_64 = 2n ** 64n - 1n;
