/**
 * PULSE Web Audio Metronome Engine
 * High-precision lookahead scheduler utilizing AudioContext clock to prevent drift.
 * Supports woodblock, hihat, beep, rimshot, 1x/2x multiplier, and phase nudging.
 */

export type MetronomeSoundType = 'woodblock' | 'hihat' | 'beep' | 'rimshot';

export class PulseMetronome {
  private audioCtx: AudioContext | null = null;
  public bpm: number = 160;
  public multiplier: 1 | 2 = 1;
  public isPlaying: boolean = false;
  public volume: number = 0.8;
  public soundType: MetronomeSoundType = 'woodblock';

  // Lookahead timing configuration
  private lookaheadMs: number = 25.0; // Interval to check for upcoming notes
  private scheduleAheadSec: number = 0.1; // Scheduling window ahead of currentTime
  private nextNoteTime: number = 0.0;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private beatCount: number = 0;
  public phaseOffsetSec: number = 0.0;

  private onBeatListeners: Set<(count: number, effectiveBpm: number) => void> = new Set();

  constructor() {}

  public initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getEffectiveBpm(): number {
    return this.bpm * this.multiplier;
  }

  public start(bpm?: number, multiplier?: 1 | 2, initialDelaySec: number = 0): void {
    const ctx = this.initAudioContext();
    if (bpm) this.bpm = Math.max(30, Math.min(300, bpm));
    if (multiplier) this.multiplier = multiplier;

    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.beatCount = 0;

    // Align start time to current audio time + safety margin + phase offset
    this.nextNoteTime = ctx.currentTime + 0.04 + initialDelaySec + this.phaseOffsetSec;
    if (this.nextNoteTime < ctx.currentTime) {
      this.nextNoteTime = ctx.currentTime + 0.02;
    }

    this.scheduler();
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setBpm(bpm: number): void {
    this.bpm = Math.max(30, Math.min(300, Number(bpm) || 120));
  }

  public setMultiplier(multiplier: 1 | 2): void {
    this.multiplier = multiplier;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, Number(vol)));
  }

  public setSoundType(type: MetronomeSoundType): void {
    this.soundType = type;
  }

  public nudgePhase(deltaSec: number): void {
    this.phaseOffsetSec += deltaSec;
    // Clamp phase offset within -0.5s to +0.5s
    this.phaseOffsetSec = Math.max(-0.5, Math.min(0.5, this.phaseOffsetSec));
    this.nextNoteTime += deltaSec;
  }

  public resetPhase(): void {
    this.phaseOffsetSec = 0.0;
    if (this.audioCtx && this.isPlaying) {
      this.nextNoteTime = this.audioCtx.currentTime + 0.02;
    }
  }

  public syncToPlayhead(): void {
    if (this.audioCtx && this.isPlaying) {
      this.nextNoteTime = this.audioCtx.currentTime + 0.02;
      this.beatCount = 0;
    }
  }

  public onBeat(callback: (count: number, effectiveBpm: number) => void): () => void {
    this.onBeatListeners.add(callback);
    return () => this.onBeatListeners.delete(callback);
  }

  private notifyBeat(time: number, count: number): void {
    if (!this.audioCtx) return;
    const delayMs = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying) {
        const effBpm = this.getEffectiveBpm();
        this.onBeatListeners.forEach((cb) => {
          try {
            cb(count, effBpm);
          } catch (e) {
            console.error('Error in metronome beat callback:', e);
          }
        });
      }
    }, delayMs);
  }

  private scheduleNextTick(): void {
    const effectiveBpm = this.getEffectiveBpm();
    const secondsPerBeat = 60.0 / effectiveBpm;
    this.nextNoteTime += secondsPerBeat;
    const beatsPerBar = this.multiplier === 2 ? 8 : 4;
    this.beatCount = (this.beatCount + 1) % beatsPerBar;
  }

  private playClick(time: number, isAccent: boolean = false): void {
    if (!this.audioCtx || this.volume <= 0.001) return;

    const ctx = this.audioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, time);
    masterGain.connect(ctx.destination);

    if (this.soundType === 'woodblock') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = isAccent ? 1400 : 1050;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, time);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, time + 0.035);

      gain.gain.setValueAtTime(1.0, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.05);
    } else if (this.soundType === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = isAccent ? 1200 : 880;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.9, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.055);
    } else if (this.soundType === 'hihat') {
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(isAccent ? 7000 : 5000, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(time);
      noise.stop(time + 0.04);
    } else {
      // Rimshot
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(isAccent ? 2200 : 1600, time);

      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.025);
    }
  }

  private scheduler(): void {
    if (!this.isPlaying || !this.audioCtx) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadSec) {
      const isAccent = this.beatCount === 0;
      this.playClick(this.nextNoteTime, isAccent);
      this.notifyBeat(this.nextNoteTime, this.beatCount);
      this.scheduleNextTick();
    }

    this.timerId = setTimeout(() => this.scheduler(), this.lookaheadMs);
  }
}

// Global singleton instance for client-side use
let metronomeInstance: PulseMetronome | null = null;

export function getMetronome(): PulseMetronome {
  if (typeof window === 'undefined') {
    return new PulseMetronome();
  }
  if (!metronomeInstance) {
    metronomeInstance = new PulseMetronome();
  }
  return metronomeInstance;
}
