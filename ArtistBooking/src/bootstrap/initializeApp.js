import { getSession } from '../auth/authService'

const MIN_SPLASH_MS = 600

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function initializeApp() {
  const startedAt = Date.now()
  const session = getSession()

  const elapsed = Date.now() - startedAt
  if (elapsed < MIN_SPLASH_MS) {
    await delay(MIN_SPLASH_MS - elapsed)
  }

  return session
}
