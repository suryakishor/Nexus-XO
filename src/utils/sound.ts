export type SoundName = 'place' | 'win' | 'lose' | 'draw';

type AudioContextConstructor = typeof AudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass: AudioContextConstructor | undefined =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new AudioContextClass();
    } catch {
      return null;
    }
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume().catch(() => undefined);
  }

  return audioContext;
}

function playNote(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume = 0.045,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export function playSound(name: SoundName): void {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  try {
    const now = context.currentTime;

    switch (name) {
      case 'place':
        playNote(context, 560, now, 0.08, 0.03);
        break;
      case 'win':
        playNote(context, 523.25, now, 0.14);
        playNote(context, 659.25, now + 0.09, 0.14);
        playNote(context, 783.99, now + 0.18, 0.22);
        break;
      case 'lose':
        playNote(context, 392, now, 0.16);
        playNote(context, 329.63, now + 0.1, 0.16);
        playNote(context, 261.63, now + 0.2, 0.24);
        break;
      case 'draw':
        playNote(context, 349.23, now, 0.18, 0.035);
        playNote(context, 349.23, now + 0.16, 0.18, 0.035);
        break;
      default:
        break;
    }
  } catch {
    // Audio is a progressive enhancement; gameplay never depends on it.
  }
}
