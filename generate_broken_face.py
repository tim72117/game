# -*- coding: utf-8 -*-
# generate_broken_face.py

import json
import os
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image as VertexImage
from PIL import Image, ImageDraw
import numpy as np

import traceback

def generate_broken_face(project_id, location, prompt, points_json, output_filename, base_image_path, style_ref_path=None):
    """
    1. 根據網頁導出的多邊形座標建立與底圖尺寸一致的遮罩
    2. 使用 Vertex AI Imagen 3.0 的 edit_image 進行 Inpainting (局部重繪)
    3. 產出與底圖完美融合的破碎面資產
    """
    try:
        vertexai.init(project=project_id, location=location)

        if not os.path.exists(base_image_path):
            print(f"Error: Base image not found at {base_image_path}")
            return None

        # 1. 建立遮罩
        print(f"Creating mask from points for base image: {base_image_path}")
        points = json.loads(points_json)
        base_img = Image.open(base_image_path).convert("RGB")
        width, height = base_img.size
        print(f"  Base image size: {width}x{height}")

        # 建立黑白遮罩 (L 模式)
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)

        # 座標轉換
        center_x, center_y = width // 2, height // 2
        scale = width / 300.0 # 假設網頁預覽區為 300px

        polygon = []
        for p in points:
            px = center_x + p['x'] * scale
            py = center_y + p['y'] * scale
            polygon.append((px, py))

        draw.polygon(polygon, fill=255)

        mask_path = "temp_inpainting_mask.png"
        mask.save(mask_path)

        # 診斷：計算遮罩非零像素數量
        mask_array = np.array(mask)
        nonzero_count = np.count_nonzero(mask_array)
        print(f"  Mask created and saved to {mask_path} (size: {mask.size}, nonzero pixels: {nonzero_count})")
        if nonzero_count == 0:
            print("  WARNING: Mask is completely black! This will cause mask-free editing errors.")

        # 2. 執行 Inpainting
        enhanced_prompt = f"{prompt}"

        print(f"Executing inpainting in {location} using capability model: '{enhanced_prompt[:100]}...'")
        # 使用專門用於編輯能力的模型 ID
        model = ImageGenerationModel.from_pretrained("imagen-3.0-capability-001")

        base_vertex_img = VertexImage.load_from_file(base_image_path)
        mask_vertex_img = VertexImage.load_from_file(mask_path)

        print(f"  Base Image: {base_image_path}")
        print(f"  Mask Image: {mask_path}")

        # 使用 edit_image 進行重繪
        # 暫時移除 edit_mode="inpainting-insert" 以測試模型是否能自動識別遮罩
        response = model.edit_image(
            prompt=enhanced_prompt,
            base_image=base_vertex_img,
            mask=mask_vertex_img,
            number_of_images=1
        )

        if response.images:
            response.images[0].save(output_filename)
            print(f"Success! Inpainted asset saved to {output_filename}")
        else:
            print("No images returned from Vertex AI.")
            return None

    except Exception as e:
        print(f"Inpainting error: {e}")
        # 將 Traceback 列印到 stdout 確保網頁端一定能看到
        print(f"--- DETAILED TRACEBACK START ---\n{traceback.format_exc()}\n--- DETAILED TRACEBACK END ---")
        return None
    finally:
        if 'mask_path' in locals() and os.path.exists(mask_path):
            os.remove(mask_path)

    return output_filename

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--location", default="us-central1") # 切換至功能最完整的地區
    parser.add_argument("--points", required=True)
    parser.add_argument("--prompt", default="exposed glowing magical crystal core, jagged shattered stone edges, deep volumetric cracks, Studio Ghibli cel-shaded style")
    parser.add_argument("--output", required=True)
    parser.add_argument("--base_image", required=True, help="Base image for inpainting")
    parser.add_argument("--style_ref", help="Style reference image path")

    args = parser.parse_args()

    generate_broken_face(
        args.project, args.location, args.prompt, args.points, args.output, args.base_image, args.style_ref
    )
