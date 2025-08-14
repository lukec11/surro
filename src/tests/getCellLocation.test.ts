import getCellLocation from '../getCellLocation';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as queryCell from '../queryCell';
import { MAX_INT_32, MAX_INT_64 } from '../util/constants';

afterEach(() => {
  sinon.restore();
});

describe('getCellLocation', () => {
  it('should return cell location for valid LTE inputs', async () => {
    const result = await getCellLocation(310, 410, 142089743, 34647, 'LTE');
    assert.isTrue(result.success);

    // Data is correct
    assert.isObject(result.data);
    assert.property(result.data, 'lat');
    assert.property(result.data, 'lon');
    assert.property(result.data, 'range');
  });

  it('should return cell location for valid NR inputs', async () => {
    // Pass as bigint, since NR values can be up to 36 bits
    const result = await getCellLocation(
      310,
      260,
      BigInt(7637840173),
      BigInt(3884544),
      'NR',
    );

    assert.isTrue(result.success);

    // Data is correct
    assert.isObject(result.data);
    assert.property(result.data, 'lat');
    assert.property(result.data, 'lon');
    assert.property(result.data, 'range');
  });

  it('should return an error for invalid inputs', async () => {
    const result = await getCellLocation(999, 999, 99999999, 99999, 'LTE');
    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for no data found', async () => {
    // Stub queryCell to return length 0
    sinon.stub(queryCell, 'default').resolves([]);

    const result = await getCellLocation(310, 260, 99999999999999, 9999, 'LTE');

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for invalid output coordinates', async () => {
    // Stub queryCell to have invalid lat/lng
    sinon.stub(queryCell, 'default').resolves([
      {
        $typeName: 'apple.CellTowerLte',
        mcc: 310,
        mnc: 410,
        tacId: 12345,
        $unknown: [],
        pci: 123,
        uarfcn: 123,
        cellId: 12345,
        location: {
          $typeName: 'apple.Location',
          latitude: undefined, // Invalid latitude
          longitude: undefined, // Invalid longitude
        },
      },
    ]);

    const result = await getCellLocation(310, 410, 142089743, 34647, 'LTE');

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for invalid 32bit location (LTE)', async () => {
    // Stub queryCell to return invalid number
    sinon.stub(queryCell, 'default').resolves([
      {
        $typeName: 'apple.CellTowerLte',
        mcc: 310,
        mnc: 410,
        tacId: 12345,
        $unknown: [],
        pci: 123,
        uarfcn: 123,
        cellId: MAX_INT_32 + 100,
        location: {
          $typeName: 'apple.Location',
          latitude: BigInt(1234567890),
          longitude: BigInt(9876543210),
        },
      },
    ]);

    const result = await getCellLocation(310, 410, 142089743, 34647, 'LTE');

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for invalid 64bit location (NR)', async () => {
    // Stub queryCell to return invalid number
    sinon.stub(queryCell, 'default').resolves([
      {
        $typeName: 'apple.CellTowerNr',
        mcc: 310,
        mnc: 410,
        tacId: BigInt(12345),
        $unknown: [],
        pci: 123,
        uarfcn: 123,
        cellId: MAX_INT_64 + BigInt(100),
        location: {
          $typeName: 'apple.Location',
          latitude: BigInt(1234567890),
          longitude: BigInt(9876543210),
        },
      },
    ]);

    const result = await getCellLocation(
      310,
      410,
      123456789456123,
      12345,
      'NR',
    );

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });
});
