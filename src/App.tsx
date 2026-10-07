import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createWebAudioSink } from './audio';
import { exampleScore } from './ejemplo';
import { renderScore, xAtUnit, type Layout } from './pentagrama';
import { clampTempo, DENOMINATORS, NUMERATORS, type Score } from './partitura';
import { createPlayer, type PlayerPosition } from './reproductor';

const TICK_MS = 25;

export function App() {
  const [score, setScore] = useState<Score>(exampleScore);
  const [loop, setLoop] = useState(false);
  const [tempoText, setTempoText] = useState(String(score.tempo));
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState<PlayerPosition | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [width, setWidth] = useState(900);

  const sheetRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const audio = useMemo(() => createWebAudioSink(), []);
  const player = useMemo(() => createPlayer({ score, audio }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // La partitura cambió: el reproductor la toma y se detiene.
  useEffect(() => {
    player.setScore(score);
    setPlaying(false);
    setPosition(null);
  }, [score, player]);

  useEffect(() => player.setLoop(loop), [loop, player]);

  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(Math.max(600, Math.floor(el.clientWidth))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (svgRef.current) setLayout(renderScore(svgRef.current, score, width));
  }, [score, width]);

  // Mientras suena: programa el audio cada pocos ms y mueve el indicador en cada cuadro.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => player.tick(), TICK_MS);
    let frame = 0;
    const paint = () => {
      setPosition(player.position());
      if (!player.isPlaying()) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, [playing, player]);

  const play = useCallback(async () => {
    await audio.resume();
    player.play();
    player.tick();
    setPlaying(true);
  }, [audio, player]);

  const stop = useCallback(() => {
    player.stop();
    setPosition(player.position());
    setPlaying(false);
  }, [player]);

  function commitTempo() {
    const tempo = clampTempo(parseFloat(tempoText));
    setTempoText(String(tempo));
    if (tempo !== score.tempo) setScore({ ...score, tempo });
  }

  function setSignature(patch: Partial<Score['timeSignature']>) {
    setScore({ ...score, timeSignature: { ...score.timeSignature, ...patch } });
  }

  const indicator = (() => {
    if (!layout || !position) return null;
    const m = layout.measures[position.measure - 1];
    if (!m) return null;
    return { left: xAtUnit(m, position.unit), top: m.top, height: m.bottom - m.top };
  })();

  return (
    <main className="app">
      <h1>Drum Sync</h1>

      <div className="barra" role="toolbar" aria-label="Transporte">
        {playing ? (
          <button onClick={stop}>Detener</button>
        ) : (
          <button onClick={play}>Play</button>
        )}
        <label>
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Bucle
        </label>
        <label>
          Tempo
          <input
            type="text"
            inputMode="numeric"
            value={tempoText}
            onChange={(e) => setTempoText(e.target.value)}
            onBlur={commitTempo}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label="Tempo en BPM"
          />
          BPM
        </label>
        <label>
          Compás
          <select
            value={score.timeSignature.numerator}
            onChange={(e) => setSignature({ numerator: Number(e.target.value) })}
            aria-label="Numerador del compás"
          >
            {NUMERATORS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          /
          <select
            value={score.timeSignature.denominator}
            onChange={(e) => setSignature({ denominator: Number(e.target.value) })}
            aria-label="Denominador del compás"
          >
            {DENOMINATORS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <span className="estado">
          {position ? `Compás ${position.measure} · tiempo ${position.beat}` : 'Detenido'}
        </span>
      </div>

      <div className="hoja" ref={sheetRef}>
        <div ref={svgRef} />
        {indicator && (
          <div
            className="indicador"
            style={{ left: indicator.left, top: indicator.top, height: indicator.height }}
          />
        )}
      </div>
    </main>
  );
}
