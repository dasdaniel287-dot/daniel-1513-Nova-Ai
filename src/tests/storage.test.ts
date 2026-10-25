import test, { describe } from 'node:test';
import assert from 'node:assert';
import { extractTasksFromText } from '../utils/storage';
import { ASSISTANT_MODES } from '../constants/modes';

describe('NOVA AI Utility & Mode Tests', () => {
  test('should load all 10 specialized assistant modes with English and Bengali metadata', () => {
    assert.strictEqual(ASSISTANT_MODES.length, 10);
    const expectedModes = [
      'general',
      'coding',
      'research',
      'writing',
      'document',
      'learning',
      'data',
      'productivity',
      'creative',
      'personal',
    ];

    expectedModes.forEach((modeId) => {
      const mode = ASSISTANT_MODES.find((m) => m.id === modeId);
      assert.ok(mode, `Mode ${modeId} should exist`);
      assert.ok(mode?.name, `Mode ${modeId} should have name`);
      assert.ok(mode?.nameBn, `Mode ${modeId} should have Bengali name`);
      assert.ok(mode?.capabilities.length > 0, `Mode ${modeId} should have capabilities`);
      assert.ok(mode?.starterPrompts.length > 0, `Mode ${modeId} should have starter prompts`);
    });
  });

  test('should correctly extract tasks from markdown checklists and action items', () => {
    const sampleResponse = `
Here is your roadmap:
- [ ] Initialize repository structure
- [x] Configure TypeScript compiler
1. Implement real-time streaming endpoint
2. Review security and privacy guidelines
    `;

    const extracted = extractTasksFromText(sampleResponse);
    assert.ok(extracted.length > 0);
    assert.ok(extracted.includes('Initialize repository structure'));
  });
});
