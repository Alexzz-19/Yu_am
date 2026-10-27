import LegalPage from '@/components/LegalPage'
import BilingualLegalDocument from '@/components/BilingualLegalDocument'
import { PRIVACY_CONTENT } from '@/lib/legal-content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata('Política de privacidad / Privacy policy', 'Información en español e inglés sobre cuentas, telemetría IoT, Google OAuth, Supabase, Yum, cookies y derechos sobre tus datos en YU’AM.', '/privacidad')

export default function PrivacyPage() {
  return <LegalPage title="Política de privacidad / Privacy policy" description="Cómo tratamos los datos del proyecto, qué información se comparte y cómo puedes gestionar tu privacidad."><BilingualLegalDocument content={PRIVACY_CONTENT} kind="privacy" /></LegalPage>
}
