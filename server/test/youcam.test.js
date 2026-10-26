import test from 'node:test';
import assert from 'node:assert/strict';
import { mapYouCamApiError } from '../src/services/youcam.js';

test('maps CreditInsufficiency to an actionable insufficient-units error', () => {
  const error = mapYouCamApiError(
    { error_code: 'CreditInsufficiency', error: 'Insufficient unit to run' },
    400,
  );

  assert.equal(error.name, 'YouCamError');
  assert.equal(error.code, 'INSUFFICIENT_UNITS');
  assert.equal(error.status, 402);
  assert.match(error.message, /enough units/);
  assert.equal(error.details.youcamCode, 'CreditInsufficiency');
  assert.equal(error.details.httpStatus, 400);
});

test('keeps other provider rejections behind a generic YouCam error', () => {
  const error = mapYouCamApiError(
    { error_code: 'InvalidParameter', error: 'The image is not supported.' },
    400,
  );

  assert.equal(error.code, 'YOUCAM_REJECTED');
  assert.equal(error.status, 502);
  assert.equal(error.message, 'The image is not supported.');
  assert.equal(error.details.youcamCode, 'InvalidParameter');
});

test('handles non-JSON provider failures', () => {
  const error = mapYouCamApiError(null, 500);

  assert.equal(error.code, 'YOUCAM_REJECTED');
  assert.equal(error.details.youcamCode, 'HTTP_500');
});
