document.addEventListener('mousemove', (e) => {
    const layers = document.querySelectorAll('.layer');
    const x = (window.innerWidth / 2 - e.pageX) / 25;
    const y = (window.innerHeight / 2 - e.pageY) / 25;

    layers.forEach(layer => {
        const speed = layer.getAttribute('data-speed');
        if (speed) {
            const movementX = x * speed;
            const movementY = y * speed;
            layer.style.transform = `translateX(${movementX}px) translateY(${movementY}px)`;
        }
    });
});

// 礦石交互與資產引用
const ore = document.getElementById('main-ore');
const brokenOre = document.getElementById('broken-ore');
const maskCanvas = document.getElementById('mask-canvas');
const ctx = maskCanvas.getContext('2d');
const pointListEl = document.getElementById('point-list');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let maskPoints = [];
let isMaskingLocked = false;

// ---------------------------------------------------------
// 直接測試模式：預載 V4 淺層預設座標
// ---------------------------------------------------------
const testPoints = [
    { "x": 10, "y": -86 },
    { "x": 4, "y": -49 },
    { "x": 39, "y": -5 },
    { "x": 66, "y": -4 },
    { "x": 87, "y": -43 },
    { "x": 41, "y": -88 },
    { "x": 12, "y": -88 }
];

function applyDirectTest() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const oreSize = 300;

    const polygonString = testPoints.map(p => {
        const relX = (p.x + (oreSize / 2)) / oreSize * 100;
        const relY = (p.y + (oreSize / 2)) / oreSize * 100;
        return `${relX.toFixed(2)}% ${relY.toFixed(2)}%`;
    }).join(', ');

    brokenOre.style.clipPath = `polygon(${polygonString})`;
    brokenOre.style.opacity = '1';
    console.log('直接測試 V4：已套用淺層破碎預設點。');
}

// ---------------------------------------------------------
// 分頁切換與顯示邏輯
// ---------------------------------------------------------
function switchTab(tabId) {
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `${tabId}-tab`));

    if (tabId === 'mask') {
        maskCanvas.classList.add('active');
        resizeCanvas();
        brokenOre.style.opacity = '0';
        ore.style.clipPath = 'none';
    } else {
        maskCanvas.classList.remove('active');
    }
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ---------------------------------------------------------
// 圈選與繪製邏輯
// ---------------------------------------------------------
function resizeCanvas() {
    maskCanvas.width = window.innerWidth;
    maskCanvas.height = window.innerHeight;
    drawMask();
}

