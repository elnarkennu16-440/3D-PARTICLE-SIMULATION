/**
 * 3D Shape Coordinates Generator (True 3D Volumetric Models)
 * 100% Zero Bounding Boxes, Zero Wireframe Squares, Zero Debug Outlines.
 * High-precision mathematical reconstructions matching the 3D Blender assets:
 * - dragon.png: Full 3D horned dragon with outstretched bat wings, claws, tail & belly
 * - face.png: Full 360-degree sculpted male head bust with ears, nose, jaw & neck
 * - wormhole.png: Wireframe hyperboloid spacetime funnel with flared circular rims
 * - house.png: Modern Art-Deco apartment building with 3-tier curved balconies & rooftop antenna
 * - heart.png: Anatomical heart with aorta arch, carotid branches, pulmonary trunk & coronary vessels
 * - saturn.png: Spheroid planet core + tilted planar concentric rings with Cassini gap
 * - mountain.png: Alpine mountain massif with towering sharp peak, spires & rock talus
 * - blackhole.png: Gargantua black hole with event horizon void, accretion disk & lensing arch
 * - text: 3D extruded 'I LOVE YOU' typography
 * - idle: Cosmic grand design spiral galaxy
 */
import { ShapeMode } from '../types';

export function generateShapePoints(mode: ShapeMode, count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  const phiG = Math.PI * (3.0 - Math.sqrt(5.0));

  switch (mode) {
    case 'IDLE': {
      // Grand Design Spiral Galaxy with spherical core and dual logarithmic arms
      const nCore = Math.floor(count * 0.28);
      const nArms = count - nCore;

      // 1. Spheroidal Galactic Core Bulge
      for (let i = 0; i < nCore; i++) {
        const u = i / floatSafe(nCore);
        const r = Math.pow(u, 1.6) * 65;
        const theta = phiG * i;
        const phi = Math.acos(1 - 2 * (i / floatSafe(nCore)));
        const zThickness = 0.55;

        pts[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        pts[i * 3 + 1] = r * Math.cos(phi) * zThickness;
        pts[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }

      // 2. Dual Logarithmic Spiral Arms
      for (let i = 0; i < nArms; i++) {
        const idx = nCore + i;
        const armIndex = i % 2;
        const t = (i / nArms);
        const r = 40 + Math.pow(t, 0.78) * 220;
        const armOffset = armIndex * Math.PI;
        const theta = 3.8 * Math.log(r / 25) + armOffset + (Math.sin(i * 99) * 0.18);
        const scatter = (Math.sin(i * 1234.56) * 16) * (r / 220);
        const yScatter = (Math.cos(i * 987.65) * 12) * Math.exp(-r / 160);

        pts[idx * 3 + 0] = (r + scatter) * Math.cos(theta);
        pts[idx * 3 + 1] = yScatter;
        pts[idx * 3 + 2] = (r + scatter) * Math.sin(theta);
      }
      break;
    }

    case 'SATURN': {
      // 3D Saturn: Sphere core + tilted planar concentric rings with Cassini division
      const nSphere = Math.floor(count * 0.38);
      const nRings = count - nSphere;

      // 1. Fibonacci Sphere Core
      for (let i = 0; i < nSphere; i++) {
        const yNorm = 1.0 - (i / floatSafe(nSphere - 1)) * 2.0;
        const radiusAtY = Math.sqrt(Math.max(0, 1.0 - yNorm * yNorm));
        const theta = phiG * i;
        const sphereR = 88.0;

        pts[i * 3 + 0] = sphereR * radiusAtY * Math.cos(theta);
        pts[i * 3 + 1] = sphereR * yNorm;
        pts[i * 3 + 2] = sphereR * radiusAtY * Math.sin(theta);
      }

      // 2. Concentric Planar Rings (Tilted at 27 deg) with Cassini division
      const tilt = (27.0 * Math.PI) / 180.0;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      for (let i = 0; i < nRings; i++) {
        const idx = nSphere + i;
        const u = i / nRings;
        // Inner ring B [122, 166], Cassini gap (166-178), Outer ring A [178, 230], F-ring [233, 240]
        let ringR = 0;
        if (u < 0.52) {
          ringR = 122.0 + (u / 0.52) * 44.0;
        } else if (u < 0.94) {
          const u2 = (u - 0.52) / 0.42;
          ringR = 178.0 + u2 * 52.0;
        } else {
          ringR = 233.0 + ((u - 0.94) / 0.06) * 7.0;
        }

        const phi = (i * phiG) % (Math.PI * 2.0);
        const rx = ringR * Math.cos(phi);
        const rz = ringR * Math.sin(phi);
        const ry = (i % 2 === 0 ? 1.0 : -1.0) * (0.8 + Math.sin(i * 45) * 0.6);

        pts[idx * 3 + 0] = rx;
        pts[idx * 3 + 1] = ry * cosT - rz * sinT;
        pts[idx * 3 + 2] = ry * sinT + rz * cosT;
      }
      break;
    }

    case 'WORMHOLE': {
      // Matching wormhole.png: Wireframe hyperboloid spacetime funnel with wide circular flange rims
      const nRims = Math.floor(count * 0.26);
      const nGrid = count - nRims;

      const r0 = 22.0;
      const c = 68.0;

      // 1. Hyperboloid Grid (meridians and latitudinal rings)
      for (let i = 0; i < nGrid; i++) {
        const yNorm = -1.0 + (i / floatSafe(nGrid - 1)) * 2.0;
        const y = yNorm * 185.0;
        const r = r0 * Math.sqrt(1.0 + Math.pow(y / c, 2));

        // 36 longitudinal lines + latitudinal rings
        const theta = (i % 36) * (Math.PI * 2.0 / 36.0) + (y * 0.0035);
        const rJitter = r * (0.98 + (i % 3 === 0 ? 0.04 : 0.0));

        pts[i * 3 + 0] = rJitter * Math.cos(theta);
        pts[i * 3 + 1] = y;
        pts[i * 3 + 2] = rJitter * Math.sin(theta);
      }

      // 2. Flared Top & Bottom Rims (wide circular discs)
      const halfRim = Math.floor(nRims / 2);
      for (let i = 0; i < halfRim; i++) {
        const idx = nGrid + i;
        const u = i / halfRim;
        const rRim = 175.0 + u * 60.0;
        const th = i * phiG;
        pts[idx * 3 + 0] = rRim * Math.cos(th);
        pts[idx * 3 + 1] = 185.0 + Math.sin(i * 12) * 1.5;
        pts[idx * 3 + 2] = rRim * Math.sin(th);
      }
      for (let i = 0; i < nRims - halfRim; i++) {
        const idx = nGrid + halfRim + i;
        const u = i / floatSafe(nRims - halfRim);
        const rRim = 175.0 + u * 60.0;
        const th = i * phiG;
        pts[idx * 3 + 0] = rRim * Math.cos(th);
        pts[idx * 3 + 1] = -185.0 - Math.sin(i * 12) * 1.5;
        pts[idx * 3 + 2] = rRim * Math.sin(th);
      }
      break;
    }

    case 'FACE': {
      // Matching face.png: 360-degree sculpted human head bust (cranium, brow, eyes, nose, lips, jaw, ears, neck)
      const nCranium = Math.floor(count * 0.28);
      const nFeatures = Math.floor(count * 0.44);
      const nEars = Math.floor(count * 0.10);
      const nNeck = count - (nCranium + nFeatures + nEars);
      let idx = 0;

      // 1. Skull Dome & Cranium
      for (let i = 0; i < nCranium; i++) {
        const yNorm = -0.15 + (i / floatSafe(nCranium - 1)) * 1.15; // y from -20 to 140
        const phi = Math.acos(Math.max(-1, Math.min(1, yNorm)));
        const theta = phiG * i;
        const rx = 74.0 * Math.sin(phi);
        const rz = (theta > 0 && theta < Math.PI ? 75.0 : 88.0) * Math.sin(phi); // occipital back is deeper
        const y = 30.0 + 95.0 * Math.cos(phi);

        pts[idx * 3 + 0] = rx * Math.cos(theta);
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = rz * Math.sin(theta);
        idx++;
      }

      // 2. Sculpted Facial Features (Eyes, Eyebrows, Nose, Mouth, Chin, Jaw)
      for (let i = 0; i < nFeatures; i++) {
        const u = i / floatSafe(nFeatures);
        if (u < 0.22) {
          // Nose Bridge, Tip, and Nostrils
          const tn = u / 0.22;
          const y = 30.0 - tn * 48.0; // y from +30 down to -18
          const noseProtrude = 52.0 + Math.sin(tn * Math.PI) * 35.0; // tip reaches z ~ 87
          const noseWidth = 6.0 + tn * 16.0;
          const side = i % 2 === 0 ? 1 : -1;
          const x = side * (noseWidth * 0.5 * (1.0 - (i % 4) * 0.2));

          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = noseProtrude;
        } else if (u < 0.42) {
          // Eye Sockets & Eyelids (Left and Right)
          const te = (u - 0.22) / 0.20;
          const isLeft = te < 0.5;
          const eyeT = isLeft ? te * 2.0 : (te - 0.5) * 2.0;
          const xCenter = isLeft ? -36.0 : 36.0;
          const ang = eyeT * Math.PI * 2.0;
          const x = xCenter + 16.0 * Math.cos(ang);
          const y = 20.0 + 7.5 * Math.sin(ang);
          const z = 48.0 + 6.0 * Math.cos(ang);

          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = z;
        } else if (u < 0.60) {
          // Forehead & Brow Arches
          const tb = (u - 0.42) / 0.18;
          const isLeft = tb < 0.5;
          const browT = isLeft ? tb * 2.0 : (tb - 0.5) * 2.0;
          const xCenter = isLeft ? -38.0 : 38.0;
          const xSpan = (browT - 0.5) * 34.0;
          const x = xCenter + xSpan;
          const y = 36.0 - Math.pow(browT - 0.5, 2) * 12.0;
          const z = 54.0 - Math.abs(xSpan) * 0.25;

          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = z;
        } else if (u < 0.80) {
          // Lips and Mouth
          const tm = (u - 0.60) / 0.20;
          const ang = tm * Math.PI * 2.0;
          const x = 24.0 * Math.cos(ang);
          const isUpper = Math.sin(ang) >= 0;
          const y = -34.0 + (isUpper ? 6.0 * Math.sin(ang) : 7.5 * Math.sin(ang));
          const z = 72.0 + 6.0 * Math.cos(ang);

          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = z;
        } else {
          // Chin & Jawline
          const tj = (u - 0.80) / 0.20;
          const tArch = -1.0 + tj * 2.0;
          const x = tArch * 62.0;
          const y = -65.0 + Math.pow(tArch, 2) * 45.0; // chin is lowest at y=-65, rising to y=-20 at jaw angles
          const z = 62.0 - Math.abs(tArch) * 65.0;

          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = z;
        }
        idx++;
      }

      // 3. Ears on Left & Right
      const halfEars = Math.floor(nEars / 2);
      for (let i = 0; i < halfEars; i++) {
        const te = i / halfEars;
        const ang = te * Math.PI * 1.5;
        pts[idx * 3 + 0] = -72.0 - Math.sin(ang) * 6.0;
        pts[idx * 3 + 1] = 5.0 + Math.cos(ang) * 22.0;
        pts[idx * 3 + 2] = -8.0 + Math.sin(ang) * 12.0;
        idx++;
      }
      for (let i = 0; i < nEars - halfEars; i++) {
        const te = i / floatSafe(nEars - halfEars);
        const ang = te * Math.PI * 1.5;
        pts[idx * 3 + 0] = 72.0 + Math.sin(ang) * 6.0;
        pts[idx * 3 + 1] = 5.0 + Math.cos(ang) * 22.0;
        pts[idx * 3 + 2] = -8.0 + Math.sin(ang) * 12.0;
        idx++;
      }

      // 4. Neck Column & Clavicle Collar
      for (let i = 0; i < nNeck; i++) {
        const tn = i / floatSafe(nNeck - 1);
        const y = -55.0 - tn * 95.0; // from -55 down to -150
        const th = i * phiG;
        const rNeck = 42.0 + tn * 26.0; // flares out at shoulders

        pts[idx * 3 + 0] = rNeck * Math.cos(th);
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = rNeck * Math.sin(th) * 0.85 - 10.0;
        idx++;
      }
      break;
    }

    case 'DRAGON': {
      // Matching dragon.png: Stylized 3D white dragon with horned head, spread wings, pear belly, legs & tail
      const nTorso = Math.floor(count * 0.25);
      const nHead = Math.floor(count * 0.22);
      const nWings = Math.floor(count * 0.32);
      const nLegs = Math.floor(count * 0.12);
      const nTail = count - (nTorso + nHead + nWings + nLegs);
      let idx = 0;

      // 1. Pear-Shaped Torso & Rounded Belly
      for (let i = 0; i < nTorso; i++) {
        const yNorm = -1.0 + (i / floatSafe(nTorso - 1)) * 2.0; // y from -85 to +25
        const y = -30.0 + yNorm * 55.0;
        const wBase = 62.0 * Math.sqrt(Math.max(0, 1.0 - Math.pow(yNorm, 2)));
        const th = phiG * i;
        const isBelly = Math.sin(th) > 0;
        const bellyProtrusion = isBelly ? 18.0 * Math.sin(th) * (1.0 - Math.abs(yNorm) * 0.5) : 0;

        pts[idx * 3 + 0] = wBase * Math.cos(th);
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = wBase * Math.sin(th) * 0.85 + bellyProtrusion;
        idx++;
      }

      // 2. Head, Snout, Teeth, Brow Horns & Spinal Crest
      for (let i = 0; i < nHead; i++) {
        const u = i / floatSafe(nHead);
        if (u < 0.28) {
          // Curved Horns (Left & Right)
          const th = u / 0.28;
          const isLeft = th < 0.5;
          const hornT = isLeft ? th * 2.0 : (th - 0.5) * 2.0;
          const side = isLeft ? -1.0 : 1.0;

          pts[idx * 3 + 0] = side * (24.0 + hornT * 22.0);
          pts[idx * 3 + 1] = 95.0 + hornT * 42.0;
          pts[idx * 3 + 2] = -5.0 - hornT * 45.0; // horns sweep backwards
        } else if (u < 0.50) {
          // Snout, Mouth & Teeth
          const tm = (u - 0.28) / 0.22;
          const thM = tm * Math.PI * 2.0;
          pts[idx * 3 + 0] = 22.0 * Math.cos(thM);
          pts[idx * 3 + 1] = 68.0 + 12.0 * Math.sin(thM);
          pts[idx * 3 + 2] = 25.0 + 38.0 * Math.max(0, Math.sin(thM)); // snout reaches z ~ 63
        } else {
          // Skull Cranium & Crest
          const tc = (u - 0.50) / 0.50;
          const yN = -1.0 + tc * 2.0;
          const rH = 38.0 * Math.sqrt(Math.max(0, 1.0 - yN * yN));
          const thC = tc * phiG * 24.0;
          pts[idx * 3 + 0] = rH * Math.cos(thC);
          pts[idx * 3 + 1] = 78.0 + yN * 32.0;
          pts[idx * 3 + 2] = rH * Math.sin(thC) + 8.0;
        }
        idx++;
      }

      // 3. Arched Spread Bat Wings (Left & Right)
      const halfWings = Math.floor(nWings / 2);
      for (let i = 0; i < halfWings; i++) {
        const uw = i / floatSafe(halfWings);
        const side = -1.0; // Left wing
        const armT = uw;
        const spanX = 28.0 + armT * 185.0;
        const archY = 15.0 + Math.sin(armT * Math.PI * 0.9) * 85.0 - Math.pow(armT, 2) * 75.0;
        const sweepZ = -12.0 - armT * 55.0;
        const ribScatter = (i % 4 === 0 ? -1.0 : 1.0) * (Math.sin(i * 12) * 12.0);

        pts[idx * 3 + 0] = side * spanX;
        pts[idx * 3 + 1] = archY + ribScatter;
        pts[idx * 3 + 2] = sweepZ;
        idx++;
      }
      for (let i = 0; i < nWings - halfWings; i++) {
        const uw = i / floatSafe(nWings - halfWings);
        const side = 1.0; // Right wing
        const armT = uw;
        const spanX = 28.0 + armT * 185.0;
        const archY = 15.0 + Math.sin(armT * Math.PI * 0.9) * 85.0 - Math.pow(armT, 2) * 75.0;
        const sweepZ = -12.0 - armT * 55.0;
        const ribScatter = (i % 4 === 0 ? -1.0 : 1.0) * (Math.sin(i * 12) * 12.0);

        pts[idx * 3 + 0] = side * spanX;
        pts[idx * 3 + 1] = archY + ribScatter;
        pts[idx * 3 + 2] = sweepZ;
        idx++;
      }

      // 4. Sturdy Short Legs & Clawed Feet
      const halfLegs = Math.floor(nLegs / 2);
      for (let i = 0; i < halfLegs; i++) {
        const ul = i / floatSafe(halfLegs);
        pts[idx * 3 + 0] = -38.0 + Math.sin(ul * 8) * 14.0;
        pts[idx * 3 + 1] = -80.0 - ul * 65.0; // ground at y=-145
        pts[idx * 3 + 2] = 5.0 + ul * 24.0;
        idx++;
      }
      for (let i = 0; i < nLegs - halfLegs; i++) {
        const ul = i / floatSafe(nLegs - halfLegs);
        pts[idx * 3 + 0] = 38.0 + Math.sin(ul * 8) * 14.0;
        pts[idx * 3 + 1] = -80.0 - ul * 65.0;
        pts[idx * 3 + 2] = 5.0 + ul * 24.0;
        idx++;
      }

      // 5. Curving Tail
      for (let i = 0; i < nTail; i++) {
        const ut = i / floatSafe(nTail - 1);
        const tailX = Math.sin(ut * Math.PI * 1.5) * 45.0;
        const tailY = -75.0 - ut * 40.0 + Math.sin(ut * Math.PI) * 18.0;
        const tailZ = -28.0 - ut * 140.0; // tail sweeps back
        pts[idx * 3 + 0] = tailX;
        pts[idx * 3 + 1] = tailY;
        pts[idx * 3 + 2] = tailZ;
        idx++;
      }
      break;
    }

    case 'HEART': {
      // Matching heart.png: Anatomical heart (ventricles, apex, aorta arch, carotid branches, pulmonary trunk, coronary arteries)
      const nVentricles = Math.floor(count * 0.44);
      const nAorta = Math.floor(count * 0.26);
      const nPulmonary = Math.floor(count * 0.16);
      const nCoronary = count - (nVentricles + nAorta + nPulmonary);
      let idx = 0;

      // 1. Muscular Ventricular Body & Apex
      for (let i = 0; i < nVentricles; i++) {
        const u = i / floatSafe(nVentricles);
        const yNorm = -1.0 + u * 1.8; // y from -135 up to +25
        const y = -45.0 + yNorm * 55.0;
        const conicalTaper = Math.max(0.1, (y + 135.0) / 160.0);
        const rV = 68.0 * Math.pow(conicalTaper, 0.72);
        const th = phiG * i;
        const apexTiltX = -28.0 * (1.0 - conicalTaper);

        pts[idx * 3 + 0] = apexTiltX + rV * Math.cos(th);
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = rV * Math.sin(th) * 0.85;
        idx++;
      }

      // 2. Aortic Arch & Ascending Carotid Arteries
      for (let i = 0; i < nAorta; i++) {
        const u = i / floatSafe(nAorta);
        if (u < 0.70) {
          // Cane-handle Aorta Arch
          const tArch = (u / 0.70) * Math.PI * 1.1; // loops up and over
          const archR = 48.0;
          const x = -8.0 + archR * Math.cos(tArch);
          const y = 35.0 + archR * Math.sin(tArch);
          const z = -10.0 - (tArch / Math.PI) * 45.0;
          const rTube = 16.0;
          const thTube = i * 0.8;

          pts[idx * 3 + 0] = x + rTube * Math.cos(thTube);
          pts[idx * 3 + 1] = y + rTube * Math.sin(thTube);
          pts[idx * 3 + 2] = z + rTube * 0.4 * Math.sin(thTube);
        } else {
          // 3 Upward Carotid Arterial Branches
          const tb = (u - 0.70) / 0.30;
          const branchIndex = Math.floor(tb * 3);
          const tBranch = (tb * 3) % 1.0;
          const bx = -22.0 + branchIndex * 20.0;
          const by = 82.0 + tBranch * 45.0;
          const bz = -5.0 + branchIndex * 5.0;

          pts[idx * 3 + 0] = bx + (i % 2 === 0 ? 3.0 : -3.0);
          pts[idx * 3 + 1] = by;
          pts[idx * 3 + 2] = bz;
        }
        idx++;
      }

      // 3. Pulmonary Artery Trunk & Vena Cava
      for (let i = 0; i < nPulmonary; i++) {
        const u = i / floatSafe(nPulmonary);
        if (u < 0.65) {
          // Pulmonary trunk crossing horizontally under aorta
          const tp = u / 0.65;
          const x = -35.0 + tp * 75.0;
          const y = 25.0 + Math.sin(tp * Math.PI) * 15.0;
          const z = 18.0 - tp * 35.0;
          pts[idx * 3 + 0] = x + Math.sin(i * 12) * 8.0;
          pts[idx * 3 + 1] = y + Math.cos(i * 12) * 8.0;
          pts[idx * 3 + 2] = z;
        } else {
          // Superior Vena Cava
          const tv = (u - 0.65) / 0.35;
          pts[idx * 3 + 0] = 45.0 + Math.sin(i * 8) * 9.0;
          pts[idx * 3 + 1] = 40.0 + tv * 60.0;
          pts[idx * 3 + 2] = -12.0 + Math.cos(i * 8) * 9.0;
        }
        idx++;
      }

      // 4. Coronary Arterial Tree
      for (let i = 0; i < nCoronary; i++) {
        const tc = i / floatSafe(nCoronary);
        const y = 15.0 - tc * 120.0;
        const x = -15.0 + Math.sin(tc * 14.0) * 22.0 - tc * 15.0;
        const z = 42.0 * (1.0 - tc * 0.7);
        pts[idx * 3 + 0] = x;
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = z;
        idx++;
      }
      break;
    }

    case 'BUILDING': {
      // Matching house.png: Modern Art-Deco apartment building with 3-tier curved balconies & rooftop antenna
      const nBalconies = Math.floor(count * 0.38);
      const nFacade = Math.floor(count * 0.42);
      const nRooftop = count - (nBalconies + nFacade);
      let idx = 0;

      // 1. Three Tiers of Curved Balconies on Left & Rectangular Balconies on Right
      const floors = [-75.0, -15.0, 45.0];
      const perBalcony = Math.floor(nBalconies / 6);
      for (let f = 0; f < 3; f++) {
        const floorY = floors[f];
        // Left semicircular balconies
        for (let i = 0; i < perBalcony; i++) {
          const th = (i / floatSafe(perBalcony - 1)) * Math.PI;
          const rBalc = 48.0;
          const x = -90.0 + rBalc * Math.cos(th);
          const z = 25.0 + rBalc * Math.sin(th);
          const yOffset = (i % 3 === 0 ? 14.0 : 0.0); // railing height
          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = floorY + yOffset;
          pts[idx * 3 + 2] = z;
          idx++;
        }
        // Right rectangular balconies
        for (let i = 0; i < perBalcony; i++) {
          const u = i / floatSafe(perBalcony - 1);
          const x = 35.0 + u * 75.0;
          const z = 70.0;
          const yOffset = (i % 3 === 0 ? 14.0 : 0.0);
          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = floorY + yOffset;
          pts[idx * 3 + 2] = z;
          idx++;
        }
      }

      // 2. Main Building Façade, Windows, Walls, Entrance
      for (let i = 0; i < nFacade; i++) {
        const x = -135.0 + (i % 50) * 5.5;
        const y = -130.0 + Math.floor(i / 50) * 4.8;
        const zWall = (i % 2 === 0 ? 25.0 : -45.0);
        pts[idx * 3 + 0] = x;
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = zWall;
        idx++;
      }

      // 3. Rooftop Elevator Tower & Antenna Mast
      for (let i = 0; i < nRooftop; i++) {
        const ur = i / floatSafe(nRooftop);
        if (ur < 0.65) {
          // Penthouse mechanical tower
          const x = -75.0 + (i % 20) * 2.8;
          const y = 95.0 + Math.floor(i / 20) * 3.5;
          const z = -15.0 + (i % 5) * 6.0;
          pts[idx * 3 + 0] = x;
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = z;
        } else {
          // Antenna Mast rising to y=190
          const ua = (ur - 0.65) / 0.35;
          pts[idx * 3 + 0] = -48.0 + ((i % 4 === 0) ? (i % 2 === 0 ? 16 : -16) : 0);
          pts[idx * 3 + 1] = 135.0 + ua * 55.0;
          pts[idx * 3 + 2] = 0.0;
        }
        idx++;
      }
      break;
    }

    case 'MOUNTAIN':
    case 'CITY': {
      // Matching mountain.png: Alpine mountain massif with towering sharp peak, spires, steep jagged arêtes & rock talus
      for (let i = 0; i < count; i++) {
        const u = i / floatSafe(count);
        const th = i * phiG;
        const rBase = Math.sqrt(u) * 230.0;

        // Peak height function: sharp Matterhorn central horn + radial arêtes + secondary spires
        const centerDist = rBase;
        const mainPeakH = Math.exp(-Math.pow(centerDist / 68.0, 2)) * 265.0;

        // 4 craggy arêtes running down radially
        const ridgeEffect = Math.pow(Math.abs(Math.cos(th * 2.0)), 3.0) * Math.exp(-centerDist / 120.0) * 65.0;

        // Secondary sub-peaks
        const dSub1 = Math.hypot(rBase * Math.cos(th) - (-65), rBase * Math.sin(th) - (-20));
        const subPeak1 = Math.exp(-Math.pow(dSub1 / 38.0, 2)) * 125.0;

        const dSub2 = Math.hypot(rBase * Math.cos(th) - 55, rBase * Math.sin(th) - 35);
        const subPeak2 = Math.exp(-Math.pow(dSub2 / 34.0, 2)) * 110.0;

        // Craggy rocky noise
        const rockNoise = Math.sin(rBase * 0.22) * 12.0 + Math.cos(th * 9.0) * 8.0;

        const y = -120.0 + mainPeakH + ridgeEffect + subPeak1 + subPeak2 + rockNoise;

        pts[i * 3 + 0] = rBase * Math.cos(th);
        pts[i * 3 + 1] = y;
        pts[i * 3 + 2] = rBase * Math.sin(th);
      }
      break;
    }

    case 'BLACKHOLE': {
      // Matching blackhole.png: Gargantua black hole (event horizon void, swirling accretion disk & lensing arch)
      const nDisk = Math.floor(count * 0.68);
      const nLensing = count - nDisk;

      // 1. Swirling Equatorial Accretion Disk (outside event horizon R > 52)
      for (let i = 0; i < nDisk; i++) {
        const u = i / floatSafe(nDisk);
        const r = 54.0 + Math.pow(u, 0.85) * 185.0;
        const th = u * 48.0 * Math.PI;
        const yDisk = Math.sin(u * 180.0) * 3.5;

        pts[i * 3 + 0] = r * Math.cos(th);
        pts[i * 3 + 1] = yDisk;
        pts[i * 3 + 2] = r * Math.sin(th);
      }

      // 2. Upper and Lower Gravitational Lensing Arches (bent spacetime light)
      const halfLens = Math.floor(nLensing / 2);
      for (let i = 0; i < halfLens; i++) {
        const idx = nDisk + i;
        const t = (i / floatSafe(halfLens - 1)) * Math.PI;
        const rLens = 65.0 + Math.sin(t) * 55.0;
        pts[idx * 3 + 0] = rLens * Math.cos(t);
        pts[idx * 3 + 1] = 48.0 + Math.sin(t) * 82.0; // arch curving over event horizon
        pts[idx * 3 + 2] = Math.sin(t * 3.0) * 10.0;
      }
      for (let i = 0; i < nLensing - halfLens; i++) {
        const idx = nDisk + halfLens + i;
        const t = (i / floatSafe(nLensing - halfLens - 1)) * Math.PI;
        const rLens = 65.0 + Math.sin(t) * 55.0;
        pts[idx * 3 + 0] = rLens * Math.cos(t);
        pts[idx * 3 + 1] = -(48.0 + Math.sin(t) * 82.0); // arch curving beneath event horizon
        pts[idx * 3 + 2] = Math.sin(t * 3.0) * 10.0;
      }
      break;
    }

    case 'TEXT': {
      // 3D Volumetric Typography 'KENNU' (Replaced from 'I LOVE YOU')
      const segments = [
        // K
        [-190, -50, -190, 50], [-185, -50, -185, 50],
        [-185, 0, -135, -50], [-185, 0, -135, 50],
        [-185, -5, -140, -50], [-185, 5, -140, 50],
        // E
        [-115, -50, -115, 50], [-110, -50, -110, 50],
        [-115, -50, -65, -50], [-115, 0, -72, 0], [-115, 50, -65, 50],
        // First N
        [-45, -50, -45, 50], [-45, -50, 10, 50], [10, -50, 10, 50],
        [-40, -50, -40, 50], [5, -50, 5, 50],
        // Second N
        [35, -50, 35, 50], [35, -50, 90, 50], [90, -50, 90, 50],
        [40, -50, 40, 50], [85, -50, 85, 50],
        // U
        [115, -50, 115, 25], [175, -50, 175, 25],
        [120, -50, 120, 25], [170, -50, 170, 25],
        [115, 25, 130, 50], [130, 50, 160, 50], [160, 50, 175, 25],
      ];

      const perSeg = Math.floor(count / segments.length);
      let idx = 0;
      for (const seg of segments) {
        const [x0, y0, x1, y1] = seg;
        for (let j = 0; j < perSeg && idx < count; j++) {
          const t = j / floatSafe(perSeg);
          const zDepth = ((j % 7) - 3.0) * 6.0;
          pts[idx * 3 + 0] = (x0 + t * (x1 - x0)) * 1.12;
          pts[idx * 3 + 1] = -(y0 + t * (y1 - y0)) * 1.12;
          pts[idx * 3 + 2] = zDepth;
          idx++;
        }
      }
      while (idx < count) {
        pts[idx * 3 + 0] = 0;
        pts[idx * 3 + 1] = 0;
        pts[idx * 3 + 2] = 0;
        idx++;
      }
      break;
    }

    case 'COBRA': {
      // 3D King Cobra Snake (Matching Image 4):
      // 1. Double spiral coiled ground base
      // 2. Upright S-curved muscular column
      // 3. Wide flared concave cervical hood with dorsal chevron spectacles
      // 4. Raised striking head with open jaws, twin curved venom fangs & forked tongue
      const nBase = Math.floor(count * 0.32);
      const nNeck = Math.floor(count * 0.22);
      const nHood = Math.floor(count * 0.28);
      const nHead = count - (nBase + nNeck + nHood);
      let idx = 0;

      // 1. Coiled Base Foundation (Spiral on ground at y=-145 to -95)
      for (let i = 0; i < nBase; i++) {
        const u = i / floatSafe(nBase - 1);
        const theta = u * 5.6 * Math.PI;
        const rSpiral = 40.0 + Math.pow(u, 0.85) * 155.0;
        const rTube = 8.0 + u * 10.0 + Math.sin(u * 120.0) * 1.2;
        const phi = (i * phiG) % (Math.PI * 2.0);

        pts[idx * 3 + 0] = (rSpiral + rTube * Math.cos(phi)) * Math.cos(theta);
        pts[idx * 3 + 1] = -145.0 + u * 48.0 + rTube * Math.sin(phi);
        pts[idx * 3 + 2] = (rSpiral + rTube * Math.cos(phi)) * Math.sin(theta);
        idx++;
      }

      // 2. Upright S-Curved Neck Column (y = -97 to +10)
      for (let i = 0; i < nNeck; i++) {
        const u = i / floatSafe(nNeck - 1);
        const y = -97.0 + u * 107.0;
        const zCenter = -14.0 + Math.sin(u * Math.PI * 1.4) * 26.0;
        const xCenter = Math.sin(u * Math.PI * 0.8) * 8.0;
        const rNeck = 17.0 - u * 2.0;
        const phi = (i * phiG) % (Math.PI * 2.0);

        // Ventral belly flattening on front
        const cosP = Math.cos(phi);
        const radX = rNeck * (cosP > 0.2 ? 1.15 : 1.0);
        const radZ = rNeck * (cosP > 0.2 ? 0.85 : 1.0);

        pts[idx * 3 + 0] = xCenter + radX * Math.sin(phi);
        pts[idx * 3 + 1] = y;
        pts[idx * 3 + 2] = zCenter + radZ * cosP;
        idx++;
      }

      // 3. Wide Flared Concave Cobra Cervical Hood (y = 10 to 95)
      for (let i = 0; i < nHood; i++) {
        const u = i / floatSafe(nHood - 1);
        const y = 10.0 + u * 85.0;
        const maxFlare = Math.sin(u * Math.PI) ** 0.65 * 92.0;
        const pNorm = ((i % 100) / 50.0 - 1.0);
        const xRel = pNorm * maxFlare;
        const zCurvature = 8.0 - Math.pow(xRel / Math.max(1.0, maxFlare), 2.0) * 16.0;
        const ribNoise = Math.sin(u * 28.0) * 2.0;

        // Dorsal King Cobra Spectacle Eyespot markings
        const isDorsalSpectacle = Math.abs(xRel) > 28.0 && Math.abs(xRel) < 46.0 && y > 52.0 && y < 72.0 && (i % 3 === 0);
        const zMarking = isDorsalSpectacle ? -6.0 : 0.0;

        pts[idx * 3 + 0] = xRel;
        pts[idx * 3 + 1] = y + ribNoise;
        pts[idx * 3 + 2] = zCurvature + zMarking;
        idx++;
      }

      // 4. Striking Head, Brow, Jaws, Venom Fangs & Forked Tongue (y = 88 to 125)
      for (let i = 0; i < nHead; i++) {
        const u = i / floatSafe(nHead - 1);
        if (u < 0.45) {
          // Cranium & Snout (Triangular wedge skull)
          const uh = u / 0.45;
          const y = 92.0 + uh * 28.0;
          const wSkull = 32.0 * (1.0 - uh * 0.55);
          const thS = (i * phiG) % (Math.PI * 2.0);
          pts[idx * 3 + 0] = wSkull * Math.cos(thS);
          pts[idx * 3 + 1] = y;
          pts[idx * 3 + 2] = 12.0 + uh * 32.0 + Math.sin(thS) * 12.0;
        } else if (u < 0.62) {
          // Open Lower Jaw (Dropped in hiss/strike)
          const uj = (u - 0.45) / 0.17;
          const thJ = (i % 2 === 0 ? 1 : -1) * (uj * 14.0);
          pts[idx * 3 + 0] = thJ;
          pts[idx * 3 + 1] = 84.0 - uj * 6.0;
          pts[idx * 3 + 2] = 20.0 + uj * 22.0;
        } else if (u < 0.78) {
          // Twin Curved Venom Fangs (Left & Right hanging down from maxilla)
          const uf = (u - 0.62) / 0.16;
          const side = (i % 2 === 0 ? -1.0 : 1.0);
          pts[idx * 3 + 0] = side * (8.5 - uf * 1.5);
          pts[idx * 3 + 1] = 100.0 - uf * 18.0; // fangs descend downward
          pts[idx * 3 + 2] = 34.0 - Math.sin(uf * Math.PI * 0.5) * 4.0; // recurved fang
        } else {
          // Forked Snake Tongue projecting forward
          const ut = (u - 0.78) / 0.22;
          const fork = ut > 0.6 ? ((i % 2 === 0 ? -1.0 : 1.0) * (ut - 0.6) * 22.0) : 0;
          pts[idx * 3 + 0] = fork;
          pts[idx * 3 + 1] = 90.0 + Math.sin(ut * Math.PI) * 3.0;
          pts[idx * 3 + 2] = 32.0 + ut * 34.0; // flicking tongue projecting forward to z ~ 66
        }
        idx++;
      }
      break;
    }
  }

  return pts;
}

function floatSafe(v: number): number {
  return Math.max(1, v);
}

export const GESTURE_CATALOG: Array<{
  id: ShapeMode;
  name: string;
  gestureName: string;
  triggerDescription: string;
  handIcon: string;
  badgeColor: string;
  accentHex: string;
  colors: [string, string, string];
}> = [
  {
    id: 'IDLE',
    name: 'Floating Dust Galaxy',
    gestureName: 'Open Palm',
    triggerDescription: 'All 5 fingers extended, cosmic galactic spiral disc',
    handIcon: '✋',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentHex: '#34d399',
    colors: ['#00f0ff', '#70d6ff', '#ffffff'],
  },
  {
    id: 'SATURN',
    name: '3D Saturn (saturn.png)',
    gestureName: 'Pointing Up',
    triggerDescription: 'Index finger pointing up, planet core + tilted planar rings with Cassini gap',
    handIcon: '☝️',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentHex: '#fbbf24',
    colors: ['#fb8500', '#ffb703', '#ffe49e'],
  },
  {
    id: 'WORMHOLE',
    name: '3D Wormhole (wormhole.png)',
    gestureName: 'Pointing Down',
    triggerDescription: 'Index pointing down, hyperbolic dual-funnel with wide circular rims',
    handIcon: '👇',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentHex: '#22d3ee',
    colors: ['#4cc9f0', '#7209b7', '#f72585'],
  },
  {
    id: 'FACE',
    name: '3D Human Face (face.png)',
    gestureName: 'Thumbs Up',
    triggerDescription: 'Thumb pointing up, sculpted 360° head bust with ears, nose & jaw',
    handIcon: '👍',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentHex: '#818cf8',
    colors: ['#00f5d4', '#00bbf9', '#7b2cbf'],
  },
  {
    id: 'DRAGON',
    name: '3D Dragon (dragon.png)',
    gestureName: 'Fist',
    triggerDescription: 'Fist closed, horned head, bat wings, pear belly, claws & tail',
    handIcon: '✊',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    accentHex: '#f97316',
    colors: ['#06d6a0', '#ffd166', '#ef476f'],
  },
  {
    id: 'HEART',
    name: 'Anatomical Heart (heart.png)',
    gestureName: 'Peace Sign (V)',
    triggerDescription: 'Index & Middle in V shape, aorta arch, carotid branches & ventricles',
    handIcon: '✌️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentHex: '#f43f5e',
    colors: ['#ff0055', '#ff2a6d', '#ff758f'],
  },
  {
    id: 'BUILDING',
    name: 'Art-Deco House (house.png)',
    gestureName: 'OK Sign',
    triggerDescription: 'Thumb & Index pinch, 3-tier curved balconies & rooftop antenna',
    handIcon: '👌',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    accentHex: '#38bdf8',
    colors: ['#00f0ff', '#ffffff', '#0284c7'],
  },
  {
    id: 'MOUNTAIN',
    name: 'Alpine Mountain (mountain.png)',
    gestureName: '3 Fingers Raised',
    triggerDescription: 'Index, Middle & Ring raised, jagged Matterhorn peak & spires',
    handIcon: '🤞',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    accentHex: '#2dd4bf',
    colors: ['#2a9d8f', '#8ecae6', '#ffd166'],
  },
  {
    id: 'BLACKHOLE',
    name: 'Gargantua (blackhole.png)',
    gestureName: 'Thumbs Down',
    triggerDescription: 'Thumb pointing down, event horizon void & gravitational lensing arch',
    handIcon: '👎',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentHex: '#a855f7',
    colors: ['#ff9e00', '#e85d04', '#3a0ca3'],
  },
  {
    id: 'TEXT',
    name: '3D "KENNU"',
    gestureName: 'Rock / Love Sign',
    triggerDescription: 'Thumb, Index & Pinky raised, glowing 3D KENNU typography',
    handIcon: '🤟',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentHex: '#06b6d4',
    colors: ['#22d3ee', '#ffffff', '#a855f7'],
  },
  {
    id: 'COBRA',
    name: '3D Cobra Snake',
    gestureName: 'Cobra Fangs / Claw',
    triggerDescription: 'Index & Middle curled forward like fangs, reared hood & strike jaws (Image 3 & 4)',
    handIcon: '🐍',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentHex: '#eab308',
    colors: ['#fef08a', '#eab308', '#22d3ee'],
  },
];
