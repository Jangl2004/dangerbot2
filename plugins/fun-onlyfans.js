import { createCanvas } from 'canvas'

const handler = async (m, { conn, args, usedPrefix }) => {

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `❌ Usa il comando così:\n${usedPrefix}onlyfans nomeprofilo`,
      m
    )
  }

  const nome = args.join(" ")

  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const id = random(100000, 999999)
  const prezzo = random(5, 50)
  const followers = random(1000, 900000)
  const post = random(5, 350)
  const likes = random(10000, 900000)

  const bioList = [
    "🔥 Contenuti esclusivi ogni giorno",
    "💋 Solo per veri fan",
    "😈 Non adatto ai deboli di cuore",
    "💎 Premium content 18+",
    "🌙 Notte calda garantita",
    "🖤 DM aperti per richieste speciali"
  ]

  const bio = bioList[Math.floor(Math.random() * bioList.length)]

  // CANVAS
  const canvas = createCanvas(800, 1000)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0f0f14'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Header
  ctx.fillStyle = '#00aff0'
  ctx.fillRect(0, 0, canvas.width, 120)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px Sans'
  ctx.fillText('ONLYFANS', 280, 75)

  // Avatar
  ctx.beginPath()
  ctx.arc(400, 250, 120, 0, Math.PI * 2)
  ctx.fillStyle = '#1c1c25'
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = 'bold 30px Sans'
  ctx.fillText(nome, 400, 430)

  ctx.font = '24px Sans'
  ctx.fillText(`ID: OF${id}`, 400, 470)

  ctx.fillText(`💰 ${prezzo}€ / mese`, 400, 520)
  ctx.fillText(`👥 ${followers.toLocaleString()} followers`, 400, 560)
  ctx.fillText(`📸 ${post} post`, 400, 600)
  ctx.fillText(`🔥 ${likes.toLocaleString()} like`, 400, 640)

  ctx.font = '22px Sans'
  ctx.fillStyle = '#bbbbbb'
  ctx.fillText(bio, 400, 720)

  ctx.fillStyle = '#00aff0'
  ctx.fillRect(250, 800, 300, 70)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px Sans'
  ctx.fillText('ABBONATI ORA', 400, 845)

  const buffer = canvas.toBuffer()

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: `🔞 Profilo simulato creato per ${nome}`
  })
}

handler.help = ['onlyfans <nome>']
handler.tags = ['fun']
handler.command = /^onlyfans$/i

export default handler