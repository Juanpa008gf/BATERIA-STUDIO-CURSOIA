import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createWebAudioSink } from './audio';
import { exampleScore } from './ejemplo';
import type { MidiHit } from './midi';
import { pieceForNote } from './midi';
import { PanelBateria, type LastHit } from './PanelBateria';
import { PanelPractica } from './PanelPractica';
import { renderScore, xAtUnit, type Layout } from './pentagrama';
import { clampTempo, DENOMINATORS, measureUnits, msPerUnit, NUMERATORS, type Piece, type Score } from './partitura';
import { evaluateHit, type HitResult } from './practica';
import { createPlayer, type PlayerPosition } from './reproductor';
import { nextExpected, omittedNotes } from './sesionPractica';
import { useMidi } from './useMidi';

const TICK_MS = 25;

type Mode = 'lectura' | 'practica';

interface HitMark {
  id: number;
  /** Vuelta de la partitura en que cayó el golpe (con bucle); los de vueltas anteriores se borran. */
  lap: number;
  /** Instante del golpe en ms desde el inicio de esa vuelta, medido con el reloj de audio. */
  timeMs: number;
  result: HitResult;
}

export function App() {
  const [score, setScore] = useState<Score>(exampleScore);
  const [loop, setLoop] = useState(false);
  const [mode, setMode] = useState<Mode>('lectura');
  const [tempoText, setTempoText] = useState(String(score.tempo));
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState<PlayerPosition | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [width, setWidth] = useState(900);
  const [lastHit, setLastHit] = useState<LastHit | null>(null);
  const [marks, setMarks] = useState<HitMark[]>([]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const audio = useMemo(() => createWebAudioSink(), []);
  const player = useMemo(() => createPlayer({ score, audio }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // El golpe MIDI se evalúa con lo último que hay en pantalla, sin volver a registrar el listener.
  const live = useRef({ score, loop, mode });
  live.current = { score, loop, mode };
  const nextId = useRef(0);

  const onHit = useCallback(
    (hit: MidiHit, timeStamp: number) => {
      const piece: Piece | null = pieceForNote(hit.note);
      setLastHit({ ...hit, piece });

      const { score: current, loop: looping, mode: currentMode } = live.current;
      if (currentMode !== 'practica' || !player.isPlaying() || !piece) return;

      // El desvío se mide contra el reloj de audio, no contra el de la interfaz.
      let timeMs = (audio.audioTimeAt(timeStamp) - player.startTime()) * 1000;
      const lap = looping ? Math.floor(timeMs / player.durationMs()) : 0;
      if (looping) timeMs -= lap * player.durationMs();

      const result = evaluateHit({ score: current, hit: { piece, timeMs } });
      setMarks((prev) => [...prev.filter((m) => m.lap === lap), { id: nextId.current++, lap, timeMs, result }]);
    },
    [audio, player],
  );

  const midi = useMidi(onHit);

  // RF-10.3: sin una entrada abierta no hay Modo Práctica.
  useEffect(() => {
    if (!midi.state.connected && mode === 'practica') {
      player.stop();
      setPlaying(false);
      setMode('lectura');
    }
  }, [midi.state.connected, mode, player]);

  // La partitura cambió: el reproductor la toma y se detiene.
  useEffect(() => {
    player.setScore(score);
    setPlaying(false);
    setPosition(null);
    setMarks([]);
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
      // Con bucle, al empezar una vuelta nueva se limpian los golpes de la anterior.
      const lap = live.current.loop ? Math.floor(((audio.currentTime - player.startTime()) * 1000) / player.durationMs()) : 0;
      setMarks((prev) => (prev.some((m) => m.lap !== lap) ? prev.filter((m) => m.lap === lap) : prev));
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
  }, [playing, player, audio]);

  const play = useCallback(async () => {
    await audio.resume();
    setMarks([]);
    player.play();
    player.tick();
    setPlaying(true);
  }, [audio, player]);

  const stop = useCallback(() => {
    player.stop();
    setPosition(player.position());
    setPlaying(false);
  }, [player]);

  function changeMode(next: Mode) {
    if (next === mode) return;
    stop();
    setMarks([]);
    setMode(next);
  }

  function commitTempo() {
    const tempo = clampTempo(parseFloat(tempoText));
    setTempoText(String(tempo));
    if (tempo !== score.tempo) setScore({ ...score, tempo });
  }

  function setSignature(patch: Partial<Score['timeSignature']>) {
    setScore({ ...score, timeSignature: { ...score.timeSignature, ...patch } });
  }

  const practicing = mode === 'practica';
  const indicator = (() => {
    if (!layout || !position) return null;
    const m = layout.measures[position.measure - 1];
    return m ? { left: xAtUnit(m, position.unit), top: m.top, height: m.bottom - m.top } : null;
  })();

  // Marcas del Modo Práctica sobre el pentagrama.
  const overlay = (() => {
    if (!practicing || !layout) return null;
    const unitMs = msPerUnit(score.tempo);
    const perMeasure = measureUnits(score.timeSignature);
    const nowMs = playing && position ? ((position.measure - 1) * perMeasure + position.unit) * unitMs : null;

    const at = (measure: number, unit: number) => {
      const m = layout.measures[measure];
      return m ? { m, x: xAtUnit(m, unit) } : null;
    };

    const next = nowMs === null ? null : nextExpected(score, nowMs);
    const omitted = nowMs === null ? [] : omittedNotes(score, marks.map((k) => k.timeMs), nowMs);
    return {
      next: next && at(next.measure, next.position),
      omitted: omitted.flatMap((o) => at(o.measure, o.position) ?? []),
      hits: marks.flatMap((k) => {
        const units = k.timeMs / unitMs;
        const measure = Math.floor(units / perMeasure);
        const p = at(measure, units - measure * perMeasure);
        return p ? [{ id: k.id, ...p, color: k.result.color }] : [];
      }),
    };
  })();

  const lastResult = marks.length ? marks[marks.length - 1].result : null;

  return (
    <main className="app">
      <h1>Drum Sync</h1>

      <div className="barra" role="toolbar" aria-label="Transporte">
        {playing ? <button onClick={stop}>Detener</button> : <button onClick={play}>Play</button>}
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
        <div className="modos" role="group" aria-label="Modo">
          <button
            className={mode === 'lectura' ? '' : 'secundario'}
            aria-pressed={mode === 'lectura'}
            onClick={() => changeMode('lectura')}
          >
            Lectura
          </button>
          <button
            className={practicing ? '' : 'secundario'}
            aria-pressed={practicing}
            disabled={!midi.state.connected}
            title={midi.state.connected ? undefined : 'Conectá la batería para practicar'}
            onClick={() => changeMode('practica')}
          >
            Práctica
          </button>
        </div>
        <span className="estado">{position ? `Compás ${position.measure} · tiempo ${position.beat}` : 'Detenido'}</span>
      </div>

      <PanelBateria midi={midi.state} lastHit={lastHit} onConnect={midi.connect} onSelect={midi.select} />

      {practicing && <PanelPractica result={lastResult} />}

      <div className="hoja" ref={sheetRef}>
        <div ref={svgRef} />
        {overlay?.next && (
          <div
            className="siguiente"
            style={{ left: overlay.next.x - 9, top: overlay.next.m.top, height: overlay.next.m.bottom - overlay.next.m.top }}
          />
        )}
        {overlay?.omitted.map((o) => (
          <div key={`${o.m.top}-${o.x}`} className="marca-omitida" style={{ left: o.x - 3, top: o.m.bottom - 18 }} title="Omitida" />
        ))}
        {overlay?.hits.map((h) => (
          <div key={h.id} className={`golpe ${h.color}`} style={{ left: h.x - 3, top: h.m.top + 6 }} />
        ))}
        {indicator && <div className="indicador" style={{ left: indicator.left, top: indicator.top, height: indicator.height }} />}
      </div>
    </main>
  );
}
