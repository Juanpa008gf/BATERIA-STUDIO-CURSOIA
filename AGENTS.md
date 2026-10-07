# AGENTS.md — Drum Sync

## Propósito
Drum Sync: escribir, escuchar y practicar partituras de batería con una batería MIDI.

## Stack
- React + TypeScript sobre Vite, con VexFlow para la notación.
- Electron como cliente de escritorio; Electron Forge solo para empaquetar.
- La app se distribuye como aplicación de escritorio Electron. Para desarrollo, el cliente debe poder correr también en Chrome o Edge en localhost.
- Supabase como backend (Auth con Google, Postgres con Row Level Security, Storage para los sonidos), vía `supabase-js`. No hay servidor propio!
- Una sola base de datos: la Postgres de Supabase, para usuarios, partituras y configuración. La app no tiene base local.
- Vitest para los tests y npm como gestor de paquetes.
- Las versiones las fija `package.json`. Node en versión LTS.

## Cómo correr
```bash
npm install
npm run dev        # Vite en http://localhost:5174
npx electron .     # en otra terminal, con Vite ya levantado
npm test
```

## Qué NO hacer
- No romper las partituras guardadas por versiones anteriores: cada cambio de formato tiene que migrarlas solo, sin perder notas.
- No hacer que el editor ni la reproducción dependan de Web MIDI: si no está o se deniega el permiso, solo se deshabilitan la grabación y el Modo Práctica (RNF-07).
- No poner la red en el camino del timing: la reproducción, la grabación y el Modo Práctica usan sonidos ya decodificados en memoria, nunca piden nada al servidor (RNF-15).
- No crear una tabla ni un bucket con datos de usuario sin Row Level Security, y no incluir nunca la clave `service_role` en la app (RNF-14).
- No guardar en la computadora más que la sesión, y siempre cifrada con `safeStorage` (RNF-13).
