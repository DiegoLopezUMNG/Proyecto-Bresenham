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