let handler = m => m
handler.all = async function (m) {
  if (!m.isGroup || !m.text) return null
  const user = global.db.data.users[m.sender]
  const chat = global.db.data.chats[m.chat]  

  if (chat.bestemmiometro) {
    const bestemmieRegex = /porco dio|porcodio|dio microonde|madonna zoccola|dio cagnaccio|dio tostapane|dio puttana|porco di dio|dio beduino|dio armadillo|porco il tuo dio|porco il vostro dio|dio bastardo|diocan|dio merda|diomerda|dio can|dio cane|porcamadonna|puttana la madonna|madonnaporca|porca madonna|madonna porca|dio inutile|dio cinghiale|mannaggia alla madonna|mannaggia a dio|madonna troia|mannggia a gesù|mannaggia a cristo|dio maiale|diomaiale|porco gesù|porcogesù|gesù cane|cristo madonna|madonna impanata|mannaggia cristo|porcaccio il dio|porcaccio dio|porcaccioddio|orcodio|orco dio|rcodio|rco dio|porcaccio gesù|porcaccio ddio|fucking god|fuckinggod|fuckingod|mannaggia a cristo|dio ciolla|dio cipolla|mannaggia a dio|porco de dio|mannaggia dio|cristo tostapane|porco cristo|dio pera|puttanaccia la madonna|porca la madonna|dioporco|dio frocio|dio ricchione|dio poveretto|dio povero|p.o.r.c.o.d.i.o|d.i.o.p.o.r.c.o|d.i.o.c.a.n.e|porco allah|allah cane|diobestia|dio bestia|porca madonnina|madonnina porca|madonnina puttana|puttana madonnina|madonninaputtana|madonninaporca|puttanamadonnina|porcamadonnina|poccoddio|poccodio|pocco dio|pocco ddio|dio pollo|dio cotoletta|gesù cotoletta|cristo porchetta|gesù pollo|dio disabile|dio gay|dio inculato|dio infuocato|dio nutella|dio bastoncino|gesù bastoncino|gesù nutella|dio down|dio handicappato|dio handicap|dio andicappato|dio crocifissato|dio negro|madonna negra|gesù negro|dio pisello|dio marocchino|dio africano|dio pulla|madonna pulla|dio lattuga|gesù pisello|madonna puttana|madonna vacca|madonna inculata|porcoddio|porcaccia la madonna|dio porchetta|dio porchetto|cristo bastardo|dio lesbico|dio lesbica|dio porco|gesù impanato|gesù porco|porca madonna|diocane|madonna porca|dio capra|capra dio|dio impanato|dio temperino|dio petardo/gi

    const matches = m.text.match(bestemmieRegex)
    if (!matches) return

    const count = matches.length
    user.blasphemy += count

    let grado = (user.blasphemy > 0 && user.blasphemy <= 5) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐢𝐚𝐧𝐭𝐞'
      : (user.blasphemy > 5 && user.blasphemy <= 20) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐚𝐥𝐞'
      : (user.blasphemy > 20 && user.blasphemy <= 50) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐚𝐛𝐢𝐭𝐮𝐚𝐥𝐞'
      : (user.blasphemy > 50 && user.blasphemy <= 100) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐚𝐦𝐚𝐭𝐨𝐫𝐢𝐚𝐥𝐞'
      : (user.blasphemy > 100 && user.blasphemy <= 200) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐨 𝐩𝐫𝐨𝐟𝐞𝐬𝐬𝐢𝐨𝐧𝐢𝐬𝐭𝐚'
      : (user.blasphemy > 200 && user.blasphemy <= 400) ? '𝐠𝐫𝐚𝐧 𝐦𝐚𝐞𝐬𝐭𝐫𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 400 && user.blasphemy <= 700) ? '𝐤𝐢𝐧𝐠 𝐝𝐞𝐥𝐥𝐞 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞'
      : (user.blasphemy > 700 && user.blasphemy <= 1000) ? '𝐢𝐦𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 1000 && user.blasphemy <= 1500) ? '𝐝𝐢𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 1500 && user.blasphemy <= 2100) ? '𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚 𝐢𝐧𝐜𝐚𝐫𝐧𝐚𝐭𝐚'
      : (user.blasphemy > 2100 && user.blasphemy <= 2800) ? '𝐚𝐩𝐨𝐬𝐭𝐨𝐥𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 2800 && user.blasphemy <= 3600) ? '𝐬𝐢𝐠𝐧𝐨𝐫𝐞 𝐝𝐞𝐥 𝐬𝐚𝐜𝐫𝐢𝐥𝐞𝐠𝐢𝐨'
      : (user.blasphemy > 3600 && user.blasphemy <= 4500) ? '𝐩𝐚𝐝𝐫𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐞 𝐞𝐫𝐞𝐬𝐢𝐞'
      : (user.blasphemy > 4500 && user.blasphemy <= 5500) ? '𝐚𝐫𝐜𝐢𝐝𝐮𝐜𝐚 𝐝𝐞𝐥𝐥𝐚 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐚'
      : (user.blasphemy > 5500 && user.blasphemy <= 6600) ? '𝐬𝐨𝐯𝐫𝐚𝐧𝐨 𝐝𝐞𝐥 𝐯𝐢𝐥𝐢𝐩𝐞𝐧𝐝𝐢𝐨'
      : (user.blasphemy > 6600 && user.blasphemy <= 7800) ? '𝐳𝐚𝐫 𝐝𝐞𝐥 𝐬𝐚𝐜𝐫𝐢𝐥𝐞𝐠𝐢𝐨'
      : (user.blasphemy > 7800 && user.blasphemy <= 9100) ? '𝐭𝐢𝐫𝐚𝐧𝐧𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 9100 && user.blasphemy <= 10500) ? '𝐬𝐜𝐢𝐚𝐦𝐚𝐧𝐨 𝐝𝐞𝐥𝐥\'𝐞𝐦𝐩𝐢𝐞𝐭𝐚̀'
      : (user.blasphemy > 10500 && user.blasphemy <= 12000) ? '𝐩𝐚𝐩𝐚 𝐝𝐞𝐥𝐥𝐞 𝐞𝐫𝐞𝐬𝐢𝐞'
      : (user.blasphemy > 12000 && user.blasphemy <= 13600) ? '𝐢𝐦𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 𝐬𝐚𝐜𝐫𝐢𝐥𝐞𝐠𝐢𝐨'
      : (user.blasphemy > 13600 && user.blasphemy <= 15300) ? '𝐤𝐚𝐢𝐬𝐞𝐫 𝐝𝐞𝐥𝐥𝐚 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐚'
      : (user.blasphemy > 15300 && user.blasphemy <= 17100) ? '𝐬𝐨𝐯𝐫𝐚𝐧𝐨 𝐝𝐞𝐥𝐥𝐚 𝐩𝐫𝐨𝐟𝐚𝐧𝐚𝐳𝐢𝐨𝐧𝐞'
      : (user.blasphemy > 17100 && user.blasphemy <= 19000) ? '𝐭𝐢𝐫𝐚𝐧𝐧𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐥𝐚𝐬𝐟𝐞𝐦𝐢𝐚'
      : (user.blasphemy > 19000 && user.blasphemy <= 21000) ? "𝐦𝐞𝐬𝐬𝐢𝐚 𝐝𝐞𝐥𝐥'𝐞𝐦𝐩𝐢𝐞𝐭𝐚̀"
      : (user.blasphemy > 21000 && user.blasphemy <= 23100) ? '𝐞𝐦𝐢𝐫𝐨 𝐝𝐞𝐥 𝐬𝐚𝐜𝐫𝐢𝐥𝐞𝐠𝐢𝐨'
      : (user.blasphemy > 23100 && user.blasphemy <= 25300) ? '𝐬𝐮𝐥𝐭𝐚𝐧𝐨 𝐝𝐞𝐥𝐥𝐚 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐚'
      : (user.blasphemy > 25300 && user.blasphemy <= 27600) ? '𝐫𝐞 𝐝𝐞𝐥 𝐯𝐢𝐥𝐢𝐩𝐞𝐧𝐝𝐢𝐨'
      : (user.blasphemy > 27600 && user.blasphemy <= 30000) ? '𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐞 𝐝𝐞𝐥 𝐬𝐚𝐜𝐫𝐢𝐥𝐞𝐠𝐢𝐨'
      : (user.blasphemy > 30000) ? '𝐬𝐢𝐠𝐧𝐨𝐫𝐞 𝐝𝐞𝐥𝐥𝐞 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞'
      : '𝐬𝐚𝐧𝐭𝐨'

    if (user.blasphemy === 1) {
      conn.reply(m.chat, `𝐍𝐮𝐨𝐯𝐨 𝐨𝐛𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 \n@${m.sender.split`@`[0]} 𝐡𝐚 𝐭𝐢𝐫𝐚𝐭𝐨 𝐥𝐚 𝐬𝐮𝐚 𝐩𝐫𝐢𝐦𝐚 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐚`, null, { mentions: [m.sender] })
    } else if (user.blasphemy % 100 === 0 && user.blasphemy <= 1000000) {
      let milestoneMoney = 50 * Math.pow(2, Math.floor(Math.log2(user.blasphemy / 100)));
      await conn.reply(m.chat, `𝐍𝐮𝐨𝐯𝐨 𝐨𝐛𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 @${m.sender.split`@`[0]} 𝐡𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 *${user.blasphemy}* 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞\n𝐄𝐜𝐜𝐨 𝐚 𝐭𝐞 + *${milestoneMoney}* €\n> 𝐆𝐫𝐚𝐝𝐨: ${grado}`, null, { mentions: [m.sender] })
      user.money += milestoneMoney;
    } else if (user.blasphemy > 1 && user.blasphemy % 100 !== 0) {
      conn.reply(m.chat, `@${m.sender.split`@`[0]} 𝐡𝐚 𝐭𝐢𝐫𝐚𝐭𝐨 *${user.blasphemy}* 𝐛𝐞𝐬𝐭𝐞𝐦𝐦𝐢𝐞\n> 𝐆𝐫𝐚𝐝𝐨: ${grado}`, null, { mentions: [m.sender]})
    }
  }
}
export default handler