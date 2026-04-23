const listaEdiciones = document.getElementById('lista-ediciones');

async function cargarGanadores() {
  const { data, error } = await clienteSupabase
    .from('ganadores_historicos')
    .select(`
      id,
      categoria,
      edicion,
      year,
      puestos (
        id,
        nombre,
        especialidad,
        foto_perfil_url
      )
    `)
    .order('year', { ascending: false });

  if (error) {
    listaEdiciones.innerHTML = '<p class="cargando">Error al cargar ganadores</p>';
    console.error(error);
    return;
  }

  // Agrupar por edición/año
  const porEdicion = {};
  data.forEach(g => {
    const clave = `${g.edicion}-${g.year}`;
    if (!porEdicion[clave]) {
      porEdicion[clave] = { edicion: g.edicion, year: g.year, ganadores: [] };
    }
    porEdicion[clave].ganadores.push(g);
  });

  listaEdiciones.innerHTML = Object.values(porEdicion).map(edicion => `
    <div class="bloque-edicion">
      <div class="encabezado-edicion">
        <span class="numero-edicion">Edición ${edicion.edicion}</span>
        <span class="year-edicion">${edicion.year}</span>
      </div>
      <div class="grid-ganadores">
        ${edicion.ganadores.map(g => {
          const puesto = g.puestos;
          const iniciales = puesto.nombre.split(' ').slice(0,2).map(n => n[0]).join('');
          return `
            <a href="perfil.html?id=${puesto.id}" class="tarjeta-ganador">
              ${puesto.foto_perfil_url
                ? `<img src="${puesto.foto_perfil_url}" alt="${puesto.nombre}" class="foto-ganador">`
                : `<div class="foto-ganador placeholder-ganador">${iniciales}</div>`
              }
              <div class="info-ganador">
                <div class="nombre-ganador">${puesto.nombre}</div>
                <span class="categoria-ganador">${g.categoria}</span>
              </div>
              <div class="trofeo-ganador">🏆</div>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

cargarGanadores();