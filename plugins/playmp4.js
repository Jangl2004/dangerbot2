import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {

if (!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎬 Scarico video...',m)

try {

let api = `https://api.siputzx.my.id/api/d/ytmp4?url=${text}`

let res = await fetch(api)
let json = await res.json()

if(!json.status) throw 'Provider error'

let video = json.data.dl

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
