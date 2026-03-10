const handler = async (m, { conn }) => {
    // Risponde con l'ID del gruppo in cui è stato usato il comando
    m.reply(`📍 *ID di questo gruppo:* \n\n${m.chat}`);
};

handler.help = ['id'];
handler.tags = ['info'];
handler.command = /^(id)$/i;

export default handler;
