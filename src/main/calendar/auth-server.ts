import http from 'node:http'
import { createHash, randomBytes } from 'node:crypto'

export interface AuthResult {
  code: string
  state: string
}

/**
 * Start a one-shot local HTTP server on a random free port.
 * Resolves with the auth code once the browser redirects back.
 * Auto-closes after 5 minutes if the user doesn't complete the flow.
 */
export async function startRedirectServer(): Promise<{
  port: number
  waitForCode: Promise<AuthResult>
}> {
  const port = await findFreePort()

  let resolveCode!: (r: AuthResult) => void
  let rejectCode!: (e: Error) => void

  const waitForCode = new Promise<AuthResult>((res, rej) => {
    resolveCode = res
    rejectCode = rej
  })

  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url ?? '', `http://localhost:${port}`)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(resultPage('Authorization was denied. You can close this window.', false))
        server.close()
        rejectCode(new Error(`OAuth denied: ${error}`))
        return
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(resultPage('✅ Connected! You can close this window and return to MeetingFly.', true))
        server.close()
        resolveCode({ code, state: state ?? '' })
      }
    } catch {
      res.writeHead(400)
      res.end('Bad request')
    }
  })

  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve))

  const timeout = setTimeout(() => {
    server.close()
    rejectCode(new Error('OAuth timed out — authorization was not completed within 5 minutes'))
  }, 5 * 60 * 1000)

  waitForCode.finally(() => clearTimeout(timeout))

  return { port, waitForCode }
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = http.createServer()
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address()
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind port'))
        return
      }
      const port = addr.port
      srv.close(() => resolve(port))
    })
    srv.on('error', reject)
  })
}

function resultPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      height: 100vh; margin: 0;
      background: #1a1a2e; color: #e8e8f0;
    }
    .box { text-align: center; padding: 40px; }
    .icon { font-size: 56px; margin-bottom: 20px; }
    p { font-size: 18px; opacity: 0.85; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">${success ? '✈️' : '❌'}</div>
    <p>${message}</p>
  </div>
</body>
</html>`
}

/** Generate a random state parameter for CSRF protection */
export function generateState(): string {
  return randomBytes(16).toString('hex')
}

/** Generate PKCE code_verifier + code_challenge (SHA-256 / base64url) */
export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(64).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}
