# -*- coding: utf-8 -*-
# generate_runes.py

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image
import os

PROJECT_ID = "game-485606"
LOCATION = "asia-east1"
OUTPUT_DIR = "c:/www/game/assets/output"

def generate_runes():
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")

    # 生成一組古代符文或神祕刻文，樣式要像刻在石頭上的
    prompt = (
        "A set of ancient mystical runes and symbols, carved stone texture, "
        "dark gray chiseled lines, hand-painted Ghibli style, watercolor texture, "
        "isolated on pure white background, high contrast, clean symbols"
    )

    output_filename = "ancient_runes_decal.png"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    print("Generating ancient runes decal...")
    try:
        response = model.generate_images(prompt=prompt, number_of_images=1)
        if response.images:
            if not os.path.exists(OUTPUT_DIR):
                os.makedirs(OUTPUT_DIR, exist_ok=True)
            response.images[0].save(output_path)
            print(f"Success! Saved to {output_path}")
            return output_path
    except Exception as e:
        print(f"Failed to generate runes: {e}")

if __name__ == "__main__":
    generate_runes()
