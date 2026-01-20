import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock AudioContext for Node.js environment
class MockAudioBuffer {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  duration: number;
  private channels: Float32Array[];

  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.numberOfChannels = options.numberOfChannels;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = options.length / options.sampleRate;
    this.channels = [];
    for (let i = 0; i < options.numberOfChannels; i++) {
      this.channels.push(new Float32Array(options.length));
    }
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel];
  }
}

class MockAudioContext {
  sampleRate: number;
  state: 'running' | 'suspended' | 'closed' = 'running';

  constructor(options?: { sampleRate?: number }) {
    this.sampleRate = options?.sampleRate || 44100;
  }

  createBuffer(numChannels: number, length: number, sampleRate: number): MockAudioBuffer {
    return new MockAudioBuffer({ numberOfChannels: numChannels, length, sampleRate });
  }

  createBufferSource() {
    return {
      buffer: null as MockAudioBuffer | null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.8,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getByteFrequencyData: vi.fn((array: Uint8Array) => {
        array.fill(0);
      }),
    };
  }

  createScriptProcessor() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      onaudioprocess: null as ((event: any) => void) | null,
    };
  }

  createMediaStreamSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  async close(): Promise<void> {
    this.state = 'closed';
  }

  async resume(): Promise<void> {
    this.state = 'running';
  }

  get destination() {
    return {};
  }
}

// @ts-ignore
global.AudioContext = MockAudioContext;
// @ts-ignore
global.webkitAudioContext = MockAudioContext;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn(),
      }],
    }),
  },
  writable: true,
});

// Mock navigator.wakeLock
Object.defineProperty(global.navigator, 'wakeLock', {
  value: {
    request: vi.fn().mockResolvedValue({
      release: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    }),
  },
  writable: true,
});
