#!/usr/bin/env python3
"""
Generate icon files from SVG source.
Requires: pip install cairosvg pillow
"""

import subprocess
import sys
from pathlib import Path

def generate_icons():
    script_dir = Path(__file__).parent
    svg_path = script_dir / "icon.svg"
    
    if not svg_path.exists():
        print(f"Error: {svg_path} not found")
        sys.exit(1)
    
    print("Generating app icons from SVG...")
    
    try:
        # Try using cairosvg if available
        import cairosvg
        
        sizes = [256, 128, 96, 64, 48, 32, 16]
        
        # Generate PNG at 256x256
        print("  → Generating PNG (256x256)...")
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(script_dir / "icon.png"),
            output_width=256,
            output_height=256
        )
        
        # Generate ICO with multiple sizes
        print("  → Generating ICO (multiple sizes)...")
        from PIL import Image
        
        png_path = script_dir / "icon.png"
        img = Image.open(png_path)
        
        ico_images = []
        for size in sizes:
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            ico_images.append(resized)
        
        ico_images[0].save(
            script_dir / "icon.ico",
            format="ICO",
            sizes=[(size, size) for size in sizes]
        )
        
        print("✅ Icons generated successfully!")
        print("   - icon.png (256x256)")
        print("   - icon.ico (multi-size)")
        print("\n⚠️  For macOS, you still need to generate icon.icns")
        print("   See ICON_SETUP.md for instructions")
        
    except ImportError as e:
        print("Error: Required packages not installed")
        print("Install with: pip install cairosvg pillow")
        print(f"Specific error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_icons()
