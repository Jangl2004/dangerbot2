import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {

if (!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎧 Scarico audio...',m)

try {

let api = `https://api.siputzx.my.id/api/d/ytmp3?url=${text}`

let res = await fetch(api)
let json = await res.json()

if(!json.status) throw 'Provider error'

let audio = json.data.dl

await conn.sendMessage(m.chat,{
audio:{url:audio},
mimetype:'audio/mpeg'
},{quoted:m})

} catch(e){

conn.reply(m.chat,'❌ Errore download audio',m)

}

}

handler.command = ['playmp3']
export default handler
