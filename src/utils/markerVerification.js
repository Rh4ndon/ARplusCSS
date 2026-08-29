import * as ImageManipulator from 'expo-image-manipulator';
import { inflate } from 'pako';
import {
  hashes as referenceHashes,
  hashThreshold,
  colorRange,
} from '../data/markerReferences';

// ---------------------------------------------------------------------------
// Minimal PNG decoder — handles 8-bit grayscale/RGB/RGBA, no interlacing.
// Sufficient for the tiny 16×16 PNGs produced by expo-image-manipulator.
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function readUint32BE(buf, offset) {
  return (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3];
}

function parsePNG(uint8) {
  for (let i = 0; i < 8; i++) {
    if (uint8[i] !== PNG_SIGNATURE[i]) throw new Error('Not a valid PNG');
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  let offset = 8;
  while (offset < uint8.length) {
    const length = readUint32BE(uint8, offset);
    const type = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
    const data = uint8.slice(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = readUint32BE(data, 0);
      height = readUint32BE(data, 4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length;
  }

  return { width, height, bitDepth, colorType, idatChunks };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNGIDAT(idatChunks, width, height, bitDepth, colorType) {
  const totalLen = idatChunks.reduce((s, c) => s + c.length, 0);
  const combined = new Uint8Array(totalLen);
  let pos = 0;
  for (const chunk of idatChunks) {
    combined.set(chunk, pos);
    pos += chunk.length;
  }
  const raw = inflate(combined);

  let bpp;
  switch (colorType) {
    case 0: bpp = 1; break;
    case 2: bpp = 3; break;
    case 3: bpp = 1; break;
    case 4: bpp = 2; break;
    case 6: bpp = 4; break;
    default: throw new Error(`Unsupported PNG color type: ${colorType}`);
  }

  const stride = 1 + width * bpp;
  const pixels = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * stride];
    const rowStart = y * stride + 1;

    for (let x = 0; x < width; x++) {
      const idx = rowStart + x * bpp;
      let r, g, b, a;

      switch (colorType) {
        case 0: r = g = b = raw[idx]; a = 255; break;
        case 2: r = raw[idx]; g = raw[idx + 1]; b = raw[idx + 2]; a = 255; break;
        case 3: r = g = b = raw[idx]; a = 255; break;
        case 4: r = g = b = raw[idx]; a = raw[idx + 1]; break;
        case 6: r = raw[idx]; g = raw[idx + 1]; b = raw[idx + 2]; a = raw[idx + 3]; break;
      }

      const outIdx = (y * width + x) * 4;
      const leftIdx = outIdx - 4;
      const upIdx = outIdx - width * 4;

      let pr = 0, pg = 0, pb = 0, pa_ = 0;
      if (filter === 1 && x > 0) {
        pr = pixels[leftIdx]; pg = pixels[leftIdx + 1]; pb = pixels[leftIdx + 2]; pa_ = pixels[leftIdx + 3];
      } else if (filter === 2 && y > 0) {
        pr = pixels[upIdx]; pg = pixels[upIdx + 1]; pb = pixels[upIdx + 2]; pa_ = pixels[upIdx + 3];
      } else if (filter === 3 && (x > 0 || y > 0)) {
        const lR = x > 0 ? pixels[leftIdx] : 0;
        const lG = x > 0 ? pixels[leftIdx + 1] : 0;
        const lB = x > 0 ? pixels[leftIdx + 2] : 0;
        const lA = x > 0 ? pixels[leftIdx + 3] : 0;
        const uR = y > 0 ? pixels[upIdx] : 0;
        const uG = y > 0 ? pixels[upIdx + 1] : 0;
        const uB = y > 0 ? pixels[upIdx + 2] : 0;
        const uA = y > 0 ? pixels[upIdx + 3] : 0;
        pr = (lR + uR) >> 1; pg = (lG + uG) >> 1; pb = (lB + uB) >> 1; pa_ = (lA + uA) >> 1;
      } else if (filter === 4) {
        if (x > 0 && y > 0) {
          const lr = pixels[leftIdx], lg = pixels[leftIdx + 1], lb = pixels[leftIdx + 2], la = pixels[leftIdx + 3];
          const ur = pixels[upIdx], ug = pixels[upIdx + 1], ub = pixels[upIdx + 2], ua = pixels[upIdx + 3];
          const ulr = pixels[upIdx - 4], ulg = pixels[upIdx - 3], ulb = pixels[upIdx - 2], ula = pixels[upIdx - 1];
          pr = paethPredictor(lr, ur, ulr); pg = paethPredictor(lg, ug, ulg);
          pb = paethPredictor(lb, ub, ulb); pa_ = paethPredictor(la, ua, ula);
        } else if (x > 0) {
          pr = pixels[leftIdx]; pg = pixels[leftIdx + 1]; pb = pixels[leftIdx + 2]; pa_ = pixels[leftIdx + 3];
        } else if (y > 0) {
          pr = pixels[upIdx]; pg = pixels[upIdx + 1]; pb = pixels[upIdx + 2]; pa_ = pixels[upIdx + 3];
        }
      }

      pixels[outIdx] = (r + pr) & 0xff;
      pixels[outIdx + 1] = (g + pg) & 0xff;
      pixels[outIdx + 2] = (b + pb) & 0xff;
      pixels[outIdx + 3] = (a + pa_) & 0xff;
    }
  }

  return pixels;
}

// ---------------------------------------------------------------------------
// aHash computation (16×16 = 256 bits)
// ---------------------------------------------------------------------------

function computeAHashFromPixels(rgbaPixels, width, height) {
  const cellW = width / 16;
  const cellH = height / 16;
  const greys = new Float64Array(256);

  for (let gy = 0; gy < 16; gy++) {
    for (let gx = 0; gx < 16; gx++) {
      let sum = 0;
      let count = 0;
      const x0 = Math.floor(gx * cellW);
      const y0 = Math.floor(gy * cellH);
      const x1 = Math.floor((gx + 1) * cellW);
      const y1 = Math.floor((gy + 1) * cellH);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          sum += 0.299 * rgbaPixels[i] + 0.587 * rgbaPixels[i + 1] + 0.114 * rgbaPixels[i + 2];
          count++;
        }
      }
      greys[gy * 16 + gx] = sum / count;
    }
  }

  let avg = 0;
  for (let i = 0; i < 256; i++) avg += greys[i];
  avg /= 256;

  let hash = 0n;
  for (let i = 0; i < 256; i++) {
    if (greys[i] > avg) hash |= 1n << BigInt(i);
  }
  return hash.toString(16).padStart(64, '0');
}

