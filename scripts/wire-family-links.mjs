/**
 * Wires the 28 extracted catalogue families into products.html:
 *  - points existing segment cards at product-family.html#f=<id>
 *  - appends new cards for families with no matching segment
 * Run: node scripts/wire-family-links.mjs
 */
import fs from 'node:fs';

let s = fs.readFileSync('products.html', 'utf8');
const FP = id => 'product-family.html#f=' + id;

const map = {
  'Appliance Wires & Cables': 'ul-appliance',
  'Automotive Cables': 'automotive',
  'Battery Cables': 'battery',
  'Coaxial Cables': 'antenna',
  'Control & Switchboard Cables': 'is1554-control',
  'Fire Resistant Cables': 'fire-resistant',
  'Flexible Cables': 'sflex',
  'High Temperature Cables': 'sietherm-155',
  'Irrigation Communication': 'irrigation-comm',
  'Nuclear Cables': 'nuclear',
  'Offshore, Marine, Shipboard': 'marine',
  'Power Cables': 'is7098-power',
  'PW 125 Wires (High-Rise)': 'pw-125',
  'Railway Quad & Signalling': 'indian-railway',
  'Rolling Stock Cables': 'rolling-stock',
  'Rubber Cables': 'rubber',
  'Silicone Cables': 'silicone',
  'Solar Cables': 'solar',
  'Welding Cables': 'welding',
  'Wind Energy Cables': 'wind'
};

const escRe = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let updated = 0;
for (const [name, fam] of Object.entries(map)) {
  const e = escRe(name);
  const reWithUrl = new RegExp('(\\{ name: "' + e + '"[^}]*?url: ")[^"]*(")');
  const reNoUrl = new RegExp('(\\{ name: "' + e + '"[^}]*?icon: "[^"]*")(, img:)');
  if (reWithUrl.test(s)) { s = s.replace(reWithUrl, '$1' + FP(fam) + '$2'); updated++; }
  else if (reNoUrl.test(s)) { s = s.replace(reNoUrl, '$1, url: "' + FP(fam) + '"$2'); updated++; }
  else console.log('NOT FOUND:', name);
}

const newCards = [
  `      { name: "EV & Charging Cables", std: "LV 216 · EBXL 150°C · 1000V AC", icon: "battery", url: "${FP('ev')}", img: GD("1GLkmZige7CATzMa-jiiphOtQu0SlhJDU") },`,
  `      { name: "Diesel Locomotive Cables (EMD)", std: "EMD/EL/PT/505 · ATC 125°C", icon: "train", url: "${FP('emd-locomotive')}", img: GD("1n337Fh4mQvz939KNYsR1HvrjOjo5pKAm") },`,
  `      { name: "BS 5467 Power Cables", std: "BS 5467 · 600/1000V · XLPE", icon: "power", url: "${FP('bs5467-power')}", img: GD("1gLp94H5x5fW1x4FzFUzHVjQbVjvXgPm0") },`,
  `      { name: "Cable Conduits & Fittings", std: "RDSO/PE/SPEC/0138", icon: "hybrid", url: "${FP('conduits')}", img: GD("1qxUJf4R3uE-xO609AGXTdlx9qxNhpCE1") },`,
  `      { name: "Sietherm 125 Wires", std: "EBXL 125°C · Single & Multicore", icon: "heat", url: "${FP('sietherm-125')}", img: GD("17g0F4km0FmzAFO5ga0ArTWMoQSzdk1J5") },`,
  `      { name: "Fluoroelastomer Cables", std: "200°C · Diesel Locomotive", icon: "rubber", url: "${FP('fluoroelastomer')}", img: GD("1tgvYsgvugxZtyoYPdL4iYsVo0EhszND-") },`
].join('\n');

if (!s.includes('EV & Charging Cables')) {
  s = s.replace(/(\{ name: "Wiring Harness"[^\n]*\n)/, '$1' + newCards + '\n');
}

fs.writeFileSync('products.html', s);
console.log('updated:', updated, '| new cards:', s.includes('EV & Charging Cables'));
