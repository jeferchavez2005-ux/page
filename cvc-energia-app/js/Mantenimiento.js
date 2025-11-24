document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mantenimientoForm");
  const canvas = document.getElementById("mantenimientoFirmaCanvas");
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  // Configuración firma
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  function getPosicion(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      return { x: touch.pageX - rect.left - window.scrollX, y: touch.pageY - rect.top - window.scrollY };
    } else {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }

  function comenzarDibujo(e) {
    dibujando = true;
    const pos = getPosicion(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function terminarDibujo() {
    dibujando = false;
    ctx.beginPath();
  }

  function dibujar(e) {
    if (!dibujando) return;
    const pos = getPosicion(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  // Eventos mouse/touch
  canvas.addEventListener("mousedown", comenzarDibujo);
  canvas.addEventListener("mouseup", terminarDibujo);
  canvas.addEventListener("mouseout", terminarDibujo);
  canvas.addEventListener("mousemove", dibujar);

  canvas.addEventListener("touchstart", comenzarDibujo, { passive: false });
  canvas.addEventListener("touchend", terminarDibujo, { passive: false });
  canvas.addEventListener("touchcancel", terminarDibujo, { passive: false });
  canvas.addEventListener("touchmove", e => { e.preventDefault(); dibujar(e); }, { passive: false });

  // Botón limpiar firma
  document.getElementById("limpiarMantenimientoFirma").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  });

  // Validar firma vacía
  function estaCanvasVacio(canvas, ctx) {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false;
    }
    return true;
  }

  // Guardar mantenimiento
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (estaCanvasVacio(canvas, ctx)) {
      alert("Por favor, firme antes de guardar.");
      return;
    }

    const formData = new FormData(this);
    const registroFinal = {};
    formData.forEach((value, key) => {
      registroFinal[key] = value;
    });

    // ✅ Diferenciar tipo de registro
    registroFinal.tipoRegistro = "mantenimiento";

    // ✅ Guardar firma en base64
    registroFinal.firma = canvas.toDataURL("image/png");

    let historial = JSON.parse(localStorage.getItem("historial")) || [];
    historial.push(registroFinal);
    localStorage.setItem("historial", JSON.stringify(historial));

    alert("Mantenimiento guardado correctamente ✅");
    this.reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  });
});
