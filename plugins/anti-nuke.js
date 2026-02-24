const handler = m => m;

// Lista utenti autorizzati
const registeredAdmins = [
  '212781816909@s.whatsapp.net',
  '390935931875@s.whatsapp.net',
];

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  const sender = m.key?.participant || m.participant || m.sender;

  if (![29, 30].includes(m.messageStubType)) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const BOT_OWNERS = global.owner.map(o => o[0] + '@s.whatsapp.net');

  let founderJid = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    founderJid = metadata.owner;
  } catch {
    founderJid = null;
  }

  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...registeredAdmins,
    founderJid
  ].filter(Boolean);

  if (allowed.includes(sender)) return;

  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length) return;

  await conn.groupParticipantsUpdate(
    m.chat,
    usersToDemote,
    'demote'
  );

  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action = m.messageStubType === 29 ? 'Tentativo di Promozione' : 'Tentativo di Retrocessione';

  const groupName = m.pushName || 'GRUPPO THE DANGER';

  const text = `
🚨 AZIONE NON AUTORIZZATA RILEVATA
════════════════════
👤 @${sender.split('@')[0]} ha tentato di eseguire una ${action} senza permessi.

☠️ AMMINISTRATORI DEMOTATI:
${usersToDemote.map(j => `💀 @${j.split('@')[0]}`).join('\n')}

🔒 gruppo messo in modalità sicurezza temporanea.

👑 OWNER AVVISATI:
${BOT_OWNERS.map(x => `🛡️ @${x.split('@')[0]}`).join('\n')}
════════════════════
`.trim();

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [...usersToDemote, ...BOT_OWNERS].filter(Boolean),
    },
  });
};

export default handler;
