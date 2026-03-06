import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import yts from 'yt-search'

const TMP_DIR = path.join(process.cwd(), 'temp')

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

async function searchYoutube(query) {
  const res = await yts(query)
  return res?.videos?.[0] || null
}

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || stdout || err.message))
      resolve(stdout)
    })
  })
}

async function downloadAudio(url, output) {
  await runYtDlp([
    url,
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '--no-playlist',
    '-o', output
  ])
}

async function downloadVideo(url, output) {
  await runYtDlp([
    url,
    '-f', 'mp4',
    '--no-playlist',
    '-o', output
  ])
}

async function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  } catch {}
}

function findRealDownloadedFile(prefix) {
  const files = fs.readdirSync(TMP_DIR)
  const found = files.find(f => f.startsWith(prefix))
  return found ? path.join(TMP_DIR, found) : null
}

function getPrefix() {
  return global.prefissoComandi || global.prefisso || '.'
}

export default {
  command: ['play', 'playmp3', 'playmp4'],

  async execute(m, { conn, command, text }) {
    try {
      const prefix = getPrefix()

      if (command === 'play') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            { text: `🎶 *Usa così:*\n\n${prefix}play <canzone + artista>` },
            { quoted: m }
          )
        }

        await conn.sendMessage(
          m.chat,
          { text: '🔎 *Ricerca in corso...*' },
          { quoted: m }
        )

        const video = await searchYoutube(text)
        if (!video) {
          return conn.sendMessage(
            m.chat,
            { text: '❌ Nessun risultato trovato.' },
            { quoted: m }
          )
        }

        const caption = `╭─🎧 *CHROME BOT DOWNLOAD*
│
│ 🎵 *Titolo:* ${video.title}
│ ⏱ *Durata:* ${video.timestamp || 'Sconosciuta'}
│ 👁 *Views:* ${Number(video.views || 0).toLocaleString('it-IT')}
│ 📺 *Canale:* ${video.author?.name || 'Sconosciuto'}
│ 📅 *Pubblicato:* ${video.ago || 'Sconosciuto'}
╰──────────────
⬇️ *Seleziona formato:*`

        const mp3Cmd = `${prefix}playmp3 ${video.url}`
        const mp4Cmd = `${prefix}playmp4 ${video.url}`

        try {
          await conn.sendMessage(
            m.chat,
            {
              image: { url: video.thumbnail },
              caption,
              buttons: [
                {
                  buttonId: mp3Cmd,
                  buttonText: { displayText: '🎵 Audio MP3' },
                  type: 1
                },
                {
                  buttonId: mp4Cmd,
                  buttonText: { displayText: '🎬 Video MP4' },
                  type: 1
                }
              ],
              footer: 'CHROME BOT Downloader',
              headerType: 4
            },
            { quoted: m }
          )
          return
        } catch (err) {
          await conn.sendMessage(
            m.chat,
            {
              image: { url: video.thumbnail },
              caption: `${caption}

⚠️ *Se i pulsanti non funzionano, usa questi comandi:*

🎵 \`${mp3Cmd}\`
🎬 \`${mp4Cmd}\``
            },
            { quoted: m }
          )
          return
        }
      }

      if (command === 'playmp3') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            { text: `❌ URL mancante.\n\nUsa:\n${prefix}playmp3 <url>` },
            { quoted: m }
          )
        }

        const id = `audio_${Date.now()}`
        const outTpl = path.join(TMP_DIR, `${id}.%(ext)s`)

        await conn.sendMessage(
          m.chat,
          { text: '🎧 *Download audio in corso...*' },
          { quoted: m }
        )

        await downloadAudio(text, outTpl)

        const realFile = findRealDownloadedFile(id)
        if (!realFile) throw new Error('File audio non trovato dopo il download')

        const buffer = await fs.promises.readFile(realFile)

        await conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false
          },
          { quoted: m }
        )

        await safeUnlink(realFile)
        return
      }

      if (command === 'playmp4') {
        if (!text) {
          return conn.sendMessage(
            m.chat,
            { text: `❌ URL mancante.\n\nUsa:\n${prefix}playmp4 <url>` },
            { quoted: m }
          )
        }

        const id = `video_${Date.now()}`
        const outTpl = path.join(TMP_DIR, `${id}.%(ext)s`)

        await conn.sendMessage(
          m.chat,
          { text: '🎬 *Download video in corso...*' },
          { quoted: m }
        )

        await downloadVideo(text, outTpl)

        const realFile = findRealDownloadedFile(id)
        if (!realFile) throw new Error('File video non trovato dopo il download')

        const buffer = await fs.promises.readFile(realFile)

        await conn.sendMessage(
          m.chat,
          {
            video: buffer,
            mimetype: 'video/mp4'
          },
          { quoted: m }
        )

        await safeUnlink(realFile)
        return
      }
    } catch (e) {
      console.error('❌ Errore play:', e)
      await conn.sendMessage(
        m.chat,
        { text: `❌ *Errore: ${e.message || e}*` },
        { quoted: m }
      )
    }
  }
}
