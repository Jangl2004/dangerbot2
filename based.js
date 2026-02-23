process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
import { ripristinaTimer } from './plugins/gp-configgruppo.js';

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getPerformanceConfig, setPerformanceConfig, Logger, makeInMemoryStore } = await import('@realvare/based');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let MethodMobile = process.argv.includes("mobile");
let phoneNumber = global.botNumberCode;

function redefineConsoleMethod(methodName, filterStrings) {
    const originalConsoleMethod = console[methodName];
    console[methodName] = function () {
        const message = arguments[0];
        if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
            arguments[0] = "";
        }
        originalConsoleMethod.apply(console, arguments);
    };
}

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new JSONFile('database.json') : new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

if (global.conns instanceof Array) {
    console.log('Connessioni già inizializzate...');
} else {
    global.conns = [];
}

global.creds = 'creds.json';
global.authFile = 'varesession';
global.authFileJB = 'varebot-sub';

setPerformanceConfig({
    performance: {
        enableCache: true,
        enableMetrics: true
    },
    debug: {
        enableLidLogging: true,
        logLevel: 'debug'
    }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
    const cyan1 = chalk.hex('#00BFFF');     // DeepSkyBlue
    const cyan2 = chalk.hex('#00CED1');     // DarkTurquoise
    const cyan3 = chalk.hex('#20B2AA');     // LightSeaGreen
    const green = chalk.hex('#2ECC71');     // Emerald
    const whiteSoft = chalk.hex('#ECF0F1'); // Soft white
    const redSoft = chalk.hex('#E74C3C');   // Soft red

    const a = cyan1('╭━━━━━━━━━━━━━• ACCESS PANEL •━━━━━━━━━━━━━');
    const b = cyan1('╰━━━━━━━━━━━━━• END SESSION •━━━━━━━━━━━━━');
    const linea = cyan2('   ────────┼┼────────┼────────┼┼────────');
    const sm = cyan3.bold('SELEZIONE MODALITÀ DI ACCESSO');

    const qr = cyan3(' ┌─⭓') + ' ' + chalk.bold.white('1. Login tramite QR');
    const codice = cyan3(' └─⭓') + ' ' + chalk.bold.white('2. Login con codice');

    const istruzioni = [
        cyan3(' ┌─⭓') + whiteSoft.italic(' Seleziona una modalità disponibile.'),
        cyan3(' └─⭓') + whiteSoft.italic(' Premi Invio per continuare.'),
        whiteSoft.italic(''),
        cyan1.italic('                access system • deadly'),
    ];

    const prompt = green.bold('\n⌯ selezione ➤ ');

    opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

    if (!/^[1-2]$/.test(opzione)) {
        console.log(`\n${redSoft.bold('✖ SELEZIONE NON VALIDA')}

${whiteSoft('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${redSoft.bold('⚠️ Sono ammessi solo i numeri')} ${chalk.bold.green('1')} ${redSoft.bold('o')} ${chalk.bold.green('2')}
${whiteSoft('┌─⭓ Nessuna lettera o simbolo')}
${whiteSoft('└─⭓ Copia il numero dell\'opzione desiderata e incollalo')}
${green.italic('\n✧ Suggerimento: Se hai dubbi, scrivi al creatore +393476686131')}
`);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const filterStrings = [
    "Q2xvc2luZyBzdGFsZSBvcGVu",
    "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
    "RmFpbGVkIHRvIGRlY3J5cHQ=",
    "U2Vzc2lvbiBlcnJvcg==",
    "RXJyb3I6IEJhZCBNQUM=",
    "RGVjcnlwdGVkIG1lc3NhZ2U="
];
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));
const groupMetadataCache = new NodeCache();
global.groupCache = groupMetadataCache;
const logger = pino({
    level: 'silent',
});
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });
const connectionOptions = {
    logger: logger,
    mobile: MethodMobile,
    browser: opzione === '1' ? Browsers.windows('Chrome') : methodCodeQR ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: (jid) => {
        if (!jid) return jid;
        const cached = global.jidCache.get(jid);
        if (cached) return cached;
        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (typeof decoded === 'object' && decoded.user && decoded.server) {
            decoded = `${decoded.user}@${decoded.server}`;
        }
        if (typeof decoded === 'string' && decoded.endsWith('@lid')) {
            decoded = decoded.replace('@lid', '@s.whatsapp.net');
        }
        global.jidCache.set(jid, decoded);
        return decoded;
    },
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    cachedGroupMetadata: async (jid) => {
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            const metadata = await global.conn.groupMetadata(global.conn.decodeJid(jid));
            global.groupCache.set(jid, metadata, { ttl: 300 });
            return metadata;
        } catch (err) {
            console.error('Errore nel recupero dei metadati del gruppo:', err);
            return {};
        }
    },
    getMessage: async (key) => {
        try {
            const jid = global.conn.decodeJid(key.remoteJid);
            const msg = await global.store.loadMessage(jid, key.id);
            return msg?.message || undefined;
        } catch (error) {
            console.error('Errore in getMessage:', error);
            return undefined;
        }
    },
    msgRetryCounterCache,
    msgRetryCounterMap,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    shouldIgnoreJid: jid => false,
};
global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);
if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.bold.bgMagentaBright(`Inserisci il numero di WhatsApp.\n${chalk.bold.yellowBright("Esempio: +393471234567")}\n${chalk.bold.magenta('━━► ')}`)));
                addNumber = phoneNumber.replace(/\D/g, '');
                if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'DTH3BOT3');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bold.white(chalk.bgMagenta('『 🔗 』– CODICE DI ABBINAMENTO:')), chalk.bold.white(chalk.white(codeBot)));
            }, 3000);
        }
    }
}
conn.isInit = false;
conn.well = false;
async function bysamakavare() {
    try {
        const mainChannelId = global.IdCanale?.[0] || '120363418582531215@newsletter';
        await global.conn.newsletterFollow(mainChannelId);
    } catch (error) {}
}
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp'] && (global.support || {}).find) {
            const tmp = [tmpdir(), 'tmp', "varebot-sub"];
            tmp.forEach(filename => spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete']));
        }
    }, 30 * 1000);
}
if (opts['server']) (await import('./server.js')).default(global.conn, PORT);
async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date;
    }
    if (global.db.data == null) loadDatabase();
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.bold.yellow(`\n 🪐 SCANSIONA IL CODICE QR - SCADE TRA 45 SECONDI 🪐`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
        global.qrGenerated = false;
        global.connectionMessagesPrinted = {};
        if (!global.isLogoPrinted) {
            const finchevedotuttoviolaviola = [
                '#3b0d95', '#3b0d90', '#3b0d85', '#3b0d80', '#3b0d75',
                '#3b0d70', '#3b0d65', '#3b0d60', '#3b0d55', '#3b0d50', '#3b0d45'
            ];
            const varebot = [
                ` ██▒   █▓ ▄▄▄       ██▀███  ▓█████  ▄▄▄▄    ▒█████  ▄▄▄█████▓   `,
                `▓██░   █▒▒████▄    ▓██ ▒ ██▒▓█   ▀ ▓█████▄ ▒██▒  ██▒▓  ██▒ ▓▒   `,
                ` ▓██  █▒░▒██  ▀█▄  ▓██ ░▄█ ▒▒███   ▒██▒ ▄██▒██░  ██▒▒ ▓██░ ▒░   `,
                `  ▒██ █░░░██▄▄▄▄██ ▒██▀▀█▄  ▒▓█  ▄ ▒██░█▀  ▒██   ██░░ ▓██▓ ░    `,
                `   ▒▀█░   ▓█   ▓██▒░██▓ ▒██▒░▒████▒░▓█  ▀█▓░ ████▓▒░  ▒██▒ ░    `,
                `   ░ ▐░   ▒▒   ▓▒█░░ ▒▓ ░▒▓░░░ ▒░ ░░▒▓███▀▒░ ▒░▒░▒░   ▒ ░░      `,
                `   ░ ░░    ▒   ▒▒ ░  ░▒ ░ ▒░ ░ ░  ░▒░▒   ░   ░ ▒ ▒░     ░       `,
                `     ░░    ░   ▒     ░░   ░    ░    ░    ░ ░ ░ ▒░    ░         `,
                `      ░        ░  ░   ░        ░  ░ ░          ░ ░              `,
                `     ░                                   ░                      `
            ];
            varebot.forEach((line, i) => {
                const color = finchevedotuttoviolaviola[i] || finchevedotuttoviolaviola[finchevedotuttoviolaviola.length - 1];
                console.log(chalk.hex(color)(line));
            });
            global.isLogoPrinted = true;
            await bysamakavare();
        }
        const perfConfig = getPerformanceConfig();
        Logger.info('Performance Config:', perfConfig);
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.badSession && !global.connectionMessagesPrinted.badSession) {
            console.log(chalk.bold.redBright(`\n⚠️❗ SESSIONE NON VALIDA, ELIMINA LA CARTELLA ${global.authFile} E SCANSIONA IL CODICE QR ⚠️`));
            global.connectionMessagesPrinted.badSession = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost && !global.connectionMessagesPrinted.connectionLost) {
            console.log(chalk.bold.blueBright(`\n╭⭑⭒━━━✦❘༻ ⚠️ CONNESSIONE PERSA COL SERVER ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO... \n╰⭑⭒━━━✦❘༻☾⋆₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
            global.connectionMessagesPrinted.connectionLost = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionReplaced && !global.connectionMessagesPrinted.connectionReplaced) {
            console.log(chalk.bold.yellowBright(`╭⭑⭒━━━✦❘༻ ⚠️ CONNESSIONE SOSTITUITA ༺❘✦━━━⭒⭑\n┃ È stata aperta un'altra sessione, \n┃ chiudi prima quella attuale.\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
            global.connectionMessagesPrinted.connectionReplaced = true;
        } else if (reason === DisconnectReason.loggedOut && !global.connectionMessagesPrinted.loggedOut) {
            console.log(chalk.bold.redBright(`\n⚠️ DISCONNESSO, CARTELLA ${global.authFile} ELIMINATA. RIAVVIA IL BOT E SCANSIONA IL CODICE QR ⚠️`));
            global.connectionMessagesPrinted.loggedOut = true;
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason === DisconnectReason.restartRequired && !global.connectionMessagesPrinted.restartRequired) {
            console.log(chalk.bold.magentaBright(`\n⭑⭒━━━✦❘༻ ✨ CONNESSIONE AL SERVER ༺❘✦━━━⭒⭑`));
            global.connectionMessagesPrinted.restartRequired = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.timedOut && !global.connectionMessagesPrinted.timedOut) {
            console.log(chalk.bold.yellowBright(`\n╭⭑⭒━━━✦❘༻ ⌛ TIMEOUT CONNESSIONE ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO...\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
            global.connectionMessagesPrinted.timedOut = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === 401) {
            console.log(chalk.bold.redBright(`\n⚠️❗ DISCONNESSIONE CON CODICE 401, CARTELLA ${global.authFile} ELIMINATA. RIAVVIA IL BOT E SCANSIONA IL CODICE QR ⚠️`));
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason !== DisconnectReason.restartRequired && reason !== DisconnectReason.connectionClosed && !global.connectionMessagesPrinted.unknown) {
            console.log(chalk.bold.redBright(`\n⚠️❗ MOTIVO DISCONNESSIONE SCONOSCIUTO: ${reason || 'Non trovato'} >> ${connection || 'Non trovato'}`));
            global.connectionMessagesPrinted.unknown = true;
        }
    }
}
process.on('uncaughtException', console.error);
async function connectSubBots() {
    const subBotDirectory = './varebot-sub';
    if (!existsSync(subBotDirectory)) {
        console.log(chalk.bold.magentaBright('🌙 vare ✧ bot non ha Sub-Bot collegati. Creazione directory...'));
        try {
            mkdirSync(subBotDirectory, { recursive: true });
            console.log(chalk.bold.green('✅ Directory varebot-sub creata con successo.'));
        } catch (err) {
            console.log(chalk.bold.red('❌ Errore nella creazione della directory varebot-sub:', err.message));
            return;
        }
        return;
    }
    try {
        const subBotFolders = readdirSync(subBotDirectory).filter(file =>
            statSync(join(subBotDirectory, file)).isDirectory()
        );
        if (subBotFolders.length === 0) {
            console.log(chalk.bold.magenta('- 🌑 | Nessun subbot collegato'));
            return;
        }
        const botPromises = subBotFolders.map(async (folder) => {
            const subAuthFile = join(subBotDirectory, folder);
            if (existsSync(join(subAuthFile, 'creds.json'))) {
                try {
                    const { state: subState, saveCreds: subSaveCreds } = await useMultiFileAuthState(subAuthFile);
                    const subConn = makeWASocket({
                        ...connectionOptions,
                        auth: {
                            creds: subState.creds,
                            keys: makeCacheableSignalKeyStore(subState.keys, logger),
                        },
                    });
                   
                    subConn.ev.on('creds.update', subSaveCreds);
                    subConn.ev.on('connection.update', connectionUpdate);
                    return subConn;
                } catch (err) {
                    console.log(chalk.bold.red(`❌ Errore nella connessione del Sub-Bot ${folder}:`, err.message));
                    return null;
                }
            }
            return null;
        });
        const bots = await Promise.all(botPromises);
        global.conns = bots.filter(Boolean);
        if (global.conns.length > 0) {
            console.log(chalk.bold.magentaBright(`🌙 ${global.conns.length} Sub-Bot si sono connessi con successo.`));
        } else {
            console.log(chalk.bold.yellow('⚠️ Nessun Sub-Bot è riuscito a connettersi.'));
        }
    } catch (err) {
        console.log(chalk.bold.red('❌ Errore generale nella connessione dei Sub-Bot:', err.message));
    }
}
(async () => {
    global.conns = [];
    try {
        conn.ev.on('connection.update', connectionUpdate);
        conn.ev.on('creds.update', saveCreds);
        console.log(chalk.bold.magenta(`⭑⭒━━━✦❘༻☾⋆⁺₊✧ varebot connesso correttamente ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
        await connectSubBots();
    } catch (error) {
        console.error(chalk.bold.bgRedBright(`🥀 Errore nell'avvio del bot: `, error));
    }
})();
let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) {
        console.error(e);
    }
    if (restatConn) {
        try {
            global.conn.ws.close();
        } catch { }
        conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        global.store.bind(global.conn.ev);
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
    }
    conn.handler = handler.handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds;
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    isInit = false;
    return true;
};
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(e);
            delete global.plugins[filename];
        }
    }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);
