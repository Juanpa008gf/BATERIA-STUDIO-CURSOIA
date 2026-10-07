# PRD-001: Drum Sync — Escribir, escuchar y practicar batería

> **Convención de este documento.** Los requerimientos usan IDs con sub-numeración (RF-14.3) para poder trazar cada uno a sus criterios de aceptación. La etiqueta **@CRITICO** marca los requerimientos cuyo fallo invalida el producto.

## Contexto y Problema

### Alcance de este PRD

Drum Sync es **un editor de partitura de batería que suena y que sirve para practicar con la batería electrónica**. Tres piezas, una sola cadena de valor:

1. **Escribir** una partitura de batería legible, con el mouse o **tocándola** en la batería MIDI. Son dos formas de hacer lo mismo: poner notas en el pentagrama.
2. **Escucharla**, con tempo fiable, bucle y metrónomo.
3. **Practicarla**: la partitura corre —en silencio, o de fondo bajito como guía, según elija el baterista—, él toca sobre su batería MIDI y recibe feedback visual de su timing, golpe por golpe.

Cada baterista entra con su **cuenta de Google**. Sus partituras y el mapeo de su batería se guardan **en su cuenta, en un servidor en la nube**: los encuentra desde cualquier computadora con la app instalada y solo ve lo suyo.

La **aplicación de escritorio es el cliente** y corre en Windows, macOS y Linux. Todo lo que afecta al timing —leer la batería MIDI, hacer sonar la partitura y medir el feedback— se resuelve en la computadora, sin pasar por la red. El servidor solo interviene para identificar al usuario, guardar y leer su biblioteca, y entregar el kit de sonidos.

### El problema

Para practicar batería hace falta escribir ideas, escucharlas y repetirlas leyendo. Hoy eso está partido en tres herramientas que no se hablan: una para escribir, otra para escuchar y el metrónomo aparte. El alumno termina con PDFs y fotos de partituras que se pierden en la computadora o en el celular, y sin ninguna forma de saber si lo que toca cae a tiempo. La pregunta "¿estoy tocando esto bien?" no la responde ninguna de las tres.

Hay además una fricción propia del instrumento: un baterista piensa un groove tocándolo, no dibujándolo. Obligarlo a traducir con el mouse lo que ya sabe tocar es la forma más rápida de perder la idea.

Drum Sync junta las tres en un solo lugar, deja escribir tocando, y agrega la que falta: **decirte, mientras toca, si tu golpe llegó a tiempo y cuánto se desvió.** Y lo que escribís queda en un solo lugar, no repartido en archivos.

### Personas

- **David (baterista aficionado, 25 años)**: toca 4–5 veces por semana y arma grooves propios. Quiere capturar una idea sin fricción —tocándola, no dibujándola—, escucharla con sonidos creíbles y después practicarla con metrónomo y bucle hasta que le salga limpia. Su frustración concreta: no sabe si lo que toca está a tiempo o si se le está adelantando el bombo, y los ejercicios que junta se le pierden.
- **Luis (baterista profesional, 40 años)**: sessions, giras y clases. Necesita escribir un arreglo con precisión —tempo exacto, articulaciones reales, nada de adornos visuales—, encontrarlo de nuevo la semana siguiente y practicar su arreglo en bucle. Valora una herramienta que no le saque tiempo de ensayo.

## Objetivos

- **O-1 (P0) · La partitura es legible para un baterista.** Un baterista que lee partitura entiende un compás escrito en Drum Sync sin que nadie se lo explique: figuras, silencios, articulaciones y alturas del kit en las posiciones convencionales. *Objetivo de producto: no tiene AC automatizado.*
- **O-2 (P0) · Lo que se escribe suena, y suena a batería.** Cualquier partitura se reproduce con tempo estable y sonidos identificables pieza por pieza, sin que el usuario tenga que cargar ni descargar sonidos.
- **O-3 (P0) · El Modo Práctica dice la verdad sobre el timing.** El margen en milisegundos que muestra la pantalla es fiel al reloj de audio dentro de ±20 ms, porque un feedback impreciso es peor que ninguno.
- **O-4 (P1) · Capturar una idea lleva menos de 2 minutos** a alguien que abre la app por primera vez y no leyó documentación, tanto escribiendo un groove de 2 compases con el mouse como tocándolo en la batería. *Objetivo de producto: no tiene AC automatizado.*
- **O-5 (P1) · Nada de lo escrito se pierde y todo está en un solo lugar.** El trabajo sobrevive a cerrar la aplicación y a cambiar de computadora, y cualquier partitura guardada se encuentra y se vuelve a abrir desde la propia app.

**Métrica de éxito del PRD:** un baterista escribe o toca un ejercicio, lo guarda, lo escucha, lo practica con su batería MIDI y sabe, al terminar, en qué golpes se adelantó o se atrasó.

## Requerimientos Funcionales

### Notación

- **RF-01.1**: El sistema debe mostrar la partitura en un pentagrama de percusión con clave neutra.
- **RF-01.2**: El sistema debe indicar visualmente la posición actual durante la reproducción.
- **RF-02.1**: El sistema debe permitir escribir el kit completo: bombo, caja, hi-hat cerrado, hi-hat abierto, hi-hat con pie, tom agudo, tom medio, tom de piso, crash, ride, campana del ride, china y splash.
- **RF-02.2**: El sistema debe dibujar cada pieza del kit en su altura convencional del pentagrama.
- **RF-03.1**: El sistema debe permitir escribir redonda, blanca, negra, corchea y semicorchea.
- **RF-03.2**: El sistema debe permitir escribir figuras en **tresillo**: tres figuras en el espacio de dos.
- **RF-04.1**: El sistema debe mostrar los **silencios** que completan cada compás, calculados a partir de las notas escritas, sin que el usuario los escriba ni los mantenga a mano.
- **RF-04.2**: El sistema debe separar notas y silencios en dos voces: manos (plicas hacia arriba), con todas las piezas salvo bombo y hi-hat con pie, y pies (plicas hacia abajo), con bombo e hi-hat con pie.
- **RF-05.1**: El sistema debe unir con barras las corcheas y figuras menores que caen dentro de un mismo tiempo.
- **RF-05.2**: El sistema debe marcar los grupos de tresillo con su corchete y su número.
- **RF-06.1**: El sistema debe permitir marcar la articulación de cada golpe: normal, acento, nota fantasma y flam.
- **RF-06.2**: El sistema debe dibujar cada articulación de forma distinta en la partitura.
- **RF-06.3**: El sistema debe reproducir cada articulación con un sonido distinto.
- **RF-07.1**: El sistema debe elegir el instrumento según la altura del clic en el pentagrama.
- **RF-07.2**: El sistema debe elegir la posición rítmica según la posición horizontal del clic.
- **RF-08.1**: El sistema debe permitir añadir compases.
- **RF-08.2**: El sistema debe permitir quitar el último compás.
- **RF-08.3**: El sistema no debe permitir quitar el último compás cuando la partitura tiene un solo compás.
- **RF-08.4**: El sistema no debe permitir que la partitura supere los 128 compases.
- **RF-09**: El sistema debe permitir deshacer cualquier cambio de la partitura, venga de la edición con el mouse o de una toma grabada.

### Conexión con la batería MIDI

