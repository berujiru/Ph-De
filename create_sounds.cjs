const fs = require('fs');
const dir = 'public/assets/sounds';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
const base64 = '//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
const buf = Buffer.from(base64, 'base64');
['btn-press.mp3', 'victory.mp3', 'defeat.mp3', 'shoot.mp3', 'enemy-hit.mp3', 'enemy-die.mp3', 'barrier-hit.mp3', 'barrier-break.mp3'].forEach(f => fs.writeFileSync(`${dir}/${f}`, buf));
console.log('Dummy MP3s created successfully.');
