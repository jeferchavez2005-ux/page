window.addEventListener("DOMContentLoaded", () => {
  const historial = JSON.parse(localStorage.getItem("historial")) || [];
  const contenedor = document.getElementById("listaHistorial");
  const btnMantenimiento = document.getElementById("btnVerMantenimiento");
  const btnRegistro = document.getElementById("btnVerRegistro");

  function exportarPDF(reg, tipo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      tipo === "mantenimiento"
        ? "REGISTRO DE MANTENIMIENTO VEHICULAR"
        : "REGISTRO DE CONDUCTOR VEHICULAR",
      105,
      15,
      { align: "center" }
    );

    let y = 30;

    if (tipo === "registro") {
      doc.setFontSize(12);
      doc.text("Datos del Conductor", 20, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [["Campo", "Valor"]],
        body: [
          ["Nombre del conductor", reg.conductor || ""],
          ["Número de brevete", reg.brevete || ""],
          ["Placa del vehículo", reg.placa || ""],
          ["Fecha", reg.fecha || ""],
          ["Hora de salida", reg.hora_salida || ""],
          ["Hora de retorno", reg.hora_retorno || ""],
          ["Nombre del jefe inmediato", reg.jefe || ""],
        ],
        theme: "grid",
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;

      doc.text("Actividades a Realizar", 20, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [["Campo", "Valor"]],
        body: [
          ["Lugar de ejecución", reg.lugar || ""],
          ["Detalle de actividad", reg.detalle || ""],
          ["Fecha de actividad", reg.fecha_actividad || ""],
          ["Cumplimiento", reg.cumplimiento || ""],
        ],
        theme: "grid",
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;

      doc.text("Estado físico-emocional del conductor", 20, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [["Pregunta", "Respuesta"]],
        body: [
          ["¿Descansado y en condiciones de conducir?", reg.descanso || ""],
          ["¿Sin dolencias o enfermedades?", reg.salud || ""],
          ["¿Medicamentos no afectan conducción?", reg.medicamentos || ""],
          ["¿Buen estado emocional y concentración?", reg.emocional || ""],
          ["¿Consciente de la responsabilidad?", reg.responsabilidad || ""],
        ],
        theme: "grid",
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;

      doc.text("Estado general del vehículo", 20, y); y += 10;

      const checklist = Object.entries(reg).filter(([key]) =>
        key.startsWith("motor_") ||
        key.startsWith("interna_") ||
        key.startsWith("externa_") ||
        key.startsWith("doc_") ||
        key.startsWith("func_") ||
        key.startsWith("eq_")
      ).map(([key, val]) => [key.replace(/_/g, " "), val || ""]);

      doc.autoTable({
        startY: y,
        head: [["Elemento", "Estado"]],
        body: checklist,
        theme: "grid",
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;

      doc.text("Observaciones", 20, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [["Salida", "Retorno"]],
        body: [[reg.obs_salida || "", reg.obs_retorno || ""]],
        theme: "grid",
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;

      if (reg.fotos && Array.isArray(reg.fotos)) {
        doc.text("Fotos del vehículo:", 20, y); 
        y += 5;

        let x = 20;
        reg.fotos.forEach((img) => {
          if (y + 40 > doc.internal.pageSize.getHeight()) {
            doc.addPage();
            y = 20;
            x = 20;
          }
          const format = img.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(img, format, x, y, 40, 30);
          x += 50;
          if (x > 100) {
            x = 20;
            y += 35;
          }
        });
        y += 40;
      }
    }

    if (reg.firma) {
      doc.text("Firma del conductor:", 20, y);
      const firmaFormat = reg.firma.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(reg.firma, firmaFormat, 20, y + 5, 60, 30);
    }

    doc.save(`${tipo}_${Date.now()}.pdf`);
  }

  function exportarExcelIndividual(reg, tipo, index) {
    const hoja = XLSX.utils.json_to_sheet([reg]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, tipo === "mantenimiento" ? "Mantenimiento" : "Registro");
    XLSX.writeFile(libro, `${tipo}_${index + 1}.xlsx`);
  }

  function mostrar(tipo) {
    contenedor.innerHTML = "";
    const historial = JSON.parse(localStorage.getItem("historial")) || [];
    const filtrados = historial
      .filter(reg => tipo === "mantenimiento" ? (reg.fechaMantenimiento || reg.tipo) : reg.conductor)
      .reverse();

    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No hay registros disponibles.</p>";
      return;
    }

    filtrados.forEach((reg, index) => {
      const div = document.createElement("div");
      div.className = "registro-cuadro";

      if (tipo === "mantenimiento") {
        div.innerHTML = `
          <h3>Mantenimiento ${index + 1}</h3>
          <p><strong>Tipo:</strong> ${reg.tipo || "No especificado"}</p>
          <p><strong>Placa:</strong> ${reg.placa || ""}</p>
          <p><strong>Fecha:</strong> ${reg.fechaMantenimiento || ""}</p>
        `;
      } else {
        div.innerHTML = `
          <h3>Registro ${index + 1}</h3>
          <p><strong>Nombre:</strong> ${reg.conductor || ""}</p>
          <p><strong>Placa:</strong> ${reg.placa || ""}</p>
          <p><strong>Fecha:</strong> ${reg.fecha || ""}</p>
        `;
      }

      const grupoBotones = document.createElement("div");
      grupoBotones.className = "grupo-botones";

      const botonPDF = document.createElement("button");
      botonPDF.textContent = "Exportar PDF";
      botonPDF.className = "btn-exportar";
      botonPDF.addEventListener("click", () => exportarPDF(reg, tipo));

      const botonExcel = document.createElement("button");
      botonExcel.textContent = "Exportar Excel";
      botonExcel.className = "btn-excel";
      botonExcel.addEventListener("click", () => exportarExcelIndividual(reg, tipo, index));

      grupoBotones.appendChild(botonPDF);
      grupoBotones.appendChild(botonExcel);
      div.appendChild(grupoBotones);
      contenedor.appendChild(div);
    });
  }

  btnMantenimiento.addEventListener("click", () => mostrar("mantenimiento"));
  btnRegistro.addEventListener("click", () => mostrar("registro"));
});
