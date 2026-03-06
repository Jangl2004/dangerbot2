import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❌ URL mancante', m)

  await conn.reply(m.chat, '🎧 Scarico audio...', m)

  try {
    const api = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(text)}`
    const res = await fetch(api, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'Mozilla/5.0'
      }
    })

    const raw = await res.text()
    console.log('[playmp3] STATUS:', res.status)
    console.log('[playmp3] RAW:', raw)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} | ${raw.slice(0, 300)}`)
    }

    let json
    try {
      json = JSON.parse(raw)
    } catch {
      throw new Error(`Risposta non JSON: ${raw.slice(0, 300)}`)
    }

    const audio =
      json?.data?.dl ||
      json?.data?.url ||
      json?.url ||
      json?.result?.download

    if (!audio) {
      throw new Error(`Nessun link audio trovato nella risposta: ${raw.slice(0, 300)}`)
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audio },
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('[playmp3] ERRORE:', e)
    await conn.reply(m.chat, `❌ Errore download audio\n${e.message || e}`, m)
  }
}

handler.command = ['playmp3']
export default handler