- **RF-10.1**: El sistema debe conectarse por Web MIDI a la batería USB.
- **RF-10.2**: El sistema debe listar las entradas MIDI disponibles.
- **RF-10.3**: Si Web MIDI no está disponible o el permiso se deniega, el sistema debe deshabilitar la grabación de tomas y el Modo Práctica.
- **RF-10.4**: En ese caso, el sistema debe mostrar el motivo: "Web MIDI no está disponible" o "Permiso MIDI denegado", según corresponda.
- **RF-10.5**: Si no puede abrir la entrada MIDI elegida porque otra aplicación la tiene tomada, el sistema debe mostrar el motivo "No se pudo abrir la entrada MIDI" y mantener deshabilitadas la grabación de tomas y el Modo Práctica.
- **RF-11.1**: El sistema debe traer por defecto un mapeo General MIDI de percusión (notas 35–59).
- **RF-11.2**: El sistema debe permitir reasignar cualquier nota MIDI recibida (0–127) a una pieza del kit.
- **RF-12**: El sistema debe guardar el mapeo MIDI en la cuenta del usuario, de modo que la batería se configure una sola vez, aunque el usuario cambie de computadora. Hay un único mapeo por cuenta.
- **RF-13**: El sistema debe mostrar en vivo el último golpe recibido —nota, canal e intensidad—, para confirmar que la batería está bien mapeada antes de grabar o de practicar.

### Escribir tocando: grabación de tomas

Grabar una toma es escribir en la partitura con las baquetas en lugar del mouse (RF-14.2, RF-09).

- **RF-14.1**: El sistema debe permitir grabar en la batería MIDI una toma de la cantidad de compases elegida, de 1 a 128.
- **RF-14.2**: El sistema debe escribir cada golpe de la toma como una nota normal de la partitura, editable igual que una escrita con el mouse.
- **RF-14.3** @CRITICO: El sistema debe cuantizar los golpes de la toma a la grilla elegida: semicorchea, corchea de tresillo, corchea o negra.
- **RF-14.4**: El sistema debe reemplazar lo que había escrito en los compases de la toma por los golpes grabados.
- **RF-14.5**: Si la toma tiene más compases que la partitura, el sistema debe añadir los compases que falten, hasta el tope de 128 (RF-08.4).
- **RF-14.6**: El sistema debe empezar siempre la toma en el compás 1.
- **RF-14.7**: El sistema debe deducir la duración de cada nota escrita de la separación con el golpe siguiente, nunca de cuándo se soltó el pad. El último golpe de la toma dura hasta el final del compás en que cae.
- **RF-15.1**: El sistema debe permitir arrancar la toma **al primer golpe**.
- **RF-15.2**: El sistema debe permitir arrancar la toma con una **cuenta previa** de un compás marcada por el metrónomo, aunque el metrónomo esté desactivado, sin escribir los golpes que lleguen durante la cuenta.
- **RF-16.1**: El sistema debe terminar la toma al completar los compases elegidos.
- **RF-16.2**: El sistema debe terminar la toma al pulsar Detener o Esc.
- **RF-16.3**: El sistema debe conservar los golpes ya escritos cuando la toma termina, por cualquiera de los motivos de RF-16.1 y RF-16.2.
- **RF-17.1**: El sistema debe conservar los golpes simultáneos como notas simultáneas.
- **RF-17.2**: El sistema debe fusionar en una sola nota dos golpes de la misma pieza que caigan en el mismo paso de la grilla.
- **RF-17.3**: El sistema debe ignorar los mensajes que no son un golpe —soltar el pad, o un golpe de intensidad cero—, sin escribir nada.

### Transporte y sonido

- **RF-18.1**: El sistema debe permitir fijar el tempo entre 30 y 260 BPM escribiendo el número.
- **RF-18.2**: El sistema debe permitir elegir el compás (numerador y denominador).
- **RF-18.3**: Si se escribe un tempo fuera de 30–260 BPM, el sistema debe fijar el tempo en el límite más cercano (30 o 260).
- **RF-18.4**: El sistema debe ofrecer como numerador los valores de 1 a 16 y como denominador 2, 4, 8 o 16.
- **RF-19.1** @CRITICO: El sistema debe reproducir la partitura desde el compás 1 al pulsar Play.
- **RF-19.2**: El sistema debe detener la reproducción al pulsar Detener.
- **RF-19.3**: El sistema debe permitir reproducir en bucle.
- **RF-20.1**: El sistema debe permitir activar y desactivar el **metrónomo** en cualquier momento.
- **RF-20.2**: Si el metrónomo está activado, el sistema debe hacerlo sonar durante la reproducción.
- **RF-20.3**: Si el metrónomo está activado, el sistema debe hacerlo sonar durante la grabación de una toma.
- **RF-20.4**: Si el metrónomo está activado, el sistema debe hacerlo sonar durante el Modo Práctica.
- **RF-20.5**: El sistema debe marcar con el metrónomo el pulso del compás, con acento en el primer tiempo.
- **RF-20.6**: El sistema debe ajustar el metrónomo al tempo de la partitura.
- **RF-20.7**: El sistema debe ajustar el metrónomo al compás de la partitura.
- **RF-20.8**: El sistema debe dar al metrónomo un volumen propio, para poder oírlo por encima de lo que se está tocando.
- **RF-21.1**: El sistema debe traer un **kit predefinido de samples reales**, igual para todos los usuarios y servido desde el servidor.
- **RF-21.2**: El sistema debe usar en el kit predefinido un sonido distinto para cada pieza del kit.
- **RF-21.3**: El sistema no debe habilitar Play, la grabación ni el Modo Práctica hasta que el kit predefinido esté descargado y decodificado en memoria.
- **RF-21.4**: Mientras el kit se carga, el sistema debe mostrar que el kit está cargando.

### Guardado y biblioteca

- **RF-22.1**: El sistema debe autoguardar en el servidor, en la cuenta del usuario, la partitura en curso mientras se trabaja, sin que el usuario tenga que guardar a mano.
- **RF-22.2**: El sistema debe recuperar la partitura en curso tal como estaba al volver a abrir la aplicación.
- **RF-23.1**: El sistema debe permitir guardar la partitura en la **biblioteca del usuario** dándole un nombre.
- **RF-23.2**: El sistema debe permitir volver a guardar sobre una partitura que ya está en la biblioteca.
- **RF-23.3**: El sistema no debe guardar una partitura con el nombre vacío.
- **RF-23.4**: El sistema no debe guardar una partitura con el nombre de otra partitura de la biblioteca del usuario, sin distinguir mayúsculas ni espacios en los extremos.
- **RF-24**: El sistema debe mostrar la biblioteca como un listado de las partituras guardadas, cada una con su nombre, su tempo, su cantidad de compases y la fecha de su última modificación.
- **RF-25**: El sistema debe permitir abrir en el editor cualquier partitura de la biblioteca.
- **RF-26.1**: El sistema debe pedir confirmación antes de eliminar una partitura de la biblioteca.
- **RF-26.2**: El sistema debe eliminar la partitura de forma definitiva al confirmar.

### Modo Práctica

- **RF-27.1**: El sistema debe ofrecer un **Modo Práctica** que haga avanzar la partitura para que el baterista toque sobre ella con su batería MIDI.
- **RF-27.2**: El sistema debe arrancar el Modo Práctica con el sonido de la partitura en silencio, para que lo único que se escuche sea lo que toca el baterista.
- **RF-28**: En Modo Práctica, el sistema debe destacar visualmente la próxima nota esperada mientras avanza la reproducción.
- **RF-29.1** @CRITICO: El sistema debe comparar cada golpe capturado con la nota esperada más cercana en el tiempo, sin importar la pieza; si hay varias notas a igual distancia, con la de la misma pieza que el golpe. El desvío es la diferencia entre el instante del golpe y el de esa nota: positivo si el golpe llega tarde, negativo si llega adelantado.
- **RF-29.2** @CRITICO: El sistema debe colorear de **verde** el golpe cuyo desvío, en valor absoluto, sea de 100 ms o menos y que sea de la pieza esperada.
- **RF-29.3** @CRITICO: El sistema debe colorear de **amarillo** el golpe cuyo desvío, en valor absoluto, sea mayor que 100 ms y de 250 ms o menos y que sea de la pieza esperada.
- **RF-29.4** @CRITICO: El sistema debe colorear de **rojo** el golpe cuyo desvío, en valor absoluto, sea mayor que 250 ms, incluido el que no tiene ninguna nota esperada a menos de 250 ms, y el golpe de una pieza distinta de la esperada.
- **RF-29.5**: El sistema debe marcar como **omitida**, con un indicador distinto de verde, amarillo y rojo, la nota esperada para la que ningún golpe tuvo un desvío de 250 ms o menos, cuando pasaron 250 ms desde su instante.
- **RF-30.1**: En Modo Práctica, el sistema debe mostrar en vivo la pieza esperada.
- **RF-30.2**: En Modo Práctica, el sistema debe mostrar en vivo el resultado de cada golpe.
- **RF-30.3**: En Modo Práctica, el sistema debe mostrar en vivo el desvío de cada golpe en milisegundos, con signo (positivo tarde, negativo adelantado).
- **RF-30.4**: En Modo Práctica, el sistema debe permitir usar el bucle.
- **RF-31**: En Modo Práctica, el sistema debe permitir regular el volumen de la partitura mientras se practica, desde el silencio total hasta su nivel normal, sin detener la práctica y de forma **independiente del volumen del metrónomo**.

