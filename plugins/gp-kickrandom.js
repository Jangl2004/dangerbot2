const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ La roulette si gioca solo nei gruppi!');
  }

  // Prendi tutti i partecipanti del gruppo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  
  // Filtra: solo utenti normali (non admin, non bot stesso)
  const eligibleUsers = participants.filter(p => {
    return !p.admin && // Non admin
           p.id !== botNumber; // Non il bot
  });

  if (eligibleUsers.length === 0) {
    return m.reply('🎯 Non ci sono utenti non-admin nel gruppo!');
  }

  // Scegli una vittima casuale
  const randomVictim = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
  const victimNumber = randomVictim.id.split('@')[0];
  const adminNumber = m.sender.split('@')[0];

  // Genera percentuale di "fortuna"
  const luckPercent = Math.floor(Math.random() * 101);
  
  // Comando ROULETTE (con colpo di scena)
  if (command === 'rouletteban' || command === 'roulette') {
    const messages = [
      "🎯 *ROULETTE RUSSA* 🎯",
      "🔫 *GIOCO PERICOLOSO* 🔫",
      "💀 *LA PALLOTTOLA GIRA* 💀",
      "🎲 *FORTUNA O MORTE* 🎲"
    ];
    
    const randomTitle = messages[Math.floor(Math.random() * messages.length)];
    
    const initialMsg = `
╔══════════════════════╗
   ${randomTitle}
╚══════════════════════╝

🎰 *L'admin @${adminNumber} carica il tamburo...*

🔄 *Giocatori in gioco:* ${eligibleUsers.length}
👑 *Admin che gioca:* @${adminNumber}

${createLoadingBar(luckPercent, 12)}

📊 *Probabilità per la vittima:* ${luckPercent}%
    `;

    const sentMsg = await conn.sendMessage(m.chat, { 
      text: initialMsg,
      mentions: [m.sender, randomVictim.id],
      contextInfo: {
        externalAdReply: {
          title: '🎲 ROULETTE RUSSA',
          body: 'Il destino sta per decidere...',
          mediaType: 1,
          renderLargerThumbnail: false,
          thumbnailUrl: 'https://telegra.ph/file/your-roulette-image.jpg'
        }
      }
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 3000));

    if (luckPercent > 50) {
      // Vittima colpita
      await conn.sendMessage(m.chat, { 
        text: `💥 *BANG!* 💥\n\nLa pallottola ha colpito @${victimNumber}\n\n💀 *ELIMINATO DAL GRUPPO* 💀\n\n👑 *Admin killer:* @${adminNumber}`,
        mentions: [randomVictim.id, m.sender]
      }, { quoted: sentMsg });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      await conn.groupParticipantsUpdate(m.chat, [randomVictim.id], 'remove');
      
    } else {
      // Colpo a salve
      await conn.sendMessage(m.chat, { 
        text: `😮‍💨 *CLICK!* 😮‍💨\n\n*COLPO A SALVE!*\n\n@${victimNumber} è stato fortunato! @${adminNumber} deve riprovare!`,
        mentions: [randomVictim.id, m.sender]
      }, { quoted: sentMsg });
    }
    
  } else { // Comando KICKRANDOM
    const emojis = ['🎯', '🎲', '💫', '⭐', '⚡', '🌀'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const actions = [
      "viene eliminato",
      "saluta il gruppo",
      "fa le valigie",
      "cambia aria",
      "prende un volo",
      "vola via",
      "si teletrasporta",
      "lascia per sempre"
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const kickMessage = `
╔══════════════════════╗
   ${randomEmoji} *KICK RANDOM* ${randomEmoji}
╚══════════════════════╝

👑 *Admin esecutore:* @${adminNumber}
🎰 *Estrazione in corso...*

${createLoadingBar(luckPercent, 10)}

🔮 *Il fato ha scelto:*

👤 *Vittima:* @${victimNumber}
📦 *Stato:* ${randomAction} dal gruppo!

━━━━━━━━━━━━━━━━━━━
📊 *Statistiche roulette:*
• Totale estrazioni: ${Math.floor(Math.random() * 50) + 10}
• Probabilità scelta: ${luckPercent}%
• Utenti rimasti: ${eligibleUsers.length - 1}
    `;

    await conn.sendMessage(m.chat, {
      text: kickMessage,
      mentions: [randomVictim.id, m.sender]
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await conn.groupParticipantsUpdate(m.chat, [randomVictim.id], 'remove');
  }
};

// Funzione per creare barra di caricamento
function createLoadingBar(percent, length = 10) {
  const filledLength = Math.round((percent / 100) * length);
  const emptyLength = length - filledLength;
  
  const filledBar = '▓'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);
  
  return `[${filledBar}${emptyBar}]`;
}

// Configurazione
handler.help = [
  'kickrandom - Rimuove un utente casuale dal gruppo (SOLO ADMIN)',
  'rouletteban - Roulette russa per utenti casuali (SOLO ADMIN)'
];

handler.tags = ['admin'];
handler.command = ['kickrandom', 'rouletteban', 'roulette'];
handler.group = true;
handler.admin = true; // Solo admin possono usare il comando
handler.botAdmin = true; // Il bot deve essere admin

export default handler;