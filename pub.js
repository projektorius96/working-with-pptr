const process = require('node:process')
const {spawn, exec} = require('node:child_process')

// CONSTANTS
const SAVE_TO_FILE_PATHSPEC = "./console_log.txt";

// DEV_NOTES:
// spawnSync cannot be IPCed, otherwise error yield - "Error [ERR_IPC_SYNC_FORK] : IPC cannot be used with synchronous forks";
// use spawnAsync i.e. spawn instead :
const ch1 = spawn('node', ['./index.js'], {
    /* shell: true, *//* <= was a [CULPRIT] for : Error: EBADF: bad file descriptor, uv_pipe_open */
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'] /* : subprocess.stdin, .out, .err, ipc for messaging */
}).on('message', (m)=>{
    if (m) {
        /* console.log(`echo "${m}"`); */
        exec(`echo "${m}" >> ${SAVE_TO_FILE_PATHSPEC}`, (error, stdout, stderr) => {
            if (error) {
            console.error(`exec error: ${error}`);
            return;
            }
            console.log(`stdout: ${stdout}` + m);
            console.error(`stderr: ${stderr}`);
        });
    }
});

ch1.on('spawn', ()=>{
    // explicit check if proceess not equal child
    ch1.send('READY_ACCEPT_PUPPETEER')
    if (ch1.pid !== process.pid) console.log("child process spawned");
    if (ch1.channel != undefined) {
        console.log("IPC was established")
    }
})

ch1.stdin.on("data", (data)=>{
    console.log(`child_process.stdin:\n ${data}`);
})
ch1.stdout.on("data", (data)=>{
    console.log(`child_process.stdout:\n ${data}`);
})
ch1.stderr.on("data", (data)=>{
    console.log(`child_process.stderr:\n ${data}`);
})

/* --- */
ch1.on('close', (signalTxt) => {
    console.log(`child_process was terminated due to receipt of signal ${signalTxt}`);
});
/* --- */
// Send SIGKILL to process.
// ch1.kill('SIGKILL'); // # refer to 1^ lines below :
ch1.on("exit", ()=>{
    // ^EXPLANATION : @https://nodejs.org/api/child_process.html#event-disconnect
    /* ch1.disconnect() */// ^NOTE : Error [ERR_IPC_DISCONNECTED]: IPC channel is already disconnected
    console.log(`child_proccess with PID ${ch1.pid} was immediately killed? ` /* 1^ */, ch1.killed)
})

// Credits to Jacob Krall : @https://stackoverflow.com/questions/23622051/how-to-forcibly-keep-a-node-js-process-from-terminating
process.stdin.resume() // On hold parent_process from exiting : exit it with standard CTRL + C

// Listen for Ctrl + C, otherwise emulate Ctrl + C with the following : process.kill(process.pid, 'SIGINT')
process.on('SIGINT', ()=>{
    console.log("You just terminated parent process gracefully")
    process.kill(0) ; /* The "pid" argument must be of type number. Received undefined" */
})