### Identificación de usuario

Cada baterista se identifica con su cuenta de Google. La primera vez que una cuenta entra a Drum Sync es el **registro**; las siguientes, el **login**. Los datos del usuario son sus partituras de la biblioteca, su partitura en curso y su mapeo MIDI, y todos viven en el servidor asociados a su cuenta.

- **RF-32**: El sistema debe exigir una sesión iniciada con una cuenta de Google antes de dar acceso al editor, a la biblioteca y al Modo Práctica.
- **RF-33**: El sistema debe registrar al usuario la primera vez que se identifica con una cuenta de Google, creando su perfil en el servidor con su nombre y su email.
- **RF-34**: El sistema debe hacer login con el perfil existente cuando un usuario ya registrado vuelve a identificarse con la misma cuenta de Google, desde cualquier computadora, sin crear un perfil nuevo.
- **RF-35**: El sistema debe mantener la sesión iniciada entre cierres de la aplicación, hasta que el usuario cierre sesión o la sesión se revoque en el servidor.
- **RF-35.1**: Si el sistema operativo no ofrece un almacén seguro para cifrar la sesión (RNF-13), el sistema no debe permitir iniciar sesión y debe mostrar el aviso "Almacén de claves no disponible".
- **RF-36**: El sistema debe permitir cerrar la sesión.
- **RF-37**: El sistema debe asociar cada partitura guardada en la biblioteca al usuario que la guardó.
- **RF-38**: El sistema debe mostrar en la biblioteca solo las partituras del usuario con sesión iniciada.

### Conexión con el servidor

Drum Sync necesita conexión para usarse (ver Fuera de Alcance). Estos requisitos cubren qué pasa cuando la conexión falta al abrir la aplicación o se corta durante el uso.

- **RF-39.1**: Si al abrir la aplicación no puede comunicarse con el servidor, el sistema debe mostrar un aviso de "Sin conexión".
- **RF-39.2**: En ese caso, el sistema no debe dar acceso al editor, a la biblioteca ni al Modo Práctica.
- **RF-40**: Si la conexión se pierde durante el uso, el sistema debe mostrar un aviso visible.

## Requerimientos No Funcionales

- **RNF-01**: Cada nota y cada click del metrónomo debe programarse contra el reloj de Web Audio (`AudioContext.currentTime`) con 120 ms de anticipación, calculando su instante a partir del inicio de la reproducción y no sumando intervalos al evento anterior. En una reproducción de 10 minutos, a cualquier tempo entre 30 y 260 BPM, cada evento debe programarse a menos de 1 ms de su instante teórico, sin error acumulado, y ninguno debe programarse con su instante ya pasado.
- **RNF-02**: Un golpe MIDI válido debe verse en la partitura en menos de 250 ms p95, tanto grabando una toma como practicando.
- **RNF-03**: En Modo Práctica, el feedback visual debe aparecer en menos de 100 ms p95 desde el golpe, y el desvío mostrado debe ser fiel al reloj de Web Audio dentro de ±20 ms.
- **RNF-04**: La grilla rítmica debe representar la negra con 48 unidades enteras (divisible por 4 y por 3), de modo que semicorcheas y tresillos caigan en posiciones exactas y no acumulen error de redondeo al reproducir, al grabar ni al guardar.
- **RNF-05**: En cualquier compás y para cada voz, la suma de las figuras escritas y de los silencios mostrados debe completar el compás exactamente. Un silencio nunca puede contradecir a las notas, porque se deriva de ellas al dibujar.
- **RNF-06**: Al grabar, cada golpe debe cuantizarse al paso más cercano de la grilla elegida, con error máximo de medio paso.
- **RNF-07**: El editor, la reproducción y el guardado no deben depender de Web MIDI: deben funcionar igual con y sin MIDI.
- **RNF-08**: La partitura en curso debe recuperarse del servidor en menos de 3 s p95 después del login, con una conexión de 10 Mbps y una partitura de referencia de 128 compases.
- **RNF-09**: Cada partitura guardada debe llevar el número de versión de su formato; el formato de este PRD es la versión 1. Toda versión nueva del formato debe abrir sin intervención del usuario las partituras guardadas con cualquier versión publicada anterior, con el 100 % de sus notas en la misma posición musical.
- **RNF-10**: La identificación debe hacerse con Supabase Auth usando Google como proveedor, con el flujo OAuth 2.0 *authorization code* con PKCE. El login debe abrirse en el navegador del sistema, no en una vista web embebida (Google la bloquea), y volver a la app por un protocolo propio (`drumsync://`).
- **RNF-11**: Cada request de la app al servidor debe llevar el access token de la sesión, un JWT firmado por el backend. El servidor debe verificar su firma y su vencimiento (`exp`) en cada request, y rechazar con 401 cualquier token alterado o vencido. El ID token de Google lo valida el backend al hacer login (`iss`, `aud`, firma y `exp`), nunca la app.
- **RNF-12**: El access token debe usar la expiración estándar de Supabase Auth, 1 hora (3600 s), y renovarse automáticamente antes de vencer con un refresh token de un solo uso (rotación). La sesión no tiene un límite propio: dura hasta que el usuario cierra sesión o se revoca en el servidor.
- **RNF-13**: La sesión (access token y refresh token) es el único dato del usuario que se guarda en la computadora. Debe guardarse cifrada con el almacén seguro del sistema operativo (`safeStorage` de Electron), nunca en texto plano ni en el almacenamiento local del navegador.
- **RNF-14**: El control de acceso debe aplicarse en el servidor, no en la app. Toda tabla con datos de usuario debe tener Row Level Security activado, con políticas que limiten lectura y escritura a las filas cuyo dueño es el usuario del token. La app solo lleva la clave pública (*anon key*); la clave de servicio (*service_role*) nunca se distribuye con la app.
- **RNF-15**: El kit predefinido debe pesar en total 3 MB o menos, con samples cuya licencia permita distribuirlos (CC0 o comprados). Tras el login, el kit predefinido debe estar descargado y decodificado en memoria en 5 s o menos p95, con una conexión de 10 Mbps. La reproducción nunca lee sonidos de la red.
- **RNF-16**: El autoguardado debe subir la partitura en curso al servidor como máximo 5 s después del último cambio. Si la aplicación se cierra de golpe con conexión, se pierden como máximo esos 5 s de trabajo.
- **RNF-17**: La aplicación de escritorio debe ejecutarse en Windows, macOS y Linux.

## Criterios de Aceptación

### Notación

