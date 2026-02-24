import os from 'os';
import { performance } from 'perf_hooks';

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const userId = message.sender;
    const userName = message.pushName || userId.split('@')[0];

    // Calcolo uptime bot
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    const totalUsers = Object.keys(global.db?.data?.users || {}).length;

    const menuText = `
╔═════════════╗
     𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 
     CONTROL PANEL
╚═════════════╝

👤 Utente: @${userId.split('@')[0]}
⏳ Online da: ${uptimeStr}
👥 Utenti registrati: ${totalUsers}

━━━━━━━━━━━━━━━
⚠ SISTEMA OPERATIVO ATTIVO
━━━━━━━━━━━━━━━
Seleziona un pannello qui sotto 👇
`.trim();

    const buttons = [
        { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '🛡 Menu Admin' }, type: 1 },
        { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '👑 Menu Owner' }, type: 1 },
        { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🫅🏻 Moderazione' }, type: 1 },
        { buttonId: `${usedPrefix}menufunzioni`, buttonText: { displayText: '🚨 Funzioni' }, type: 1 },
        { buttonId: `${usedPrefix}menugiochi`, buttonText: { displayText: '🎮 Giochi' }, type: 1 },
        { buttonId: `${usedPrefix}menuludopatici`, buttonText: { displayText: '📱 Area Digitale' }, type: 1 }
    ];

    await conn.sendMessage(message.chat, {
        text: menuText,
        footer: '⚡ Danger Bot System',
        buttons: buttons,
        headerType: 1,
        mentions: [userId]
    });
};

// Funzione per convertire ms in gg:hh:mm:ss
function clockString(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

handler.help = ['menu', 'comandi'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;

export default handler;
