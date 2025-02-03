import getSurroundingCells from '../getSurroundingCells';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
import * as queryCell from '../queryCell';

describe('getSurroundingCells', () => {
  it('should return surrounding towers for valid inputs', async () => {
    const result = await getSurroundingCells(310, 410, 142089743, 34647);
    assert.isTrue(result.success);
    assert.isArray(result.data);
    assert.isNotEmpty(result.data);
    result.data.forEach((tower) => {
      assert.property(tower, 'eNB');
      assert.property(tower, 'latitude');
      assert.property(tower, 'longitude');
      assert.property(tower, 'accuracy');
    });
  });

  it('should return an error for invalid inputs', async () => {
    const result = await getSurroundingCells(999, 999, 99999999, 99999);
    assert.isFalse(result.success);
    assert.instanceOf(result.error, Error);
  });

  it('should skip entries with invalid location data', async () => {
    // Mock the queryCell function to return data with invalid location
    const queryCellStub = sinon.stub(queryCell, 'default').resolves([
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
      {
        $typeName: 'apple.CellTower',
        mmc: 310,
        mnc: 410,
        tacId: 12345,
        $unknown: [],
        pid: 123,
        uarfcn: 123,
        cellId: 67890,
        location: {
          $typeName: 'apple.Location',
          latitude: 1234567890n, // Valid latitude
          longitude: 9876543210n, // Valid longitude
        },
      },
    ]);

    const result = await getSurroundingCells(310, 410, 142089743, 34647);

    // Restore the original function
    queryCellStub.restore();

    // Assertions
    assert.isTrue(result.success);
    assert.isArray(result.data);
    assert.lengthOf(result.data, 1);
    assert.strictEqual(result.data[0].cellId, 67890);
  });
});
