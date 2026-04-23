const listTop5 = document.getElementById('lista-top5');

const emojis = {
  'Arepa de huevo': '🥚',
  'Carimañola': '🫓',
  'Empanada': '🫔',
  'Buñuelo de frijol': '🟡',
  'Arepita dulce': '🍯',
  'Frito innovador': '⭐'
};

const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
const clases  = ['primero', 'segundo', 'tercero', '', ''];

// Renderizar el ranking
function renderizarTop5(fritos) {
  if (!fritos || fritos.length === 0) {
    listTop5.innerHTML = `
      <div class="estado-vacio">
        <div class="emoji-vacio">🍽️</div>
        <h3>Aún no hay votos</h3>
        <p>Sé el primero en votar por tu frito favorito.<br>Ve a los perfiles de las matronas y elige tu preferido.</p>
      </div>
    `;
    return;
  }

  // Máximo de votos para calcular la barra de progreso
  const maxVotos = fritos[0].total_votos || 1;

  listTop5.innerHTML = fritos.map((frito, i) => {
    const porcentaje = maxVotos > 0 ? Math.round((frito.total_votos / maxVotos) * 100) : 0;
    const emoji = emojis[frito.categoria] || '🍳';

    const imagenHTML = frito.imagen_url
      ? `<img src="${frito.imagen_url}" alt="${frito.nombre}" class="imagen-ranking" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';

    const placeholderHTML = `
      <div class="imagen-ranking-placeholder ${i % 2 !== 0 ? 'azul' : ''}" ${frito.imagen_url ? 'style="display:none"' : ''}>
        ${emoji}
      </div>
    `;

    return `
      <div class="tarjeta-ranking ${clases[i]}">
        <div class="numero-ranking">${medallas[i]}</div>

        ${imagenHTML}
        ${placeholderHTML}

        <div class="info-ranking">
          <div class="nombre-ranking">${frito.nombre}</div>
          <span class="categoria-ranking">${frito.categoria}</span>
          <div class="matrona-ranking">👩‍🍳 ${frito.matrona} · Puesto ${frito.numero_puesto}</div>
          <div class="barra-progreso">
            <div class="barra-progreso-relleno" style="width: ${porcentaje}%"></div>
          </div>
        </div>

        <div class="votos-ranking">
          <span class="numero-votos">${frito.total_votos}</span>
          <span class="label-votos">${frito.total_votos === 1 ? 'voto' : 'votos'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Cargar top5 desde la vista de Supabase
async function cargarTop5() {
  const { data, error } = await clienteSupabase
    .from('top5_fritos')
    .select('*')
    .order('total_votos', { ascending: false })
    .limit(5);

  if (error) {
    listTop5.innerHTML = '<p class="cargando">Error al cargar el ranking</p>';
    console.error(error);
    return;
  }

  renderizarTop5(data);
}

// Suscripción en tiempo real a la tabla votos
// Cada vez que alguien vote, se recarga el top5 automáticamente
function suscribirseEnTiempoReal() {
  clienteSupabase
    .channel('votos-tiempo-real')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votos' },
      () => {
        // Pequeño delay para que la vista top5_fritos se actualice
        setTimeout(cargarTop5, 300);
      }
    )
    .subscribe();
}

// Iniciar
cargarTop5();
suscribirseEnTiempoReal();