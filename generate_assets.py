# -*- coding: utf-8 -*-
# generate_assets.py

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image, StyleReferenceConfig
import os

def generate_image_vertex_ai(project_id, location, prompt, output_filename, style_ref_path=None):
    """Generates an image using Vertex AI, with optional style reference."""
    vertexai.init(project=project_id, location=location)

    try:
        model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

    print(f"Generating: '{prompt}'...")

    try:
        generate_params = {
            "prompt": prompt,
            "number_of_images": 1
        }

        # 整合風格參考
        if style_ref_path and os.path.exists(style_ref_path):
            print(f"  Using style reference: {os.path.basename(style_ref_path)}")
            style_image = Image.load_from_file(style_ref_path)
            generate_params["style_reference_config"] = StyleReferenceConfig(image=style_image)

        response = model.generate_images(**generate_params)

        if response.images:
            output_dir = os.path.dirname(output_filename)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)

            response.images[0].save(output_filename)
            print(f"Success! Saved to {output_filename}")
            return output_filename
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate game assets using Vertex AI Imagen.")
    parser.add_argument("--project", required=True, help="Google Cloud Project ID")
    parser.add_argument("--location", default="asia-east1", help="Vertex AI Location (default: asia-east1)")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation")
    parser.add_argument("--output", required=True, help="Output filename (e.g., asset.png)")
    parser.add_argument("--style_ref", help="Path to style reference image (optional)")

    args = parser.parse_args()

    # 執行生成
    generate_image_vertex_ai(
        project_id=args.project,
        location=args.location,
        prompt=args.prompt,
        output_filename=args.output,
        style_ref_path=args.style_ref
    )