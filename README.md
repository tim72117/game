# 遊戲資產工作流 (Game Asset Pipeline)

這是一個完整的遊戲資產開發展示專案，涵蓋了從 AI 風格定型到網頁互動實裝的完整流程。

## 🚀 快速啟動
```bash
npm install
npm run dev
```
瀏覽展示頁面：[http://localhost:5173/](http://localhost:5173/)

## 🎨 主要功能
- **AI 風格管線**：使用 Imagen 3 的 Style Reference 功能生成風格高度一致的資產。
- **互動展示介面**：具備滑鼠視差滾動、礦石敲擊震動與裂縫發光回饋。
- **3D 調整工具 (Gizmo)**：首創的 3D 視覺化調整面板，可手動對齊符文並選取 U/V 偏移，自動生成 CSS 代碼。

## 📂 資料夾結構
- `/assets`: 存放所有生成的背景與透明 Sprite 資產。
- `/scripts`: (對應 Python 腳本) 用於生成、清理資產的工具。
- `index.html`, `style.css`, `main.js`: Web Showcase 的核心實作。

## 📝 相關文件
詳情請參閱專案目錄下的：
- `PLAN.md`: 技術實作計畫。
- `DEVELOPMENT_LOG.md`: 完整開發日誌與功能說明。
