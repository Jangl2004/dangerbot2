import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🎧 *Usa così:*\n${usedPrefix}play <titolo canzone>`,
      m
    )
  }

  await conn.reply(m.chat, '🔎 *Cerco su YouTube...*', m)

  const result = await yts(text)
  const video = result?.videos?.[0]

  if (!video) {
    return conn.reply(m.chat, '❌ Nessun risultato trovato.', m)
  }

  const caption = `
╭─🎵 *PLAY DOWNLOADER*
│
│ 📀 *Titolo:* ${video.title}
│ ⏱ *Durata:* ${video.timestamp || 'N/D'}
│ 👁 *Views:* ${video.views?.toLocaleString?.() || video.views || 'N/D'}
│ 📺 *Canale:* ${video.author?.name || 'Sconosciuto'}
│
╰──────────────
⬇️ *Scegli formato:*
  `.trim()

  await conn.sendMessage(
    m.chat,
    {
      image: { url: video.thumbnail },
      caption,
      footer: 'DangerBot Music',
      buttons: [
        {
          buttonId: `${usedPrefix}playmp3 ${video.url}`,
          buttonText: { displayText: '🎧 MP3' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}playmp4 ${video.url}`,
          buttonText: { displayText: '🎬 MP4' },
          type: 1
        }
      ],
      headerType: 4
    },
    { quoted: m }
  )
}

handler.help = ['play <query>']
handler.tags = ['downloader']
handler.command = ['play']

export default handler
