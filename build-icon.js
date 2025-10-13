const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Gradient background
const gradient = ctx.createLinearGradient(0, 0, 256, 256);
gradient.addColorStop(0, '#667eea');
gradient.addColorStop(1, '#764ba2');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 256, 256);

// White CSV text
ctx.fillStyle = 'white';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('CSV', 128, 128);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);
console.log('Icon created: icon.png');
