let accessToken = null
const listeners = new Set()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token
  listeners.forEach((listener) => listener(accessToken))
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function onAccessTokenChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