- **AC-01 (RF-01.1, RF-02.2)**: **Dado** un compás con una negra de bombo en el tiempo 1 y una negra de caja en el tiempo 3, **cuando** se muestra la partitura, **entonces** se ve un pentagrama de percusión con clave neutra, el bombo en el 1.er espacio y la caja en el 3.er espacio (tabla de AC-03).
- **AC-02 (RF-01.2)**: **Dada** una partitura de 2 compases en 4/4 a 60 BPM, **cuando** se pulsa Play y suena el tiempo 3 del compás 1, **entonces** el indicador de posición está sobre el tiempo 3 del compás 1.
- **AC-03 (RF-02.1, RF-02.2)**: **Dado** un compás vacío, **cuando** se escribe una negra de cada pieza del kit, **entonces** cada una se dibuja en la posición y con la cabeza de esta tabla:

  | Pieza | Posición en el pentagrama | Cabeza |
  |---|---|---|
  | Bombo | 1.er espacio | ovalada |
  | Caja | 3.er espacio | ovalada |
  | Tom agudo | 4.º espacio | ovalada |
  | Tom medio | 4.ª línea | ovalada |
  | Tom de piso | 2.º espacio | ovalada |
  | Hi-hat cerrado | espacio sobre el pentagrama | cruz |
  | Hi-hat abierto | espacio sobre el pentagrama | cruz con "o" encima |
  | Hi-hat con pie | espacio bajo el pentagrama | cruz |
  | Ride | 5.ª línea | cruz |
  | Campana del ride | 5.ª línea | rombo |
  | Crash | 1.ª línea adicional superior | cruz |
  | China | espacio sobre la 1.ª línea adicional superior | cruz |
  | Splash | 2.ª línea adicional superior | cruz |

- **AC-04 (RF-03.1, RF-07.1, RF-07.2)**: **Dada** la figura Negra elegida, **cuando** se hace clic a la altura de la caja en el tiempo 2 del compás 1, **entonces** aparece una negra de caja en el tiempo 2.
- **AC-05 (RF-03.1)**: **Dado** un compás de 4/4 vacío, **cuando** se escribe cada figura en el tiempo 1, **entonces** ocupa en la grilla las unidades de esta tabla:

  | Figura | Unidades de la grilla |
  |---|---|
  | Redonda | 192 |
  | Blanca | 96 |
  | Negra | 48 |
  | Corchea | 24 |
  | Semicorchea | 12 |

- **AC-06 (RF-03.2, RF-05.2)**: **Dada** la figura Corchea elegida con el tresillo activado, **cuando** se escriben tres golpes seguidos de hi-hat dentro del tiempo 1, **entonces** los tres entran completos en ese tiempo, quedan unidos por una barra y llevan el número 3 sobre el grupo.
- **AC-07 (RF-04.1)**: **Dado** un compás de 4/4 con una sola negra de caja en el tiempo 1, **cuando** se muestra, **entonces** la voz de manos tiene un silencio de negra en el tiempo 2 y uno de blanca en los tiempos 3–4. **Cuando** se agrega una negra de caja en el tiempo 4, **entonces** los silencios pasan a ser uno de negra en el tiempo 2 y otro de negra en el tiempo 3, sin que el usuario los toque.
- **AC-08 (RF-04.1)**: **Dado** un compás sin ninguna nota, **cuando** se muestra, **entonces** tiene un único silencio de compás completo, no una línea vacía.
- **AC-09 (RF-04.2)**: **Dado** un compás de 4/4 con ocho corcheas de hi-hat cerrado y bombo en los tiempos 1 y 3, **cuando** se muestra, **entonces** el hi-hat lleva plicas hacia arriba, el bombo plicas hacia abajo, la voz de pies muestra un silencio de negra en los tiempos 2 y 4, y la voz de manos no muestra ningún silencio. **Cuando** se escribe un hi-hat con pie, **entonces** queda en la voz de pies, con plica hacia abajo.
- **AC-10 (RF-05.1)**: **Dado** un compás de 4/4 con ocho corcheas de hi-hat, **cuando** se muestra, **entonces** se ven cuatro grupos de dos corcheas unidas por una barra, uno por tiempo, y ninguna barra une notas de tiempos distintos.
- **AC-11 (RF-06.1, RF-06.2, RF-06.3)**: **Dado** un golpe de caja, **cuando** se le aplica cada articulación, **entonces** se dibuja y suena como dice esta tabla:

  | Articulación | Se dibuja | Suena |
  |---|---|---|
  | Normal | cabeza sin marca | sample de caja con ganancia 1,0 (la de referencia) |
  | Acento | signo ">" sobre la nota | ganancia 1,3 |
  | Nota fantasma | cabeza entre paréntesis | ganancia 0,4 |
  | Flam | nota de adorno pequeña antes de la principal | dos ataques: el de adorno con ganancia 0,5 y 30 ms antes del tiempo, y el principal con ganancia 1,0 en el tiempo |

- **AC-12 (RF-08.1)**: **Dada** una partitura de 2 compases, **cuando** se pulsa Añadir compás, **entonces** la partitura tiene 3 compases, los dos primeros sin cambios y el tercero vacío.
- **AC-13 (RF-08.2)**: **Dada** una partitura de 3 compases con notas en todos, **cuando** se pulsa Quitar el último, **entonces** la partitura tiene 2 compases con las mismas notas que antes en el 1 y el 2.
- **AC-14 (RF-08.3)**: **Dada** una partitura de 1 compás con notas, **cuando** se intenta Quitar el último, **entonces** la partitura sigue teniendo 1 compás con las mismas notas.
- **AC-15 (RF-08.4)**: **Dada** una partitura de 128 compases, **cuando** se intenta Añadir compás, **entonces** la partitura sigue teniendo 128 compases.
- **AC-16 (RF-09)**: **Dada** una toma que terminó y dejó golpes escritos, **cuando** se pulsa Deshacer, **entonces** vuelve la partitura anterior a la toma.
- **AC-17 (RF-09)**: **Dada** una nota recién escrita, **cuando** se pulsa Deshacer, **entonces** la partitura vuelve a como estaba antes de escribirla.

### Conexión con la batería MIDI

- **AC-18 (RF-10.1, RF-10.2)**: **Dada** una batería "Midiplus Pro 9" conectada por USB, **cuando** se pulsa Conectar batería, **entonces** aparece en el listado de entradas.
- **AC-19 (RF-10.1, RF-13)**: **Dada** la batería en el listado de entradas, **cuando** se la elige y se golpea un pad, **entonces** queda conectada y se muestran la nota, el canal y la intensidad del último golpe.
- **AC-20 (RF-11.2)**: **Dada** una batería conectada, **cuando** se reasigna la nota 60 a Bombo, **entonces** los golpes de ese pad pasan a contar como bombo.
- **AC-21 (RF-11.2)**: **Dada** una batería conectada, **cuando** se reasignan las notas 0 y 127 a Caja, **entonces** los golpes que envían la nota 0 y la nota 127 cuentan como caja.
- **AC-22 (RF-11.1)**: **Dada** una batería conectada con el mapeo por defecto, **cuando** se golpean un pad que envía la nota 36 y otro que envía la 38, **entonces** los golpes cuentan como bombo y como caja, respectivamente.
- **AC-23 (RF-12)**: **Dado** un usuario que reasignó la nota 60 a Bombo en una computadora, **cuando** hace login con la misma cuenta en otra computadora, **entonces** la nota 60 sigue asignada a Bombo, sin tener que configurarla otra vez.
- **AC-24 (RF-10.3, RF-10.4)**: **Dado** que Web MIDI no está disponible, **cuando** se abre el editor, **entonces** los botones de grabar una toma y de Modo Práctica están deshabilitados y se muestra el texto "Web MIDI no está disponible". **Dado** que el permiso MIDI se denegó, **cuando** se abre el editor, **entonces** esos botones están deshabilitados y se muestra el texto "Permiso MIDI denegado".

