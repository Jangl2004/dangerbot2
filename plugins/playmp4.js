import fetch from 'node-fetch'

const handler = async (m,{conn,text}) => {

if(!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎬 Scarico video...',m)

let api = `https://api.akuari.my.id/downloader/youtube?link=${text}`

let res = await fetch(api)
let json = await res.json()

let video = json.mp4

await conn.sendMessage(m.chat,{
video:{url:video},
caption:'🎬 Ecco il tuo video'
},{quoted:m})

}

handler.command = ['playmp4']

export default handler
