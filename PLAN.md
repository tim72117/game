# 遊戲資產工作流：實作計畫 (Exported)

## 視覺風格：吉卜力手繪風
採用 Imagen 3 Style Reference 技術，繼承基準圖的色彩、光影與筆觸。

## 實作階段
1. **風格定型 (Style Anchoring)**：生成基準圖。
2. **物件處理 (Cleanup)**：自動化 Python 腳本去背與邊緣強化。
3. **網頁整合 (Web Showcase)**：Vite 前端基礎、視差系統。
4. **互動增強 (Interaction)**：礦石挖掘特效、3D 手動校正工具、UV 選取系統。

## 技術細節
- **去背處理**：使用 OpenCV 偵測顏色範圍或邊緣。
- **3D 校正**：利用 CSS 3D Transforms (rotateX, rotateY, rotateZ) 與 skewX 結合，實現平面圖像與立體表面的完美貼合。
