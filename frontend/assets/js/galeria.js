const gridGaleria = document.getElementById('grid-galeria');
const lightbox = document.getElementById('lightbox');
const lightboxContenido = document.getElementById('lightbox-contenido');
const lightboxCerrar = document.getElementById('lightbox-cerrar');

const emojis = {
  'Arepa de huevo': '🥚',
  'Carimañola': '🫓',
  'Empanada': '🫔',
  'Buñuelo de frijol': '🟡',
  'Arepita dulce': '🍯',
  'Frito innovador': '⭐'
};

let todosLosItems = [];

async function cargarGaleria() {
  const { data, error } = await clienteSupabase
    .from('fritos')
    .select(`
      id,
      nombre,
      categoria,
      imagen_url,
      puestos ( nombre )
    `);

  if (error) {
    gridGaleria.innerHTML = '<p class="cargando">Error al cargar la galería</p>';
    console.error(error);
    return;
  }

  todosLosItems = data;
  renderizarGaleria(data);
  iniciarFiltros();
}

function renderizarGaleria(items) {
  const conMedia = items.filter(f => f.imagen_url || f.video_url);

  if (conMedia.length === 0) {
    gridGaleria.innerHTML = `
      <div class="estado-vacio">
        <div class="emoji-vacio">📷</div>
        <h3>Sin imágenes aún</h3>
        <p>Pronto habrá fotos de los mejores fritos del festival.</p>
      </div>
    `;
    return;
  }

  gridGaleria.innerHTML = conMedia.map(frito => {
    const esVideo = frito.video_url && !frito.imagen_url;
    return `
      <div class="item-galeria" data-id="${frito.id}" data-categoria="${frito.categoria}">
        ${esVideo
          ? `<div class="media-galeria video-galeria">
               <video src="${frito.video_url}" muted loop playsinline></video>
               <div class="badge-video">▶ Reel</div>
             </div>`
          : `<div class="media-galeria">
               <img src="${frito.imagen_url}" alt="${frito.nombre}" loading="lazy"
                 onerror="this.parentElement.innerHTML='<div class=placeholder-galeria>${emojis[frito.categoria] || '🍳'}</div>'">
             </div>`
        }
        <div class="info-galeria">
          <span class="categoria-galeria">${frito.categoria}</span>
          <div class="nombre-galeria">${frito.nombre}</div>
          <div class="matrona-galeria">👩‍🍳 ${frito.puestos?.nombre || ''}</div>
        </div>
      </div>
    `;
  }).join('');

  // Lightbox al hacer clic
  document.querySelectorAll('.item-galeria').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const frito = todosLosItems.find(f => f.id === id);
      abrirLightbox(frito);
    });
  });

  // Hover en videos
  document.querySelectorAll('.video-galeria video').forEach(video => {
    video.parentElement.parentElement.addEventListener('mouseenter', () => video.play());
    video.parentElement.parentElement.addEventListener('mouseleave', () => video.pause());
  });
}

function abrirLightbox(frito) {
  lightboxContenido.innerHTML = `
    ${frito.video_url
      ? `<video src="${frito.video_url}" controls autoplay class="lightbox-media"></video>`
      : `<img src="${frito.imagen_url}" alt="${frito.nombre}" class="lightbox-media">`
    }
    <div class="lightbox-info">
      <span class="categoria-galeria">${frito.categoria}</span>
      <h3>${frito.nombre}</h3>
      <p>👩‍🍳 ${frito.puestos?.nombre || ''}</p>
    </div>
  `;
  lightbox.classList.add('abierto');
  document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
  lightbox.classList.remove('abierto');
  document.body.style.overflow = '';
  lightboxContenido.innerHTML = '';
}

lightboxCerrar.addEventListener('click', cerrarLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) cerrarLightbox();
});

function iniciarFiltros() {
  document.querySelectorAll('.filtros-galeria .boton-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtros-galeria .boton-filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      const cat = btn.dataset.categoria;
      const filtrados = cat === 'todos' ? todosLosItems : todosLosItems.filter(f => f.categoria === cat);
      renderizarGaleria(filtrados);
    });
  });
}

cargarGaleria();