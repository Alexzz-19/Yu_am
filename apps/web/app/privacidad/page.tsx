import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Política de privacidad | YU’AM',
  description: 'Cómo YU’AM y MILAB manejan cuentas, telemetría ambiental, ubicación de nodos y preferencias de cookies.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      description="Qué datos usa YU’AM, para qué los necesita y cómo puedes consultar o solicitar cambios en tu información."
    >
      <p>
        Esta política corresponde a YU&apos;AM, proyecto de tecnología ambiental del equipo MILAB. Para preguntas o solicitudes sobre datos,
        escribe a <a href="mailto:bionexo_support@proton.me">bionexo_support@proton.me</a>. La plataforma está dirigida a personas que
        administran cultivos, nodos IoT y biorreactores.
      </p>

      <h2>Datos que tratamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> correo electrónico y datos de autenticación. Si eliges Google, Supabase recibe los datos de perfil que el proveedor comparte, como nombre, correo y avatar.</li>
        <li><strong>Perfil y nodos:</strong> identificador de cuenta, nombre del nodo, zona y coordenadas que aportas. Las coordenadas se redondean a dos decimales y la vista pública muestra el nombre, ubicación aproximada, estado y hora de la última lectura.</li>
        <li><strong>Telemetría:</strong> lecturas asociadas a tus nodos o reactores: estimación de CO₂ y calidad del aire, temperatura, humedad, pH, oxígeno disuelto, estado del búfer y marcas de tiempo, según los sensores y campos disponibles.</li>
        <li><strong>Seguridad:</strong> tokens de sesión, datos técnicos de las solicitudes y verificaciones anti-bot necesarias para operar y proteger la cuenta.</li>
        <li><strong>Asistente:</strong> si consultas el bot, la pregunta y hasta cinco fragmentos coincidentes de la bóveda de memoria se envían a Google Gemini para generar la respuesta. El historial del chat del navegador no se conserva al cerrar o recargar la página.</li>
      </ul>

      <h2>Cómo usamos la información</h2>
      <ul>
        <li>Crear y mantener sesiones mediante Supabase Auth, incluyendo acceso por correo y Google OAuth.</li>
        <li>Permitir que registres nodos, consultes lecturas y gestiones tokens asociados a tu cuenta.</li>
        <li>Mostrar en el mapa la información pública indicada al registrar un nodo. No publicamos correo, propietario ni tokens de ingesta.</li>
        <li>Recibir y presentar telemetría para investigación y seguimiento de fotobiorreactores.</li>
        <li>Responder preguntas del bot desde la bóveda de memoria y proteger el servicio contra abuso.</li>
      </ul>

      <h2>Acceso, almacenamiento y seguridad</h2>
      <p>
        La aplicación usa Supabase para autenticación y base de datos. Las sesiones se mantienen en cookies de autenticación para que el servidor
        pueda verificar las rutas privadas. Las políticas de seguridad a nivel de fila (RLS) limitan la lectura y gestión de nodos, reactores y
        mediciones a sus propietarios; los tokens completos de los nodos se muestran una sola vez y la base almacena su hash.
      </p>
      <p>
        Supabase, Google, Cloudflare Turnstile y Google Gemini procesan los datos que necesitan para prestar sus funciones. Estos proveedores
        pueden procesar información en centros de datos fuera de Guatemala y aplican sus propias políticas y condiciones. Consulta las políticas
        de <a href="https://supabase.com/privacy" rel="noreferrer">Supabase</a>, <a href="https://policies.google.com/privacy" rel="noreferrer">Google</a> y
        {' '}<a href="https://www.cloudflare.com/privacypolicy/" rel="noreferrer">Cloudflare</a>.
      </p>
      <p>
        Aplicamos controles de autenticación, RLS, acceso mínimo a credenciales y HTTPS en el despliegue. Ninguna plataforma conectada a Internet
        puede garantizar seguridad absoluta; evita incluir contraseñas, tokens o información sensible en nombres de nodo o preguntas del bot.
      </p>

      <h2>Cookies y preferencias</h2>
      <p>
        Supabase usa cookies esenciales para mantener la sesión y proteger las páginas privadas. La elección del banner se guarda en el
        almacenamiento local del navegador bajo <code>yuam_cookie_consent</code>. Actualmente no cargamos una herramienta analítica ni cookies
        analíticas. Si incorporamos medición opcional, solo se activará después de aceptar y se actualizará esta política. Puedes cambiar tu
        elección con el enlace “Preferencias de cookies” del pie de página o borrar el almacenamiento local del navegador.
      </p>

      <h2>Conservación y eliminación</h2>
      <p>
        Conservamos datos de cuenta, nodos y telemetría mientras sean necesarios para operar la cuenta y el proyecto. Eliminar un nodo desde el
        perfil revoca su token y elimina sus mediciones asociadas. Para solicitar acceso, corrección o eliminación de datos de cuenta, escribe al
        correo de contacto desde la dirección asociada a la cuenta; verificaremos la identidad antes de atender la solicitud. Copias de seguridad
        y registros técnicos pueden permanecer durante el ciclo operativo de los proveedores.
      </p>

      <h2>Solicitudes y marco de privacidad</h2>
      <p>
        Puedes solicitar información sobre los datos asociados a tu cuenta, pedir que se corrijan o eliminen y retirar permisos de proveedores
        desde la configuración correspondiente. Atenderemos las solicitudes de acuerdo con la normativa aplicable. En Guatemala, la Constitución
        protege la inviolabilidad de documentos y comunicaciones en su artículo 24; la Corte de Constitucionalidad también ha tratado la
        autodeterminación informativa como parte de la tutela de la privacidad. Puedes consultar el
        {' '}<a href="https://www.congreso.gob.gt/assets/uploads/congreso/marco_legal/b376c-cprg.pdf" rel="noreferrer">texto constitucional oficial</a>.
      </p>

      <h2>Actualizaciones</h2>
      <p>
        Si cambian las funciones, proveedores o categorías de datos, actualizaremos esta página y su fecha de vigencia. Para consultas, utiliza
        <a href="mailto:bionexo_support@proton.me"> bionexo_support@proton.me</a>.
      </p>
    </LegalPage>
  )
}
