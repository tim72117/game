# -*- coding: utf-8 -*-
# extract_original_face.py

import json
import os
from PIL import Image, ImageDraw

def extract_face(input_path, points_json, output_path):
    """
    從輸入圖檔中裁切出指定的區域
    """
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} not found.")
        return

    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size

        points = json.loads(points_json)
        center_x, center_y = width // 2, height // 2

        # 網頁上的礦石是 300px，我們放大座標以匹配資產尺寸 (假設 1024x1024)
        scale = width / 300.0

        polygon = []
        for p in points:
            px = center_x + p['x'] * scale
            py = center_y + p['y'] * scale
            polygon.append((px, py))

        # 建立遮罩
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        draw.polygon(polygon, fill=255)

        # 應用遮罩
        result = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        result.paste(img, (0, 0), mask=mask)

        # 改成不裁剪，以維持中心點對齊
        result.save(output_path)
        print(f"Success! Extracted region saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--points", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    extract_face(args.input, args.points, args.output)
