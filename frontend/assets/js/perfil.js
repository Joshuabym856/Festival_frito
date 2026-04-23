const encabezadoPerfil = document.getElementById('encabezado-perfil');
const cuadriculaFritos = document.getElementById('cuadricula-fritos');
const botonDescargarQr = document.getElementById('boton-descargar-qr');

// Obtener ID del puesto desde la URL
const parametros = new URLSearchParams(window.location.search);
const idPuesto = parametros.get('id');

let usuarioActual = null;
let votosUsuario = [];

// Generar iniciales
function obtenerIniciales(nombre) {
  return nombre.split(' ')
    .filter(n => n.length > 2)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

// Obtener emoji según especialidad
function obtenerEmoji(especialidad) {
  const emojis = {
    'Arepa de huevo': '🥚',
    'Carimañola': '🫓',
    'Empanada': '🫔',
    'Buñuelo de frijol': '🟡',
    'Arepita dulce': '🍯',
    'Frito innovador': '⭐'
  };
  return emojis[especialidad] || '🍳';
}

// Cargar perfil del puesto
async function cargarPerfil() {
  if (!idPuesto) {
    encabezadoPerfil.innerHTML = '<p class="cargando">Puesto no encontrado</p>';
    return;
  }

  const { data: puesto, error } = await clienteSupabase
    .from('puestos')
    .select('*')
    .eq('id', idPuesto)
    .single();

  if (error || !puesto) {
    encabezadoPerfil.innerHTML = '<p class="cargando">Error al cargar el perfil</p>';
    return;
  }

  document.title = `FritoMapp - ${puesto.nombre}`;

  encabezadoPerfil.innerHTML = `
    ${puesto.foto_perfil_url
  ? `<img src="${puesto.foto_perfil_url}" alt="${puesto.nombre}" class="avatar-perfil foto-perfil">`
  : `<div class="avatar-perfil azul">${obtenerIniciales(puesto.nombre)}</div>`
}
    <div class="info-perfil">
      <h1 class="nombre-perfil">${puesto.nombre}</h1>
      <p class="especialidad-perfil">${puesto.especialidad}</p>
      <p class="biografia-perfil">${puesto.biografia}</p>
      <span class="etiqueta-puesto">Puesto ${puesto.numero_puesto}</span>
    </div>
  `;

  generarQR(puesto);
  iniciarMapa(puesto.coordenadas, puesto.nombre);
}

// Cargar fritos del puesto
async function cargarFritos() {
  const { data: fritos, error } = await clienteSupabase
    .from('fritos')
    .select('*')
    .eq('puesto_id', idPuesto);

  if (error) {
    cuadriculaFritos.innerHTML = '<p class="cargando">Error al cargar el menú</p>';
    return;
  }

  if (fritos.length === 0) {
    cuadriculaFritos.innerHTML = '<p class="cargando">Este puesto aún no tiene fritos registrados</p>';
    return;
  }

  // Obtener conteo de votos por frito
  const { data: votos } = await clienteSupabase
    .from('votos')
    .select('frito_id');

  const conteoPorFrito = {};
  if (votos) {
    votos.forEach(v => {
      conteoPorFrito[v.frito_id] = (conteoPorFrito[v.frito_id] || 0) + 1;
    });
  }

  cuadriculaFritos.innerHTML = fritos.map((f, i) => `
    <div class="tarjeta-frito">
     ${f.imagen_url
  ? `<img src="${f.imagen_url}" alt="${f.nombre}" class="imagen-frito" style="object-fit:cover;">`
  : `<div class="imagen-frito ${i % 2 === 0 ? '' : 'azul'}">${obtenerEmoji(f.categoria)}</div>`
}
      <div class="contenido-frito">
        <div class="nombre-frito">${f.nombre}</div>
        <span class="categoria-frito">${f.categoria}</span>
        <p class="descripcion-frito">${f.descripcion}</p>
        <div class="pie-frito">
          <span class="conteo-votos">
            ♥ ${conteoPorFrito[f.id] || 0} votos
          </span>
          <button 
            class="boton-votar ${votosUsuario.includes(f.id) ? 'votado' : ''}" 
            id="boton-votar-${f.id}"
            onclick="manejarVoto('${f.id}')"
          >
            ${votosUsuario.includes(f.id) ? 'Votado ♥' : 'Votar'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

//Gestionar el voto del usuario
async function manejarVoto(idFrito) {
  const sesion = await clienteSupabase.auth.getSession();
  usuarioActual = sesion.data.session?.user;

  if (!usuarioActual) {
    document.getElementById('fondo-formulario').classList.add('abierto');
    return;
  }

  const boton = document.getElementById(`boton-votar-${idFrito}`);
  const yaVotoEste = votosUsuario.includes(idFrito);

  if (yaVotoEste) {
    // Quitar su voto
    const { error } = await clienteSupabase
      .from('votos')
      .delete()
      .eq('usuario_id', usuarioActual.id);

    if (!error) {
      votosUsuario = [];
      boton.textContent = 'Votar';
      boton.classList.remove('votado');
      boton.disabled = false;

      const conteo = boton.previousElementSibling;
      const actual = parseInt(conteo.textContent.match(/\d+/)?.[0]) || 0;
      conteo.textContent = `♥ ${Math.max(0, actual - 1)} votos`;
    }
  } else {
    // Primero borra cualquier voto anterior
    await clienteSupabase
      .from('votos')
      .delete()
      .eq('usuario_id', usuarioActual.id);

    // Luego inserta el nuevo
    const { error } = await clienteSupabase
      .from('votos')
      .insert([{ usuario_id: usuarioActual.id, frito_id: idFrito }]);

    if (!error) {
      votosUsuario = [idFrito];
      boton.textContent = 'Votado ♥';
      boton.classList.add('votado');

      const conteo = boton.previousElementSibling;
      const actual = parseInt(conteo.textContent.match(/\d+/)?.[0]) || 0;
      conteo.textContent = `♥ ${actual + 1} votos`;
    }
  }
}

//Para el mapa
function iniciarMapa(coordenadas, nombrePuesto) {
  if (!coordenadas) return;

  const [lat, lng] = coordenadas.split(',').map(Number);

  const mapa = L.map('mapa').setView([lat, lng], 17);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  const icono = L.divIcon({
    html: '🍳',
    className: 'icono-mapa',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  L.marker([lat, lng], { icon: icono })
    .addTo(mapa)
    .bindPopup(`<b>${nombrePuesto}</b>`)
    .openPopup();
}

//Para generar el QR

function generarQR(puesto) {
  const urlPerfil = `${window.location.origin}/perfil.html?id=${puesto.id}`;

  new QRCode(document.getElementById('codigo-qr'), {
    text: urlPerfil,
    width: 180,
    height: 180,
    colorDark: '#1B4F8A',
    colorLight: '#f5f0e8',
  });

  // Guardar la URL del perfil en qr_url si aún no existe
  if (!puesto.qr_url) {
    clienteSupabase
      .from('puestos')
      .update({ qr_url: urlPerfil })
      .eq('id', puesto.id)
      .then(({ error }) => {
        if (error) console.error('Error guardando QR:', error.message);
        else console.log('QR guardado:', urlPerfil);
      });
  }
}

// Descargar QR
botonDescargarQr.addEventListener('click', () => {
  const canvas = document.querySelector('#codigo-qr canvas');
  if (!canvas) return;
  const enlace = document.createElement('a');
  enlace.download = `qr-puesto-${idPuesto}.png`;
  enlace.href = canvas.toDataURL();
  enlace.click();
});

// Cargar votos del usuario actual
async function cargarVotosUsuario() {
  const sesion = await clienteSupabase.auth.getSession();
  usuarioActual = sesion.data.session?.user;

  if (usuarioActual) {
    const { data } = await clienteSupabase
      .from('votos')
      .select('frito_id')
      .eq('usuario_id', usuarioActual.id);

    if (data) votosUsuario = data.map(v => v.frito_id);
  }
}

// Iniciar
async function iniciar() {
  await cargarVotosUsuario();
  await cargarPerfil();
  await cargarFritos();
}

iniciar();