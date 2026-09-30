import zlib
import struct
import math

def make_png(width, height, draw_fn):
    # RGBA image buffer
    # Each row starts with filter type byte (0 = None) followed by width * 4 bytes
    raw_data = bytearray()
    
    for y in range(height):
        raw_data.append(0) # Filter byte: None
        for x in range(width):
            r, g, b, a = draw_fn(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return bytes(png)

def draw_socotu_icon(x, y, w, h):
    # Normalized coords from -1 to 1
    nx = (x / (w - 1)) * 2 - 1
    ny = (y / (h - 1)) * 2 - 1
    
    # Background: Navy blue #0f2c59
    bg_r, bg_g, bg_b = 0x0f, 0x2c, 0x59
    
    # Rounded corner border for app icon
    # Corner radius approx 20%
    cr = 0.25
    dx = max(0, abs(nx) - (1 - cr))
    dy = max(0, abs(ny) - (1 - cr))
    dist_corner = math.sqrt(dx*dx + dy*dy)
    if dist_corner > cr:
        return 0, 0, 0, 0 # Transparent outside rounded icon
        
    # Gold anchor color #f59e0b
    gold_r, gold_g, gold_b = 0xf5, 0x9e, 0x0b
    white_r, white_g, white_b = 0xff, 0xff, 0xff
    
    # Draw Anchor
    # Ring at top: center (0, -0.45), radius 0.16, thickness 0.05
    dist_ring = math.sqrt(nx*nx + (ny + 0.45)**2)
    if 0.10 <= dist_ring <= 0.17:
        return gold_r, gold_g, gold_b, 255
        
    # Vertical shank: nx between -0.04 and +0.04, ny between -0.32 and 0.50
    if abs(nx) <= 0.04 and -0.32 <= ny <= 0.50:
        return gold_r, gold_g, gold_b, 255
        
    # Horizontal crossbar: nx between -0.35 and 0.35, ny between -0.15 and -0.07
    if abs(nx) <= 0.35 and -0.15 <= ny <= -0.07:
        return gold_r, gold_g, gold_b, 255
        
    # Crossbar tips (caps)
    if 0.33 <= abs(nx) <= 0.38 and -0.18 <= ny <= -0.04:
        return gold_r, gold_g, gold_b, 255
        
    # Bottom curved arms: circular arc centered at (0, 0.12), radius ~0.42
    arm_dist = math.sqrt(nx*nx + (ny - 0.12)**2)
    if 0.38 <= arm_dist <= 0.46 and ny > 0.10 and abs(nx) <= 0.52:
        return gold_r, gold_g, gold_b, 255
        
    # Flukes / arrows at ends: around nx = +-0.50, ny = 0.15
    if (0.44 <= nx <= 0.55 or -0.55 <= nx <= -0.44) and 0.10 <= ny <= 0.28:
        # triangular flukes
        return gold_r, gold_g, gold_b, 255
        
    # Text or subtle badge highlight at bottom
    if ny > 0.65 and ny < 0.85 and abs(nx) < 0.70:
        # Subtle light badge bar
        return 0x1e, 0x40, 0xaf, 255
        
    return bg_r, bg_g, bg_b, 255

def main():
    import os
    os.makedirs('public', exist_ok=True)
    
    print("Generating pwa-192x192.png...")
    png192 = make_png(192, 192, draw_socotu_icon)
    with open('public/pwa-192x192.png', 'wb') as f:
        f.write(png192)
        
    print("Generating pwa-512x512.png...")
    png512 = make_png(512, 512, draw_socotu_icon)
    with open('public/pwa-512x512.png', 'wb') as f:
        f.write(png512)
        
    print("Generating apple-touch-icon.png...")
    png180 = make_png(180, 180, draw_socotu_icon)
    with open('public/apple-touch-icon.png', 'wb') as f:
        f.write(png180)
        
    print("Generating pwa-maskable-512x512.png...")
    # Maskable has full background without transparent rounded corners
    def draw_maskable(x, y, w, h):
        nx = (x / (w - 1)) * 2 - 1
        ny = (y / (h - 1)) * 2 - 1
        # Safe zone scaling: scale down icon slightly to 75%
        nx /= 0.75
        ny /= 0.75
        gold_r, gold_g, gold_b = 0xf5, 0x9e, 0x0b
        bg_r, bg_g, bg_b = 0x0f, 0x2c, 0x59
        
        # Ring
        dist_ring = math.sqrt(nx*nx + (ny + 0.45)**2)
        if 0.10 <= dist_ring <= 0.17:
            return gold_r, gold_g, gold_b, 255
        # Shank
        if abs(nx) <= 0.04 and -0.32 <= ny <= 0.50:
            return gold_r, gold_g, gold_b, 255
        # Crossbar
        if abs(nx) <= 0.35 and -0.15 <= ny <= -0.07:
            return gold_r, gold_g, gold_b, 255
        # Crossbar tips
        if 0.33 <= abs(nx) <= 0.38 and -0.18 <= ny <= -0.04:
            return gold_r, gold_g, gold_b, 255
        # Curved arms
        arm_dist = math.sqrt(nx*nx + (ny - 0.12)**2)
        if 0.38 <= arm_dist <= 0.46 and ny > 0.10 and abs(nx) <= 0.52:
            return gold_r, gold_g, gold_b, 255
        # Flukes
        if (0.44 <= nx <= 0.55 or -0.55 <= nx <= -0.44) and 0.10 <= ny <= 0.28:
            return gold_r, gold_g, gold_b, 255
            
        return bg_r, bg_g, bg_b, 255

    png_maskable = make_png(512, 512, draw_maskable)
    with open('public/pwa-maskable-512x512.png', 'wb') as f:
        f.write(png_maskable)
        
    print("PNG icons successfully created!")

if __name__ == '__main__':
    main()
