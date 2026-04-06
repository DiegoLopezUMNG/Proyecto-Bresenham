const CELL      = 36;  // Tamaño en píxeles de cada celda de la cuadrícula
const MARGIN    = 2;   // Margen en celdas alrededor de los extremos de la línea
const TICK_EVERY = 2;  // Mostrar etiqueta numérica cada N celdas

/* ============================================================
   FUNCIÓN PRINCIPAL: run()
   Se invoca al presionar el botón "Trazar".
   Lee los valores del formulario, ejecuta el algoritmo,
   dibuja el canvas y genera la tabla de pasos.
   ============================================================ */
function run() {
  // Leer y convertir a entero los valores del formulario
  const x0 = parseInt(document.getElementById('x0').value);
  const y0 = parseInt(document.getElementById('y0').value);
  const x1 = parseInt(document.getElementById('x1').value);
  const y1 = parseInt(document.getElementById('y1').value);

  // Ejecutar el algoritmo; obtener puntos y registro de pasos
  const { points, steps } = bresenham(x0, y0, x1, y1);

  // Dibujar la cuadrícula, ejes y píxeles
  drawCanvas(points, x0, y0, x1, y1);

  // Poblar la tabla de pasos
  buildTable(steps);
}
/* ============================================================
   ALGORITMO DE BRESENHAM
   Implementación del algoritmo de trazado de línea de Bresenham.
   @param {number} x0 - Coordenada X inicial.
   @param {number} y0 - Coordenada Y inicial.
   @param {number} x1 - Coordenada X final.
   @param {number} y1 - Coordenada Y final.
   @returns {{ points: Array<{x,y}>, steps: Array<Object> }}
            points → lista de píxeles trazados.
            steps  → lista de objetos con el estado interno en cada iteración.
   ============================================================ */
function bresenham(x0, y0, x1, y1) {
  // Diferenciales absolutos de cada eje
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
    // Determinar la dirección de incremento para cada eje
    // Dirección del paso: +1 o -1 según el sentido de la línea
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  // Error inicial: diferencia entre el avance en X y el avance en Y
  let err = dx - dy;

  const points = []; // Píxeles activados
  const steps  = []; // Registro para la tabla
  let stepNum  = 0; // Contador de pasos

  while (true) {
    const e2     = 2 * err; // Doble del error para comparación
    const adjX   = e2 > -dy; // Condición para ajustar X
    const adjY   = e2 < dx;  // Condición para ajustar Y
     const isLast = (x0 === x1 && y0 === y1); // Verificar si se ha llegado al punto final
     // Registrar solo los campos necesarios para la tabla
     steps.push({ step: stepNum++, x: x0, y: y0, err, adjX, adjY, sx, sy, isLast });
     // Activar el píxel actual
     points.push({ x: x0, y: y0 });
     // Condición de parada: llegamos al punto final
    if (isLast) break;
     // Ajustar el error y las coordenadas según las condiciones
    if (adjX) {
      err -= dy; // Reducir el error por el avance en X
      x0 += sx;  // Mover en X según la dirección
    }
    if (adjY) {
      err += dx; // Aumentar el error por el avance en Y
      y0 += sy;  // Mover en Y según la dirección
    }
  }
   return { points, steps };
}
/* ============================================================
   DIBUJO DEL CANVAS
   Renderiza la cuadrícula con ejes numerados y los píxeles
   activados por el algoritmo de Bresenham.
   @param {Array<{x,y}>} points - Píxeles a resaltar.
   @param {number} x0 - Coordenada X del punto inicial (para marcarlo).
   @param {number} y0 - Coordenada Y del punto inicial.
   @param {number} x1 - Coordenada X del punto final.
   @param {number} y1 - Coordenada Y del punto final.
   ============================================================ */
function drawCanvas(points, x0, y0, x1, y1) {
  const canvas = document.getElementById('grid');
  const ctx    = canvas.getContext('2d');
// Calcular el rango visible con margen
  const minX = Math.min(x0, x1) - MARGIN;
  const maxX = Math.max(x0, x1) + MARGIN;
  const minY = Math.min(y0, y1) - MARGIN;
  const maxY = Math.max(y0, y1) + MARGIN;
  
  const cols = maxX - minX + 1; // Número de columnas visibles
  const rows = maxY - minY + 1; // Número de filas visibles
  // Ajustar el tamaño del canvas según el rango visible
  // Dimensiones del canvas en píxeles
  const W = cols * CELL;
  const H = rows * CELL;
  canvas.width  = W;
  canvas.height = H; 
  
 //actializar variables CSS del wrapper para posicionar los ejes
  const wrapper = document.getElementById('canvas-wrapper');
  wrapper.style.setProperty('--min-x', minX); // Para posicionar los ejes en el lugar correcto
  wrapper.style.setProperty('--min-y', minY); // Para posicionar los ejes en el lugar correcto
  // Renderizar ejes numéricos en los divs laterales
  buildAxisLabels(minX, maxX, minY, maxY, cols, rows);

   // ── Fondo ──
  ctx.fillStyle = getComputedStyle(document.documentElement)
                   .getPropertyValue('--surface').trim();
  ctx.fillRect(0, 0, W, H);
// ── Cuadrícula ──
  ctx.strokeStyle = 'rgba(48,54,61,0.6)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, H);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(W, r * CELL);
    ctx.stroke();
  }
