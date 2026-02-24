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

// 礦石交互邏輯
const ore = document.getElementById('main-ore');
let crackLevel = 0;

const crackLayer = document.createElement('div');
crackLayer.className = 'crack-overlay';
ore.appendChild(crackLayer);

for (let i = 1; i <= 3; i++) {
    const rune = document.createElement('div');
    rune.className = `rune-decal rune-face-${i}`;
    ore.appendChild(rune);
}

// ---------------------------------------------------------
// 手動調整工具邏輯
// ---------------------------------------------------------
const layerSelect = document.getElementById('layer-select');
const cssOutput = document.getElementById('css-value');
const gizmoPlane = document.getElementById('gizmo-plane');
const gizmoRoot = document.getElementById('gizmo-root');

const inputs = {
    left: document.getElementById('input-left'),
    top: document.getElementById('input-top'),
    size: document.getElementById('input-size'),
    rotate: document.getElementById('input-rotate'),
    rotX: document.getElementById('input-rotX'),
    rotY: document.getElementById('input-rotY'),
    skewX: document.getElementById('input-skewX'),
    u: document.getElementById('input-u'),
    v: document.getElementById('input-v'),
    zoom: document.getElementById('input-zoom')
};

function updateDecalStyle() {
    const layerClass = layerSelect.value;
    const target = layerClass === 'crack-overlay'
        ? ore.querySelector('.crack-overlay')
        : ore.querySelector(`.${layerClass}`);

    if (!target) return;

    const v = {
        left: inputs.left.value,
        top: inputs.top.value,
        size: inputs.size.value,
        rotate: inputs.rotate.value,
        rotX: inputs.rotX.value,
        rotY: inputs.rotY.value,
        skewX: inputs.skewX.value,
        u: inputs.u.value,
        v: inputs.v.value,
        zoom: inputs.zoom.value
    };

    target.style.left = `${v.left}%`;
    target.style.top = `${v.top}%`;
    target.style.width = `${v.size}%`;
    target.style.height = `${v.size}%`;

    target.style.backgroundPosition = `${v.u}% ${v.v}%`;
    target.style.backgroundSize = `${v.zoom}%`;

    // 【修正變形順序】先 3D 傾斜 (X/Y)，再做平面旋轉 (Z/Rotate)
    // 這樣 rotate(v.rotate) 才會是「沿著已傾斜平面的法線旋轉」
    const transform = `translate(-50%, -50%) rotateX(${v.rotX}deg) rotateY(${v.rotY}deg) rotate(${v.rotate}deg) skewX(${v.skewX}deg)`;
    target.style.transform = transform;

    // 同步更新 Gizmo 視覺
    gizmoRoot.style.left = `calc(50% + ${(v.left - 50)}px + 180px)`;
    gizmoRoot.style.top = `calc(50% + ${(v.top - 50)}px)`;

    // Gizmo 也要維持同樣的 Transform 順序
    gizmoPlane.style.transform = `rotateX(${v.rotX}deg) rotateY(${v.rotY}deg) rotateZ(${v.rotate}deg)`;

    const cssText = `top: ${v.top}%; left: ${v.left}%; width: ${v.size}%; height: ${v.size}%; background-position: ${v.u}% ${v.v}%; background-size: ${v.zoom}%; transform: ${transform};`;
    cssOutput.textContent = cssText;
}

// Gizmo 拖拽邏輯
let isDraggingGizmo = false;
let startX, startY;
let startRotX, startRotY, startRotate;

gizmoRoot.addEventListener('mousedown', (e) => {
    isDraggingGizmo = true;
    startX = e.clientX;
    startY = e.clientY;
    startRotX = parseInt(inputs.rotX.value);
    startRotY = parseInt(inputs.rotY.value);
    startRotate = parseInt(inputs.rotate.value);
});

window.addEventListener('mousemove', (e) => {
    if (!isDraggingGizmo) return;

    const deltaX = (e.clientX - startX) * 0.5;
    const deltaY = (startY - e.clientY) * 0.5;

    if (e.shiftKey) {
        inputs.rotate.value = startRotate + deltaX;
    } else {
        inputs.rotY.value = startRotY + deltaX;
        inputs.rotX.value = startRotX + deltaY;
    }

    updateDecalStyle();
});

window.addEventListener('mouseup', () => {
    isDraggingGizmo = false;
});

// 鍵盤控制邏輯
window.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 5 : 1;
    let changed = false;

    if (e.key === 'ArrowUp') {
        inputs.rotX.value = parseInt(inputs.rotX.value) + step;
        changed = true;
    } else if (e.key === 'ArrowDown') {
        inputs.rotX.value = parseInt(inputs.rotX.value) - step;
        changed = true;
    } else if (e.key === 'ArrowLeft') {
        if (e.ctrlKey || e.altKey) {
            inputs.rotate.value = parseInt(inputs.rotate.value) - step;
        } else {
            inputs.rotY.value = parseInt(inputs.rotY.value) - step;
        }
        changed = true;
    } else if (e.key === 'ArrowRight') {
        if (e.ctrlKey || e.altKey) {
            inputs.rotate.value = parseInt(inputs.rotate.value) + step;
        } else {
            inputs.rotY.value = parseInt(inputs.rotY.value) + step;
        }
        changed = true;
    }

    if (changed) {
        e.preventDefault();
        updateDecalStyle();
    }
});

// 監聽拉桿變動
Object.values(inputs).forEach(input => {
    input.addEventListener('input', updateDecalStyle);
});
layerSelect.addEventListener('change', updateDecalStyle);

// ---------------------------------------------------------
// 敲擊互動
// ---------------------------------------------------------
ore.addEventListener('click', (e) => {
    if (e.target.closest('.manual-controls') || e.target.closest('.gizmo-container')) return;

    crackLevel = Math.min(crackLevel + 0.1, 1);
    crackLayer.style.opacity = crackLevel;

    ore.classList.remove('hit');
    void ore.offsetWidth;
    ore.classList.add('hit');
});

console.log('吉卜力風格資產展示平台已啟動！變形順序已修正：先傾斜後旋轉。');
