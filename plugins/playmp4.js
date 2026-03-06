import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

const YTDLP_BIN = 'yt-dlp'
const COOKIES_PATH = '/home/luxifer/dangerbot2/cookies.txt'
const TMP_DIR = path.join(process.cwd(), 'temp')
const COBALT_API = 'http://127.0.0.1:9000/' // cambia porta se serve

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

function execFileAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 30 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message))
      resolve({ stdout, stderr })
    })
  })
}

async function tryCobaltVideo(url) {
  const res = await fetch(COBALT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      url,
      audioOnly: false
    })
  })

  if (!res.ok) {
    throw new Error(`Cobalt HTTP ${res.status}`)
  }

  const data = await res.json()
  const dl = data?.url

  if (!dl) {
    throw new Error('Cobalt non ha restituito un link video valido')
  }

  return dl
}

async function tryYtdlpVideo(url) {
  if (!fs.existsSync(COOKIES_PATH)) {
    throw new Error('cookies.txt non trovato')
  }

  const output = path.join(TMP_DIR, `video_${Date.now()}.mp4`)

  await execFileAsync(YTDLP_BIN, [
    '--cookies', COOKIES_PATH,
    url,
    '-f', 'mp4',
    '--no-playlist',
    '-o', output
  ])

  if (!fs.existsSync(output)) {
    throw new Error('File video non trovato dopo yt-dlp')
  }

  return output
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❌ URL mancante.', m)
  }

  await conn.reply(m.chat, '🎬 *Scarico video...*', m)

  let localFile = null

  try {
    try {
      const videoUrl = await tryCobaltVideo(text)

      return await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: '🎬 Ecco il tuo video'
        },
        { quoted: m }
      )
    } catch (e1) {
      console.log('[playmp4] Cobalt fallito:', e1.message)

      localFile = await tryYtdlpVideo(text)
      const buffer = await fs.promises.readFile(localFile)

      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype: 'video/mp4',
          fileName: 'video.mp4',
          caption: '🎬 Ecco il tuo video'
        },
        { quoted: m }
      )
    }
  } catch (e) {
    console.error('[playmp4] Errore finale:', e)
    await conn.reply(
      m.chat,
      `❌ *Errore download video*\n\n${e.message || e}`,
      m
    )
  } finally {
    if (localFile && fs.existsSync(localFile)) {
      await fs.promises.unlink(localFile).catch(() => {})
    }
  }
}

handler.help = ['playmp4 <url>']
handler.tags = ['downloader']
handler.command = ['playmp4']

export default handler
