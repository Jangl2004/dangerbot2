import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

// 🧠 Immagini brainrot dirette
const brainrotImages = [
  "https://i.imgur.com/sV1FAsS.png",
  "https://i.imgur.com/GfwsDr7.png",
  "https://i.imgur.com/svhOrGS.png",
  "https://i.imgur.com/qO5rVdj.png"
]

// [x, y, width, height] della faccia in ciascuna immagine (modifica se necessario)
const faceCoords = [
  [150, 120, 180, 180],
  [120, 100, 200, 200],
  [140, 110, 180, 180],
  [130, 90, 220, 220]
]

// Frasi brainrot casuali
const brainrotFrasi = [
  "IL BRO PENSA DI ESSERE SIGMA",
  "NPC ENERGY DETECTED",
  "MENTALITÀ 2009 FACEBOOK",
  "HA VISTO TROPPI EDIT",
  "SIGMA MA SENZA SIG",
  "MAIN CHARACTER DEL NULLA",
  "OHIO FINAL BOSS",
  "BRAIN ROT LEVEL 9999",
  "TROPPO TIKTOK",
  "MODALITÀ CRINGE ATTIVA"
]

// Funzione principale: combina foto utente + brainrot
async function brainrotFace(userBuffer) {
  const index = Math.floor(Math.random() * brainrotImages.length)
  const brainrotUrl = brainrotImages[index]
  const coords = faceCoords[index]

  // Carica immagine brainrot
  const res = await fetch(brainrotUrl)
  if (!res.ok) throw new Error("Immagine brainrot non trovata")
  const brainrotBuffer = Buffer.from(await res.arrayBuffer())
  const brainrotImg = await loadImage(brainrotBuffer)
  const userImg = await loadImage(userBuffer)

  const canvas = createCanvas(brainrotImg.width, brainrotImg.height)
  const ctx = canvas.getContext('2d')

  // Disegna immagine brainrot base
  ctx.drawImage(brainrotImg, 0, 0)

  // Sovrapponi faccia dell'utente
  ctx.drawImage(userImg, coords[0], coords[1], coords[2], coords[3])

  // Overlay "deepfried"
  ctx.globalAlpha = 0.25
  ctx.fillStyle = "rgba(255,0,0,0.25)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "rgba(255,255,0,0.2)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1.0

  // Testo brainrot casuale
  const frase = brainrotFrasi[Math.floor(Math.random() * brainrotFrasi.length)]
  ctx.font = "bold 60px Impact"
  ctx.fillStyle = "white"
  ctx.strokeStyle = "black"
  ctx.lineWidth = 6
  ctx.textAlign = "center"
  wrapText(ctx, frase, canvas.width / 2, canvas.height - 120, canvas.width - 100, 70)

  return canvas.toBuffer("image/jpeg")
}

// Funzione per testo multi-riga
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  const lines = []

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)

  lines.forEach((l, i) => {
    ctx.strokeText(l, x, y + i * lineHeight)
    ctx.fillText(l, x, y + i * lineHeight)
  })
}

// Handler comando brainrot
let handler = async (m, { conn }) => {
  let who = m.sender
  if (m.quoted) who = m.quoted.sender
  if (m.mentionedJid?.[0]) who = m.mentionedJid[0]

  let userBuffer
  try {
    const ppUrl = await conn.profilePictureUrl(who, 'image')
    const res = await fetch(ppUrl)
    if (!res.ok) throw new Error("DP non trovata")
    const contentType = res.headers.get('content-type')
    if (!contentType.startsWith('image/')) throw new Error("Non è un'immagine valida")
    userBuffer = Buffer.from(await res.arrayBuffer())
  } catch {
    // Fallback con immagine pubblica diretta
    const fallbackUrl = "https://i.imgur.com/0Qw7Y0H.png"
    const res = await fetch(fallbackUrl)
    userBuffer = Buffer.from(await res.arrayBuffer())
  }

  try {
    const result = await brainrotFace(userBuffer)

    await conn.sendFile(
      m.chat,
      result,
      'brainrot.jpg',
      '*🧠 Brainrot con la tua faccia!*',
      m,
      false,
      { mentions: [who] }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Errore nella generazione brainrot.")
  }
}

handler.help = ['brainrot']
handler.tags = ['fun']
handler.command = /^brainrot$/i

export default handler