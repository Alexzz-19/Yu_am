import { Fragment } from 'react'
import { SUPPORT_EMAIL, type BilingualLegalContent } from '@/lib/legal-content'
import CookiePreferencesButton from './CookiePreferencesButton'

function linkedText(text: string) {
  return text.split(SUPPORT_EMAIL).map((part, index) => <Fragment key={index}>{index > 0 && <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all">{SUPPORT_EMAIL}</a>}{part}</Fragment>)
}

export default function BilingualLegalDocument({ content, kind }: { content: BilingualLegalContent; kind: 'privacy' | 'terms' }) {
  return <>
    <nav aria-label="Idioma del documento / Document language" className="flex flex-wrap gap-3 border-b border-slate-200 pb-6"><a href="#es" lang="es" className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-4 font-semibold">Español</a><a href="#en" lang="en" className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-4 font-semibold">English</a></nav>
    {(['es', 'en'] as const).map(lang => <section key={lang} id={lang} lang={lang} aria-labelledby={`${kind}-${lang}`} className="scroll-mt-24">
      <h2 id={`${kind}-${lang}`}>{lang === 'es' ? kind === 'privacy' ? 'Política de privacidad' : 'Condiciones de servicio' : kind === 'privacy' ? 'Privacy policy' : 'Terms of service'}</h2>
      {content[lang].map(section => <section key={section.id} aria-labelledby={`${lang}-${section.id}`} className="scroll-mt-24">
        <h3 id={`${lang}-${section.id}`}>{section.title}</h3>
        {section.paragraphs?.map((paragraph, index) => <p key={index}>{linkedText(paragraph)}</p>)}
        {section.items && <ul>{section.items.map(item => <li key={item}>{linkedText(item)}</li>)}</ul>}
        {section.links && <ul aria-label={lang === 'es' ? 'Fuentes y referencias' : 'Sources and references'}>{section.links.map(link => <li key={link.href}><a href={link.href} rel="noreferrer">{link.label}</a></li>)}</ul>}
        {section.id === 'cookies' && <div className="mt-4 text-emerald-800"><CookiePreferencesButton label={lang === 'es' ? 'Preferencias de cookies' : 'Cookie preferences'} /></div>}
      </section>)}
      {kind === 'terms' && <p><a href="/privacidad">{lang === 'es' ? 'Leer política de privacidad' : 'Read the privacy policy'}</a></p>}
    </section>)}
  </>
}