### Escribir tocando

- **AC-25 (RF-10.5)**: **Dada** una entrada MIDI abierta por otra aplicación, **cuando** se la elige en el listado, **entonces** se muestra el texto "No se pudo abrir la entrada MIDI" y la grabación de tomas y el Modo Práctica siguen deshabilitados.
- **AC-26 (RF-14.1, RF-14.2, RF-14.3, RF-14.6, RNF-06)**: **Dada** una toma de 1 compás a 120 BPM con la grilla en semicorchea (paso de 125 ms), **cuando** llegan un golpe simulado de bombo a 0 ms y uno de caja a 510 ms del inicio, **entonces** el bombo queda escrito en el tiempo 1 del compás 1 y la caja en el tiempo 2 (paso de 500 ms), como notas normales que después se pueden editar con el mouse.
- **AC-27 (RF-17.3)**: **Dada** la toma del AC-26, **cuando** llegan los mensajes de soltar esos pads y un golpe de intensidad cero, **entonces** no se escribe nada más.
- **AC-28 (RF-14.4)**: **Dado** un compás con bombo en el tiempo 1, **cuando** se graba una toma con caja en el tiempo 3, **entonces** el compás queda solo con la caja en el tiempo 3.
- **AC-29 (RF-14.5)**: **Dada** una partitura de 2 compases, **cuando** se graba una toma de 4 compases, **entonces** la partitura queda con 4 compases.
- **AC-30 (RF-14.1)**: **Dado** el selector de cantidad de compases de la toma, **cuando** se despliega, **entonces** ofrece como máximo 128 compases.
- **AC-31 (RF-14.7)**: **Dada** una toma de 1 compás en 4/4 a 120 BPM con la grilla en negra, **cuando** llegan un golpe de bombo en el tiempo 1 y uno de caja en el tiempo 3, y el pad del bombo se suelta 100 ms después de golpearlo, **entonces** el bombo se escribe como una blanca y la caja, por ser el último golpe, como una blanca hasta el final del compás.
- **AC-32 (RF-15.1)**: **Dada** una toma de 1 compás con arranque al primer golpe, **cuando** pasan 3 s sin golpes, **entonces** la toma no empieza y no se escribe nada. **Cuando** se golpea la caja, **entonces** ese golpe queda escrito en el tiempo 1 del compás.
- **AC-33 (RF-15.2)**: **Dada** una toma de 1 compás con cuenta previa, **cuando** se golpea la caja durante la cuenta, **entonces** ese golpe no se escribe.
- **AC-34 (RF-15.2)**: **Dada** una toma de 1 compás en 4/4 con cuenta previa y el metrónomo desactivado, **cuando** arranca la toma, **entonces** se programan 4 clicks para la cuenta previa, el primero acentuado.
- **AC-35 (RF-16.1, RF-16.3)**: **Dada** una toma de 1 compás en curso con golpes ya escritos, **cuando** se completa el compás, **entonces** la grabación termina sola y esos golpes siguen en la partitura.
- **AC-36 (RF-16.2, RF-16.3)**: **Dada** una toma de 4 compases en curso con golpes ya escritos, **cuando** se pulsa Detener durante el compás 2, **entonces** la toma termina en ese momento y esos golpes siguen en la partitura.
- **AC-37 (RF-16.2, RF-16.3)**: **Dada** una toma de 4 compases en curso con golpes ya escritos, **cuando** se pulsa Esc durante el compás 2, **entonces** la toma termina en ese momento y esos golpes siguen en la partitura.
- **AC-38 (RF-17.1)**: **Dada** una toma a 120 BPM con la grilla en semicorchea, **cuando** llegan un golpe de bombo y uno de hi-hat con 5 ms de diferencia, **entonces** la partitura conserva las dos notas en el mismo paso.
- **AC-39 (RF-17.2)**: **Dada** una toma a 120 BPM con la grilla en semicorchea, **cuando** llegan dos golpes de caja con 20 ms de diferencia dentro del mismo paso, **entonces** queda una sola nota de caja.

### Transporte y sonido

- **AC-40 (RF-18.1)**: **Dado** el tempo en 100 BPM, **cuando** se escribe 128, **entonces** la indicación de tempo y la reproducción pasan a 128 BPM.
- **AC-41 (RF-18.3)**: **Dado** el tempo en 100 BPM, **cuando** se escribe 20, **entonces** el tempo pasa a 30 BPM.
- **AC-42 (RF-18.3)**: **Dado** el tempo en 100 BPM, **cuando** se escribe 300, **entonces** el tempo pasa a 260 BPM.
- **AC-43 (RF-18.2, RF-18.4)**: **Dado** el selector de compás, **cuando** se despliega, **entonces** el numerador ofrece solo los valores de 1 a 16 y el denominador solo 2, 4, 8 y 16.
- **AC-44 (RF-18.2, RF-20.7)**: **Dada** una partitura en 4/4 con el metrónomo activado, **cuando** se elige 3/4 y se pulsa Play, **entonces** la partitura muestra 3/4 y el metrónomo da 3 clicks por compás.
- **AC-45 (RF-19.1)**: **Dada** una partitura de 2 compases con una nota en el tiempo 1 del compás 1, detenida durante el compás 2, **cuando** se pulsa Play, **entonces** el indicador de posición vuelve al tiempo 1 del compás 1 y esa nota suena en el primer instante de la reproducción.
- **AC-46 (RF-19.2)**: **Dada** una reproducción en curso con el metrónomo activado, **cuando** se pulsa Detener, **entonces** se cancelan los eventos de audio pendientes y no se programa ninguno nuevo, el indicador de posición se detiene y el botón vuelve a Play.
- **AC-47 (RF-19.3)**: **Dada** una partitura de 1 compás con el bucle activado, **cuando** se pulsa Play y termina el compás, **entonces** la reproducción vuelve al compás 1 sin detenerse.
- **AC-48 (RF-20.1)**: **Dada** una reproducción en curso con el metrónomo activado, **cuando** se desactiva el metrónomo, **entonces** no se programa ningún click más y las notas siguen programándose.
- **AC-49 (RF-20.2, RF-20.5)**: **Dada** una partitura de 4/4 a 120 BPM con el metrónomo activado, **cuando** se pulsa Play, **entonces** se programan 4 clicks por compás, el primero acentuado, junto con las notas de la partitura.
- **AC-50 (RF-20.3, RF-20.4)**: **Dado** el metrónomo activado, **cuando** se graba una toma y cuando se practica en Modo Práctica, **entonces** en los dos casos se programan sus clicks.
- **AC-51 (RF-20.2, RF-20.3, RF-20.4)**: **Dado** el metrónomo desactivado, **cuando** se reproduce, se graba una toma sin cuenta previa y se practica, **entonces** en ningún caso se programa un click.
- **AC-52 (RF-20.4, RF-20.6, RF-30.4)**: **Dada** una partitura de 1 compás en Modo Práctica a 100 BPM con bucle y metrónomo activados, **cuando** termina el compás, **entonces** vuelve a empezar, el metrónomo sigue marcando 100 BPM y los golpes siguen recibiendo feedback.
- **AC-53 (RF-20.8)**: **Dada** una partitura sonando con el metrónomo activado, **cuando** se baja el volumen del metrónomo a cero, **entonces** la ganancia de los clicks es 0 y la ganancia de las notas no cambia.
- **AC-54 (RF-21.1, RF-21.2)**: **Dado** un usuario con sesión iniciada, **cuando** se reproduce una partitura con una nota de cada pieza del kit, **entonces** cada pieza suena con el sample del kit predefinido, distinto del de las demás piezas.
- **AC-55 (RF-21.3, RF-21.4)**: **Dado** un usuario que acaba de hacer login, **cuando** el kit todavía se está descargando, **entonces** Play, la grabación y el Modo Práctica están deshabilitados y se muestra el texto "Cargando kit". **Cuando** el kit queda decodificado en memoria, **entonces** se habilitan y el texto desaparece.

