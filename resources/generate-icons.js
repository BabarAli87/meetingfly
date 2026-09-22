#!/usr/bin/env node

/**
 * Generate placeholder PNG icons from SVG using Node.js
 * This is a simple fallback when Python/cairosvg is not available
 */

const fs = require('node:fs');
const path = require('node:path');

// Very simple PNG generator - creates a blue placeholder icon
function createSimplePNG() {
  // PNG header and IHDR chunk for 256x256 blue image
  const width = 256;
  const height = 256;
  
  // Create a simple blue gradient image using raw pixel data
  const canvas = Buffer.alloc(width * height * 4);
  
  // Fill with airplane icon colors (blue gradient)
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = 91;      // R - blue
    canvas[i + 1] = 155; // G 
    canvas[i + 2] = 213; // B
    canvas[i + 3] = 255; // A - opaque
  }
  
  // Note: Full PNG encoding is complex; this is a placeholder
  console.log('ℹ️  Simple PNG generation not fully supported');
  console.log('Please use: npm install -g electron-icon-generator');
  console.log('Then run: electron-icon-generator --input=icon.svg --output=.');
  
  return null;
}

// Try using sharp or manual PNG creation
try {
  const sharp = require('sharp');
  
  console.log('Generating icons with Sharp...');
  
  const svgPath = path.join(__dirname, 'icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Generate PNG
  sharp(Buffer.from(svgContent))
    .png()
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(path.join(__dirname, 'icon.png'))
    .then(() => console.log('✅ Generated icon.png'))
    .catch(err => console.error('Error generating PNG:', err));
    
} catch (e) {
  console.error('Error:', e.message ?? e);
  console.log('⚠️  Sharp not available. Please install dependencies:');
  console.log('  npm install sharp');
  console.log('');
  console.log('Or use the Python generator:');
  console.log('  cd resources');
  console.log('  python -m pip install cairosvg pillow');
  console.log('  python generate-icons.py');
  console.log('');
  console.log('Or use online tool: https://icoconvert.com/');
}
