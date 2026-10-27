import { serverSupabase } from '@/lib/api-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const client = serverSupabase(true)
  const encoder = new TextEncoder()
  let channel: ReturnType<typeof client.channel> | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let closed = false
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (value: string) => {
        if (!closed) {
          try { controller.enqueue(encoder.encode(value)) } catch { closed = true }
        }
      }
      send('retry: 5000\n\n')
      channel = client.channel('yuam-public-dashboard-readings')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'readings' }, () => {
          // Only announce that the public summary changed; never stream rows.
          send('event: readings\ndata: refresh\n\n')
        })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') send('event: connected\ndata: ready\n\n')
        })
      heartbeat = setInterval(() => send(': keepalive\n\n'), 25000)
      request.signal.addEventListener('abort', () => {
        closed = true
        if (heartbeat) clearInterval(heartbeat)
        if (channel) void client.removeChannel(channel)
        try { controller.close() } catch { /* stream already closed */ }
      }, { once: true })
    },
    cancel() {
      closed = true
      if (heartbeat) clearInterval(heartbeat)
      if (channel) void client.removeChannel(channel)
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
