// Además del límite de espera, cancela las peticiones subyacentes al resolver.
export async function withinBudget<T>(milliseconds: number, parent: AbortSignal, work: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
  if (milliseconds <= 0 || parent.aborted) return null
  const controller = new AbortController()
  const signal = AbortSignal.any([parent, controller.signal])
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<null>(resolve => {
    timer = setTimeout(() => { controller.abort(); resolve(null) }, milliseconds)
  })
  try {
    return await Promise.race([work(signal), timeout])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}
