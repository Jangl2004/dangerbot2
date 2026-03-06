import fetch from 'node-fetch'

const PROVIDER_BASE = 'https://api.cobalt.tools/api/json'

async function getAudioFromProvider(url) {
  const res = await fetch(PROVIDER_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      url,
      audioOnly: true
    })
  })

  const raw = await res.text()

  if (!res.ok) {
    throw new Error(`Provider HTTP ${res.status}: ${raw.slice(0, 200)}`)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(`Provider non ha restituito JSON valido: ${raw.slice(0, 200)}`)
  }

  if (!data?.url) {
    throw new Error('Il provider non ha restituito un link audio valido')
  }

  return data.url
}

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❌ URL mancante.', m)

  await conn.reply(m.chat, '🎧 *Scarico audio...*', m)

  try {
    const audioUrl = await getAudioFromProvider(text)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('[playmp3]', e)
    await conn.reply(
      m.chat,
      `❌ *Errore download audio*\n${e.message || e}`,
      m
    )
  }
}

handler.help = ['playmp3 <url>']
handler.tags = ['downloader']
handler.command = ['playmp3']

export default handler
