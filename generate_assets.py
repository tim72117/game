# -*- coding: utf-8 -*- 
# generate_assets.py

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image
import os

def generate_image_vertex_ai(project_id: str, location: str, prompt: str, output_filename: str = "generated_image.png"):
    """Generates an image using Vertex AI and saves it to a file.

    Args:
        project_id: Your Google Cloud project ID.
        location: The region for Vertex AI (e.g., "us-central1").
        prompt: The text prompt describing the image to generate.
        output_filename: The name of the file to save the generated image.

    Returns:
        The path to the saved image file, or None if generation failed.
    """
    # Initialize Vertex AI
    vertexai.init(project=project_id, location=location)

    # Load the Imagen model
    try:
        model = ImageGenerationModel.from_pretrained("imagen-3.0-fast-generate-001") 
    except Exception as e:
        print(f"Error loading image generation model: {e}")
        print("Ensure model name, region, and Vertex AI API are correctly configured.")
        return None

    print(f"Generating image with prompt: '{prompt}'...")

    # Generate images
    try:
        response = model.generate_images(
            prompt=prompt,
        )

        if response.images and len(response.images) > 0:
            try:
                image_bytes = response.images[0].image_bytes # Access image data
                with open(output_filename, "wb") as f:
                    f.write(image_bytes)
                print(f"Image successfully saved to: {output_filename}")
                return output_filename
            except AttributeError: # Fallback to save method if image_bytes is not found
                try:
                    response.images[0].save(output_filename)
                    print(f"Image successfully saved to: {output_filename}")
                    return output_filename
                except Exception as save_error:
                    print(f"Error saving image: {save_error}")
                    return None
            except IOError as e:
                print(f"Error writing image file: {e}")
                return None
        else:
            print("Image generation did not return any images.")
            return None

    except Exception as e:
        print(f"Error during image generation: {e}")
        return None

if __name__ == "__main__":
    # Configuration
    PROJECT_ID = "game-485606" 
    LOCATION = "asia-east1"     
    USER_PROMPT = "A cute, cartoon-style fox character with a transparent background, designed for a 2D side-scrolling game."
    OUTPUT_IMAGE_FILENAME = "fox_character.png"

    # Execution
    print(f"Attempting to generate image with prompt: '{USER_PROMPT}'")
    print(f"Using Project ID: {PROJECT_ID}, Location: {LOCATION}")

    saved_path = generate_image_vertex_ai(PROJECT_ID, LOCATION, USER_PROMPT, OUTPUT_IMAGE_FILENAME)
    if saved_path:
        print(f"\nImage generation process completed. Check the file '{saved_path}'.")
    else:
        print("\nImage generation failed. Please check the error messages above.")