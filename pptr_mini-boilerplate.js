const puppeteer_core = require('puppeteer-core');

(async () => {
    /* console.log(puppeteer_core) */// [PASSED]
    let outputHandle;
    const browser = await puppeteer_core.launch({
        executablePath: "PATHSPEC_TO_BROWSER-EXE",
        headless: false, /* <= DEFAULT : TRUE */
        devtools: true,
    });
    const page = await browser.newPage();
    page.on('console', async (msg) => {
        console.log("_>", outputHandle = msg.text())
        if (outputHandle === "JSHandle@" + ("object" || "array" || "function") ) console.log("use page.evaluateHandle(<JSHandle>)");
    })
    // await browser.close(); // # waits until user explicitly closes user-agent (browser's) window
})()