// ---------------------------------------------------------------------------
// Color histogram — green-blue PCB detection
// ---------------------------------------------------------------------------

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function computeGreenBluePercent(rgbaPixels, width, height) {
  const pixels = width * height;
  let greenBlueCount = 0;
  for (let i = 0; i < pixels; i++) {
    const r = rgbaPixels[i * 4];
    const g = rgbaPixels[i * 4 + 1];
    const b = rgbaPixels[i * 4 + 2];
    const { h, s } = rgbToHsl(r, g, b);
    if (h >= 90 && h <= 210 && s > 0.15) greenBlueCount++;
  }
  return Math.round((greenBlueCount / pixels) * 100);
}

// ---------------------------------------------------------------------------
// Hamming distance
// ---------------------------------------------------------------------------

function hammingDistance(a, b) {
  const xor = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  return xor.toString(2).split('1').length - 1;
}

// ---------------------------------------------------------------------------
// Shared image processing
// ---------------------------------------------------------------------------

async function processImage(imageUri) {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 16, height: 16 } }],
    { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true },
  );

  if (!result.base64) throw new Error('Failed to get base64 from image manipulator');

  const raw = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
  const { width, height, bitDepth, colorType, idatChunks } = parsePNG(raw);
  const rgba = decodePNGIDAT(idatChunks, width, height, bitDepth, colorType);

  const hash = computeAHashFromPixels(rgba, width, height);
  const greenBluePct = computeGreenBluePercent(rgba, width, height);

  return { hash, greenBluePct };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify whether the captured image is a motherboard using two checks:
 * 1. aHash (256-bit) — spatial brightness pattern must match a reference
 * 2. Green-blue % — PCB color must be present in expected range
 *
 * Both checks must pass for acceptance.
 *
 * @param {string} imageUri - URI of the captured photo
 * @returns {Promise<{ isMatch: boolean, hashMatch: boolean, colorMatch: boolean, distance: number, greenBluePct: number }>}
 */
export async function verifyMotherboard(imageUri) {
  const { hash, greenBluePct } = await processImage(imageUri);

  // Check 1: aHash distance
  let bestDist = Infinity;
  for (const ref of referenceHashes) {
    const d = hammingDistance(hash, ref);
    if (d < bestDist) bestDist = d;
  }
  const hashMatch = bestDist <= hashThreshold;

  // Check 2: green-blue PCB color percentage
  const colorMatch = greenBluePct >= colorRange.min && greenBluePct <= colorRange.max;

  return {
    isMatch: hashMatch && colorMatch,
    hashMatch,
    colorMatch,
    distance: bestDist,
    greenBluePct,
  };
}
