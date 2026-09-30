// Real acoustic procedural synthesizer using the Web Audio API
// Generates gentle authentic acoustic tones (Bansuri, Sitar/Tanpura, Harmonium, Acoustic Guitar)

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlaying: boolean = false;
  private timer: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playPreset(preset: 'bansuri' | 'sitar' | 'harmonium' | 'guitar' | 'tanpura' | 'ambient' = 'bansuri', onStop?: () => void): () => void {
    this.stop();
    this.initCtx();
    if (!this.ctx) return () => {};

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Raga Yaman / Bhairavi scales (frequencies in Hz)
    const scaleYaman = [220, 246.94, 277.18, 311.13, 329.63, 369.99, 415.3, 440];
    const scaleBhairavi = [220, 233.08, 261.63, 293.66, 329.63, 349.23, 392.0, 440];
    const scaleDorian = [196, 220, 246.94, 261.63, 293.66, 329.63, 369.99, 392];

    const chosenScale = preset === 'sitar' ? scaleBhairavi : preset === 'harmonium' ? scaleYaman : scaleDorian;

    // Tanpura Drone Foundation
    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.exponentialRampToValueAtTime(0.08, now + 1.5);

    const droneOsc1 = this.ctx.createOscillator();
    droneOsc1.type = 'triangle';
    droneOsc1.frequency.setValueAtTime(110, now); // Sa (A2)
    droneOsc1.connect(droneGain);
    droneOsc1.start(now);

    const droneOsc2 = this.ctx.createOscillator();
    droneOsc2.type = 'sine';
    droneOsc2.frequency.setValueAtTime(165, now); // Pa (E3)
    droneOsc2.connect(droneGain);
    droneOsc2.start(now);

    droneGain.connect(this.ctx.destination);
    this.activeNodes.push({ osc: droneOsc1, gain: droneGain }, { osc: droneOsc2, gain: droneGain });

    // Melodic sequence loop
    let noteIndex = 0;
    const melodySteps = [0, 2, 4, 3, 5, 4, 6, 7, 5, 4, 2, 0, 1, 2, 0];
    
    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      
      const currentTime = this.ctx.currentTime;
      const noteFreq = chosenScale[melodySteps[noteIndex % melodySteps.length]];
      noteIndex++;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      if (preset === 'bansuri') {
        osc.type = 'sine';
        // Gentle flute breath harmonic
        const harmonic = this.ctx.createOscillator();
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(noteFreq * 2, currentTime);
        harmonic.connect(noteGain);
        harmonic.start(currentTime);
        harmonic.stop(currentTime + 1.2);
      } else if (preset === 'sitar') {
        osc.type = 'sawtooth';
      } else if (preset === 'harmonium') {
        osc.type = 'square';
      } else {
        osc.type = 'triangle';
      }

      osc.frequency.setValueAtTime(noteFreq, currentTime);

      // Acoustic envelope (attack, decay, release)
      noteGain.gain.setValueAtTime(0.001, currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.12, currentTime + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.1);

      // Warm low-pass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(preset === 'bansuri' ? 1200 : preset === 'sitar' ? 2400 : 900, currentTime);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + 1.2);

      const delay = preset === 'harmonium' ? 900 : 750;
      this.timer = window.setTimeout(playNextNote, delay);
    };

    playNextNote();

    return () => {
      this.stop();
      if (onStop) onStop();
    };
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.activeNodes.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        }
        setTimeout(() => {
          try { osc.stop(); } catch {}
        }, 200);
      } catch {}
    });
    this.activeNodes = [];
  }
}

export const proceduralAudio = new ProceduralAudioEngine();
