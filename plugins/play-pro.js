import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn, text, command }) => {

if (!text) return m.reply('🎵 Usa:\n.play nome canzone')

m.reply('🔎 Ricerca su YouTube...')

let search = await yts(text)
let videos = search.videos.slice(0,5)

if (!videos.length) return m.reply('❌ Nessun risultato')

let list = videos.map((v,i)=>`
${i+1}. ${v.title}
⏱ ${v.timestamp}
📺 ${v.author.name}
`).join('\n')

let buttons = videos.map((v,i)=>({
buttonId: `.ytmp3 ${v.url}`,
buttonText: { displayText: `🎵 MP3 ${i+1}` },
type:1
}))

await conn.sendMessage(m.chat,{
image:{url:videos[0].thumbnail},
caption:`🎧 *RISULTATI YOUTUBE*

${list}

Seleziona formato ↓`,
buttons:buttons.slice(0,3),
footer:'GiuseBot Player',
headerType:4
},{quoted:m})

}

handler.command = ['play']
handler.help = ['play']
handler.tags = ['downloader']

export default handler


let mp3 = async (m,{conn,text})=>{

if(!text) return m.reply('❌ URL mancante')

let file = `audio_${Date.now()}.mp3`

m.reply('🎧 Download audio...')

exec(`yt-dlp -x --audio-format mp3 -o "${file}" "${text}"`, async (err)=>{

if(err){
console.log(err)
return m.reply('❌ Errore download')
}

let buffer = fs.readFileSync(file)

await conn.sendMessage(m.chat,{
audio:buffer,
mimetype:'audio/mpeg'
},{quoted:m})

fs.unlinkSync(file)

})

}

mp3.command = ['ytmp3']

export { mp3 }


let mp4 = async (m,{conn,text})=>{

if(!text) return m.reply('❌ URL mancante')

let file = `video_${Date.now()}.mp4`

m.reply('🎬 Download video...')

exec(`yt-dlp -f mp4 -o "${file}" "${text}"`, async (err)=>{

if(err){
console.log(err)
return m.reply('❌ Errore download')
}

let buffer = fs.readFileSync(file)

await conn.sendMessage(m.chat,{
video:buffer,
mimetype:'video/mp4'
},{quoted:m})

fs.unlinkSync(file)

})

}

mp4.command = ['ytmp4']

export { mp4 }
