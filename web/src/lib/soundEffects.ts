/**
 * Pulse Interactive Web Audio SFX Engine
 * Zero-latency synthesized sound effects for running & tempo interactions.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  // Metronome scheduler state
  private metronomeTimer: number | null = null;
  private isMetronomeRunning: boolean = false;
  private currentBpm: number = 160;
  private nextBeatTime: number = 0;
  private currentBeatIndex: number = 0;
  private onBeatCallback: ((beatIndex: number) => void) | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Autoplay policy may defer until user gesture
      });
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted && this.isMetronomeRunning) {
      this.stopMetronome();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Crisp short mechanical dial click (10-15ms)
   * Frequency scales subtly with BPM (400 + bpm * 3 Hz)
   */
  public playDialTick(bpm: number = 160): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Frequency calculation: 400 + bpm * 3 (e.g. 120bpm -> 760Hz, 180bpm -> 940Hz)
      const baseFreq = Math.max(300, Math.min(1300, 400 + (bpm || 160) * 3));
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);

      // Tight bandpass filter for a crisp mechanical ratchet sound
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Punchy drum pad hit:
   * Low sine pitch-drop kick + crisp hi-hat transient.
   * Every 4th tap has an accent pitch and extra punch!
   */
  public playTapKick(tapCount: number = 1): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const isAccent = tapCount > 0 && tapCount % 4 === 0;

      // 1. Low Sine Kick with rapid pitch drop
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();

      const startFreq = isAccent ? 175 : 135;
      const endFreq = isAccent ? 44 : 38;
      const kickDuration = isAccent ? 0.16 : 0.13;
      const kickVol = isAccent ? 0.42 : 0.3;

      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(startFreq, now);
      kickOsc.frequency.exponentialRampToValueAtTime(endFreq, now + kickDuration);

      kickGain.gain.setValueAtTime(kickVol, now);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + kickDuration + 0.02);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + kickDuration + 0.03);

      // 2. Crisp Transient Hat / Click for tactile snap
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      const hatFilter = ctx.createBiquadFilter();

      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(isAccent ? 3200 : 2600, now);

      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(1800, now);

      hatGain.gain.setValueAtTime(isAccent ? 0.16 : 0.1, now);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      hatOsc.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(ctx.destination);

      hatOsc.start(now);
      hatOsc.stop(now + 0.03);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Tactile pop/bubble sound:
   * active: 520 -> 880Hz (chirp up)
   * inactive: 480 -> 300Hz (chirp down)
   */
  public playPopSound(active: boolean): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = active ? 520 : 480;
      const endFreq = active ? 880 : 300;
      const duration = 0.075;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Quick rhythmic synth arpeggio / card-shuffle sweep
   */
  public playShuffleSweep(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Fast ascending pentatonic sweep
      const freqs = [392.0, 440.0, 523.25, 659.25, 783.99]; // G4, A4, C5, E5, G5
      const noteDuration = 0.04;

      freqs.forEach((freq, idx) => {
        const noteStart = now + idx * 0.028;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration + 0.01);
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Bright, punchy chord chime (C5 - E5 - G5 - C6)
   * Played when a playlist is generated.
   */
  public playSuccessFanfare(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C Major arpeggiated sparkle + root bass
      const notes = [
        { freq: 261.63, delay: 0.0, dur: 0.6, vol: 0.2, type: 'sine' as OscillatorType },    // C4
        { freq: 523.25, delay: 0.02, dur: 0.5, vol: 0.22, type: 'triangle' as OscillatorType }, // C5
        { freq: 659.25, delay: 0.07, dur: 0.5, vol: 0.22, type: 'triangle' as OscillatorType }, // E5
        { freq: 783.99, delay: 0.12, dur: 0.55, vol: 0.24, type: 'triangle' as OscillatorType }, // G5
        { freq: 1046.5, delay: 0.17, dur: 0.7, vol: 0.28, type: 'sine' as OscillatorType },   // C6
      ];

      notes.forEach(({ freq, delay, dur, vol, type }) => {
        const noteStart = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(vol, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.02);
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Precision Metronome Scheduler for BPM Screen Beat Loop
   */
  public startMetronome(bpm: number, onBeat?: (beatIndex: number) => void): void {
    this.currentBpm = Math.max(60, Math.min(220, bpm));
    this.onBeatCallback = onBeat || null;

    if (this.isMetronomeRunning) return;

    const ctx = this.getContext();
    if (!ctx) return;

    this.isMetronomeRunning = true;
    this.currentBeatIndex = 0;
    this.nextBeatTime = ctx.currentTime + 0.05;

    // Scheduler tick interval (every 25ms)
    this.metronomeTimer = window.setInterval(() => {
      this.scheduleMetronomeNotes();
    }, 25);
  }

  public updateMetronomeBpm(bpm: number): void {
    this.currentBpm = Math.max(60, Math.min(220, bpm));
  }

  public stopMetronome(): void {
    this.isMetronomeRunning = false;
    if (this.metronomeTimer !== null) {
      clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
    this.currentBeatIndex = 0;
    this.onBeatCallback = null;
  }

  public isMetronomeActive(): boolean {
    return this.isMetronomeRunning;
  }

  private scheduleMetronomeNotes(): void {
    const ctx = this.getContext();
    if (!ctx || !this.isMetronomeRunning) return;

    const lookahead = 0.1; // Schedule beats 100ms in advance
    const secondsPerBeat = 60.0 / this.currentBpm;

    while (this.nextBeatTime < ctx.currentTime + lookahead) {
      this.playMetronomeTickAtTime(this.nextBeatTime, this.currentBeatIndex);

      if (this.onBeatCallback) {
        const beatNum = this.currentBeatIndex;
        const delayMs = Math.max(0, (this.nextBeatTime - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (this.isMetronomeRunning && this.onBeatCallback) {
            this.onBeatCallback(beatNum);
          }
        }, delayMs);
      }

      this.nextBeatTime += secondsPerBeat;
      this.currentBeatIndex = (this.currentBeatIndex + 1) % 4;
    }
  }

  private playMetronomeTickAtTime(time: number, beatIndex: number): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const isDownbeat = beatIndex === 0;

      // Click sound: higher pitch for beat 1
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isDownbeat ? 1100 : 800, time);

      gain.gain.setValueAtTime(isDownbeat ? 0.28 : 0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.03);
    } catch {
      // Ignore scheduling errors
    }
  }
}

// Global singleton instance
export const soundEngine = new SoundEffectsEngine();

// Convenience exports for direct usage
export const playDialTick = (bpm: number = 160) => soundEngine.playDialTick(bpm);
export const playTapKick = (tapCount: number = 1) => soundEngine.playTapKick(tapCount);
export const playPopSound = (active: boolean) => soundEngine.playPopSound(active);
export const playShuffleSweep = () => soundEngine.playShuffleSweep();
export const playSuccessFanfare = () => soundEngine.playSuccessFanfare();

export const startBpmMetronome = (bpm: number, onBeat?: (beatIndex: number) => void) =>
  soundEngine.startMetronome(bpm, onBeat);
export const updateBpmMetronome = (bpm: number) => soundEngine.updateMetronomeBpm(bpm);
export const stopBpmMetronome = () => soundEngine.stopMetronome();
export const isBpmMetronomePlaying = () => soundEngine.isMetronomeActive();
export const setSoundMuted = (muted: boolean) => soundEngine.setMuted(muted);
export const isSoundMuted = () => soundEngine.isMuted();