### Guardado y biblioteca

- **AC-56 (RF-22.1, RF-22.2)**: **Dada** una partitura con tempo y notas que nunca se guardó en la biblioteca, **cuando** se cierra la aplicación y se vuelve a abrir, **entonces** aparece la misma partitura con su tempo y sus notas.
- **AC-57 (RF-23.1, RF-24)**: **Dada** una partitura de 2 compases a 120 BPM, **cuando** se guarda en la biblioteca con el nombre "Shuffle lento", **entonces** aparece en el listado con ese nombre, 120 BPM, 2 compases y la fecha de hoy.
- **AC-58 (RF-25)**: **Dada** "Shuffle lento" en la biblioteca, **cuando** se abre, **entonces** el editor la carga con el mismo tempo, los mismos compases y las mismas notas.
- **AC-59 (RF-23.2)**: **Dada** "Shuffle lento" abierta y modificada, **cuando** se vuelve a guardar, **entonces** el listado muestra la fecha actualizada y sigue habiendo una sola entrada con ese nombre.
- **AC-60 (RF-23.3)**: **Dada** una partitura, **cuando** se intenta guardar con el nombre vacío, **entonces** no se guarda y la biblioteca no cambia.
- **AC-61 (RF-23.4)**: **Dada** "Shuffle lento" en la biblioteca y otra partitura distinta en el editor, **cuando** se intenta guardar la segunda con el nombre "Shuffle lento", **entonces** no se guarda y la entrada existente no cambia. **Cuando** se intenta con el nombre "  shuffle LENTO ", **entonces** tampoco se guarda.
- **AC-62 (RF-26.1)**: **Dada** una partitura en la biblioteca, **cuando** se pide eliminarla, **entonces** se pide confirmación antes de borrarla.
- **AC-63 (RF-26.1)**: **Dada** la confirmación de eliminar en pantalla, **cuando** se cancela, **entonces** la partitura sigue en el listado.
- **AC-64 (RF-26.2)**: **Dada** la confirmación de eliminar en pantalla, **cuando** se confirma, **entonces** la partitura desaparece del listado.

### Modo Práctica

- **AC-65 (RF-27.1, RF-27.2, RF-28)**: **Dada** una partitura de 2 compases con notas en los tiempos 1 y 3, **cuando** se activa Modo Práctica con el metrónomo activado y se pulsa Play, **entonces** no se programa ninguna nota de la partitura con ganancia audible y el metrónomo suena. **Cuando** ya pasó la nota del tiempo 1 y todavía no llegó la del tiempo 3, **entonces** la nota destacada es la del tiempo 3.
- **AC-66 (RF-29.1, RF-29.2, RF-29.3, RF-29.4, RF-30.1, RF-30.2, RF-30.3)**: **Dada** una partitura de 1 compás con bombo en el tiempo 1 y caja en el tiempo 3, a 120 BPM y en Modo Práctica, **cuando** se toca el bombo con cada uno de estos desvíos respecto del tiempo 1, **entonces** el golpe se ve del color de la tabla y en todos los casos se muestran la pieza esperada y el desvío en milisegundos con su signo:

  | Desvío del golpe | Desvío mostrado | Color |
  |---|---|---|
  | 0 ms | 0 ms | verde |
  | 100 ms tarde | +100 ms | verde |
  | 100 ms adelantado | −100 ms | verde |
  | 101 ms tarde | +101 ms | amarillo |
  | 150 ms adelantado | −150 ms | amarillo |
  | 250 ms tarde | +250 ms | amarillo |
  | 250 ms adelantado | −250 ms | amarillo |
  | 251 ms tarde | +251 ms | rojo |
  | 251 ms adelantado | −251 ms | rojo |

- **AC-67 (RF-29.1, RF-29.4)**: **Dada** una partitura con crash en el tiempo 1, **cuando** el baterista toca bombo en ese tiempo con 0 ms de desvío, **entonces** el golpe se ve rojo, porque la pieza no es la esperada.
- **AC-68 (RF-29.1)**: **Dada** la partitura del AC-66 (bombo en el tiempo 1 y caja en el tiempo 3, a 120 BPM), **cuando** se toca el bombo a 500 ms del tiempo 1, a igual distancia de las dos notas esperadas, **entonces** el golpe se compara con la nota de bombo, la pieza esperada mostrada es bombo y el desvío mostrado es +500 ms.
- **AC-69 (RF-29.1, RF-29.4)**: **Dada** la partitura del AC-66, **cuando** se toca la caja a 600 ms del tiempo 1, sin ninguna nota esperada a menos de 250 ms, **entonces** el golpe se ve rojo.
- **AC-70 (RF-29.5)**: **Dada** la partitura del AC-66, **cuando** se toca solo el bombo con 0 ms de desvío y pasan 250 ms desde el instante de la caja, **entonces** la caja se ve marcada como omitida y el bombo no.
- **AC-71 (RF-31)**: **Dada** una partitura de 2 compases en Modo Práctica con el volumen de la partitura en 0 %, **cuando** se sube al 50 % sin detener la práctica, **entonces** las notas de la partitura empiezan a programarse con ganancia audible, la ganancia del metrónomo no cambia y la práctica no se interrumpe.
- **AC-72 (RF-31)**: **Dada** una partitura de 2 compases en Modo Práctica, **cuando** se repiten los mismos golpes simulados con el volumen en 0 % y en 50 %, **entonces** el color y el desvío de cada golpe son iguales en los dos casos.
- **AC-73 (RF-31)**: **Dada** una práctica con el volumen de la partitura en 50 %, **cuando** se vuelve a 0 %, **entonces** las notas de la partitura dejan de programarse con ganancia audible y la práctica sigue.

### Identificación de usuario

- **AC-74 (RF-32)**: **Dado** que no hay ninguna sesión iniciada, **cuando** se abre la aplicación, **entonces** solo se muestra la pantalla para identificarse con Google, y no se puede llegar al editor, a la biblioteca ni al Modo Práctica.
- **AC-75 (RF-33)**: **Dada** una cuenta de Google que nunca entró a Drum Sync, **cuando** el usuario completa la identificación con Google, **entonces** se crea un único perfil con su nombre y su email, y su biblioteca aparece vacía.
- **AC-76 (RF-34)**: **Dado** un usuario registrado que tiene la partitura "Shuffle lento" en su biblioteca, **cuando** se identifica con la misma cuenta de Google en otra computadora, **entonces** entra a su mismo perfil, "Shuffle lento" aparece en su listado y sigue existiendo un solo perfil para esa cuenta.
- **AC-77 (RF-35, RNF-12)**: **Dado** un usuario con sesión iniciada, **cuando** cierra la aplicación y la vuelve a abrir con conexión más de 1 hora después, con el access token ya vencido, **entonces** entra directo al editor sin pasar por la pantalla de identificación.
- **AC-78 (RF-35, RNF-12)**: **Dado** un usuario con sesión iniciada cuya sesión se revoca en el servidor, **cuando** la aplicación intenta renovar el token, **entonces** la sesión se cierra y se muestra la pantalla de identificación.
- **AC-79 (RF-35.1)**: **Dado** un sistema Linux sin almacén de claves disponible para `safeStorage`, **cuando** se abre la aplicación y se intenta identificarse con Google, **entonces** se muestra el aviso "Almacén de claves no disponible" y no se inicia sesión.
- **AC-80 (RF-36)**: **Dado** un usuario con sesión iniciada, **cuando** cierra sesión y vuelve a abrir la aplicación, **entonces** se muestra la pantalla de identificación.
- **AC-81 (RF-37)**: **Dado** un usuario A con sesión iniciada, **cuando** guarda la partitura "Shuffle lento" en la biblioteca, **entonces** la fila guardada en el servidor tiene como dueño el identificador de A.
- **AC-82 (RF-37, RF-38) · Control de acceso desde la app**: **Dados** dos usuarios registrados y A con "Shuffle lento" en su biblioteca, **cuando** A cierra sesión y B hace login en la misma computadora, **entonces** "Shuffle lento" no aparece en el listado de B.

