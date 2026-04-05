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
    

