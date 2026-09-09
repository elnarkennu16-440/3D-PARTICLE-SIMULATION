/**
 * Ethereal Web Audio Synthesizer for Particle Dust Morphing
 */

class SoundEffectsController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public playMorphSound(intensity: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Ethereal Sub-Bass Resonator (Cosmic swirl)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(260, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.9);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.12 * intensity, now + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.95);

      // 2. High Shimmer Chime (Dust crystallization)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(620, now);
      osc2.frequency.exponentialRampToValueAtTime(1240, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.7);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.75);

    } catch {
      // Audio context might be restricted before user gesture
    }
  }
}

export const soundFx = new SoundEffectsController();
