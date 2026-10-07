// Feedback en vivo del Modo Práctica: pieza esperada, resultado y desvío con signo (RF-30.1 a RF-30.3).
import { PIECE_STAFF } from './kit';
import type { HitResult } from './practica';

const COLOR_LABEL = { green: 'Verde', yellow: 'Amarillo', red: 'Rojo' } as const;

export function formatDeviation(ms: number): string {
  const rounded = Math.round(ms);
  return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${Math.abs(rounded)} ms`;
}

export function PanelPractica({ result }: { result: HitResult | null }) {
  return (
    <div className="barra practica" aria-label="Feedback de práctica">
      {result ? (
        <>
          <span>
            Pieza esperada: <strong>{result.expectedPiece ? PIECE_STAFF[result.expectedPiece].label : 'ninguna'}</strong>
          </span>
          <span className={`chip ${result.color}`}>{COLOR_LABEL[result.color]}</span>
          <span className="desvio">{result.expectedPiece ? formatDeviation(result.deviationMs) : '—'}</span>
        </>
      ) : (
        <span className="suave">Dale Play y tocá sobre la partitura: acá ves cada golpe.</span>
      )}
      <span className="leyenda">
        <i className="punto green" /> hasta ±100 ms <i className="punto yellow" /> hasta ±250 ms <i className="punto red" /> más, o
        pieza distinta <i className="punto omitida" /> omitida
      </span>
    </div>
  );
}
