// ============================================
// COMANDO 1: .cinema - Storia interattiva
// ============================================
const cinemaHandler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(`🎬 *CINEMA INTERATTIVO*\n\n` +
      `Scegli un genere:\n` +
      `▸ .cinema horror\n` +
      `▸ .cinema fantasy\n` +
      `▸ .cinema romance\n` +
      `▸ .cinema thriller\n` +
      `▸ .cinema comedy`);
  }

  const genre = args[0].toLowerCase();
  const user = m.sender;
  
  const stories = {
    horror: {
      title: "🏚️ LA CASA DEI SUSSURRI",
      start: "Sei in una vecchia casa abbandonata. Senti dei passi al piano di sopra...",
      options: [
        { emoji: "⬆️", text: "Sali le scale", next: "senti una porta che cigola..." },
        { emoji: "🏃", text: "Scappi via", next: "inciampi e cadi..." },
        { emoji: "🔦", text: "Accendi la torcia", next: "vedi un'ombra muoversi..." }
      ]
    },
    fantasy: {
      title: "🐉 IL DRAGO ADDORMENTATO",
      start: "Sei davanti alla caverna di un drago. Devi recuperare un uovo d'oro...",
      options: [
        { emoji: "🚶", text: "Entri piano piano", next: "il drago si sveglia!" },
        { emoji: "🎵", text: "Canti una ninna nanna", next: "il drago russa più forte..." },
        { emoji: "🍖", text: "Lanci della carne", next: "il drago la annusa..." }
      ]
    },
    romance: {
      title: "💘 APPUNTAMENTO AL BUIO",
      start: "Sei al ristorante. Il tuo appuntamento è in ritardo di 20 minuti...",
      options: [
        { emoji: "📱", text: "Gli mandi un messaggio", next: "risponde con 'arrivo!'" },
        { emoji: "🍷", text: "Ordini da bere", next: "il cameriere ti guarda strano..." },
        { emoji: "🚗", text: "Te ne vai", next: "lo incontri proprio all'uscita!" }
      ]
    }
  };

  if (!stories[genre]) {
    return m.reply(`❌ Genere non disponibile. Scegli tra: horror, fantasy, romance, thriller, comedy`);
  }

  const story = stories[genre];
  let response = `🎬 *${story.title}*\n\n`;
  response += `📖 *Inizio:* ${story.start}\n\n`;
  response += `*Cosa vuoi fare?*\n`;
  
  story.options.forEach(opt => {
    response += `${opt.emoji} ${opt.text}\n`;
  });
  
  response += `\n_Rispondi a questo messaggio con l'emoji della tua scelta!_`;

  await conn.sendMessage(m.chat, { text: response }, { quoted: m });
  
  // Qui si potrebbe implementare un sistema di attesa per le risposte
};

// ============================================
// COMANDO 2: .cacciaaltesoro - Gioco di gruppo
// ============================================
const treasureHandler = async (m, { conn }) => {
  const participants = m.quoted ? [m.quoted.sender] : m.mentionedJid;
  
  if (participants.length === 0) {
    return m.reply(`💰 *CACCIA AL TESORO DI GRUPPO*\n\n` +
      `Taggami chi partecipa! Esempio:\n` +
      `.cacciaaltesoro @utente1 @utente2`);
  }

  const gameId = Date.now();
  const locations = [
    { name: "🏖️ Spiaggia dei Pirati", hint: "Dove l'acqua bacia la sabbia" },
    { name: "🏛️ Tempio Antico", hint: "Colonne di pietra custodiscono segreti" },
    { name: "🌲 Foresta Incantata", hint: "Gli alberi sussurrano" },
    { name: "⛰️ Montagna del Drago", hint: "La cima tocca le nuvole" },
    { name: "🏚️ Villaggio Abbandonato", hint: "Nessuno vive qui da anni" }
  ];

  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  let gameMsg = `🗺️ *CACCIA AL TESORO #${gameId}*\n\n`;
  gameMsg += `👥 *Partecipanti:* ${participants.map(p => '@' + p.split('@')[0]).join(', ')}\n\n`;
  gameMsg += `📜 *Indizio:* ${randomLocation.hint}\n\n`;
  gameMsg += `🕵️ *Chi trova il tesoro?*\n`;
  gameMsg += `_Rispondete con il nome del luogo!_`;

  await conn.sendMessage(m.chat, { 
    text: gameMsg,
    mentions: participants 
  }, { quoted: m });

  // Qui si potrebbe implementare la logica per chi indovina
};

