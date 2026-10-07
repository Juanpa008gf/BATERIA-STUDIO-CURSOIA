// RF-19.1 @CRITICO — Play reproduce desde el compás 1 (AC-45).
import { describe, expect, it } from 'vitest';
import { createPlayer, type AudioSink } from '../src/reproductor';
import { makeScore, note, U } from './ayudas';

// Audio falso: reloj controlable y registro de lo programado. No toca Web Audio real.
function fakeAudio() {
  const scheduled: { piece: string; time: number }[] = [];
  const audio: AudioSink & { currentTime: number; scheduled: typeof scheduled } = {
    currentTime: 0,
    scheduled,
    playNote(piece, time) {
      scheduled.push({ piece, time });
    },
    playClick() {},
    cancelPending() {},
  };
  return audio;
}

describe('RF-19.1 · Play arranca desde el compás 1', () => {
  it('AC-45: tras detener en el compás 2, Play vuelve al tiempo 1 del compás 1 y suena su nota', () => {
    // 2 compases a 120 BPM (compás = 2 s), nota en el tiempo 1 del compás 1.
    const score = makeScore(120, [[note('snare', 0, U.negra)], []]);
    const audio = fakeAudio();
    const player = createPlayer({ score, audio });

    // Primera reproducción: se avanza hasta el compás 2 y se detiene ahí.
    audio.currentTime = 10;
    player.play();
    audio.currentTime = 10 + 3; // 3 s después: dentro del compás 2
    player.tick();
    expect(player.position().measure).toBe(2);
    player.stop();

    // Segunda reproducción.
    audio.scheduled.length = 0;
    audio.currentTime = 20;
    player.play();
    player.tick();

    expect(player.position()).toMatchObject({ measure: 1, beat: 1 });
    expect(audio.scheduled).toContainEqual({ piece: 'snare', time: 20 }); // primer instante de la reproducción
  });

  it('con una partitura nueva y sin detener nada, Play también empieza en el compás 1, tiempo 1', () => {
    const score = makeScore(120, [[note('kick', 0)], [note('kick', 0)]]);
    const audio = fakeAudio();
    const player = createPlayer({ score, audio });

    audio.currentTime = 5;
    player.play();
    player.tick();

    expect(player.position()).toMatchObject({ measure: 1, beat: 1 });
  });
});
