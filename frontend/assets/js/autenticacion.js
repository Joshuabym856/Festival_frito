// Se asegura que el menú siempre inicia cerrado
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('menu-movil').classList.remove('abierto');
  document.getElementById('fondo-menu-movil').classList.remove('abierto');
  document.getElementById('boton-flotante').classList.remove('abierto');
});

const botonSesion = document.getElementById('boton-sesion');
const botonSesionMovil = document.getElementById('boton-sesion-movil');
const fondoFormulario = document.getElementById('fondo-formulario');
const botonCerrarFormulario = document.getElementById('boton-cerrar-formulario');
const botonEnviar = document.getElementById('boton-enviar');
const campoCorreo = document.getElementById('campo-correo');
const campoContrasena = document.getElementById('campo-contrasena');
const formularioError = document.getElementById('formulario-error');
const cambiarRegistro = document.getElementById('cambiar-registro');

let modoRegistro = false;

// Abrir formulario
botonSesion.addEventListener('click', () => fondoFormulario.classList.add('abierto'));
botonSesionMovil.addEventListener('click', () => {
  fondoFormulario.classList.add('abierto');
  cerrarMenuMovil();
});

// Cerrar formulario
botonCerrarFormulario.addEventListener('click', () => fondoFormulario.classList.remove('abierto'));
fondoFormulario.addEventListener('click', (e) => {
  if (e.target === fondoFormulario) fondoFormulario.classList.remove('abierto');
});

// Toggle login/registro
cambiarRegistro.addEventListener('click', () => {
  modoRegistro = !modoRegistro;
  document.querySelector('.formulario-titulo').textContent = modoRegistro ? 'Crear cuenta' : 'Iniciar sesión';
  botonEnviar.textContent = modoRegistro ? 'Registrarse' : 'Entrar';
  cambiarRegistro.textContent = modoRegistro ? 'Inicia sesión' : 'Regístrate';
  document.querySelector('.formulario-cambiar').firstChild.textContent = modoRegistro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? ';
});

// Enviar formulario
botonEnviar.addEventListener('click', async () => {
  const correo = campoCorreo.value.trim();
  const contrasena = campoContrasena.value.trim();
  formularioError.textContent = '';

  if (!correo || !contrasena) {
    formularioError.textContent = 'Por favor completa todos los campos';
    return;
  }

  botonEnviar.textContent = 'Cargando...';
  botonEnviar.disabled = true;

  try {
    let resultado;
    if (modoRegistro) {
      resultado = await clienteSupabase.auth.signUp({ email: correo, password: contrasena });
    } else {
      resultado = await clienteSupabase.auth.signInWithPassword({ email: correo, password: contrasena });
    }

    if (resultado.error) {
      formularioError.textContent = resultado.error.message;
    } else {
      fondoFormulario.classList.remove('abierto');
      actualizarBotonSesion(resultado.data.user);
    }
  } catch (err) {
    formularioError.textContent = 'Error inesperado, intenta de nuevo';
  }

  botonEnviar.textContent = modoRegistro ? 'Registrarse' : 'Entrar';
  botonEnviar.disabled = false;
});

// Actualizar botón según sesión
const menuUsuario = document.getElementById('menu-usuario');
const botonUsuario = document.getElementById('boton-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');
const dropdownEmail = document.getElementById('dropdown-email');
const dropdownUsuario = document.getElementById('dropdown-usuario');
const botonCerrarSesion = document.getElementById('boton-cerrar-sesion');

function actualizarBotonSesion(usuario) {
  if (usuario) {
    botonSesion.style.display = 'none';
    menuUsuario.style.display = 'block';
    const nombre = usuario.email.split('@')[0];
    avatarUsuario.textContent = nombre[0].toUpperCase();
    nombreUsuario.textContent = nombre;
    dropdownEmail.textContent = usuario.email;
  } else {
    botonSesion.style.display = '';
    menuUsuario.style.display = 'none';
  }

  // Actualizar menú móvil
const infoMovil = document.getElementById('info-usuario-movil');
const cerrarMovil = document.getElementById('cerrar-sesion-movil-li');
const avatarMovil = document.getElementById('avatar-usuario-movil');
const nombreMovil = document.getElementById('nombre-usuario-movil');

if (usuario) {
  if (infoMovil) infoMovil.style.display = 'block';
  if (cerrarMovil) cerrarMovil.style.display = 'block';
  if (avatarMovil) avatarMovil.textContent = usuario.email[0].toUpperCase();
  if (nombreMovil) nombreMovil.textContent = usuario.email.split('@')[0];
  if (botonSesionMovil) botonSesionMovil.style.display = 'none';
} else {
  if (infoMovil) infoMovil.style.display = 'none';
  if (cerrarMovil) cerrarMovil.style.display = 'none';
  if (botonSesionMovil) botonSesionMovil.style.display = 'block';
}
}

botonUsuario.addEventListener('click', () => {
  dropdownUsuario.classList.toggle('abierto');
});

document.addEventListener('click', (e) => {
  if (!menuUsuario.contains(e.target)) {
    dropdownUsuario.classList.remove('abierto');
  }
});

botonCerrarSesion.addEventListener('click', async () => {
  await clienteSupabase.auth.signOut();
  actualizarBotonSesion(null);
  dropdownUsuario.classList.remove('abierto');
});

// Verificar sesión al cargar
clienteSupabase.auth.getSession().then(({ data: { session } }) => {
  if (session) actualizarBotonSesion(session.user);
});

// Mantener sesión entre pestañas
clienteSupabase.auth.onAuthStateChange((_evento, session) => {
  actualizarBotonSesion(session?.user || null);

  // Si hay función de recargar fritos en esta página, la llama
  if (typeof cargarVotosUsuario === 'function') {
    cargarVotosUsuario().then(() => {
      if (typeof cargarFritos === 'function') cargarFritos();
    });
  }
});

// Botón flotante menú móvil
const botonFlotante = document.getElementById('boton-flotante');
const menuMovil = document.getElementById('menu-movil');
const fondoMenuMovil = document.getElementById('fondo-menu-movil');

botonFlotante.addEventListener('click', () => {
  botonFlotante.classList.toggle('abierto');
  menuMovil.classList.toggle('abierto');
  fondoMenuMovil.classList.toggle('abierto');
});

fondoMenuMovil.addEventListener('click', cerrarMenuMovil);

function cerrarMenuMovil() {
  botonFlotante.classList.remove('abierto');
  menuMovil.classList.remove('abierto');
  fondoMenuMovil.classList.remove('abierto');
}

document.querySelectorAll('.menu-movil ul li a').forEach(enlace => {
  enlace.addEventListener('click', cerrarMenuMovil);
});

//cerrar sesión móvil
document.getElementById('cerrar-sesion-movil')?.addEventListener('click', async () => {
  await clienteSupabase.auth.signOut();
  actualizarBotonSesion(null);
});