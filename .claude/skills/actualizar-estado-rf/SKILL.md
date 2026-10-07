---
name: actualizar-estado-rf
description: Actualiza el porcentaje de desarrollo de cada requerimiento funcional (RF) del PRD y republica el artefacto "Avance del PRD". Se usa al hacer un push al repo, o cuando el usuario pide actualizar el estado o el avance del PRD. Palabras de activación: push, git push, pushear, hacer push, subir al repo, subir a github, actualizar estado, actualizar avance, estado de los RF, avance del PRD, "hacé un push", "subí los cambios".
---

# Actualizar el estado de los RF

El avance vive en tres archivos. Los datos son la única fuente de verdad; lo demás se genera.

- `docs/estado-rf.json`: un registro por RF con `id`, `grupo`, `titulo`, `pct` y, si corresponde, `critico`. Guarda también `actualizado`, `commit` (último commit de código evaluado) y `artifactUrl`.
- `scripts/generar-estado.mjs`: lee el JSON y escribe `docs/estado-rf.html`. No se edita el HTML a mano.
- El artefacto publicado: la página `docs/estado-rf.html`, en la URL de `artifactUrl`.

Cada vez que haya que hacer un `git push` (o te pidan actualizar el estado), seguí estos pasos **antes** del push, para que el push lleve el estado al día.

## Pasos

1. Leé `docs/estado-rf.json` y anotá el porcentaje total actual (el promedio de todos los `pct`).
2. Mirá qué cambió desde el commit evaluado:
   - `git log --oneline <commit>..HEAD`
   - `git diff --stat <commit>..HEAD -- src tests`
   Si no cambió código ni tests, saltá al paso 6: solo se refresca la fecha y el commit.
3. Corré `npm test` y anotá cuántos pasan. Un RF no sube con tests rojos.
4. Reevaluá **solo los RF que toca el cambio**. Para cada uno leé su texto y sus criterios de aceptación (AC) en `PRD.md`, y ubicá el código y el test que lo cubre.
5. Ajustá `pct` según la escala de abajo. Si el PRD agregó, quitó o renumeró RF, sincronizá la lista de IDs:
   ```bash
   node -e "const fs=require('fs');const prd=fs.readFileSync('PRD.md','utf8');const a=[...new Set([...prd.matchAll(/^- \*\*(RF-[\d.]+)\*\*/gm)].map(m=>m[1]))];const b=JSON.parse(fs.readFileSync('docs/estado-rf.json','utf8')).rf.map(r=>r.id);console.log('faltan:',a.filter(x=>!b.includes(x)),'sobran:',b.filter(x=>!a.includes(x)))"
   ```
6. Actualizá `actualizado` con la fecha de hoy y `commit` con `git rev-parse --short HEAD` (el HEAD actual, antes del commit de estado).
7. Regenerá la página: `node scripts/generar-estado.mjs`.
8. Commiteá solo esos dos archivos con el skill `conventional-commit`: `docs(estado): actualizar avance de los rf`.
9. Hacé el `git push`, solo si el usuario lo pidió. Este skill no empuja por su cuenta.
10. Republicá el artefacto con la herramienta Artifact: `file_path` = `docs/estado-rf.html` y `url` = el `artifactUrl` del JSON. Si `artifactUrl` está vacío, publicá uno nuevo con `icon: "progress"`, guardá la URL en el JSON, regenerá y commiteá de nuevo.
11. Informá al usuario: porcentaje total anterior y nuevo, qué RF cambiaron (con su valor anterior y nuevo) y el link del artefacto.

## Escala de porcentaje

- **100**: hecho y verificado. Hay un test que pasa o una prueba manual en el navegador, y el usuario lo puede usar desde la app.
- **1 a 99**: hay una parte hecha. Cuanto más alto, más cerca. Ejemplos:
  - Lógica hecha y con tests, pero sin pantalla que la use: **80 como máximo**.
  - Dibujo o modelo hecho, pero sin forma de que el usuario lo escriba: alrededor de **40 a 60**.
  - Depende de hardware real (batería MIDI) y solo se probó con simulación: **90 como máximo**.
- **0**: sin empezar. Una interfaz o un tipo vacío no cuenta.

## Reglas

- Subí un porcentaje solo con evidencia: un test, o algo que viste funcionando. Una intención o un código sin probar no suma.
- Bajá un porcentaje si el cambio rompió o revirtió algo.
- No toques el `titulo` ni el `grupo` de un RF salvo que el PRD haya cambiado.
- Una nota omitida o un caso borde sin cubrir se refleja en el porcentaje del RF correspondiente, no se esconde.
- Los RF `@CRITICO` (`critico: true`) son los que el PRD marca así. Si el PRD marca otros, actualizá la marca.
- El HTML de `docs/` es generado: si ves un cambio manual, descartalo y regenerá.
