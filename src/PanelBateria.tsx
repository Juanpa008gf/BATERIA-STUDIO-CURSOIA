// Conexión con la batería MIDI y último golpe recibido (RF-10, RF-13).
import { PIECE_STAFF } from './kit';
import type { MidiHit } from './midi';
import { MOTIVO_NO_DISPONIBLE } from './midiAcceso';
import type { Piece } from './partitura';
import type { MidiState } from './useMidi';

export interface LastHit extends MidiHit {
  piece: Piece | null;
}

interface Props {
  midi: MidiState;
  lastHit: LastHit | null;
  onConnect: () => void;
  onSelect: (id: string) => void;
}

export function PanelBateria({ midi, lastHit, onConnect, onSelect }: Props) {
  return (
    <div className="barra" aria-label="Batería MIDI">
      {!midi.accessGranted ? (
        <button onClick={onConnect} disabled={midi.reason === MOTIVO_NO_DISPONIBLE}>
          Conectar batería
        </button>
      ) : midi.inputs.length === 0 ? (
        <span className="suave">No hay entradas MIDI: conectá la batería por USB.</span>
      ) : (
        <label>
          Entrada
          <select value={midi.selectedId} onChange={(e) => onSelect(e.target.value)} aria-label="Entrada MIDI">
            <option value="">Elegí una entrada…</option>
            {midi.inputs.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {midi.connected && <span className="ok">Conectada</span>}
      {midi.reason && (
        <span className="motivo" role="alert">
          {midi.reason}
        </span>
      )}

      <span className="estado" aria-live="off">
        {lastHit
          ? `Último golpe: nota ${lastHit.note} · canal ${lastHit.channel} · intensidad ${lastHit.velocity}` +
            (lastHit.piece ? ` (${PIECE_STAFF[lastHit.piece].label})` : ' (sin pieza asignada)')
          : 'Sin golpes todavía'}
      </span>
    </div>
  );
}
