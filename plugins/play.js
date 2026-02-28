import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🔎 Usa: *${usedPrefix + command} titolo o artista*`)

  try {
    const r = await yts(text)
    const vids = (r.videos || []).slice(0, 5)
    if (!vids.length) return m.reply('❌ Nessun risultato trovato.')

    let msg = `🎵 *Risultati per:* ${text}\n\n`
    vids.forEach((v, i) => {
      msg += `*${i + 1}.* ${v.title}\n`
      msg += `⏱ ${v.timestamp} | 👁 ${v.views}\n`
      msg += `🔗 ${v.url}\n\n`
    })

    msg += `✅ Copia un link e aprilo.\n`
    msg += `Se vuoi, posso farti anche: *${usedPrefix}play 1* per scegliere il primo risultato automaticamente (solo link).`

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  } catch (e) {
    console.error('PLAY search error:', e)
    m.reply('❌ Errore nella ricerca. Controlla la console per i dettagli.')
  }
}

handler.help = ['play <titolo/artista>']
handler.tags = ['search']
handler.command = /^play$/i

export default handler
