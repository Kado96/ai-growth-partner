/**
 * Test AlexaBrain hors-ligne.
 * Usage : node scripts/test-alexa-brain.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const { alexaBrain } = require('../services/alexaBrain');

async function main() {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8')
  );
  const queries = [
    'Bonjour',
    'Je veux un site web',
    'Tu es humaine ?',
    'Faites une blague',
    'Combien ça coûte une enquête ?',
    'Parlez-moi en anglais',
  ];

  for (const q of queries) {
    const r = await alexaBrain.answer(q, config, []);
    console.log('\nQ:', q);
    console.log('intent:', r.intent);
    console.log('A:', r.answer.slice(0, 200).replace(/\n/g, ' '));
  }
  console.log('\n[OK] docs:', alexaBrain.docs.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
