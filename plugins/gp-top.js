// Database globale
globalThis.archivioMessaggi = globalThis.archivioMessaggi || {};

let handler = async (m, { conn, command }) => {
  let chatId = m.chat;
  let dati = globalThis.archivioMessaggi[chatId];

  if (!dati || dati.totali === 0) {
    return m.reply("📊 *CLASSIFICA MESSAGGI*\n\nNessun messaggio registrato oggi in questo gruppo.");
  }

  // Determina quanti utenti mostrare
  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite);

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];

  let testo = `╭━━━〔 📊 *CLASSIFICA* 📊 〕━━━⬣\n`;
  testo += `┃ 💬 Messaggi totali: *${dati.totali}*\n`;
  testo += `┃ 📅 Aggiornata in tempo reale\n`;
  testo += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
  testo += `🏆 *TOP ${limite} DI OGGI*\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    let id = u[0];
    let datiUtente = u[1];
    menzioni.push(id);
    testo += `${medaglie[i]} @${id.split("@")[0]}\n`;
    testo += `   ✉️ ${datiUtente.conteggio} messaggi\n\n`;
  });

  testo += `──────────────────\n`;
  testo += `⏳ _Il conteggio si azzera a mezzanotte_`;

  await conn.sendMessage(chatId, {
    text: testo,
    mentions: menzioni,
    buttons: [
      { buttonId: '.top5', buttonText: { displayText: '📊 TOP 5' }, type: 1 },
      { buttonId: '.top10', buttonText: { displayText: '🏆 TOP 10' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

// --- REGISTRAZIONE MESSAGGI ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 

  let chat = m.chat;
  let user = m.sender;

  if (!globalThis.archivioMessaggi[chat]) {
    globalThis.archivioMessaggi[chat] = { totali: 0, utenti: {} };
  }

  globalThis.archivioMessaggi[chat].totali += 1;

  let nome = m.pushName || 'Utente';
  if (!globalThis.archivioMessaggi[chat].utenti[user]) {
    globalThis.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
  }
  globalThis.archivioMessaggi[chat].utenti[user].conteggio += 1;
};

// --- AUTOMAZIONE MEZZANOTTE ---
setInterval(async () => {
  let now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {

    let gruppi = Object.keys(globalThis.archivioMessaggi);

    for (let gid of gruppi) {
      if (!globalThis.conn) continue;

      let dati = globalThis.archivioMessaggi[gid];
      if (!dati || dati.totali === 0) continue;

      let classifica = Object.entries(dati.utenti)
        .sort((a, b) => b[1].conteggio - a[1].conteggio)
        .slice(0, 3);

      let testo = `🌙 ╭━━━〔 🏆 *PODIO FINALE* 🏆 〕━━━⬣\n`;
      testo += `┃ 📊 Totale messaggi: *${dati.totali}*\n`;
      testo += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

      const medaglie = ['🥇','🥈','🥉'];
      let menzioni = [];

      classifica.forEach((u, i) => {
        menzioni.push(u[0]);
        testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio} messaggi\n`;
      });

      testo += `\nConteggio Azzerato`;

      await globalThis.conn.sendMessage(gid, {
        text: testo,
        mentions: menzioni
      });

      globalThis.archivioMessaggi[gid] = { totali: 0, utenti: {} };
    }
  }
}, 60000);

handler.help = ['top','top5','top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

export default handler;