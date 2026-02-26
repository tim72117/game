# -*- coding: utf-8 -*-
# generate_broken_face.py

import json
import os
import io
import traceback
from google import genai
from google.genai import types
from PIL import Image, ImageDraw
import numpy as np

def get_image_bytes(pil_img):
    buf = io.BytesIO()
    # 確保以 PNG 格式傳遞以保留透明度或精細度
    pil_img.save(buf, format='PNG')
    return buf.getvalue()

def generate_broken_face(project_id, location, prompt, points_json, output_filename, base_image_path, style_ref_path=None):
    """
    使用 google-genai SDK 進行 Inpainting (局部重繪)
    """
    try:
        client = genai.Client(vertexai=True, project=project_id, location=location)

        if not os.path.exists(base_image_path):
            print(f"Error: Base image not found at {base_image_path}")
            return None

        # 1. 建立遮罩
        print(f"Loading base image: {base_image_path}")
        # imagen 3 通常偏好 RGB
        base_pil = Image.open(base_image_path).convert("RGB")
        width, height = base_pil.size
        print(f"  Base image size: {width}x{height}, Mode: {base_pil.mode}")

        points = json.loads(points_json)
        # 建立黑白遮罩 (L 模式)
        mask_pil = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask_pil)

        # 座標轉換 (網頁座標轉底圖像素)
        center_x, center_y = width // 2, height // 2
        # 注意：此 scale 應與網頁端的實作對齊。這裡假設網頁寬度 300px
        scale = width / 300.0

        polygon = []
        for p in points:
            px = center_x + p['x'] * scale
            py = center_y + p['y'] * scale
            polygon.append((px, py))

        draw.polygon(polygon, fill=255)

        # 保存除錯遮罩以便檢查
        mask_pil.save("debug_mask.png")
        print(f"  Debug mask saved to debug_mask.png")

        # 診斷：遮罩像素統計
        mask_array = np.array(mask_pil)
        nonzero_count = np.count_nonzero(mask_array)
        print(f"  Mask created (nonzero pixels: {nonzero_count})")

        # 2. 準備參考圖 (Reference Images)
        # 確保遮罩與底圖尺寸完全相等
        if base_pil.size != mask_pil.size:
            raise ValueError(f"Dimension mismatch: Base {base_pil.size} != Mask {mask_pil.size}")

        print(f"  Verification: Base and Mask dimensions match ({width}x{height})")

        # 2. 準備影像資料
        base_bytes = get_image_bytes(base_pil)
        mask_bytes = get_image_bytes(mask_pil)

        # 3. 執行 Inpainting
        # 使用專門用於編輯能力的模型 ID
        model_id = "imagen-3.0-capability-001"
        print(f"Executing inpainting using {model_id} via google-genai SDK...")

        ref_images = [
            types.RawReferenceImage(
                reference_id=1,
                reference_image=types.Image(image_bytes=base_bytes, mime_type='image/png')
            ),
            types.MaskReferenceImage(
                reference_id=2,
                reference_image=types.Image(image_bytes=mask_bytes, mime_type='image/png'),
                config=types.MaskReferenceConfig(
                    mask_mode='MASK_MODE_USER_PROVIDED'
                )
            )
        ]

        response = client.models.edit_image(
            model=model_id,
            prompt=prompt,
            reference_images=ref_images,
            config=types.EditImageConfig(
                number_of_images=1,
                edit_mode='EDIT_MODE_INPAINT_INSERTION',
                guidance_scale=100.0,
                safety_filter_level='block_some',
                person_generation='dont_allow'
            )
        )

        if response.generated_images:
            result_img = response.generated_images[0].image
            result_img.save(output_filename)
            print(f"Success! Inpainted asset saved to {output_filename}")
        else:
            print("No images returned from Vertex AI.")
            return None

    except Exception as e:
        print(f"Inpainting error: {e}")
        print(f"--- DETAILED TRACEBACK START ---\n{traceback.format_exc()}\n--- DETAILED TRACEBACK END ---")
        return None

    return output_filename

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--location", default="asia-northeast1")
    parser.add_argument("--points", required=True)
    parser.add_argument("--prompt", default="a deep irregular hole recessed into the stone surface, the edges are sharply carved and drop vertically into the rock, the perimeter shows depth and thickness of the stone with cracked inwards textures, rough chiseled surfaces and hammer marks from mining, a golden raw gemstone tucked entirely inside the deep cavity, soft amber glow from the depth, perfectly blended with the original stone texture, consistent lighting and shadows, Studio Ghibli cel-shaded style")
    parser.add_argument("--output", required=True)
    parser.add_argument("--base_image", required=True)
    parser.add_argument("--style_ref", help="Style reference image path")

    args = parser.parse_args()

    generate_broken_face(
        args.project, args.location, args.prompt, args.points, args.output, args.base_image, args.style_ref
    )
