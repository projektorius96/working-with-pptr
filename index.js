const puppeteer_core = require('puppeteer-core');
const process = require('node:process');

process.on('message', (m)=>{
        (async () => {
            // NOTE: In Windows executablePath must be escaped with extra backward slash e.g.:
            //    executablePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
            const executablePath = "PATHSPEC_TO_BROWSER-EXE";
            const browser = await puppeteer_core.launch({
                executablePath,
                headless: false, /* <= DEFAULT : TRUE */
                devtools: true,
            });
            const page = await browser.newPage();
            page.on('console', async (msg) => {
                /* === sub.js */
                // // LOGIC_1:
                //     if (msg.text() != m) process.kill(0)
                //     process.send(`YES_${msg.text()}`)
                // // LOGIC_2:
                        process.send(`${msg.text()}`)
                /* === sub.js */
            })
            // await browser.close(); // # waits until user explicitly closes user-agent (browser's) window
        })()
})

