import { WAMessageStubType } from '@realvare/baileys';
import axios from 'axios';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_TTL = 1000 * 60 * 60;
const groupBackgroundCache = new Map();
const profilePicCache = new Map();

setInterval(() => {
    groupBackgroundCache.clear();
    profilePicCache.clear();
}, CACHE_TTL);

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
let defaultAvatarBuffer = null;
let puppeteer = null;
let browser = null;

async function initPuppeteer() {
    try {
        puppeteer = await import('puppeteer');
        await initBrowser();
    } catch (e) {
        console.error('❌ Puppeteer non installato:', e.message);
    }
}

async function initBrowser() {
    if (!puppeteer) return false;
    try {
        if (browser && browser.isConnected()) return true;
        if (browser) await browser.close().catch(() => {});
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process',
            ],
        });
        return true;
    } catch (err) {
        console.error('❌ Errore avvio browser:', err.message);
        browser = null;
        return false;
    }
}

async function preloadDefaultAvatar() {
    if (defaultAvatarBuffer) return;
    try {
        const res = await axios.get(DEFAULT_AVATAR_URL, { responseType:'arraybuffer', timeout:5000 });
        defaultAvatarBuffer = Buffer.from(res.data);
    } catch {
        defaultAvatarBuffer = Buffer.from('<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="200" fill="#6B7280"/></svg>');
    }
}

async function getUserProfilePic(conn, jid) {
    if (profilePicCache.has(jid)) return profilePicCache.get(jid);
    let buffer = null;
    try {
        const url = await conn.profilePictureUrl(jid,'image').catch(() => null);
        if (url) {
            const res = await axios.get(url,{ responseType:'arraybuffer' });
            buffer = Buffer.from(res.data);
        }
    } catch {}
    if (!buffer) {
        if (!defaultAvatarBuffer) await preloadDefaultAvatar();
        buffer = defaultAvatarBuffer;
    }
    profilePicCache.set(jid, buffer);
    return buffer;
}

async function getGroupBackgroundImage(groupJid, conn) {
    if (groupBackgroundCache.has(groupJid)) return groupBackgroundCache.get(groupJid);
    let buffer = null;
    try {
        const url = await conn.profilePictureUrl(groupJid,'image').catch(() => null);
        if (url) { const res = await axios.get(url,{ responseType:'arraybuffer' }); buffer = Buffer.from(res.data); }
    } catch {}
    if (!buffer) {
        try {
            const fallback = path.join(__dirname,'..','media','benvenuto-addio.jpg');
            await fs.access(fallback);
            buffer = await fs.readFile(fallback);
        } catch { buffer = defaultAvatarBuffer; }
    }
    groupBackgroundCache.set(groupJid, buffer);
    return buffer;
}

