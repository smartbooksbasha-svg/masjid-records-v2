#!/usr/bin/env python3
"""Generate Masjid Khidmat Records app icons (pure stdlib, no deps).

Design: azure rounded square + white mosque silhouette (dome, finial,
two minarets, arched door). 3x3 supersampled, premultiplied-alpha averaging.

Usage:  python tools/mkicon.py
Writes: public/icons/*.png
"""
import os
import struct
import zlib

AZ_TOP = (14, 92, 134)    # #0E5C86
AZ_BOT = (10, 71, 103)    # darker base
WHITE = (255, 255, 255)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "icons")


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


def in_round(x, y, r):
    if x < 0 or x > 1 or y < 0 or y > 1:
        return False
    if x < r and y < r:
        return (x - r) ** 2 + (y - r) ** 2 <= r * r
    if x > 1 - r and y < r:
        return (x - (1 - r)) ** 2 + (y - r) ** 2 <= r * r
    if x < r and y > 1 - r:
        return (x - r) ** 2 + (y - (1 - r)) ** 2 <= r * r
    if x > 1 - r and y > 1 - r:
        return (x - (1 - r)) ** 2 + (y - (1 - r)) ** 2 <= r * r
    return True


def circ(x, y, cx, cy, r):
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def mosque(x, y, s):
    """True when the unit point is inside the white mosque mark."""
    cx = 0.5 + (x - 0.5) / s
    cy = 0.5 + (y - 0.5) / s
    if circ(cx, cy, 0.5, 0.50, 0.155):          # main dome
        return True
    if 0.335 <= cx <= 0.665 and 0.50 <= cy <= 0.735:   # drum / body
        return True
    if circ(cx, cy, 0.5, 0.325, 0.024):         # finial ball
        return True
    if 0.491 <= cx <= 0.509 and 0.298 <= cy <= 0.345:  # finial stem
        return True
    if 0.225 <= cx <= 0.285 and 0.355 <= cy <= 0.735:  # left minaret
        return True
    if 0.715 <= cx <= 0.775 and 0.355 <= cy <= 0.735:  # right minaret
        return True
    if circ(cx, cy, 0.255, 0.355, 0.032):       # left cap
        return True
    if circ(cx, cy, 0.745, 0.355, 0.032):       # right cap
        return True
    return False


def door(x, y, s):
    """Arched doorway punched back to the azure background."""
    cx = 0.5 + (x - 0.5) / s
    cy = 0.5 + (y - 0.5) / s
    if 0.452 <= cx <= 0.548 and 0.615 <= cy <= 0.735:
        return True
    return circ(cx, cy, 0.5, 0.615, 0.048)


def png(w, h, rows):
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    raw = b"".join(b"\x00" + r for r in rows)
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


def render(size, rounded, scale):
    ss = 3
    n = ss * ss
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            pr = pg = pb = pa = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx + 0.5) / ss) / size
                    y = (py + (sy + 0.5) / ss) / size
                    if rounded and not in_round(x, y, 0.225):
                        continue
                    base = lerp(AZ_TOP, AZ_BOT, y)
                    col = base
                    if mosque(x, y, scale) and not door(x, y, scale):
                        col = WHITE
                    a = 255.0
                    pr += col[0] * a
                    pg += col[1] * a
                    pb += col[2] * a
                    pa += a
            if pa == 0:
                row += b"\x00\x00\x00\x00"
            else:
                row += bytes((round(pr / pa), round(pg / pa), round(pb / pa), round(pa / n)))
        rows.append(bytes(row))
    return png(size, size, rows)


def write(name, data):
    path = os.path.normpath(os.path.join(OUT, name))
    with open(path, "wb") as fh:
        fh.write(data)
    print("%-26s %7d bytes" % (name, len(data)))


def main():
    os.makedirs(OUT, exist_ok=True)
    write("icon-192.png", render(192, True, 1.0))
    write("icon-512.png", render(512, True, 1.0))
    write("icon-32.png", render(32, True, 1.0))
    write("maskable-512.png", render(512, False, 0.78))
    write("apple-touch-icon.png", render(180, False, 0.88))
    print("done ->", os.path.normpath(OUT))


if __name__ == "__main__":
    main()
