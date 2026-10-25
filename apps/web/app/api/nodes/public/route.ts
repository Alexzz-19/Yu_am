import { GET as getNodes } from '../route'

export async function GET(request: Request) {
  const url = new URL(request.url)
  url.searchParams.set('scope', 'community')
  return getNodes(new Request(url, { headers: request.headers }))
}
