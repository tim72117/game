# -*- coding: utf-8 -*-
# generate_with_style.py

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image
import os
import argparse

# 固定配置
PROJECT_ID = "game-485606"
LOCATION = "asia-east1"
DEFAULT_OUTPUT_DIR = "c:/www/game/assets/output"

def generate_asset_with_style(prompt, output_filename, style_ref_path):
    """使用風格參考生成圖像"""
    vertexai.init(project=PROJECT_ID, location=LOCATION)

    # 載入 Imagen 3 模型
    model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")

    # 載入風格參考圖
    try:
        if not style_ref_path or not os.path.exists(style_ref_path):
            print(f"Error: Style reference image NOT found at {style_ref_path}")
            return
        style_image = Image.load_from_file(style_ref_path)
    except Exception as e:
        print(f"Error loading style reference image: {e}")
        return

    print(f"Generating asset: {prompt}...")
    print(f"  Using style reference: {os.path.basename(style_ref_path)}")

    try:
        # 嘗試使用 StyleReferenceConfig
        try:
            from vertexai.preview.vision_models import StyleReferenceConfig
            style_config = StyleReferenceConfig(image=style_image)
        except ImportError:
            style_config = None
            print("Notice: StyleReferenceConfig cannot be imported, will try direct generation.")

        generate_kwargs = {
            "prompt": prompt,
            "number_of_images": 1,
        }
        if style_config:
            generate_kwargs["style_reference_config"] = style_config

        response = model.generate_images(**generate_kwargs)

        if response.images:
            output_dir = os.path.dirname(output_filename)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)

            response.images[0].save(output_filename)
            print(f"Success! Saved to {output_filename}")
            return output_filename
        else:
            print("No images returned from API.")
    except Exception as e:
        print(f"Generation failed: {e}")
        # Fallback to basic generation
        print("Falling back to basic generation...")
        try:
            response = model.generate_images(prompt=prompt, number_of_images=1)
            if response.images:
                response.images[0].save(output_filename)
                print(f"Success (Basic)! Saved to {output_filename}")
                return output_filename
        except Exception as e2:
            print(f"All generation attempts failed: {e2}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate game assets with style reference.")
    parser.add_argument("--prompt", help="Text prompt for generation")
    parser.add_argument("--output", help="Output filename")
    parser.add_argument("--style_ref", help="Path to style reference image")

    args = parser.parse_args()

    # 如果沒傳參數，則使用預設值生成「8面礦石」作為示範
    if not args.prompt:
        print("No prompt provided. Running default demo: 8-faced crystal ore.")
        prompt = (
            "A single mystical glowing crystal ore with exactly 8 flat, geometric faces, "
            "each face is a perfect flat plane, sharp edges, octahedron shape, "
            "hand-painted Ghibli style, vibrant watercolors, soft lighting, "
            "occupying 50% of the image area, isolated on white background"
        )
        output = os.path.join(DEFAULT_OUTPUT_DIR, "crystal_ore_8faces.png")
        style_ref = "c:/www/game/assets/output/mine_entrance_styled.png"
    else:
        prompt = args.prompt
        output = args.output
        style_ref = args.style_ref

    generate_asset_with_style(prompt, output, style_ref)
