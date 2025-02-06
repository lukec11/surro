import getCellLocation from '../getCellLocation';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as queryCell from '../queryCell';

afterEach(() => {
  sinon.restore();
});

describe('getCellLocation', () => {
  it('should return cell location for valid inputs', async () => {
    const result = await getCellLocation(310, 410, 142089743, 34647);
    assert.isTrue(result.success);

    // Data is correct
    assert.isObject(result.data);
    assert.property(result.data, 'lat');
    assert.property(result.data, 'lon');
    assert.property(result.data, 'range');
  });

  it('should return an error for invalid inputs', async () => {
    const result = await getCellLocation(999, 999, 99999999, 99999);
    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for no data found', async () => {
    // Stub queryCell to return length 0
    sinon.stub(queryCell, 'default').resolves([]);

    const result = await getCellLocation(310, 260, 99999999999999, 9999);

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for invalid output coordinates', async () => {
    // Stub queryCell to have invalid lat/lng
    sinon.stub(queryCell, 'default').resolves([
      {
        $typeName: 'apple.CellTower',
        mmc: 310,
        mnc: 410,
        tacId: 12345,
        $unknown: [],
        pid: 123,
        uarfcn: 123,
        cellId: 12345,
        location: {
          $typeName: 'apple.Location',
          latitude: undefined, // Invalid latitude
          longitude: undefined, // Invalid longitude
        },
      },
    ]);

    const result = await getCellLocation(310, 410, 142089743, 34647);

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should return an error for invalid cell ID', async () => {
    // Stub queryCell to return invalid number
    const MAX_INT = Math.pow(2, 32) - 1;
    sinon.stub(queryCell, 'default').resolves([
      {
        $typeName: 'apple.CellTower',
        mmc: 310,
        mnc: 410,
        tacId: 12345,
        $unknown: [],
        pid: 123,
        uarfcn: 123,
        cellId: MAX_INT + 100,
        location: {
          $typeName: 'apple.Location',
          latitude: BigInt(1234567890),
          longitude: BigInt(9876543210),
        },
      },
    ]);

    const result = await getCellLocation(310, 410, 142089743, 34647);

    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });
});
