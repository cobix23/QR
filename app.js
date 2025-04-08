let historial = [];
let registros = {};

window.onload = function () {
  if (localStorage.getItem("registros")) {
    registros = JSON.parse(localStorage.getItem("registros"));
    historial = JSON.parse(localStorage.getItem("historial"));
    actualizarHistorialGeneral();
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};

function escanearCaja() {
  const id = document.getElementById("idCaja").value;
  const contenido = document.getElementById("contenido").value;
  const destino = document.getElementById("destino").value;
  const ubicacion = document.getElementById("ubicacion").value;
  const estado = "En revisión";
  const timestamp = new Date().toLocaleString();

  if (!id || !contenido || !destino || !ubicacion) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const caja = { id, contenido, destino, ubicacion, estado };
  registros[id] = caja;
  historial.push({ ...caja, timestamp });

  localStorage.setItem("registros", JSON.stringify(registros));
  localStorage.setItem("historial", JSON.stringify(historial));

  mostrarEstado(caja);
  actualizarHistorialGeneral();
}

function mostrarEstado(caja) {
  document.getElementById("estadoActual").innerText =
    `Caja ${caja.id}: ${caja.estado} | Ubicación: ${caja.ubicacion}`;
}

function actualizarHistorialGeneral() {
  const lista = document.getElementById("historial");
  lista.innerHTML = "";
  historial.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.timestamp} - Caja ${item.id} → ${item.estado} en ${item.ubicacion}`;
    lista.appendChild(li);
  });
}

function nuevaBusqueda() {
  document.getElementById("idCaja").value = "";
  document.getElementById("contenido").value = "";
  document.getElementById("destino").value = "";
  document.getElementById("ubicacion").value = "";
  document.getElementById("estadoActual").innerText = "Sin escanear";
  document.getElementById("infoCaja").innerHTML = "";
  document.getElementById("historialID").innerHTML = "";
  document.getElementById("idCaja").focus();
}

function buscarCaja() {
  const id = document.getElementById("idCaja").value;
  const infoCaja = document.getElementById("infoCaja");
  const historialID = document.getElementById("historialID");
  infoCaja.innerHTML = "";
  historialID.innerHTML = "";

  if (registros[id]) {
    const caja = registros[id];
    document.getElementById("contenido").value = caja.contenido;
    document.getElementById("destino").value = caja.destino;
    document.getElementById("ubicacion").value = caja.ubicacion;
    mostrarEstado(caja);

    infoCaja.innerHTML = `
      <h4>📋 Información del ID: ${id}</h4>
      <p><strong>Contenido:</strong> ${caja.contenido}</p>
      <p><strong>Destino:</strong> ${caja.destino}</p>
      <p><strong>Ubicación:</strong> ${caja.ubicacion}</p>
      <p><strong>Estado Actual:</strong> ${caja.estado}</p>
    `;

    const listaFiltrada = historial.filter(item => item.id === id);
    if (listaFiltrada.length > 0) {
      const titulo = document.createElement("h4");
      titulo.textContent = `📂 Historial del ID: ${id}`;
      historialID.appendChild(titulo);

      const ul = document.createElement("ul");
      listaFiltrada.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.timestamp} - Estado: ${item.estado}, Ubicación: ${item.ubicacion}`;
        ul.appendChild(li);
      });
      historialID.appendChild(ul);
    }
  } else {
    alert("No se encontró ninguna caja con ese ID.");
  }
}

function iniciarEscaneo() {
  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    (decodedText) => {
      document.getElementById("idCaja").value = decodedText;
      qrScanner.stop();
    },
    (errorMessage) => {
      console.warn("QR no válido", errorMessage);
    }
  );
}
