import { NextResponse } from 'next/server'

const ARXIV_API = 'https://export.arxiv.org/api/query'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Falta el parámetro de búsqueda "q".' }, { status: 400 })
  }

  const url = `${ARXIV_API}?search_query=all:${encodeURIComponent(q)}&start=0&max_results=12`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })

    if (!res.ok) {
      return NextResponse.json(
        { error: `arXiv respondió con estado ${res.status}.` },
        { status: 502 },
      )
    }

    const xml = await res.text()

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con arXiv.' }, { status: 502 })
  }
}