function drawMask() {
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    if (maskPoints.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(maskPoints[0].x, maskPoints[0].y);
    for (let i = 1; i < maskPoints.length; i++) {
        ctx.lineTo(maskPoints[i].x, maskPoints[i].y);
    }
    ctx.strokeStyle = isMaskingLocked ? '#ffd700' : '#00ffff';
    ctx.lineWidth = 2;
    if (maskPoints.length > 2) ctx.closePath();
    ctx.stroke();

    maskPoints.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#ff0000' : (isMaskingLocked ? '#ffd700' : '#00ffff');
        ctx.beginPath();
        ctx.arc(p.x, p.y, isMaskingLocked ? 3 : 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

maskCanvas.addEventListener('mousedown', (e) => {
    if (!maskCanvas.classList.contains('active') || isMaskingLocked) return;
    if (e.button === 2) {
        if (maskPoints.length > 2) {
            isMaskingLocked = true;
            drawMask();
        }
        return;
    }
    const rect = maskCanvas.getBoundingClientRect();
    maskPoints.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    updatePointList();
    drawMask();
});

maskCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

function updatePointList() {
    pointListEl.innerHTML = '';
    maskPoints.forEach((p, i) => {
        const li = document.createElement('li');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        li.textContent = `P${i}: [${Math.round(p.x - centerX)}, ${Math.round(p.y - centerY)}]`;
        pointListEl.appendChild(li);
    });
}

function applyBreakEffect() {
    if (maskPoints.length < 3) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const oreSize = 300;
    const polygonString = maskPoints.map(p => {
        const relX = (p.x - centerX + (oreSize / 2)) / oreSize * 100;
        const relY = (p.y - centerY + (oreSize / 2)) / oreSize * 100;
        return `${relX.toFixed(2)}% ${relY.toFixed(2)}%`;
    }).join(', ');
    brokenOre.style.clipPath = `polygon(${polygonString})`;
    brokenOre.style.opacity = '1';
    const container = document.querySelector('.parallax-container');
    container.classList.add('hit');
    setTimeout(() => container.classList.remove('hit'), 200);
}

document.getElementById('btn-clear-mask').addEventListener('click', () => {
    maskPoints = [];
    isMaskingLocked = false;
    brokenOre.style.opacity = '0';
    brokenOre.style.clipPath = 'none';
    drawMask();
});

document.getElementById('btn-apply-mask').addEventListener('click', applyBreakEffect);

document.getElementById('btn-export-mask').addEventListener('click', () => {
    if (maskPoints.length < 3) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const normalizedPoints = maskPoints.map(p => ({ x: Math.round(p.x - centerX), y: Math.round(p.y - centerY) }));
    navigator.clipboard.writeText(JSON.stringify(normalizedPoints)).then(() => console.log('座標已導出至剪貼簿。'));
});

const serviceLogs = document.getElementById('service-logs');

function printLog(msg, type = 'info') {
    if (!serviceLogs) return;
    const line = document.createElement('div');
    line.style.marginBottom = '2px';
    line.style.whiteSpace = 'pre-wrap'; // 支援換行顯示
    const time = new Date().toLocaleTimeString();
    let color = '#d4d4d4';
    if (type === 'req') color = '#ce9178';
    if (type === 'res') color = '#4ec9b0';
    if (type === 'err') color = '#f44747';
    if (type === 'stdout') color = '#808080';

    line.innerHTML = `<span style="color: #569cd6">[${time}]</span> <span style="color: ${color}">${msg}</span>`;
    serviceLogs.appendChild(line);
    document.getElementById('log-container').scrollTop = document.getElementById('log-container').scrollHeight;
}

// ---------------------------------------------------------
// Antigravity CLI 一鍵生成橋接
// ---------------------------------------------------------
async function performAIGeneration() {
    if (maskPoints.length < 3) {
        printLog('請先圈選區域！', 'err');
        return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const points = maskPoints.map(p => ({ x: Math.round(p.x - centerX), y: Math.round(p.y - centerY) }));

    const genBtn = document.getElementById('btn-ai-gen');
    const regenBtn = document.getElementById('btn-regenerate');

    genBtn.disabled = true;
    regenBtn.disabled = true;
    const originalGenText = genBtn.textContent;
    genBtn.textContent = '傳送指令中...';

    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressStatus = document.getElementById('progress-status');
    const progressPercent = document.getElementById('progress-percent');

    function updateProgress(percent, status) {
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        if (status) progressStatus.textContent = status;
    }

    try {
        console.log('正在發送指令至 /api/antigravity/run...', points);
        progressContainer.style.display = 'block';
        updateProgress(5, '正在傳送座標資訊...');
        printLog(`[REQUEST] action: generate_broken_face, points: ${points.length}`, 'req');

        // 模擬前期進度 (前端反應)
        let simulatedProgress = 5;
        const progressInterval = setInterval(() => {
            if (simulatedProgress < 90) {
                simulatedProgress += Math.floor(Math.random() * 3) + 1;
                let status = '正在執行 AI 生成中...';
                if (simulatedProgress > 30) status = 'Vertex AI 處理中...';
                if (simulatedProgress > 60) status = '套用遮罩中...';
                updateProgress(simulatedProgress, status);
            }
        }, 1000);

        const payload = {
            action: 'generate_broken_face',
            points: points,
            base_image: 'assets/output/crystal_ore_8faces_clean.png' // 傳送原始礦石作為底圖
        };

        printLog(`[PAYLOAD] ${JSON.stringify(payload)}`, 'req');

        const response = await fetch('/api/antigravity/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        clearInterval(progressInterval);

        const result = await response.json();

        if (!response.ok) {
            printLog(`[ERROR] ${result.message}`, 'err');
            if (result.stdout) {
                printLog(`[STDOUT ON ERROR]`, 'stdout');
                result.stdout.split('\n').forEach(l => { if (l.trim()) printLog(` > ${l}`, 'stdout') });
            }
            if (result.stderr) {
                printLog(`[STDERR ON ERROR]`, 'err');
                result.stderr.split('\n').forEach(l => { if (l.trim()) printLog(` ! ${l}`, 'err') });
            }
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        printLog(`[RESPONSE] ${result.message}`, 'res');
        if (result.stdout) {
            const lines = result.stdout.split('\n');
            lines.forEach(l => { if (l.trim()) printLog(` > ${l}`, 'stdout') });
        }

        updateProgress(100, '產出完成！正在套用資產...');
        console.log('資產生成成功:', result);

        // 更新預覽圖
        const previewImg = document.getElementById('automated-preview-img');
        if (previewImg && result.outputPath) {
            // 加入 timestamp 避免快取
            previewImg.src = `${result.outputPath}?t=${Date.now()}`;
        }

        // 使用新的圖層管理系統添加圖層
        addLayer(result.outputPath);

        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 500);

    } catch (err) {
        console.error('自動化生成失敗:', err);
        progressContainer.style.display = 'none';
        printLog(`自動化服務失敗: ${err.message}`, 'err');
    } finally {
        genBtn.disabled = false;
        regenBtn.disabled = false;
        genBtn.textContent = originalGenText;
    }
}

document.getElementById('btn-ai-gen').addEventListener('click', performAIGeneration);
document.getElementById('btn-regenerate').addEventListener('click', performAIGeneration);

// --- 圖層管理系統實作 ---

const layerList = [];
const layerContainer = document.querySelector('.parallax-container');
const layerListUI = document.getElementById('layer-list');
const layerCountUI = document.getElementById('layer-count');

// 初始化：加入現有的預設資產
window.addEventListener('load', () => {
    // 預設資產列表
    const initialAssets = [
        { path: 'assets/output/broken_face_gem_v4.png', name: '預設破碎面 (Legacy)', isExisting: true, elId: 'broken-ore' },
        { path: 'assets/output/crack_overlay_1_clean.png', name: '預設裂縫疊加 (Legacy)', isExisting: true, elId: 'crack-overlay' }
    ];

    initialAssets.forEach(asset => {
        addLayer(asset.path, asset.name, asset.elId);
    });
});

function addLayer(path, customName = null, existingElId = null) {
    const id = existingElId || `layer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const name = customName || path.split('/').pop();
    const layerObj = { id, path, visible: true };
    layerList.push(layerObj);

    // 1. 在礦石區域建立或使用實際的圖層元素
    let layerEl = existingElId ? document.getElementById(existingElId) : null;

    if (!layerEl) {
        layerEl = document.createElement('div');
        layerEl.id = id;
        layerEl.className = 'layer-ore broken-layer';
        layerEl.style.backgroundImage = `url('${path}')`;
        layerEl.style.opacity = '1';
        layerEl.style.display = 'block';

        // 預設應用目前正在編輯的 clip-path (如果有)
        const currentClip = document.getElementById('broken-ore').style.clipPath;
        if (currentClip) layerEl.style.clipPath = currentClip;

        layerContainer.appendChild(layerEl);
    } else {
        // 如果是現有元素，我們確保它符合管理器的樣式邏輯
        layerEl.style.display = 'block';
    }

    // 2. 在底部 UI 列表建立控制項
    const itemEl = document.createElement('div');
    itemEl.className = 'layer-item';
    itemEl.id = `ui-${id}`;
    itemEl.innerHTML = `
        <div class="layer-thumb">
            <img src="${path}" alt="Layer">
        </div>
        <div class="layer-info">
            <div class="layer-name" title="${name}">${name}</div>
        </div>
        <div class="layer-actions">
            <button class="toggle-vis active" onclick="window.toggleLayerVisibility('${id}')">顯示</button>
            <button class="btn-delete" ${existingElId ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''} onclick="window.deleteLayer('${id}')">刪除</button>
        </div>
    `;
    layerListUI.appendChild(itemEl);

    // 更新計數器
    layerCountUI.textContent = layerList.length;
}

window.toggleLayerVisibility = (id) => {
    const layerEl = document.getElementById(id);
    const uiBtn = document.querySelector(`#ui-${id} .toggle-vis`);
    const uiItem = document.getElementById(`ui-${id}`);

    if (layerEl.style.display === 'none') {
        layerEl.style.display = 'block';
        uiBtn.textContent = '顯示';
        uiBtn.classList.add('active');
        uiItem.classList.remove('hidden');
    } else {
        layerEl.style.display = 'none';
        uiBtn.textContent = '隱藏';
        uiBtn.classList.remove('active');
        uiItem.classList.add('hidden');
    }
};

window.deleteLayer = (id) => {
    if (!confirm('確定要刪除此圖層嗎？')) return;

    // 移除 DOM 元素
    const layerEl = document.getElementById(id);
    const uiItem = document.getElementById(`ui-${id}`);
    layerEl.remove();
    uiItem.remove();

    // 更新數據列表
    const idx = layerList.findIndex(l => l.id === id);
    if (idx > -1) layerList.splice(idx, 1);

    layerCountUI.textContent = layerList.length;
};

document.getElementById('btn-send-ide').addEventListener('click', async () => {
    const input = document.getElementById('ide-msg-input');
    const msg = input.value.trim();
    if (!msg) return;

    const btn = document.getElementById('btn-send-ide');
    btn.disabled = true;

    try {
        await fetch('/api/antigravity/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'message', text: msg })
        });
        input.value = '';
        console.log('訊息已成功傳送至 IDE。');
    } catch (err) {
        console.error('傳送訊息失敗:', err);
    } finally {
        btn.disabled = false;
    }
});

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => setTimeout(applyDirectTest, 500));

ore.addEventListener('click', () => console.log('互動已禁用'));
