import fetch from 'node-fetch'

function extractYouTubeId(url) {
  if (!url) return null

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url

  try {
    const u = new URL(url)

    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1)
    }

    if (u.searchParams.get('v')) {
      return u.searchParams.get('v')
    }

  } catch {}

  return null
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept': 'application/json'
    }
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${text.slice(0,100)}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`JSON non valido`)
  }
}

export async function resolveDownload(type, input) {

  const id = extractYouTubeId(input)

  if (!id) throw new Error('ID YouTube non valido')

  if (type === 'mp3') {

    const api = `https://api.siputzx.my.id/api/d/ytmp3?url=https://youtube.com/watch?v=${id}`

    const json = await fetchJson(api)

    const url =
      json?.data?.dl ||
      json?.data?.url ||
      json?.url

    if (!url) throw new Error('MP3 non trovato')

    return { url }

  }

  if (type === 'mp4') {

    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=https://youtube.com/watch?v=${id}`

    const json = await fetchJson(api)

    const url =
      json?.data?.dl ||
      json?.data?.url ||
      json?.url

    if (!url) throw new Error('MP4 non trovato')

    return { url }

  }

  throw new Error('Tipo non supportato')
}
