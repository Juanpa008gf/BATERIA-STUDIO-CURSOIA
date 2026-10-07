// Acceso a Web MIDI (RF-10.1 a RF-10.5). Es lo único que toca el navegador: el editor y Play no dependen de esto (RNF-07).
import { parseMidiMessage, type MidiHit } from './midi';

export const MOTIVO_NO_DISPONIBLE = 'Web MIDI no está disponible';
export const MOTIVO_PERMISO_DENEGADO = 'Permiso MIDI denegado';
export const MOTIVO_NO_SE_PUDO_ABRIR = 'No se pudo abrir la entrada MIDI';

export interface MidiInputInfo {
  id: string;
  name: string;
}

/** Error con el texto exacto que se muestra al usuario. */
export class MidiError extends Error {}

export function isWebMidiAvailable(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
}

export interface MidiSession {
  inputs(): MidiInputInfo[];
  /** Abre la entrada elegida y cierra la anterior. Lanza MidiError si otra aplicación la tiene tomada. */
  select(id: string): Promise<void>;
  close(): void;
}

export async function openMidiSession(
  onHit: (hit: MidiHit, timeStamp: number) => void,
  onInputsChange: (inputs: MidiInputInfo[]) => void,
): Promise<MidiSession> {
  if (!isWebMidiAvailable()) throw new MidiError(MOTIVO_NO_DISPONIBLE);

  let access: MIDIAccess;
  try {
    access = await navigator.requestMIDIAccess();
  } catch {
    throw new MidiError(MOTIVO_PERMISO_DENEGADO);
  }

  const list = (): MidiInputInfo[] => [...access.inputs.values()].map((i) => ({ id: i.id, name: i.name ?? i.id }));
  access.onstatechange = () => onInputsChange(list());

  let current: MIDIInput | null = null;
  const release = async () => {
    if (!current) return;
    current.onmidimessage = null;
    try {
      await current.close();
    } catch {
      // Ya estaba cerrada.
    }
    current = null;
  };

  return {
    inputs: list,
    async select(id) {
      await release();
      const input = access.inputs.get(id);
      if (!input) throw new MidiError(MOTIVO_NO_SE_PUDO_ABRIR);
      try {
        await input.open();
      } catch {
        throw new MidiError(MOTIVO_NO_SE_PUDO_ABRIR);
      }
      input.onmidimessage = (e) => {
        if (!e.data) return;
        const hit = parseMidiMessage(e.data);
        if (hit) onHit(hit, e.timeStamp);
      };
      current = input;
    },
    close() {
      void release();
      access.onstatechange = null;
    },
  };
}