const WelcomeCard = ({ backgroundUrl, pfpUrl, isGoodbye, username, groupName }) => {
    const safeUsername = username?.replace(/</g,"&lt;").replace(/>/g,"&gt;")||'Utente';
    const safeGroupName = groupName?.replace(/</g,"&lt;").replace(/>/g,"&gt;")||'Gruppo';

    const sparkles = Array.from({ length:200 }).map(()=> {
        const x = Math.floor(Math.random()*1600);
        const y = Math.floor(Math.random()*900);
        const r = (Math.random()*3+0.5).toFixed(2);
        const o = (Math.random()*0.5+0.2).toFixed(2);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${o}"/>`;
    }).join('');

    const sparklesSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><g>${sparkles}</g></svg>`);

    const styles = `
        body { margin:0;width:1600px;height:900px;font-family:Poppins,sans-serif;display:flex;justify-content:center;align-items:center;background:#000;overflow:hidden; }
        .container { width:100%;height:100%;position:relative;display:flex;justify-content:center;align-items:center; }
        .background { position:absolute;width:100%;height:100%;background:url('${backgroundUrl}') center/cover;filter:blur(25px) brightness(0.7);z-index:0; }
        .sparkles { position:absolute;width:100%;height:100%;background-image:url("data:image/svg+xml,${sparklesSvg}");background-repeat:no-repeat;background-size:1600px 900px;mix-blend-mode:screen;opacity:0.6;z-index:1; }
        .card { position:relative;width:90%;height:85%;background:rgba(255,255,255,0.05);backdrop-filter:blur(20px) saturate(180%);border:1px solid rgba(255,255,255,0.12);border-radius:50px;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;padding:45px;z-index:2; }
        .pfp { width:500px;height:500px;border-radius:50%;border:10px solid #fff;box-shadow:0 0 50px rgba(255,255,255,0.7);object-fit:cover;margin-bottom:30px; }
        .title { font-size:120px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.5);margin-bottom:15px; }
        .username { font-size:80px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.5);margin-bottom:10px; }
        .group-name { font-size:60px;font-weight:700;color:#ccc;text-shadow:0 1px 2px rgba(0,0,0,0.5);text-align:center; }
    `;

    return React.createElement('html', { lang:'it' },
        React.createElement('head', null,
            React.createElement('meta',{ charSet:'utf-8' }),
            React.createElement('meta',{ name:'viewport', content:'width=1600,height=900' }),
            React.createElement('style',{ dangerouslySetInnerHTML:{ __html: styles } })
        ),
        React.createElement('body', null,
            React.createElement('div',{ className:'container' },
                React.createElement('div',{ className:'background' }),
                React.createElement('div',{ className:'sparkles' }),
                React.createElement('div',{ className:'card' },
                    React.createElement('img',{ src:pfpUrl, className:'pfp', alt:'PFP' }),
                    React.createElement('h1',{ className:'title' }, isGoodbye ? 'ADDIO 👋' : 'BENVENUTO 🎉'),
                    React.createElement('div',{ className:'username' }, safeUsername),
                    React.createElement('div',{ className:'group-name' }, safeGroupName)
                )
            )
        )
    );
}

async function createImage(htmlContent) {
    const ready = await initBrowser();
    if (!ready || !browser) throw new Error('Browser non disponibile');
    const page = await browser.newPage();
    try {
        await page.setViewport({ width:1600,height:900 });
        await page.setContent(htmlContent,{ waitUntil:'networkidle0' });
        return await page.screenshot({ type:'jpeg', quality:85 });
    } finally { await page.close().catch(()=>{}); }
}

await initPuppeteer();
await preloadDefaultAvatar();

let handler = m => m;

handler.before = async function(m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return false;
    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || (!chat.welcome && !chat.goodbye)) return false;

    const isAdd = m.messageStubType===WAMessageStubType.GROUP_PARTICIPANT_ADD;
    const isRemove = m.messageStubType===WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType===WAMessageStubType.GROUP_PARTICIPANT_LEAVE;
    if (!isAdd && !isRemove) return false;

    const who = m.messageStubParameters?.[0];
    if(!who) return false;
    const jid = conn.decodeJid(who);
    const username = `@${jid.split('@')[0]}`;
    const groupName = groupMetadata?.subject || 'Gruppo';

    const profilePic = await getUserProfilePic(conn,jid);
    const background = await getGroupBackgroundImage(m.chat,conn);
    const toBase64 = buffer => `data:image/jpeg;base64,${buffer.toString('base64')}`;

    const element = React.createElement(WelcomeCard,{
        backgroundUrl: toBase64(background),
        pfpUrl: toBase64(profilePic),
        isGoodbye:isRemove,
        username,
        groupName
    });

    const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;

    try {
        const image = await createImage(html);
        await conn.sendMessage(m.chat, {
            text: ' ',
            contextInfo: {
                externalAdReply: {
                    title: isRemove ? `Addio ${username}` : `Benvenuto ${username}`,
                    body: '',
                    previewType: 'PHOTO',
                    thumbnail: image,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch(err) {
        console.error('❌ Errore invio card con thumbnail:', err.message);
        await conn.sendMessage(m.chat, {
            text: isRemove ? `Addio ${username}` : `Benvenuto ${username}`,
            mentions: [jid]
        }, { quoted: m });
    }

    return true;
}

export default handler;