### Conexión con el servidor

- **AC-83 (RF-39.1, RF-39.2)**: **Dada** una computadora sin conexión a Internet, **cuando** se abre la aplicación, **entonces** se muestra el aviso "Sin conexión" y no se puede llegar al editor.
- **AC-84 (RF-40, RNF-01)**: **Dado** un usuario practicando con la partitura abierta, **cuando** se corta la conexión, **entonces** aparece un aviso de que no hay conexión, la reproducción no se detiene, ningún evento de sonido se programa tarde (RNF-01) y el feedback sigue apareciendo.

### Requerimientos no funcionales

- **AC-85 (RNF-01)**: **Dada** una reproducción simulada de 10 minutos, una vez a 30 BPM y otra a 260 BPM, **cuando** se registra el instante programado de cada nota y cada click, **entonces** ninguno se aparta 1 ms o más de su instante teórico y ninguno se programa con un instante anterior a `AudioContext.currentTime`.
- **AC-86 (RNF-02)**: **Dados** 100 golpes MIDI simulados durante una toma y otros 100 en Modo Práctica, **cuando** se mide el tiempo desde la marca de tiempo de cada golpe hasta que se dibuja en la partitura, **entonces** el p95 es menor que 250 ms en ambos casos.
- **AC-87 (RNF-03)**: **Dados** 100 golpes MIDI simulados en Modo Práctica con desvíos conocidos, **cuando** se mide el feedback, **entonces** el p95 desde el golpe hasta el feedback visual es menor que 100 ms y cada desvío mostrado difiere del conocido en 20 ms o menos.
- **AC-88 (RNF-04)**: **Dada** la grilla rítmica, **cuando** se consulta cuántas unidades tiene la negra, **entonces** tiene 48 unidades, y la semicorchea ocupa 12, la corchea de tresillo 16 y la corchea 24. **Cuando** se guarda y se vuelve a abrir una partitura con esas figuras, **entonces** cada nota queda en la misma posición.
- **AC-89 (RNF-05)**: **Dados** un compás con tresillos junto a semicorcheas y un compás escrito por una toma grabada, **cuando** se calculan los silencios, **entonces** en cada voz la suma de las figuras y los silencios es exactamente la duración del compás.
- **AC-90 (RNF-07)**: **Dado** que Web MIDI no está disponible o el permiso MIDI se denegó, **cuando** el usuario escribe una partitura con el mouse, la guarda en la biblioteca y la reproduce, **entonces** las tres acciones se completan igual que con MIDI disponible.
- **AC-91 (RNF-08)**: **Dado** un usuario cuya partitura en curso tiene 128 compases, con la conexión limitada a 10 Mbps, **cuando** hace login 100 veces, **entonces** el p95 del tiempo entre el login y ver la partitura en curso es menor que 3 s.
- **AC-92 (RNF-09)**: **Dado** un conjunto de partituras de prueba, una por cada versión publicada del formato (hoy, solo la versión 1) y con notas en todas las figuras y piezas del kit, **cuando** cada una se abre con la versión actual de la aplicación, **entonces** se abre sin que el usuario convierta nada y con el 100 % de sus notas en la misma posición musical.
- **AC-93 (RNF-09)**: **Dada** una partitura guardada con la versión actual de la aplicación, **cuando** se lee la fila guardada en el servidor, **entonces** lleva el número de versión de formato 1.
- **AC-94 (RNF-10)**: **Dado** un usuario sin sesión iniciada, **cuando** pulsa identificarse con Google, **entonces** el login se abre en el navegador del sistema y no en una vista web embebida, y al terminar vuelve a la app por `drumsync://`.
- **AC-95 (RNF-11)**: **Dado** un access token con la firma alterada, o vencido y sin refresh token válido, **cuando** la aplicación lo usa en un request, **entonces** el servidor responde 401 y la aplicación muestra la pantalla de identificación.
- **AC-96 (RNF-11)**: **Dado** un ID token de Google con la firma alterada, con `aud` ajeno a la app o vencido, **cuando** se intenta hacer login con él, **entonces** el servidor lo rechaza y no se inicia ninguna sesión.
- **AC-97 (RNF-12)**: **Dado** un refresh token que ya se usó una vez para renovar la sesión, **cuando** se intenta usarlo de nuevo, **entonces** el servidor lo rechaza y la aplicación muestra la pantalla de identificación.
- **AC-98 (RNF-13)**: **Dado** un usuario con sesión iniciada, **cuando** se inspeccionan la carpeta de datos de la aplicación y el localStorage y el IndexedDB del navegador, **entonces** ni el access token ni el refresh token aparecen en texto plano en ninguno de ellos.
- **AC-99 (RNF-14) · Control de acceso en el servidor**: **Dado** un usuario B con un token válido y los identificadores de una partitura de la biblioteca, de la partitura en curso y del mapeo MIDI del usuario A, **cuando** B las pide o intenta modificarlas o borrarlas llamando directamente a la API, sin pasar por la app, **entonces** cada pedido responde con error 401 o 403, el servidor no devuelve ningún dato de A y no modifica ni borra nada.
- **AC-100 (RNF-14)**: **Dado** un usuario B con un token válido, **cuando** B intenta crear una fila indicando a A como dueño, **entonces** el servidor responde 403 y no se crea ninguna fila.
- **AC-101 (RNF-14)**: **Dados** los pedidos del AC-99 y del AC-100, **cuando** se repiten sin token, solo con la clave pública (*anon key*), **entonces** el servidor responde 401 y no devuelve ningún dato de usuario.
- **AC-102 (RNF-14)**: **Dado** un usuario B con un token válido y el identificador del perfil (nombre y email) del usuario A, **cuando** B lo pide o intenta modificarlo o borrarlo llamando directamente a la API, **entonces** el pedido responde con error 401 o 403, el servidor no devuelve ningún dato de A y no modifica ni borra nada.
- **AC-103 (RNF-15)**: **Dado** el kit predefinido publicado, **cuando** se suman los tamaños de todos sus archivos, **entonces** el total es de 3 MB o menos, y cada sample tiene registrada una licencia CC0 o de compra con redistribución.
- **AC-104 (RNF-15)**: **Dado** un usuario con sesión iniciada, con la conexión limitada a 10 Mbps, **cuando** hace login 100 veces, **entonces** el p95 del tiempo entre el login y tener el kit predefinido decodificado en memoria es de 5 s o menos.
- **AC-105 (RNF-15)**: **Dado** el kit decodificado en memoria, **cuando** se corta la conexión y se reproduce una partitura, **entonces** la reproducción no hace ningún request de red y suena con todos los samples.
- **AC-106 (RNF-16)**: **Dado** un usuario con conexión, **cuando** escribe una nota, espera 6 s y la aplicación se cierra de golpe, **entonces** al volver a abrirla la nota está en la partitura en curso.
- **AC-107 (RNF-17)**: **Dado** el instalador de la aplicación en Windows, en macOS y en Linux, **cuando** se instala y se abre en cada uno, **entonces** en los tres sistemas se llega a la pantalla de identificación.

## Fuera de Alcance

Queda **fuera de este PRD**:

