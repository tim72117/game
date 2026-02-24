# -*- coding: utf-8 -*-
# cleanup_assets.py

import os
from PIL import Image

def remove_background(input_path, output_path):
    """
    簡單的去背腳本。
    針對 "isolated on white background" 的圖片進行處理。
    """
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")

        datas = img.getdata()

        new_data = []
        for item in datas:
            # 判斷是否為白色背景 (可以根據需要調整閾值)
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0)) # 設為透明
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"  Saved to {output_path}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    assets_dir = "./assets/output"
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)

    # 處理生成的資產
    remove_background("c:/www/game/assets/output/ancient_runes_decal.png", "c:/www/game/assets/output/ancient_runes_decal_clean.png")
    remove_background("c:/www/game/assets/output/crack_overlay_1.png", "c:/www/game/assets/output/crack_overlay_1_clean.png")
    remove_background("c:/www/game/assets/output/crystal_ore_8faces.png", "c:/www/game/assets/output/crystal_ore_8faces_clean.png")
    remove_background("c:/www/game/assets/output/mine_entrance_styled.png", "c:/www/game/assets/output/mine_entrance_clean.png")
    remove_background("c:/www/game/assets/output/treasure_chest_styled.png", "c:/www/game/assets/output/treasure_chest_clean.png")
