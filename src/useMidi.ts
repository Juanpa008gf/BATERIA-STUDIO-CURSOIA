import { useCallback, useEffect, useRef, useState } from 'react';
import type { MidiHit } from './midi';
import {
  isWebMidiAvailable,
  MidiError,
  MOTIVO_NO_DISPONIBLE,
  openMidiSession,
  type MidiInputInfo,
  type MidiSession,
} from './midiAcceso';

export interface MidiState {
  /** Motivo por el que la grabación y el Modo Práctica están deshabilitados, o null si hay una entrada abierta. */
  reason: string | null;
  inputs: MidiInputInfo[];
  selectedId: string;
  /** Hay una entrada abierta y escuchando. */
  connected: boolean;
  /** Se pidió acceso y el navegador lo concedió. */
  accessGranted: boolean;
}

export function useMidi(onHit: (hit: MidiHit, timeStamp: number) => void) {
  const [state, setState] = useState<MidiState>(() => ({
    reason: isWebMidiAvailable() ? null : MOTIVO_NO_DISPONIBLE,
    inputs: [],
    selectedId: '',
    connected: false,
    accessGranted: false,
  }));
  const session = useRef<MidiSession | null>(null);
  const handler = useRef(onHit);
  handler.current = onHit;

  useEffect(() => () => session.current?.close(), []);

  /** Pide el permiso y lista las entradas (RF-10.1, RF-10.2). Se llama desde un clic. */
  const connect = useCallback(async () => {
    try {
      session.current?.close();
      session.current = await openMidiSession(
        (hit, ts) => handler.current(hit, ts),
        (inputs) => setState((s) => ({ ...s, inputs })),
      );
      setState((s) => ({ ...s, reason: null, accessGranted: true, inputs: session.current!.inputs() }));
    } catch (e) {
      setState((s) => ({ ...s, reason: e instanceof MidiError ? e.message : MOTIVO_NO_DISPONIBLE, connected: false }));
    }
  }, []);

  const select = useCallback(async (id: string) => {
    setState((s) => ({ ...s, selectedId: id, connected: false }));
    if (!id || !session.current) return;
    try {
      await session.current.select(id);
      setState((s) => ({ ...s, reason: null, connected: true }));
    } catch (e) {
      // RF-10.5: queda deshabilitado y se puede elegir otra entrada del listado.
      setState((s) => ({ ...s, reason: e instanceof MidiError ? e.message : String(e), connected: false }));
    }
  }, []);

  return { state, connect, select };
}
