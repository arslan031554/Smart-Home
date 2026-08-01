import assert from 'node:assert/strict';
import { normalizeUuid, normalizeUuidArray } from '../src/utils/idNormalization.js';

const valid = '11111111-2222-4aaa-8bbb-333333333333';
const invalid = 'not-a-uuid';

assert.equal(normalizeUuid(valid), valid);
assert.equal(normalizeUuid(invalid), null);
assert.deepEqual(normalizeUuidArray([valid, invalid, { id: valid }, { serviceId: invalid }]), [valid, valid]);
console.log('offer id sanitization checks passed');
