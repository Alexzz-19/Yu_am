import LegalPage from '@/components/LegalPage'
import BilingualLegalDocument from '@/components/BilingualLegalDocument'
import { TERMS_CONTENT } from '@/lib/legal-content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata('Condiciones de servicio / Terms of service', 'Condiciones en español e inglés para utilizar YU’AM: cuentas, nodos IoT, hardware abierto, licencia MIT, límites del servicio y responsabilidad.', '/terminos')

export default function TermsPage() {
  return <LegalPage title="Condiciones de servicio / Terms of service" description="Reglas para usar la plataforma de MILAB, registrar hardware y compartir información de fotobiorreactores."><BilingualLegalDocument content={TERMS_CONTENT} kind="terms" /></LegalPage>
}
