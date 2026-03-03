import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi.');
  }

  // Verifica se l'utente è owner usando global.owner
  const senderNumber = m.sender.split('@')[0];
  const isOwner = global.owner.some(owner => owner[0] === senderNumber);
  
  if (!isOwner) {
    return m.reply('⚠️ Solo il proprietario del bot può usare questo comando.');
  }

  // Estrai il numero di telefono
  let phoneNumber = args[0]?.replace(/[^0-9]/g, '');
  
  if (!phoneNumber) {
    return m.reply(`📱 *COMANDO OSINT WHATSAPP*\n\n` +
      `Inserisci il numero da analizzare:\n` +
      `${usedPrefix + command} 391234567890\n\n` +
      `Oppure rispondi a un messaggio:\n` +
      `${usedPrefix + command} reply`);
  }

  // Se risponde a un messaggio, prendi il numero da lì
  if (m.quoted) {
    const quotedNumber = m.quoted.sender?.split('@')[0];
    if (quotedNumber) {
      phoneNumber = quotedNumber;
    }
  }

  // Validazione base
  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return m.reply('❌ Numero di telefono non valido. Deve contenere 10-15 cifre.');
  }

  // Formatta il numero (senza +)
  const formattedNumber = phoneNumber;

  // Messaggio di attesa
  await m.reply(`🔍 *RICERCA OSINT IN CORSO...*\n\n📱 Numero: ${formattedNumber}\n⏱️ Attendere prego`);

  try {
    // Simula tempi di risposta
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verifica se il numero cercato è un owner del bot
    const isTargetOwner = global.owner.some(owner => owner[0] === formattedNumber);
    
    // Dati simulati
    const mockData = generateMockData(formattedNumber, isTargetOwner);
    
    // Costruisci il messaggio di risposta
    const resultMessage = `
╔══════════════════════╗
   📱 *WHATSAPP OSINT* 📱
╚══════════════════════╝

👤 *NUMERO:* ${formattedNumber}
${mockData.hasWhatsapp ? '✅ *STATUS:* Account WhatsApp attivo' : '❌ *STATUS:* Account non trovato'}

${isTargetOwner ? '👑 *RUOLO:* ⚡ PROPRIETARIO DEL BOT ⚡' : '👤 *RUOLO:* Utente standard'}

📸 *FOTO PROFILO:* ${mockData.hasPhoto ? '✅ Presente' : '❌ Non disponibile/nascosta'}
🏢 *BUSINESS:* ${mockData.isBusiness ? '✅ Account Business' : '❌ Account personale'}

📝 *INFO AGGIUNTIVE:*
${mockData.info}

⚙️ *PRIVACY:*
• Ultimo accesso: ${mockData.lastSeen}
• Foto profilo: ${mockData.privacyPhoto}
• Info: ${mockData.privacyAbout}

📱 *DISPOSITIVI COLLEGATI:* ${mockData.devices}

⏱️ *RICERCA EFFETTUATA IL:* ${new Date().toLocaleString('it-IT')}

⚠️ *NOTA:* I dati mostrati sono simulati per dimostrazione
    `.trim();

    await conn.sendMessage(m.chat, {
      text: resultMessage,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Errore in osint:', error);
    await m.reply(`❌ *ERRORE*\n\nImpossibile completare la ricerca.\n\nDettagli: ${error.message}`);
  }
};

// Funzione per generare dati simulati
function generateMockData(phoneNumber, isOwner) {
  // Crea dati fittizi basati sul numero per rendere l'output variabile
  const hash = phoneNumber.split('').reduce((a, b) => a + parseInt(b), 0);
  const random = (min, max) => Math.floor((hash % (max - min + 1)) + min);
  
  // Se è owner, dai dati speciali
  const hasWhatsapp = true; // L'owner ha sicuramente WhatsApp
  const isBusiness = isOwner ? random(0, 10) > 3 : random(0, 10) > 7;
  const hasPhoto = isOwner ? random(0, 10) > 1 : random(0, 10) > 2;
  
  const lastSeenOptions = ['Visibile a tutti', 'Visibile ai contatti', 'Nessuno', 'Ultimo accesso sconosciuto'];
  const privacyOptions = ['Tutti', 'I miei contatti', 'Nessuno'];
  
  const devicesCount = isOwner ? random(2, 5) : random(1, 4);
  const deviceTypes = ['iPhone', 'Android', 'Web Client', 'Windows App', 'iPad', 'MacBook', 'Server Bot'];
  
  let devicesList = '';
  for (let i = 0; i < devicesCount; i++) {
    const randomDevice = deviceTypes[random(0, deviceTypes.length - 1)];
    const lastActive = random(1, 60);
    devicesList += `  • ${randomDevice}${randomDevice === 'Server Bot' ? ' (host principale)' : ''} (attivo ${lastActive} minuti fa)\n`;
  }
  
  // Info speciali per owner
  let specialInfo = '';
  if (isOwner) {
    specialInfo = '\n  • 👑 Utente con privilegi di amministratore\n  • 🔧 Accesso a comandi riservati';
    
    // Cerca il nome dell'owner in global.owner se disponibile
    const ownerData = global.owner.find(owner => owner[0] === phoneNumber);
    if (ownerData && ownerData[1]) {
      specialInfo += `\n  • 📝 Nome: ${ownerData[1]}`;
    }
  }
  
  return {
    hasWhatsapp,
    hasPhoto,
    isBusiness,
    lastSeen: isOwner ? 'Visibile a tutti' : lastSeenOptions[random(0, lastSeenOptions.length - 1)],
    privacyPhoto: isOwner ? 'Tutti' : privacyOptions[random(0, privacyOptions.length - 1)],
    privacyAbout: isOwner ? 'Tutti' : privacyOptions[random(0, privacyOptions.length - 1)],
    devices: `\n${devicesList || '  • Nessun dispositivo rilevato'}`,
    info: isBusiness ? 
      `  • Account verificato\n  • Categoria: ${isOwner ? 'Sviluppo Bot / Amministrazione' : 'Servizi'}\n  • Orari: ${isOwner ? '24/7' : '9:00-18:00'}${specialInfo}` : 
      `  • Account personale standard${specialInfo}`
  };
}

// Funzione per visualizzare la lista degli owner
handler.listOwners = async (m, { conn }) => {
  const senderNumber = m.sender.split('@')[0];
  const isOwner = global.owner.some(owner => owner[0] === senderNumber);
  
  if (!isOwner) {
    return m.reply('⚠️ Solo il proprietario può vedere la lista degli owner.');
  }

  let ownerList = '👑 *LISTA PROPRIETARI DEL BOT*\n\n';
  
  global.owner.forEach((owner, index) => {
    const number = owner[0];
    const name = owner[1] || 'Senza nome';
    const isMainOwner = index === 0 ? ' (Principale)' : '';
    
    ownerList += `${index + 1}. @${number} - ${name}${isMainOwner}\n`;
  });

  ownerList += `\n📊 *Totale proprietari:* ${global.owner.length}`;

  await conn.sendMessage(m.chat, {
    text: ownerList,
    mentions: global.owner.map(owner => owner[0] + '@s.whatsapp.net')
  }, { quoted: m });
};

// Aggiungi comando per vedere lista owner
handler.ownerlist = async (m, { conn }) => {
  await handler.listOwners(m, { conn });
};

// Configurazione del comando
handler.help = ['osint <numero>', 'osint reply', 'listowners'];
handler.tags = ['owner'];
handler.command = ['osint', 'osintwa', 'wainfo', 'listowners'];
handler.group = true;

// Non mettere handler.owner = true perché usiamo global.owner

export default handler;