// ============================================
// COMANDO 3: .museo - Genera opere d'arte con l'IA
// ============================================
const artHandler = async (m, { conn, args }) => {
  const artStyles = [
    "🎨 stile Van Gogh", "🖼️ stile Picasso", "🎭 stile Rinascimentale",
    "🌀 stile Surrealista", "👾 stile Cyberpunk", "🌸 stile Ukiyo-e",
    "🧩 stile Cubista", "🌈 stile Pop Art", "⚡ stile Futuristico"
  ];

  const randomStyle = artStyles[Math.floor(Math.random() * artStyles.length)];
  
  let prompt = args.join(' ') || "un gatto che suona il pianoforte";
  
  let artMsg = `🖼️ *IL MUSEO DELLE MERAVIGLIE*\n\n`;
  artMsg += `📝 *Descrizione:* "${prompt}"\n`;
  artMsg += `🎭 *Stile:* ${randomStyle}\n\n`;
  artMsg += `🔮 *L'IA sta creando il tuo capolavoro...*`;

  const waitMsg = await conn.sendMessage(m.chat, { text: artMsg }, { quoted: m });

  // Simula generazione (in realtà usa un'API vera)
  await new Promise(resolve => setTimeout(resolve, 3000));

  const artResult = `
╔══════════════════╗
   🏛️ OPERA COMPLETATA 🏛️
╚══════════════════╝

📌 *Titolo:* ${prompt.substring(0, 30)}...
🎨 *Tecnica:* ${randomStyle}
👨‍🎨 *Artista:* @${m.sender.split('@')[0]}

📜 *Descrizione poetica:*
${generatePoeticDescription(prompt)}

⚡ *Valore stimato:* ${Math.floor(Math.random() * 9000000 + 1000000)}€
🏆 *Mostra:* "Arte Digitale 2025"

_Scatta una foto alla tua opera immaginaria e condividila!_
  `.trim();

  await conn.sendMessage(m.chat, {
    text: artResult,
    mentions: [m.sender]
  }, { quoted: waitMsg });
};

// ============================================
// COMANDO 4: .oroscopo - Oroscopo personalizzato
// ============================================
const horoscopeHandler = async (m, { conn, args }) => {
  const signs = [
    "♈ ariete", "♉ toro", "♊ gemelli", "♋ cancro",
    "♌ leone", "♍ vergine", "♎ bilancia", "♏ scorpione",
    "♐ sagittario", "♑ capricorno", "♒ acquario", "♓ pesci"
  ];

  let userSign = args[0]?.toLowerCase();
  
  if (!userSign || !signs.some(s => s.includes(userSign))) {
    return m.reply(`⭐ *OROSCOPO DEL GIORNO*\n\n` +
      `Inserisci il tuo segno:\n` +
      `.oroscopo ariete\n\n` +
      `Segni disponibili:\n` +
      signs.join('\n'));
  }

  const fortunes = [
    "⭐ Oggi brillerai come non mai! Qualcuno noterà il tuo talento.",
    "🌙 La luna ti sorride. Aspettati una bella sorpresa da un amico.",
    "☀️ Energia positiva! Perfetto per iniziare quel progetto che rimandi da mesi.",
    "✨ Le stelle dicono che incontrerai qualcuno di importante.",
    "🌈 La fortuna bussa alla tua porta. Compra un biglietto della lotteria!",
    "🍀 Oggi è il tuo giorno fortunato. Osalo!",
    "💫 Nuvole rosa all'orizzonte. Una storia d'amore sta per iniziare.",
    "🌠 Segui il tuo intuito. Ti porterà dove devi essere."
  ];

  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  const luckyNumber = Math.floor(Math.random() * 90) + 10;
  const luckyColor = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Viola', 'Arancione'][Math.floor(Math.random() * 6)];

  const horoscopeMsg = `
╔══════════════════╗
   ⭐ OROSCOPO DEL GIORNO ⭐
╚══════════════════╝

👤 *Segno:* ${userSign.toUpperCase()}
📅 *Data:* ${new Date().toLocaleDateString('it-IT')}

🔮 *Previsione:*
${randomFortune}

🍀 *Numero fortunato:* ${luckyNumber}
🎨 *Colore:* ${luckyColor}

💕 *Amore:* ${generateLovePrediction()}
💼 *Lavoro:* ${generateWorkPrediction()}
💰 *Soldi:* ${generateMoneyPrediction()}

✨ *Consiglio del giorno:* 
${generateAdvice()}
  `.trim();

  await conn.sendMessage(m.chat, { text: horoscopeMsg }, { quoted: m });
};

