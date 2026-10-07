// Grabación de tomas: escribir tocando en lugar de con el mouse (RF-14, RF-15.1, RF-16).
import type { Grid } from './grabacion';
import { MAX_MEASURES } from './partitura';
import type { TakeFase } from './useToma';

const GRIDS: { value: Grid; label: string }[] = [
  { value: 'semicorchea', label: 'Semicorchea' },
  { value: 'tresillo', label: 'Corchea de tresillo' },
  { value: 'corchea', label: 'Corchea' },
  { value: 'negra', label: 'Negra' },
];

interface Props {
  fase: TakeFase;
  compas: number;
  measures: number;
  grid: Grid;
  /** Motivo por el que no se puede grabar ahora, o null si se puede. */
  blocked: string | null;
  onMeasures: (n: number) => void;
  onGrid: (g: Grid) => void;
  onStart: () => void;
  onStop: () => void;
}

export function PanelToma({ fase, compas, measures, grid, blocked, onMeasures, onGrid, onStart, onStop }: Props) {
  const idle = fase === 'inactiva';
  return (
    <div className="barra" aria-label="Grabar una toma">
      {idle ? (
        <button onClick={onStart} disabled={blocked !== null} title={blocked ?? undefined}>
          Grabar toma
        </button>
      ) : (
        <button onClick={onStop}>Detener</button>
      )}
      <label>
        Compases
        <select
          id="toma-compases"
          value={measures}
          disabled={!idle}
          onChange={(e) => onMeasures(Number(e.target.value))}
          aria-label="Compases de la toma"
        >
          {Array.from({ length: MAX_MEASURES }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        Grilla
        <select id="toma-grilla" value={grid} disabled={!idle} onChange={(e) => onGrid(e.target.value as Grid)} aria-label="Grilla de la toma">
          {GRIDS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <span className="estado" role="status">
        {fase === 'esperando' && 'Esperando el primer golpe…'}
        {fase === 'grabando' && `Grabando · compás ${compas} de ${measures} (Esc para detener)`}
        {idle && (blocked ?? 'La toma empieza con tu primer golpe, en el compás 1.')}
      </span>
    </div>
  );
}
