import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { finish } = require('../electron/lyrics/postprocess.js')

test('removes v-number speaker labels from visible lyrics and retains voice identity', () => {
  const result = finish([
    {
      time: 0,
      text: 'v1: Hello there',
      words: [
        { word: 'v1:', time: 0, end: 0.1, space: true },
        { word: 'Hello', time: 0.2, end: 0.4, space: true },
        { word: 'there', time: 0.5, end: 0.8, space: false },
      ],
    },
    {
      time: 1,
      text: 'v2 — How are you?',
      words: [
        { word: 'v2', time: 1, end: 1.1, space: true },
        { word: 'How', time: 1.2, end: 1.4, space: true },
        { word: 'are', time: 1.5, end: 1.6, space: true },
        { word: 'you?', time: 1.7, end: 2, space: false },
      ],
    },
    {
      time: 3,
      text: 'v12: Still here',
      words: [
        { word: 'v12:', time: 3, end: 3.1, space: true },
        { word: 'Still', time: 3.2, end: 3.4, space: true },
        { word: 'here', time: 3.5, end: 3.8, space: false },
      ],
    },
  ], { source: 'test' })

  assert.deepEqual(result.lines.map(line => line.text), ['Hello there', 'How are you?', 'Still here'])
  assert.deepEqual(result.lines.map(line => line.agent), ['v1', 'v2', 'v12'])
  assert.deepEqual(result.lines[0].words.map(word => word.word), ['Hello', 'there'])
  assert.deepEqual(result.lines[1].words.map(word => word.word), ['How', 'are', 'you?'])
})

test('does not remove v-number text when it is not a speaker prefix', () => {
  const result = finish([
    { time: 0, text: 'The v2 engine starts', words: [{ word: 'The', time: 0, end: 0.2, space: true }, { word: 'v2', time: 0.3, end: 0.4, space: true }, { word: 'engine', time: 0.5, end: 0.8, space: true }, { word: 'starts', time: 0.9, end: 1.2, space: false }] },
  ], { source: 'test' })

  assert.equal(result.lines[0].text, 'The v2 engine starts')
})
