import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Condiciones de servicio | YU’AM',
  description: 'Condiciones para usar la plataforma, el software y las guías abiertas de hardware de MILAB / YU’AM.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Condiciones de servicio"
      description="Reglas de uso de la plataforma YU’AM, sus servicios de telemetría y los materiales de hardware abierto de MILAB."
    >
      <p>
        Al crear una cuenta o usar YU&apos;AM aceptas estas condiciones. YU&apos;AM es un proyecto de MILAB para explorar fotobiorreactores,
        telemetría ambiental y herramientas abiertas. Si no estás de acuerdo, deja de usar las funciones que requieren cuenta.
      </p>

      <h2>Cuenta y acceso</h2>
      <ul>
        <li>Proporciona datos de cuenta correctos y protege tu contraseña, correo y sesión.</li>
        <li>La cuenta es personal. Eres responsable de las acciones realizadas desde ella y de revocar sesiones que ya no controles.</li>
        <li>Google OAuth y correo dependen de Supabase Auth y de la configuración de proveedores externos; su disponibilidad puede cambiar.</li>
        <li>El registro permite hasta cuatro nodos por cuenta. Guarda cada token de ingesta en el dispositivo que corresponda; se muestra completo una sola vez y debes rotarlo si se expone.</li>
      </ul>

      <h2>Uso de la plataforma y los datos</h2>
      <p>
        Puedes usar el dashboard, mapa, APIs, bot, simulador y herramientas para investigación, aprendizaje y operación de tus propios
        prototipos. No debes intentar acceder a cuentas o nodos ajenos, evadir límites, interferir con servicios, introducir código malicioso,
        ni publicar datos personales de otras personas sin autorización.
      </p>
      <p>
        El registro de nodos muestra públicamente el nombre, la zona aproximada, las coordenadas redondeadas a dos decimales, el estado y la hora
        de la última lectura. No registres direcciones exactas, nombres de personas ni ubicaciones que puedan poner en riesgo a alguien. Puedes
        borrar el nodo desde tu perfil; esa acción también revoca el token y elimina las mediciones asociadas.
      </p>

      <h2>Software y hardware abierto</h2>
      <p>
        El software de este repositorio se distribuye bajo la licencia MIT, disponible en el
        {' '}<a href="https://github.com/Alexzz-19/Yu_am/blob/main/LICENSE" rel="noreferrer">archivo de licencia del proyecto</a>. Esa licencia permite
        usar, copiar, modificar y distribuir el software con los avisos requeridos. Los componentes, marcas, fotografías, servicios externos y
        diseños físicos de terceros pueden tener términos propios; esta página no amplía sus licencias ni concede derechos de patente.
      </p>
      <p>
        Las guías de fotobiorreactores son educativas y describen montajes que cada persona debe adaptar y revisar. Comprueba tensiones, conexiones,
        impermeabilización, ventilación y compatibilidad de materiales antes de construir. Mantén agua, fuentes eléctricas y placas protegidas entre
        sí, usa equipos adecuados y supervisa los experimentos. La construcción, instalación y operación corren bajo tu responsabilidad.
      </p>

      <h2>Datos científicos y límites de uso</h2>
      <p>
        La telemetría, el simulador y el contenido del bot son herramientas de apoyo, no certificaciones, asesoría profesional ni resultados
        garantizados. El MQ-135 ofrece una respuesta amplia a gases y su cálculo de CO₂ es una estimación que requiere calibración; no sustituye un
        analizador selectivo ni debe usarse para decisiones médicas, regulatorias, industriales críticas o de seguridad. Verifica las lecturas con
        instrumentos calibrados y protocolos científicos apropiados.
      </p>
      <p>
        Las respuestas del bot se basan en notas de la bóveda y pueden ser incompletas o incorrectas. Revisa sus fuentes y valida las conclusiones
        antes de aplicarlas al cultivo o compartirlas como resultados científicos.
      </p>

      <h2>Disponibilidad y servicios externos</h2>
      <p>
        Podemos actualizar, suspender o retirar funciones para mantener la plataforma, corregir errores o atender riesgos de seguridad. La
        autenticación, alojamiento, base de datos, CAPTCHA, mapas y generación del bot pueden depender de terceros y de su disponibilidad,
        políticas o costos. El uso de esos servicios también está sujeto a sus condiciones.
      </p>

      <h2>Garantías y responsabilidad</h2>
      <p>
        El software y los materiales se ofrecen “tal cual”, conforme a la licencia MIT. En la medida permitida por la ley, MILAB y las personas
        colaboradoras no garantizan funcionamiento ininterrumpido, precisión de mediciones, idoneidad para un propósito específico ni ausencia de
        errores. Nada en estas condiciones elimina derechos que la ley aplicable no permita renunciar.
      </p>

      <h2>Cambios y contacto</h2>
      <p>
        Podemos actualizar estas condiciones al cambiar el servicio. Publicaremos la versión vigente en esta página. Las consultas relacionadas con
        cuentas, nodos o estas condiciones se reciben en <a href="mailto:bionexo_support@proton.me">bionexo_support@proton.me</a>.
      </p>
      <p>
        Estas condiciones se interpretan conforme a la normativa aplicable en Guatemala. No restringen derechos que no puedan limitarse por acuerdo.
      </p>
    </LegalPage>
  )
}