global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(chalk.green(`✅ AGGIORNATO - '${filename}' CON SUCCESSO`));
            else {
                conn.logger.warn(`🗑️ FILE ELIMINATO: '${filename}'`);
                return delete global.plugins[filename];
            }
        } else conn.logger.info(`🆕 NUOVO PLUGIN RILEVATO: '${filename}'`);
        
        try {
            const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(`⚠️ ERRORE NEL PLUGIN: '${filename}\n${format(e)}'`);
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
    }
};
Object.freeze(global.reload);
const pluginWatcher = watch(pluginFolder, global.reload);
pluginWatcher.setMaxListeners(20);
await global.reloadHandler();
async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version']),
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => {
                p.on('close', (code) => {
                    resolve(code !== 127);
                });
            }),
            new Promise((resolve) => {
                p.on('error', (_) => resolve(false));
            })
        ]);
    }));
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);
}
function clearDirectory(dirPath) {
    if (!existsSync(dirPath)) {
        try {
            mkdirSync(dirPath, { recursive: true });
        } catch (e) {
            console.error(chalk.red(`Errore nella creazione della directory ${dirPath}:`, e));
        }
        return;
    }
    const filenames = readdirSync(dirPath);
    filenames.forEach(file => {
        const filePath = join(dirPath, file);
        try {
            const stats = statSync(filePath);
            if (stats.isFile()) {
                unlinkSync(filePath);
            } else if (stats.isDirectory()) {
                rmSync(filePath, { recursive: true, force: true });
            }
        } catch (e) {
            console.error(chalk.red(`Errore nella pulizia del file ${filePath}:`, e));
        }
    });
}
function purgeSession(sessionDir, cleanPreKeys = false) {
    try {
        if (!existsSync(sessionDir)) {
            console.log(chalk.bold.yellow(`\n╭⭑⭒━━━✦❘༻ 🟡 DIRECTORY 🟡 ༺❘✦━━━⭒⭑\n┃  ⚠️  La directory di sessione ${sessionDir} non esiste.\n╰⭑⭒━━━✦❘༻☾⋆₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
            return;
        }
        const files = readdirSync(sessionDir);
        let deletedCount = 0;
        let preKeyDeletedCount = 0;
        files.forEach(file => {
            const filePath = path.join(sessionDir, file);
            const stats = statSync(filePath);
            const fileAge = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
            
            if (file === 'creds.json') {
                return;
            }
            
            if (file.startsWith('pre-key') && cleanPreKeys) {
                if (fileAge > 1) {  // cancella pre-key solo se hanno più di 1 giorno e non sono state modificate di recente (per non riempire la memoria yk)
                    try {
                        unlinkSync(filePath);
                        preKeyDeletedCount++;
                        deletedCount++;
                    } catch (err) {
                        console.log(chalk.bold.red(`\n╭⭑⭒━━━✦❘༻ 🔴 ERRORE PRE-KEY 🔴 ༺❘✦━━━⭒⭑\n┃  ❌ ${file} NON È STATO ELIMINATO\n┃  Errore: ${err.message}\n╰⭑⭒━━━✦❘༻☾⋆₊🗑️ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ❌₊⁺⋆☽༺❘✦━━━⭒⭑`));
                    }
                }
            } else if (!file.startsWith('pre-key')) {
                try {
                    if (stats.isDirectory()) {
                        rmSync(filePath, { recursive: true, force: true });
                    } else {
                        unlinkSync(filePath);
                    }
                    deletedCount++;
                } catch (err) {
                    console.log(chalk.bold.red(`\n╭⭑⭒━━━✦❘༻ 🔴 ERRORE FILE 🔴 ༺❘✦━━━⭒⭑\n┃  ❌ ${file} NON È STATO ELIMINATO\n┃  Errore: ${err.message}\n╰⭑⭒━━━✦❘༻☾⋆₊🗑️ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ❌₊⁺⋆☽༺❘✦━━━⭒⭑`));
                }
            }
        });

        let message = chalk.bold.magentaBright(`\n╭⭑⭒━━━✦❘༻ 🟣 SESSIONE 🟣 ༺❘✦━━━⭒⭑\n┃  ✅ ${deletedCount} file di sessione eliminati da ${sessionDir}`);
        if (preKeyDeletedCount > 0) {
            message += `\n┃  🔑 ${preKeyDeletedCount} pre-key vecchie (>7 giorni) rimosse`;
        }
        message += `\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🗑️ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ♻️₊⁺⋆☽༺❘✦━━━⭒⭑`;
        
        if (deletedCount > 0) {
            console.log(message);
        } else {
            console.log(chalk.bold.yellowBright(`\n╭⭑⭒━━━✦❘༻ 🟡 SESSIONE 🟡 ༺❘✦━━━⭒⭑\n┃  ℹ️  Nessun file da eliminare in ${sessionDir}.\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
        }

    } catch (dirErr) {
        console.log(chalk.bold.red(`\n╭⭑⭒━━━✦❘༻ 🔴 ERRORE DIRECTORY 🔴 ༺❘✦━━━⭒⭑\n┃  ❌ Errore durante la lettura della directory ${sessionDir}\n┃  Errore: ${dirErr.message}\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🗑️ 𝓿𝓪𝓻𝓮𝓱𝓸𝓽 ❌₊⁺⋆☽༺❘✦━━━⭒⭑`));
    }
};
setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return;
    clearDirectory(join(__dirname, 'tmp'));
    clearDirectory(join(__dirname, 'temp'));
    console.log(chalk.bold.greenBright(`\n╭⭑⭒━━━✦❘༻ 🟢 PULIZIA MULTIMEDIA 🟢 ༺❘✦━━━⭒⭑\n┃          CARTELLE TMP/TEMP\n┃          ELIMINATE CON SUCCESSO\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🗑️ 𝓿𝓪𝓻𝓮𝓱𝓸𝓽 ♻️₊⁺⋆☽༺❘✦━━━⭒⭑`));
}, 1000 * 60 * 60);
setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return;
    purgeSession(`./${global.authFile}`);
    const subBotDir = `./${global.authFileJB}`;
    if (existsSync(subBotDir)) {
         const subBotFolders = readdirSync(subBotDir).filter(file => statSync(join(subBotDir, file)).isDirectory());
         subBotFolders.forEach(folder => purgeSession(join(subBotDir, folder)));
    }
}, 1000 * 60 * 60 * 2);
setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return;
    console.log(chalk.bold.cyanBright(`\n╭⭑⭒━━━✦❘༻ 🔵 PULIZIA PRE-KEY 🔵 ༺❘✦━━━⭒⭑\n┃  🔄 Avvio pulizia pre-keys vecchie\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🧹 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ♻️₊⁺⋆☽༺❘✦━━━⭒⭑`));
    purgeSession(`./${global.authFile}`, true);
    const subBotDir = `./${global.authFileJB}`;
    if (existsSync(subBotDir)) {
         const subBotFolders = readdirSync(subBotDir).filter(file => statSync(join(subBotDir, file)).isDirectory());
         subBotFolders.forEach(folder => purgeSession(join(subBotDir, folder), true));
    }
}, 1000 * 60 * 60 * 6);
_quickTest().then(() => conn.logger.info(chalk.bold.magentaBright(``)));
let filePath = fileURLToPath(import.meta.url);
const mainWatcher = watch(filePath, async () => {
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'based.js' Aggiornato")))
  await global.reloadHandler(true).catch(console.error);
});
mainWatcher.setMaxListeners(20);
conn.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
        ripristinaTimer(conn);
    }
});
