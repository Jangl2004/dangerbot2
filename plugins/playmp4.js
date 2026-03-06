import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {

if (!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎬 Scarico video...',m)

try {

let res = await fetch(`https://api.vevioz.com/api/button/videos/${encodeURIComponent(text)}`)

let html = await res.text()

let match = html.match(/https?:\/\/[^"]+\.mp4/)

if(!match) throw 'Video non trovato'

let video = match[0]

await conn.sendMessage(m.chat,{
video:{url:video},
caption:'🎬 Ecco il tuo video'
},{quoted:m})

} catch(e){

conn.reply(m.chat,'❌ Errore download video',m)

}

}

handler.command = ['playmp4']

export default handler
