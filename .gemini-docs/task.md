# 遊戲資產工作流專案 (Game Asset Pipeline Project)

本專案旨在展示並實作從 AI 概念到遊戲資產的完整工作流，包含風格定型、物件清理與視差背景製作。

- [x] **第一階段：規劃與風格定義 (Planning & Style Definition)**
    - [x] 撰寫實作計畫 `implementation_plan.md`
    - [x] 定義核心視覺風格 (吉卜力手繪風)
- [x] **第二階段：風格錨點建立 (Style Anchoring & Selection)**
    - [x] 生成 17 張高品質「吉卜力風格」基準圖
    - [x] 選定 `training_1_meadow.png` 作為全局風格參考 (Style Reference)
- [x] **第三階段：物件生成與清理 (Style Reference Generation)**
    - [x] 撰寫 `generate_with_style.py` 實作參考引導式生成
    - [x] 整合 `generate_assets.py` 支援命令列參數與風格引用
    - [x] 生成特定幾何體礦石資產 (8 面平滑面)
    - [x] 生成風格一致的基礎物件 (寶箱、樹木、UI)
- [x] **第四階段：網頁展示平台開發 (Web Showcase Development)**
    - [x] 初始化網頁結構 (HTML/CSS/JS)
    - [x] 實作內容整合：以純色背景突顯中央礦石
    - [x] 實作內容整合：調整裂縫位置至單一平面
    - [x] 實作內容整合：增加裂縫發光 (Glow) 特效
    - [x] 實作內容整合：增加多面幾何貼合之「符文刻痕」
    - [x] 實作內容整合：支援單一符文選取 (UV 偏移與縮放)
    - [x] 實作 3D 視覺化調整工具 (Visual 3D Gizmo)
    - [x] 增加互動優化：支援鍵盤方向鍵微調角度
    - [x] 實作 CSS/JS 敲擊與縮放動畫系統
- [ ] **第五階段：驗證與細節優化 (Verification & Polishing)**
    - [ ] 驗證物件透明度與修復邊緣
    - [ ] 優化效能與回應式設計
    - [ ] 撰寫 `walkthrough.md` 總結成果