// ── Píxeles de Bresenham ──
  // Convertir coordenada lógica a píxel en el canvas.
  // El eje Y está invertido: fila 0 del canvas = maxY lógico.
  const toCanvasX = lx => (lx - minX) * CELL;
  const toCanvasY = ly => (maxY - ly) * CELL;

  points.forEach(({ x, y }) => {
    const cx = toCanvasX(x); // Convertir coordenada lógica X a píxel
    const cy = toCanvasY(y); // Convertir coordenada lógica Y a píxel
    
// Relleno del píxel activo
    ctx.fillStyle = 'rgba(88,166,255,0.25)'; // Color de fondo del píxel
    ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2); // Rellenar con un margen para mostrar la cuadrícula
      // Borde del píxel activo
    ctx.strokeStyle = '#58a6ff'; // Color del borde del píxel
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 1, cy + 1, CELL - 2, CELL - 2); // Dibujar borde con un margen para mostrar la cuadrícula
// Coordenadas dentro de la celda
    ctx.fillStyle = '#58a6ff'; // Color del texto de coordenadas
    ctx.font = `bold ${Math.max(9, CELL * 0.22)}px 'Share Tech Mono', monospace`; // Fuente monoespaciada y tamaño proporcional al tamaño de la celda 
    ctx.textBaseline = 'middle';
    ctx.fillText(`${x},${y}`, cx + CELL / 2, cy + CELL / 2); // Centrar el texto dentro de la celda
  });
    // ── Marcar punto inicial (círculo verde) ──
  markPoint(ctx, toCanvasX(x0), toCanvasY(y0), '#3fb950', 'P0');

  // ── Marcar punto final (círculo naranja) ──
  markPoint(ctx, toCanvasX(x1), toCanvasY(y1), '#f0883e', 'P1');
}
/* ============================================================
   MARCAR UN PUNTO ESPECIAL EN EL CANVAS
   Dibuja un pequeño círculo y etiqueta sobre una celda.
   @param {CanvasRenderingContext2D} ctx - Contexto del canvas.
   @param {number} cx    - Coordenada X canvas (esquina superior-izquierda de celda).
   @param {number} cy    - Coordenada Y canvas (esquina superior-izquierda de celda).
   @param {string} color - Color del marcador.
   @param {string} label - Texto de la etiqueta (ej. "P0", "P1").
   ============================================================ */
function markPoint(ctx, cx, cy, color, label) { // cx, cy son las coordenadas de la esquina superior-izquierda de la celda
  const r  = CELL * 0.18;
  const px = cx + CELL / 2; // Coordenada X del centro de la celda
  const py = cy + CELL / 2; // Coordenada Y del centro de la celda

  // Dibujar el círculo
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2); // Círculo centrado en la celda
  ctx.fillStyle = color;
  ctx.fill() 
// Dibujar la etiqueta centrada sobre el círculo
  ctx.fillStyle = '#000'; // Color del texto de la etiqueta
  ctx.font = `bold ${Math.max(8, CELL * 0.18)}px 'Barlow', sans-serif`; // Fuente y tamaño proporcional al tamaño de la celda
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px, py); // Centrar el texto sobre el círculo

  /* ============================================================
   CONSTRUIR ETIQUETAS DE EJES
   Rellena los divs #axisY y #axisX con los valores numéricos
   correspondientes a cada fila/columna de la cuadrícula.
   Solo se muestra un número cada TICK_EVERY celdas para no saturar.
   @param {number} minX  - Valor lógico mínimo en X.
   @param {number} maxX  - Valor lógico máximo en X.
   @param {number} minY  - Valor lógico mínimo en Y.
   @param {number} maxY  - Valor lógico máximo en Y.
   @param {number} cols  - Número de columnas en el canvas.
   @param {number} rows  - Número de filas en el canvas.
   ============================================================ */

function buildAxisLabels(minX, maxX, minY, maxY, cols, rows) {
  const axisY = document.getElementById('axisY'); // Obtener referencia a los contenedores de etiquetas de los ejes
  const axisX = document.getElementById('axisX'); 

  // Ajustar dimensiones dinámicamente según el tamaño del canvas
  axisY.style.height = (rows * CELL) + 'px';
  axisX.style.width  = (cols * CELL) + 'px';

// ── Eje Y: valores de minY (abajo) a maxY (arriba) ──
  axisY.innerHTML = '';
  for (let ly = minY; ly <= maxY; ly++) {
    const span = document.createElement('span');
    span.style.height         = CELL + 'px';
    span.style.lineHeight     = CELL + 'px';
    span.style.display        = 'flex';
    span.style.alignItems     = 'center';
    span.style.justifyContent = 'flex-end';
    // Mostrar número solo si es múltiplo de TICK_EVERY o el extremo
    if ((ly - minY) % TICK_EVERY === 0 || ly === maxY) {
      span.textContent = ly;
    }
    axisY.appendChild(span);
  }
   // ── Eje X: valores de minX (izquierda) a maxX (derecha) ──
  axisX.innerHTML = '';
  for (let lx = minX; lx <= maxX; lx++) {
    const span = document.createElement('span'); // Crear un span para cada etiqueta del eje X
    span.style.width     = CELL + 'px'; // Ancho igual al tamaño de la celda
    span.style.textAlign = 'center';
    if ((lx - minX) % TICK_EVERY === 0 || lx === maxX) { // Mostrar número solo si es múltiplo de TICK_EVERY o el extremo
      span.textContent = lx;
    }
    axisX.appendChild(span); // Agregar el span al contenedor del eje X
  }
}

/* ============================================================
   CONSTRUIR TABLA DE PASOS
   Genera las filas de la tabla con una vista simplificada:
   paso, coordenadas actuales, error acumulado y observación
   sobre qué ajustes se realizaron en esa iteración.
   @param {Array<Object>} steps - Registros de bresenham().
          Cada objeto: { step, x, y, err, adjX, adjY, sx, sy, isLast }
   ============================================================ */
function buildTable(steps) {
  const tbody = document.getElementById('stepBody');
  tbody.innerHTML = '';
  steps.forEach(s => {
    const tr = document.createElement('tr');