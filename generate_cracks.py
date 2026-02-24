# -*- coding: utf-8 -*-
# generate_cracks.py (Adapted from generate_with_style.py)

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image
import os

PROJECT_ID = "game-485606"
LOCATION = "asia-east1"
OUTPUT_DIR = "c:/www/game/assets/output"

def generate_crack(index):
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")

    # 強調「裂縫」、「透明背景感」與「手繪感」
    prompt = (
        f"A set of dark, jagged cracks and glass fracture lines, simple black line art, "
        f"hand-painted Ghibli texture style, watercolor ink lines, "
        f"isolated on pure white background, version {index}"
    )

    output_filename = f"crack_overlay_{index}.png"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    print(f"Generating crack decal {index}...")
    try:
        response = model.generate_images(prompt=prompt, number_of_images=1)
        if response.images:
            if not os.path.exists(OUTPUT_DIR):
                os.makedirs(OUTPUT_DIR, exist_ok=True)
            response.images[0].save(output_path)
            print(f"Success! Saved to {output_path}")
            return output_path
    except Exception as e:
        print(f"Failed to generate crack {index}: {e}")

if __name__ == "__main__":
    generate_crack(1)
