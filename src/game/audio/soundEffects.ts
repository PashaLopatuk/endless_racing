import { AUDIO } from "../constants/audio";
import { readSoundEnabled } from "../soundEnabled";
import { clamp } from "../util/math";

export interface ISoundEffects {
  playHit(severity: number): void;
  playDeath(): void;
  stopAll(): void;
  dispose(): void;
}

/**
 * Procedural Web Audio synthesizer and audio file player for game sound effects.
 * - Out of the box: synthesizes punchy vehicle collision crunches and explosion death sounds.
 * - Extensible: automatically uses custom audio files (e.g. /audio/hit.mp3, /audio/death.mp3) if present.
 * - Respects the user's sound enabled / muted settings.
 */
export const createSoundEffects = (): ISoundEffects => {
  let audioContext: AudioContext | null = null;
  let noiseBuffer: AudioBuffer | null = null;

  // Track if custom audio files are verified as loadable
  let hitAudioElement: HTMLAudioElement | null = null;
  let deathAudioElement: HTMLAudioElement | null = null;
  let hasCustomHit = false;
  let hasCustomDeath = false;

  const initCustomAudio = () => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      return;
    }

    try {
      const hit = new Audio(AUDIO.HIT_URL);
      hit.preload = "auto";
      hit.addEventListener("canplaythrough", () => {
        hasCustomHit = true;
      });
      hit.addEventListener("error", () => {
        hasCustomHit = false;
      });
      hitAudioElement = hit;

      const death = new Audio(AUDIO.DEATH_URL);
      death.preload = "auto";
      death.addEventListener("canplaythrough", () => {
        hasCustomDeath = true;
      });
      death.addEventListener("error", () => {
        hasCustomDeath = false;
      });
      deathAudioElement = death;
    } catch {
      // Audio element initialization fallback
    }
  };

  initCustomAudio();

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }

    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  };

  const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
      return noiseBuffer;
    }

    // 1-second white noise buffer
    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    noiseBuffer = buffer;
    return buffer;
  };

  /**
   * Synthesizes a mechanical car collision: low bass thud + metallic crunch debris.
   */
  const synthesizeHit = (ctx: AudioContext, severity: number) => {
    const now = ctx.currentTime;
    const clampedSeverity = clamp(severity, 0.2, 1.0);
    const volume = clampedSeverity * AUDIO.MASTER_VOLUME * AUDIO.HIT_VOLUME;

    // 1. Low-end chassis impact punch (sweeping oscillator)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "triangle";
    const startFreq = 110 + clampedSeverity * 70;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    const bassVol = volume * 0.75;
    oscGain.gain.setValueAtTime(bassVol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);

    // 2. Metallic scrape & crunch (filtered noise burst)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    const filterFreq = 1800 + clampedSeverity * 1200;
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.25);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    const noiseVol = volume * (0.45 + clampedSeverity * 0.4);
    noiseGain.gain.setValueAtTime(noiseVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + 0.14 + clampedSeverity * 0.16,
    );

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
  };

  /**
   * Synthesizes a dramatic vehicle destruction sound: explosion shockwave + sub-bass boom + power-down whine.
   */
  const synthesizeDeath = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const volume = AUDIO.MASTER_VOLUME * AUDIO.DEATH_VOLUME;

    // 1. Heavy sub-bass explosion rumble
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();

    boomOsc.type = "sine";
    boomOsc.frequency.setValueAtTime(180, now);
    boomOsc.frequency.exponentialRampToValueAtTime(24, now + 1.1);

    boomGain.gain.setValueAtTime(volume * 0.9, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);

    boomOsc.start(now);
    boomOsc.stop(now + 1.25);

    // 2. High-energy explosion shockwave blast (noise)
    const blastNoise = ctx.createBufferSource();
    blastNoise.buffer = getNoiseBuffer(ctx);

    const blastFilter = ctx.createBiquadFilter();
    blastFilter.type = "lowpass";
    blastFilter.frequency.setValueAtTime(4500, now);
    blastFilter.frequency.exponentialRampToValueAtTime(120, now + 0.9);

    const blastGain = ctx.createGain();
    blastGain.gain.setValueAtTime(volume * 0.85, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    blastNoise.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(ctx.destination);

    blastNoise.start(now);
    blastNoise.stop(now + 1.0);

    // 3. Engine stall / power-down electrical whine
    const whineOsc = ctx.createOscillator();
    const whineGain = ctx.createGain();

    whineOsc.type = "sawtooth";
    whineOsc.frequency.setValueAtTime(320, now);
    whineOsc.frequency.exponentialRampToValueAtTime(35, now + 0.85);

    const whineFilter = ctx.createBiquadFilter();
    whineFilter.type = "lowpass";
    whineFilter.frequency.setValueAtTime(900, now);

    whineGain.gain.setValueAtTime(volume * 0.35, now);
    whineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    whineOsc.connect(whineFilter);
    whineFilter.connect(whineGain);
    whineGain.connect(ctx.destination);

    whineOsc.start(now);
    whineOsc.stop(now + 0.9);
  };

  return {
    playHit: (severity: number) => {
      if (!readSoundEnabled()) {
        return;
      }

      // 1. Try playing custom audio file if available
      if (hasCustomHit && hitAudioElement) {
        try {
          hitAudioElement.currentTime = 0;
          hitAudioElement.volume = clamp(
            severity * AUDIO.MASTER_VOLUME * AUDIO.HIT_VOLUME,
            0.1,
            1.0,
          );
          hitAudioElement.play().catch(() => {
            // Fallback to synthesis if play was blocked
            const ctx = getAudioContext();
            if (ctx) synthesizeHit(ctx, severity);
          });
          return;
        } catch {
          // Fall through to synthesis
        }
      }

      // 2. Procedural Web Audio synthesis
      const ctx = getAudioContext();
      if (ctx) {
        synthesizeHit(ctx, severity);
      }
    },
    playDeath: () => {
      if (!readSoundEnabled()) {
        return;
      }

      // 1. Try playing custom audio file if available
      if (hasCustomDeath && deathAudioElement) {
        try {
          deathAudioElement.currentTime = 0;
          deathAudioElement.volume = clamp(
            AUDIO.MASTER_VOLUME * AUDIO.DEATH_VOLUME,
            0.1,
            1.0,
          );
          deathAudioElement.play().catch(() => {
            const ctx = getAudioContext();
            if (ctx) synthesizeDeath(ctx);
          });
          return;
        } catch {
          // Fall through to synthesis
        }
      }

      // 2. Procedural Web Audio synthesis
      const ctx = getAudioContext();
      if (ctx) {
        synthesizeDeath(ctx);
      }
    },
    stopAll: () => {
      if (hitAudioElement) {
        try {
          hitAudioElement.pause();
          hitAudioElement.currentTime = 0;
        } catch {
          // Ignore
        }
      }
      if (deathAudioElement) {
        try {
          deathAudioElement.pause();
          deathAudioElement.currentTime = 0;
        } catch {
          // Ignore
        }
      }
    },
    dispose: () => {
      if (hitAudioElement) {
        hitAudioElement.pause();
        hitAudioElement = null;
      }
      if (deathAudioElement) {
        deathAudioElement.pause();
        deathAudioElement = null;
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
        audioContext = null;
      }
    },
  };
};
