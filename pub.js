const process = require('node:process')
const {spawn, exec} = require('node:child_process')

console.log("pub --process.pid", process.pid);

// DEV_NOTES:
// # spawnSync cannot be IPCed, otherwise error yield - "Error [ERR_IPC_SYNC_FORK] : IPC cannot be used with synchronous forks";
// # use spawnAsync i.e. spawn instead :
const child_process = spawn(process.argv0 /* === "node" */ , ['./sub.mjs'], {
    /* shell: true, *//* <= was a [CULPRIT] for : Error: EBADF: bad file descriptor, uv_pipe_open */
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'] /* : subprocess.stdin, .out, .err, ipc for messaging */
}).on('message', (m)=>{
    if (m === "FEEDBACK_FROM_SUB") {
        console.log(`pub/sub communication pair was succcessful => child_process (sub.js) message was: ${m}`)
    }
});

child_process.on('spawn', ()=>{
    // do explicit check if parent_process (aka process) is not equal child_process
    if (child_process.pid !== process.pid) {
        console.log("child_process was spawned");
    }
    if (child_process.channel != undefined) {
        console.log("IPC was established...")
        // DEV_NOTE: leave the line below commented out if you want to handle child_process.kill('SIGKILL') lines below
        /*toThe*/child_process.send({parent_process_pid: process.pid, pubFile: __filename, child_process_pid: child_process.pid, codename: "CODE_NAME_XYZ"})
    }
})

// /* --- [OPTIONAL] --- child_process stream handling : */
child_process.stdin.on("data", (data)=>{
    console.log(`child_process.stdin: ${data}`);
})
child_process.stdout.on("data", (data)=>{
    console.log(`child_process.stdout: ${data}`);
})
child_process.stderr.on("data", (data)=>{
    console.log(`child_process.stderr: ${data}`);
})

/* --- [OPTIONAL] --- */
child_process.on('close', (signalTxt) => {
    console.log(`child_process was terminated due to receipt of signal ${signalTxt}`);
});
/* --- */
/* child_process.kill('SIGKILL'); */ // # [CULPRIT] refer to 1^ lines below :
child_process.on("exit", ()=>{
    // READ_ABOUT: @https://nodejs.org/api/child_process.html#event-disconnect
    /* child_process.disconnect() */// ^NOTE : Error [ERR_IPC_DISCONNECTED]: IPC channel is already disconnected
    console.log(`child_proccess with PID ${child_process.pid} was immediately killed? ` /* 1^ */, child_process.killed)
})
/* --- */
// Credits to Jacob Krall : @https://stackoverflow.com/questions/23622051/how-to-forcibly-keep-a-node-js-process-from-terminating
process.stdin.resume() // On hold parent_process from exiting , otherwise exit it with standard CTRL + C
/* --- */
// Listen for Ctrl + C, otherwise emulate Ctrl + C with the following : process.kill(process.pid, 'SIGINT')
process.on('SIGINT', ()=>{
    console.log("Parent process was gracefully terminated.")
    process.kill(process.pid, 'SIGINT'); // or in this case equally as /* process.exit(); */
})

