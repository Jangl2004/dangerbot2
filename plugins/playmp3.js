import { resolveDownload } from '../lib/play-providers.js'

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❌ URL mancante.', m)

  await conn.reply(m.chat, '🎧 *Scarico audio...*', m)

  try {
    const result = await resolveDownload('mp3', text)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: result.url },
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('[playmp3] ERRORE FINALE:', e)
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
