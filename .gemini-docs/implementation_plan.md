# 遊戲資產工作流：從概念到遊戲實裝

本計畫將建立一個 Web 應用程式，展示利用 AI (FLUX/Imagen) 生成並整合到遊戲中的完整流程。

## 視覺風格定義
我們將採用 **「精緻吉卜力手繪風格 (Ghibli-inspired Hand-drawn Style)」**。
此風格具有溫暖的色彩、細膩的筆觸以及豐富的環境細節，適合展示風格一致性 (Style Anchoring) 與視差效果。

## 核心功能與實作步驟

### 0. Style Reference Guidance (風格參考引導)
- **原理**：不進行模型微調，而是利用 Imagen 3 的「風格參考 (Style Reference)」功能。
- **步驟 1**：從 17 張基準圖中挑選一張最符合目標視覺的圖片（例如 `training_1_meadow.png`）。
- **步驟 2**：在生成新物件時，將此圖作為 `StyleReferenceConfig` 傳入，確保新生成的資產繼承其色彩、光影與筆觸。
- **優勢**：即時生成，無需等待訓練，且風格一致性極高。

### 1. Style Anchoring (風格定型)
- 使用 `generate_image` 工具生成一組具備一致視覺特徵的資產。
- **目標資產**：
    - `treasure_chest.png`: 木質與金邊的寶箱。
    - `ancient_tree.png`: 繁茂的古老大樹。
    - `ui_button.png`: 石質雕刻風格的按鈕。

### 2. Segmentation & Cleanup (物件拆解與清理)
- 在提示詞中加入 "isolated on white background" 或 "clear background" 以利去背。
- 使用 CSS `mask-image` 或 Canvas 處理邊緣（若有必要）。
- 在 Web App 中展示去背後的 Sprite。

### 3. Environment & Parallax (環境與視差背景)
- **無縫貼圖**：生成 `grass_texture.png` 並利用 CSS `background-repeat` 實現地面。
- **視差背景**：
    - `bg_layer_1_sky.png`: 遠景雲朵天空。
    - `bg_layer_2_hills.png`: 中景遠山。
    - `bg_layer_3_forest.png`: 近景剪影森林。
- 使用 JavaScript 監聽捲動或滑鼠移動，實作視差滾動 (Parallax Scrolling)。

## 技術棧
- **Frontend**: Vite + Vanilla JavaScript (為了簡潔與效能)。
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, Animations)。
- **Assets**: 由 AI 生成的 PNG 檔案。

## 驗證計畫
### 自動化檢查
- 檢查圖片資源是否成功載入。
- 驗證 CSS 的無縫貼圖是否產生明顯接縫。

### 認人驗證
- 確認背景層級移動速度是否符合深度感 (Depth Perception)。
- 確認所有物件風格是否統一且邊緣清晰。