- Transcripción de audio desde MP3 y detección automática de tempo.
- Generación de grooves con IA.
- Importación y exportación de archivos de partitura, sea `.compas.json`, MIDI, MusicXML o PDF.
- Plataforma de profesores y alumnos, con sus roles, invitaciones y partituras compartidas entre usuarios.
- **Uso sin conexión**, cualquier copia local de la biblioteca o del kit de sonidos, y conservar o subir después los cambios hechos mientras no hay red.
- Edición simultánea de la misma partitura desde dos computadoras.
- Identificación con proveedores que no sean Google o con usuario y contraseña propios.
- Versión web de la app para usuarios finales.
- Que los usuarios modifiquen o reemplacen el kit predefinido, que es igual para todos, y subir sonidos propios.
- Vista compacta de varios compases por línea y salida imprimible.
- Metrónomo por separado de la partitura.
- Notación avanzada: ligaduras entre compases, redobles medidos y buzz rolls, cambios de compás dentro de un mismo tema y partituras de instrumentos que no sean batería.
- En la grabación de tomas: grabar a un tempo distinto del de la partitura, deducir el tempo de cómo se tocó y convertir la intensidad de cada golpe en dinámica automática.
- Un mapeo MIDI distinto por cada batería: hay un único mapeo por cuenta.
- Elegir el compás desde el que arranca una toma: siempre arranca en el compás 1.
- Pedir confirmación al abrir una partitura de la biblioteca cuando hay trabajo sin guardar, o al quitar un compás que tiene notas.
- Eliminar la cuenta del usuario y exportar o borrar todos sus datos.
- Requisitos de accesibilidad (lector de pantalla, contraste, navegación por teclado).
- Cualquier idioma de la interfaz que no sea español.
- Funciones que quedan para una versión posterior: mezclador por pieza (volumen, silencio y solo), dinámicas, secciones de canción, indicaciones de texto, edición en cuadrícula, tempo con TAP o con botones +/−, volumen general de reproducción, rehacer, puntillo, rimshot y cross-stick.
- Todo hardware que no sea una batería con salida USB MIDI, así que quedan afuera las baterías acústicas y el MIDI por Bluetooth.

De esos recortes se siguen tres consecuencias que el resto del documento da por ciertas: el tempo lo fija siempre el usuario, a mano (RF-18); el metrónomo existe solo como capa de la reproducción, la grabación y el Modo Práctica, atado al tempo y al compás de la partitura (RF-20); y las partituras viven solo en la biblioteca del servidor, sin que el usuario manipule nunca un archivo de partitura. Por lo tanto este PRD **no depende de ningún proveedor de IA** y **no contempla un servidor propio**: el backend es **Supabase** (Auth, base de datos Postgres y Storage), y la app habla directamente con él.

## Riesgos y Dependencias

### Riesgos

- **Todo depende del servidor.** Si Supabase no responde, nadie puede entrar a la app (RF-39). Mitigación: plan pago con backups diarios y datos en Postgres estándar, exportables con `pg_dump` si hace falta migrar de proveedor. El plan gratuito pausa el proyecto tras una semana sin actividad, así que solo sirve para desarrollo.
- **La clave pública va dentro de la app.** Cualquiera puede extraerla, así que la seguridad depende por completo de las políticas de RLS (RNF-14). Una tabla nueva sin RLS expone los datos de todos los usuarios. Mitigación: AC-99 a AC-102 prueban las políticas sin pasar por la app.
- **Si se corta la red durante el uso, los cambios nuevos no se suben.** No hay cola de cambios ni advertencia al cerrar: lo que no llegó al servidor se pierde. Es consecuencia directa de no tener modo sin conexión. Mitigación: aviso visible apenas se pierde la conexión (RF-40), para que el usuario sepa que lo nuevo no se está subiendo; lo anterior al corte ya está en el servidor (RNF-16).
- **Descargar el kit demora la entrada a la app** y cuenta contra los 2 minutos de O-4. Mitigación: kit predefinido de 3 MB o menos (RNF-15).
- **Licencia de los samples.** El kit predefinido tiene que salir de samples libres (CC0) o comprados con licencia de redistribución. Sin eso no se puede publicar la app. Mitigación: registrar la licencia de cada sample antes de incluirlo en el kit, y verificarlo en AC-103.
- **Permiso MIDI denegado o puerto tomado por otra app** → se muestra el motivo (RF-10.4, RF-10.5) y se puede elegir otra entrada del listado (RF-10.2). Sin MIDI se pierden la grabación y la práctica, pero no el editor (AC-24, AC-90).
- **Cada módulo de batería envía notas distintas** → mapeo editable (RF-11) y mapeo guardado en la cuenta (RF-12).
- **Un golpe humano cae entre dos pasos de la grilla** → la grilla es elegible, incluye tresillo, y el redondeo está acotado a medio paso (RNF-06). Lo grabado son notas normales, así que un golpe mal cuantizado se corrige con el mouse en lugar de volver a grabar toda la toma.
- **Latencia o jitter de Web Audio y Web MIDI** → reloj de Web Audio para la reproducción, `event.timeStamp` para los golpes, cuantización explícita y el desvío siempre medido contra el reloj de audio, nunca contra el reloj de la interfaz. La red nunca está en ese camino: los sonidos se reproducen desde memoria (RNF-15).
- **El feedback de timing es la función crítica y no se puede probar sin hardware** → la suite de tests inyecta golpes MIDI simulados con marcas de tiempo conocidas, para validar la cuantización, el color y el desvío sin batería conectada.
- **El cálculo automático de silencios puede producir notación rara con figuras mezcladas** → RNF-05 lo vuelve verificable: el compás siempre cierra exacto, y los casos límite —tresillos junto a semicorcheas, y lo que salga de una toma grabada— entran en la suite.
- **Abrir una partitura de la biblioteca reemplaza la partitura en curso sin avisar.** El autoguardado conserva solo la última, así que el trabajo no guardado en la biblioteca se pierde. Es consecuencia de no pedir confirmación al abrir (Fuera de Alcance). Mitigación: lo ya guardado en la biblioteca no se pierde (RF-23); el usuario evita el problema guardando antes.
- **La identificación suma un paso antes de capturar la primera idea** → cuenta contra los 2 minutos de O-4. Mitigación: la sesión persiste entre cierres (RF-35), así que el paso se hace solo la primera vez en cada computadora.
- **En Linux, `safeStorage` depende de que el sistema tenga un almacén de claves.** Sin él, la sesión no se podría guardar cifrada (RNF-13). Mitigación: si no hay almacén seguro, la aplicación no permite iniciar sesión y muestra un aviso (RF-35.1).
- **El núcleo no debe quedar atado al backend** → el editor, la reproducción, la grabación y el Modo Práctica no dependen de Supabase ni de Electron, así que se desarrollan y se prueban sin servidor.

### Dependencias

- Web Audio API (reproducción de samples y metrónomo) y Web MIDI API (batería), sobre motor Chromium.
- **Contenedor de escritorio Electron** como cliente, con `safeStorage` para la sesión y un protocolo propio (`drumsync://`) para volver del login.
- Windows, macOS y Linux como sistemas operativos del cliente (RNF-17).
- Chrome o Edge en localhost para desarrollar y probar el cliente.
- **Supabase**:
  - **Auth** con Google como proveedor, que emite los JWT de sesión.
  - **Postgres** con Row Level Security para perfiles, biblioteca, partitura en curso y mapeo MIDI.
  - **Storage** para el kit predefinido (bucket público de lectura).
  - Plan pago para producción.
- **Google Cloud Console**: un client ID de OAuth configurado en Supabase Auth.
- Conexión a Internet para usar la aplicación.
- Samples de batería con licencia de redistribución para el kit predefinido.
- Node y Vite para desarrollo y build.
- Una batería electrónica con salida USB MIDI para grabar tomas y para el Modo Práctica.
- Mapeo General MIDI de percusión **versionado en este repositorio** (`src/midi.ts`), portado del proyecto `midi-drum-monitor`. No hay dependencia de archivos fuera del repo.
