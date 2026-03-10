import fs from 'fs'

let handler = async (m, { conn }) => {
    // Leggiamo cosa c'è nella cartella principale (dove si trova handler.js)
    const cartelle = fs.readdirSync('./').filter(f => fs.statSync('./' + f).isDirectory());
    
    m.reply('📂 Cartelle trovate nella directory principale:\n\n' + cartelle.join('\n'));
}

handler.command = /^(debugfolders)$/i
handler.owner = true

export default handler
