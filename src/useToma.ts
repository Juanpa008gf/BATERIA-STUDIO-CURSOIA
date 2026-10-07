import { useCallback, useEffect, useRef, useState } from 'react';
import type { Grid, Hit } from './grabacion';
import { measureMs, type Piece, type Score } from './partitura';
import { applyTake, type TakeConfig } from './toma';

export type TakeFase = 'inactiva' | 'esperando' | 'grabando';

const TICK_MS = 50;

interface Args {
  score: Score;
  /** Recibe la partitura con la toma ya escrita. */
  onWrite: (next: Score) => void;
}

/** Grabación de una toma: arranca al primer golpe (RF-15.1) y siempre en el compás 1 (RF-14.6). */
export function useToma({ score, onWrite }: Args) {
  const [fase, setFase] = useState<TakeFase>('inactiva');
  const [compas, setCompas] = useState(1);
  const [config, setConfigState] = useState<TakeConfig>({ measures: 2, grid: 'semicorchea' });

  // Todo lo que lee el listener de MIDI vive en refs, así `feed` es estable y nunca ve datos viejos.
  const live = useRef({ score, onWrite, config });
  live.current = { score, onWrite, config };
  const faseRef = useRef<TakeFase>('inactiva');
  const hits = useRef<Hit[]>([]);
  const t0 = useRef(0);

  const setFaseBoth = useCallback((next: TakeFase) => {
    faseRef.current = next;
    setFase(next);
  }, []);

  const finish = useCallback(() => {
    if (faseRef.current === 'inactiva') return;
    const { score: current, config: cfg, onWrite: write } = live.current;
    const elapsed = faseRef.current === 'grabando' ? performance.now() - t0.current : 0;
    // RF-16.3: lo ya tocado se conserva sea cual sea el motivo del fin. Sin golpes no se cambia nada.
    const next = applyTake(current, cfg, hits.current, elapsed);
    hits.current = [];
    setFaseBoth('inactiva');
    if (next !== current) write(next);
  }, [setFaseBoth]);

  const start = useCallback(() => {
    hits.current = [];
    setCompas(1);
    setFaseBoth('esperando');
  }, [setFaseBoth]);

  /** Se llama con cada golpe MIDI ya mapeado a una pieza. `timeStamp` es el del evento (performance.now). */
  const feed = useCallback(
    (piece: Piece, timeStamp: number) => {
      if (faseRef.current === 'inactiva') return;
      if (faseRef.current === 'esperando') {
        t0.current = timeStamp;
        setFaseBoth('grabando');
      }
      const { score: current, config: cfg } = live.current;
      const timeMs = timeStamp - t0.current;
      if (timeMs >= measureMs(current.timeSignature, current.tempo) * cfg.measures) return;
      hits.current.push({ piece, timeMs });
    },
    [setFaseBoth],
  );

  // RF-16.1: termina sola al completar los compases elegidos.
  useEffect(() => {
    if (fase !== 'grabando') return;
    const timer = window.setInterval(() => {
      const { score: current, config: cfg } = live.current;
      const perMeasure = measureMs(current.timeSignature, current.tempo);
      const elapsed = performance.now() - t0.current;
      if (elapsed >= perMeasure * cfg.measures) finish();
      else setCompas(Math.floor(elapsed / perMeasure) + 1);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [fase, finish]);

  // RF-16.2: Esc también termina la toma.
  useEffect(() => {
    if (fase === 'inactiva') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fase, finish]);

  const setMeasures = useCallback((measures: number) => setConfigState((c) => ({ ...c, measures })), []);
  const setGrid = useCallback((grid: Grid) => setConfigState((c) => ({ ...c, grid })), []);

  return { fase, compas, config, start, stop: finish, feed, setMeasures, setGrid };
}
