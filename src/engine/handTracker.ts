/**
 * Hand Tracking & Gesture Classification Engine for the Browser
 * Mirroring the exact MediaPipe landmark geometry in main.py
 */
import { ShapeMode } from '../types';

export interface HandTrackingResult {
  isHandPresent: boolean;
  anchorX: number;
  anchorY: number;
  pitch: number;
  roll: number;
  gesture: ShapeMode;
  confidence: number;
  landmarks?: Array<{ x: number; y: number; z: number }>;
}

export class BrowserHandTracker {
  private lastGesture: ShapeMode = 'IDLE';
  private debounceCount: number = 0;
  private readonly DEBOUNCE_FRAMES = 3;

  public classifyLandmarks(
    landmarks: Array<{ x: number; y: number; z: number }>,
    videoWidth: number,
    videoHeight: number
  ): HandTrackingResult {
    if (!landmarks || landmarks.length < 21) {
      return {
        isHandPresent: false,
        anchorX: videoWidth / 2,
        anchorY: videoHeight / 2,
        pitch: 0,
        roll: 0,
        gesture: this.lastGesture,
        confidence: 0,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];

    // Anchor: palm center
    const anchorX = (wrist.x + middleMcp.x) * 0.5 * videoWidth;
    const anchorY = (wrist.y + middleMcp.y) * 0.5 * videoHeight;

    // Hand tilt angles
    const dx = middleMcp.x - wrist.x;
    const dy = middleMcp.y - wrist.y;
    const roll = Math.atan2(dx, -dy);
    const pitch = (wrist.y - 0.5) * 1.5;

    // Finger extensions
    const indexExt = indexTip.y < indexPip.y && indexPip.y < indexMcp.y;
    const middleExt = middleTip.y < middlePip.y && middlePip.y < middleMcp.y;
    const ringExt = ringTip.y < ringPip.y && ringPip.y < ringMcp.y;
    const pinkyExt = pinkyTip.y < pinkyPip.y && pinkyPip.y < pinkyMcp.y;

    const thumbIndexDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const indexMiddleDist = Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y);

    const thumbUp = thumbTip.y < thumbMcp.y - 0.08 && thumbTip.y < indexMcp.y;
    const thumbDown = thumbTip.y > wrist.y + 0.04 && thumbTip.y > indexMcp.y + 0.04;
    const indexPointingDown = indexTip.y > indexPip.y && indexPip.y > indexMcp.y && indexTip.y > wrist.y - 0.05;

    let rawGesture: ShapeMode = 'IDLE';

    // Cobra Fangs Sign (Image 3): Index & Middle MCP-PIP elevated, but tips curled/hooked down like venom fangs
    const dPipIndex = Math.hypot(indexPip.x - wrist.x, indexPip.y - wrist.y);
    const dMcpIndex = Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y);
    const dPipMid = Math.hypot(middlePip.x - wrist.x, middlePip.y - wrist.y);
    const dMcpMid = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y);
    const indexPipExtended = dPipIndex > dMcpIndex * 1.12;
    const middlePipExtended = dPipMid > dMcpMid * 1.12;
    const indexHooked = indexTip.y > indexPip.y - 0.035;
    const middleHooked = middleTip.y > middlePip.y - 0.035;

    // 1. Cobra Fangs -> COBRA (Matching Image 3 & 4)
    if (indexPipExtended && middlePipExtended && !ringExt && !pinkyExt && (indexHooked || middleHooked)) {
      rawGesture = 'COBRA';
    }
    // 2. OK Sign -> BUILDING (Modern Art-Deco Apartment)
    else if (thumbIndexDist < 0.075 && middleExt && ringExt && pinkyExt) {
      rawGesture = 'BUILDING';
    }
    // 3. 3 Fingers Raised / Crossed -> CITY (Skyscrapers)
    else if (indexExt && middleExt && ringExt && !pinkyExt) {
      rawGesture = 'CITY';
    }
    // 4. Peace Sign -> HEART
    else if (indexExt && middleExt && !ringExt && !pinkyExt && indexMiddleDist >= 0.038) {
      rawGesture = 'HEART';
    }
    // 5. Pointing Down -> WORMHOLE
    else if (indexPointingDown && !middleExt && !ringExt && !pinkyExt) {
      rawGesture = 'WORMHOLE';
    }
    // 6. Pointing Up -> SATURN
    else if (indexExt && !middleExt && !ringExt && !pinkyExt && !thumbUp) {
      rawGesture = 'SATURN';
    }
    // 7. Thumbs Up -> FACE
    else if (thumbUp && !indexExt && !middleExt && !ringExt && !pinkyExt) {
      rawGesture = 'FACE';
    }
    // 8. Thumbs Down -> BLACKHOLE
    else if (thumbDown && !indexExt && !middleExt && !ringExt && !pinkyExt) {
      rawGesture = 'BLACKHOLE';
    }
    // 9. Rock / Love Sign -> TEXT ("KENNU")
    else if (thumbUp && indexExt && !middleExt && !ringExt && pinkyExt) {
      rawGesture = 'TEXT';
    }
    // 10. Fist -> DRAGON
    else if (
      !indexExt &&
      !middleExt &&
      !ringExt &&
      !pinkyExt &&
      Math.hypot(wrist.x - middleTip.x, wrist.y - middleTip.y) < 0.22
    ) {
      rawGesture = 'DRAGON';
    }
    // 0. Open Palm -> IDLE
    else if (indexExt && middleExt && ringExt && pinkyExt) {
      rawGesture = 'IDLE';
    } else {
      rawGesture = this.lastGesture;
    }

    // Debounce to eliminate jitter
    if (rawGesture === this.lastGesture) {
      this.debounceCount = Math.max(this.debounceCount + 1, this.DEBOUNCE_FRAMES);
    } else {
      this.debounceCount--;
      if (this.debounceCount <= 0) {
        this.lastGesture = rawGesture;
        this.debounceCount = this.DEBOUNCE_FRAMES;
      }
    }

    return {
      isHandPresent: true,
      anchorX,
      anchorY,
      pitch,
      roll,
      gesture: this.lastGesture,
      confidence: 0.95,
      landmarks,
    };
  }
}
