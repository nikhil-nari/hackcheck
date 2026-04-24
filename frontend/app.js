document.addEventListener('DOMContentLoaded', () => {
    const detonateBtn = document.getElementById('detonate-btn');
    const urlInput = document.getElementById('target-url');
    const bytecodeStream = document.getElementById('bytecode-stream');
    const terminalOutput = document.getElementById('terminal-output');

    const opcodes = [
        'LdaGlobal [0]', 'Star r1', 'LdaNamedProperty r1, [1]', 'Star r0',
        'LdaSmi [10]', 'Star r2', 'CallProperty1 r0, r1, r2', 'LdaUndefined',
        'Return', 'JumpIfTrue [12]', 'StackCheck', 'CreateClosure [0]',
        'PushContext r1', 'LdaTheHole', 'ThrowReferenceError [2]', 'LdaConstant [5]'
    ];

    function log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        line.innerHTML = `
            <span class="timestamp">[${now}]</span>
            <span class="${type}">${message}</span>
        `;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function addBytecode(instruction) {
        const div = document.createElement('div');
        const addr = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
        div.innerHTML = `<span style="color: #606060; margin-right: 15px;">${addr}</span> ${instruction}`;
        if (Math.random() > 0.8) div.className = 'highlight';
        bytecodeStream.appendChild(div);
        bytecodeStream.scrollTop = bytecodeStream.scrollHeight;
        
        if (bytecodeStream.children.length > 100) {
            bytecodeStream.removeChild(bytecodeStream.firstChild);
        }
    }

    async function runDetonation() {
        const url = urlInput.value || 'https://example.com';
        detonateBtn.disabled = true;
        detonateBtn.innerText = 'DETONATING...';
        
        bytecodeStream.innerHTML = '';
        log(`Launching Detonation Chamber for: ${url}`, 'info');
        
        await new Promise(r => setTimeout(r, 800));
        log('Intercepting V8 Bytecode Firehose...', 'warn');
        
        let count = 0;
        const interval = setInterval(() => {
            const op = opcodes[Math.floor(Math.random() * opcodes.length)];
            addBytecode(op);
            count++;
            
            if (count % 10 === 0) {
                log(`Captured ${count * 50} instructions...`, 'info');
            }
            
            if (count > 50) {
                clearInterval(interval);
                log(`Detonation Complete. Captured ${count * 50} lines of bytecode.`, 'success');
                detonateBtn.disabled = false;
                detonateBtn.innerText = 'INITIATE DETONATION';
            }
        }, 100);
    }

    detonateBtn.addEventListener('click', runDetonation);

    // Enter key support
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runDetonation();
    });
});