// ============================================
// COMANDO 5: .quiz - Quiz personalizzato sull'utente
// ============================================
const quizHandler = async (m, { conn }) => {
  const user = m.sender.split('@')[0];
  
  const questions = [
    {
      q: "Cosa fai quando ti annoi?",
      a: ["📱 Sto al telefono", "🎮 Gioco ai videogiochi", "📺 Guardo serie TV", "🚶 Esco"]
    },
    {
      q: "Quale superpotere vorresti?",
      a: ["🦸 Volare", "👁️ Leggere nel pensiero", "⏱️ Fermare il tempo", "🦾 Superforza"]
    },
    {
      q: "Dove ti piacerebbe vivere?",
      a: ["🏖️ Al mare", "🏔️ In montagna", "🏙️ In città", "🏝️ Su un'isola deserta"]
    },
    {
      q: "Cibo preferito?",
      a: ["🍕 Pizza", "🍣 Sushi", "🍔 Hamburger", "🥗 Insalata"]
    }
  ];

  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  
  let quizMsg = `📝 *QUIZ PERSONALIZZATO per @${user}*\n\n`;
  quizMsg += `❓ *Domanda:* ${randomQ.q}\n\n`;
  quizMsg += `*Opzioni:*\n`;
  randomQ.a.forEach((opt, i) => {
    quizMsg += `${opt}\n`;
  });
  quizMsg += `\n_Rispondi con il numero (1-4) della tua scelta!_`;

  await conn.sendMessage(m.chat, {
    text: quizMsg,
    mentions: [m.sender]
  }, { quoted: m });
};

// Funzioni di supporto
function generatePoeticDescription(prompt) {
  const descriptions = [
    `L'opera cattura l'essenza di "${prompt}" in un vortice di colori e emozioni.`,
    `Un capolavoro che fonde la realtà con l'immaginazione, dove "${prompt}" diventa poesia visiva.`,
    `L'artista ha saputo interpretare "${prompt}" con una sensibilità unica e commovente.`,
    `Ogni pennellata racconta una storia diversa di "${prompt}". Un'opera che rimane nel cuore.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateLovePrediction() {
  const pred = [
    "Cuori danzanti all'orizzonte", "Nuove fiamme stanno per accendersi",
    "L'amore bussa alla tua porta", "Momenti romantici in arrivo",
    "Qualcuno pensa a te proprio ora"
  ];
  return pred[Math.floor(Math.random() * pred.length)];
}

function generateWorkPrediction() {
  const pred = [
    "Promozione in vista!", "Colleghi collaborativi",
    "Nuove opportunità lavorative", "Riconoscimenti in arrivo",
    "Giornata produttiva"
  ];
  return pred[Math.floor(Math.random() * pred.length)];
}

function generateMoneyPrediction() {
  const pred = [
    "Soldi inaspettati in arrivo", "Buon momento per investire",
    "Risparmi in crescita", "Spese oculate oggi",
    "Fortuna finanziaria"
  ];
  return pred[Math.floor(Math.random() * pred.length)];
}

function generateAdvice() {
  const pred = [
    "Ascolta la tua musica preferita", "Chiama quel amico che non senti da tempo",
    "Fai una pausa e respira", "Segui il tuo cuore",
    "Oggi è il giorno giusto per osare"
  ];
  return pred[Math.floor(Math.random() * pred.length)];
}

// Handler principale che gestisce tutti i comandi
const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ I comandi fun possono essere usati solo nei gruppi per più divertimento!');
  }

  const commands = {
    'cinema': cinemaHandler,
    'cacciaaltesoro': treasureHandler,
    'museo': artHandler,
    'oroscopo': horoscopeHandler,
    'quiz': quizHandler
  };

  if (commands[command]) {
    await commands[command](m, { conn, args, usedPrefix, command });
  }
};

// Configurazione
handler.help = [
  'cinema <genere> - Storia interattiva (horror/fantasy/romance)',
  'cacciaaltesoro @user - Caccia al tesoro di gruppo',
  'museo <descrizione> - Genera un\'opera d\'arte',
  'oroscopo <segno> - Oroscopo personalizzato',
  'quiz - Quiz sulla tua personalità'
];

handler.tags = ['fun'];
handler.command = ['cinema', 'cacciaaltesoro', 'museo', 'oroscopo', 'quiz'];
handler.group = true;

export default handler;