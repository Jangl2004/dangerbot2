import yts from 'yt-search'
import ytdl from 'ytdl-core'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`🎵 Usa così:\n${usedPrefix + command} nome canzone`)

  await m.reply('🔎 Sto cercando la canzone...')

  try {
    const search = await yts(text)
    const video = search.videos[0]

    if (!video) return m.reply('❌ Nessun risultato trovato.')

    const url = video.url

    // Se comando è playvid manda video, altrimenti audio
    if (/playvid/i.test(command)) {

      const stream = ytdl(url, { filter: 'audioandvideo' })

      await conn.sendMessage(m.chat, {
        video: stream,
        mimetype: 'video/mp4',
        caption:
`🎬 *${video.title}*

⏱ Durata: ${video.timestamp}
👁 Visualizzazioni: ${video.views}
🔗 ${video.url}`
      }, { quoted: m })

    } else {

      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio'
      })

      await conn.sendMessage(m.chat, {
        audio: stream,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore nel download. Forse YouTube sta bloccando.')
  }
}

handler.help = ['play', 'playvid']
handler.tags = ['downloader']
handler.command = /^(play|playvid)$/i

export default handler
