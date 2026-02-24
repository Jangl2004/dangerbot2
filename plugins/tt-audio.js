import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `『 🎵 』 Inserisci un link di TikTok\n\nEsempio:\n${usedPrefix + command} https://vm.tiktok.com/xxxxx`,
      m
    )
  }

  await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } })

  try {
    const res = await fetch(`https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(text)}`)
    const data = await res.json()

    console.log(data) // 👈 IMPORTANTE per vedere la struttura reale

    const audioUrl =
      data?.results?.audio ||
      data?.result?.audio ||
      data?.audio ||
      null

    if (!audioUrl) {
      return conn.reply(m.chat, '❌ Audio non trovato. API potrebbe essere offline.', m)
    }

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: 'tiktok_audio.mp3'
    }, { quoted: m })

  } catch (err) {
    console.error('Errore ttaudio:', err)
    conn.reply(m.chat, '❌ Errore durante il download. API offline o bloccata.', m)
  }
}

handler.help = ['ttaudio <url>']
handler.tags = ['download']
handler.command = /^(tiktokmp3|ttmp3|ttaudio)$/i

export default handler
