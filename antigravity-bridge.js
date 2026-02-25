import http from 'http';
import { exec } from 'child_process';

const PORT = 5176;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.url === '/api/antigravity/run' && req.method === 'POST') {
        console.log('\n!!! [ANTIGRAVITY_BRIDGE] RECEIVED REQUEST !!!');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('\n>>> [ANTIGRAVITY_SIGNAL] 接收到來自網頁的指令:');
                console.log(JSON.stringify(data, null, 2));

                if (data.action === 'message') {
                    console.log(`\n💬 [USER_MESSAGE] 從網頁傳來的訊息: "${data.text}"`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success', message: 'Message logged in IDE' }));
                } else if (data.action === 'generate_broken_face' && data.points) {
                    // Windows CMD 需要對 JSON 字串中的雙引號進行轉義
                    const pointsStr = JSON.stringify(data.points).replace(/"/g, '\\"');
                    const timestamp = Date.now();
                    const outputPath = `assets/output/broken_face_${timestamp}.png`;
                    const baseImage = data.base_image || 'assets/output/crystal_ore_8faces_clean.png';
                    const cmd = `python generate_broken_face.py --project game-485606 --points "${pointsStr}" --output ${outputPath} --base_image ${baseImage} --style_ref assets/output/crystal_ore_8faces_clean.png --prompt "exposed magical gemstone, shallow break, ghibli style"`;

                    console.log(`\n>>> [ANTIGRAVITY_EXEC] 正在自動執行資產生成: ${cmd}`);
                    printLog(`[EXEC] ${cmd}`, 'req'); // 雖然 printLog 是前端函數，這裡我們在 res 中回傳更好

                    exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
                        console.log(`stdout: ${stdout}`);
                        if (stderr) console.error(`stderr: ${stderr}`);

                        if (error) {
                            console.error(`執行錯誤: ${error}`);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                status: 'error',
                                message: error.message,
                                stdout: stdout,
                                stderr: stderr
                            }));
                            return;
                        }

                        console.log(`\n✅ [ANTIGRAVITY_SUCCESS] 資產已自動生成至 ${outputPath}`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            status: 'success',
                            message: 'Asset generated successfully via Automated Service',
                            outputPath: outputPath,
                            stdout: stdout,
                            stderr: stderr
                        }));
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success', message: 'Action received' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
        });
        return;
    }

    res.statusCode = 404;
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n>>> [ANTIGRAVITY_BRIDGE] Standalone server listening on port ${PORT}`);
});
