import { assert } from 'chai';
import 'mocha';

import { isCellTowerLte } from '../../util/narrowTypes';
import { isCellTowerNr } from '../../util/narrowTypes';

type Case = { name: string; obj: unknown; expected: boolean };

const universallyBad: Case[] = [
  { name: 'invalid - missing cellId', obj: { tacId: 456 }, expected: false },
  { name: 'invalid - missing tacId', obj: { cellId: 123 }, expected: false },
  {
    name: 'invalid - wrong type',
    obj: { cellId: '123', tacId: 456 },
    expected: false,
  },
  { name: 'invalid - null', obj: null, expected: false },
  { name: 'invalid - non-object', obj: 123, expected: false },
];

describe('isCellTowerLte (compact table-driven)', () => {
  const cases: Case[] = [
    ...universallyBad,
    {
      name: 'valid - number',
      obj: { cellId: 123, tacId: 456 },
      expected: true,
    },
    {
      name: 'invalid - bigint',
      obj: { cellId: BigInt(1), tacId: BigInt(2) },
      expected: false,
    },
  ];

  cases.forEach(({ name, obj, expected }) =>
    it(name, () => assert.strictEqual(isCellTowerLte(obj), expected)),
  );
});

describe('isCellTowerNr', () => {
  const cases: Case[] = [
    ...universallyBad,
    {
      name: 'valid - bigint',
      obj: { cellId: BigInt(123), tacId: BigInt(456) },
      expected: true,
    },
    {
      name: 'invalid - number (not bigint)',
      obj: { cellId: 123, tacId: 456 },
      expected: false,
    },
  ];

  cases.forEach(({ name, obj, expected }) =>
    it(name, () => assert.strictEqual(isCellTowerNr(obj), expected)),
  );
});
