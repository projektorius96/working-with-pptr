const puppeteer_core = require('puppeteer-core');
const process = require('node:process');
const {exec} = require('node:child_process');

process.on('message', ({pubPID, pubFile})=>{
        (async () => {
            console.log(pubPID);
            // NOTE: In Windows executablePath must be escaped with extra backward slash e.g.:
            //    executablePath = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
            //    executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
            //    executablePath = "etc."
            const executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"/* "PATHSPEC_TO_BROWSER-EXE" */;
            const browser = await puppeteer_core.launch({
                executablePath,
                headless: false, /* <= DEFAULT : TRUE */
                devtools: true,
                /* userDataDir: "./local-user-data/" */
            });
            const page = await browser.newPage();
            const pages = await browser.pages();
            if (pages) {
                await pages[0].close() // # makes sure only .newPage() i.e. single tab per session opened 
            } 
            /* page.on('close', ()=>process.kill(pubPID)) */
            page.on(/*re*/'load', ()=>{
                page.close() && exec('node ./pub.js')
            })
            page.evaluate(()=>{
                window.log = console.log; // shorter logger e.g. log(message)
            })
            page.on('console', async (msg) => {
                /* === sub.js */
                // // LOGIC_1:
                //     if (msg.text() != m) process.kill(0)
                //     process.send(`YES_${msg.text()}`)
                // // LOGIC_2:
                        process.send(`${msg.text()}`)
                /* === sub.js */
            })
            /* await browser.close(); */ // # waits until user explicitly closes user-agent (browser's) window
        })()
})

