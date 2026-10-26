import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSkinOutput, parseTask, friendlyTaskError } from '../src/services/skin.js';

const sampleOutput = [
  { type: 'hd_texture', region: 'whole', raw_score: 71.2, ui_score: 78, mask_urls: ['https://example.com/texture.jpg'] },
  { type: 'hd_pore', region: 'nose', raw_score: 49.2, ui_score: 67, mask_urls: ['https://example.com/pore-nose.jpg'] },
  { type: 'hd_pore', region: 'whole', raw_score: 60.1, ui_score: 72, mask_urls: ['https://example.com/pore.jpg'] },
  { type: 'hd_redness', region: 'whole', raw_score: 72.0, ui_score: 77, mask_urls: ['https://example.com/redness.jpg'] },
  { type: 'hd_acne', region: 'whole', raw_score: 59.9, ui_score: 76, mask_urls: ['https://example.com/acne.jpg'] },
  { type: 'hd_skin_type', region: 'whole', skin_type: 'Combination' },
  { type: 'hd_skin_type', region: 't_zone', skin_type: 'Oily' },
  { type: 'hd_skin_type', region: 'u_zone', skin_type: 'Dry & Redness' },
  { type: 'skin_age', score: 29 },
  { type: 'all', score: 75.7 },
];

test('normalizes genuine Skin AI scores without altering them', () => {
  const report = parseSkinOutput(sampleOutput, {
    taskId: 'test-task-id',
    depth: 'essential',
    estimatedUnits: 12,
  });

  assert.equal(report.source, 'youcam');
  assert.equal(report.overall.value, 75.7);
  assert.equal(report.overall.source, 'api');
  assert.equal(report.skinAge, 29);
  assert.equal(report.skinType.whole, 'Combination');
  assert.equal(report.skinType.t_zone, 'Oily');
  assert.equal(report.skinType.u_zone, 'Dry with redness');
  assert.equal(report.measurements.length, 4);

  const pores = report.measurements.find((item) => item.key === 'pores');
  assert.equal(pores.score, 72);
  assert.equal(pores.regions.length, 2);
  assert.equal(pores.regions.find((region) => region.region === 'nose').score, 67);
  assert.deepEqual(report.focusAreas, ['pores', 'blemishes', 'redness']);
});

test('derives a clearly labelled average when the API omits the all score', () => {
  const report = parseSkinOutput(sampleOutput.filter((item) => item.type !== 'all'));
  assert.equal(report.overall.source, 'average');
  assert.equal(report.overall.value, 75.8);
});

test('returns a friendly task error instead of exposing raw provider payloads', () => {
  const result = parseTask({
    status: 200,
    data: { task_status: 'error', error: 'error_src_face_too_small' },
  });
  assert.equal(result.status, 'error');
  assert.match(result.message, /Move a little closer/);
  assert.equal(friendlyTaskError('unknown'), 'Skin AI could not complete this photo. Try again with a well-lit, front-facing portrait.');
});

test('rejects empty or unrecognised result payloads', () => {
  assert.throws(() => parseSkinOutput([]), /no readable results/);
  assert.throws(() => parseSkinOutput([{ type: 'unrelated' }]), /no supported concern scores/);
});
