const cuadriculaPuestos = document.getElementById('cuadricula-puestos');
const campoBusqueda = document.getElementById('campo-busqueda');
const botonesFilro = document.querySelectorAll('.boton-filtro');

let todosPuestos = [];
let categoriaActiva = 'todos';

// Generar iniciales del nombre
function obtenerIniciales(nombre) {
  return nombre.split(' ')
    .filter(n => n.length > 2)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

// Renderizar tarjetas de puestos
function mostrarPuestos(puestos) {
  if (puestos.length === 0) {
    cuadriculaPuestos.innerHTML = '<p class="cargando">No se encontraron puestos</p>';
    return;
  }

  cuadriculaPuestos.innerHTML = puestos.map((p, i) => `
    <a class="tarjeta-puesto" href="perfil.html?id=${p.id}">
      ${p.foto_perfil_url
  ? `<img src="${p.foto_perfil_url}" alt="${p.nombre}" class="avatar-puesto" style="object-fit:cover;">`
  : `<div class="avatar-puesto ${i % 2 === 0 ? '' : 'azul'}">${obtenerIniciales(p.nombre)}</div>`
}
      <div class="nombre-puesto">${p.nombre}</div>
      <div class="especialidad-puesto">${p.especialidad}</div>
      <span class="numero-puesto">Puesto ${p.numero_puesto}</span>
    </a>
  `).join('');
}

// Filtrar puestos
function filtrarPuestos() {
  const busqueda = campoBusqueda.value.toLowerCase();
  let resultado = todosPuestos;

  if (categoriaActiva !== 'todos') {
    resultado = resultado.filter(p =>
      p.especialidad.toLowerCase().includes(categoriaActiva.toLowerCase())
    );
  }

  if (busqueda) {
    resultado = resultado.filter(p =>
      p.nombre.toLowerCase().includes(busqueda) ||
      p.especialidad.toLowerCase().includes(busqueda)
    );
  }

  mostrarPuestos(resultado);
}

// Cargar puestos desde Supabase
async function cargarPuestos() {
  const { data, error } = await clienteSupabase
    .from('puestos')
    .select('*')
    .order('numero_puesto', { ascending: true });

  if (error) {
    cuadriculaPuestos.innerHTML = '<p class="cargando">Error al cargar los puestos</p>';
    return;
  }

  todosPuestos = data;
  mostrarPuestos(todosPuestos);
}

// Eventos filtros
botonesFilro.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesFilro.forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    categoriaActiva = boton.dataset.categoria;
    filtrarPuestos();
  });
});

campoBusqueda.addEventListener('input', filtrarPuestos);

// Iniciar
cargarPuestos();