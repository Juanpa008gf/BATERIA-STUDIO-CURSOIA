---
name: conventional-commit
description: Genera mensajes de commit siguiendo Conventional Commits. Se usa al crear un commit o cuando el usuario pide un mensaje de commit.
---

# Conventional Commit

Cuando generes un mensaje de commit:

1. Mirá el `git diff --staged` para entender QUÉ cambió.
2. Elegí el tipo: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
3. Formato: `tipo(scope): descripción en imperativo`
   - en español (voseo), en minúscula, sin punto final, máx. 72 caracteres.
4. Si rompe compatibilidad, agregá `BREAKING CHANGE:` en el cuerpo.

Ejemplos:

- feat(midi): agregar mapeo general midi de percusión por defecto
- fix(practica): corregir el color del golpe a 100 ms de desvío
- docs(prd): agregar criterios de aceptación del modo práctica
- refactor(audio): programar los clicks contra el reloj de web audio
- test(grilla): verificar que la negra ocupa 48 unidades

Con ruptura de compatibilidad:

```
refactor(formato)!: cambiar el formato de partitura a la versión 2

BREAKING CHANGE: las partituras de la versión 1 se migran al abrirlas.
```
