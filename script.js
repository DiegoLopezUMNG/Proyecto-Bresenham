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