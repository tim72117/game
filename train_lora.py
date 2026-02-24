# -*- coding: utf-8 -*-
# train_lora.py

import os
from google.cloud import storage
from vertexai.preview.vision_models import ImageGenerationModel

# 1. 配置資訊
PROJECT_ID = "game-485606"
LOCATION = "asia-east1"
BUCKET_NAME = f"{PROJECT_ID}-vcm" # 建議使用的 Bucket 名稱
TRAINING_DATA_DIR = "./assets/training_set"
MODEL_ID = "imagen-3.0-generate-001"

def upload_to_gcs(bucket_name, source_directory, destination_blob_prefix):
    """將本地訓練圖片上傳到 Google Cloud Storage"""
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(bucket_name)

    if not bucket.exists():
        bucket.create(location=LOCATION)
        print(f"Created bucket {bucket_name}")

    print(f"Uploading images from {source_directory} to gs://{bucket_name}/{destination_blob_prefix}...")
    for filename in os.listdir(source_directory):
        if filename.endswith((".png", ".jpg", ".jpeg")):
            local_path = os.path.join(source_directory, filename)
            blob = bucket.blob(f"{destination_blob_prefix}/{filename}")
            blob.upload_from_filename(local_path)
            print(f"  Uploaded {filename}")

def start_tuning_job():
    """啟動 Imagen 模型微調任務 (模擬 LoRA)"""
    # 注意：Imagen 3 的微調 API 通常需要特定的權限與格式（如 JSONL 標註）
    # 這裡演示如何使用 SDK 載入模型並調用微調接法

    print("Initializing Vertex AI...")
    import vertexai
    vertexai.init(project=PROJECT_ID, location=LOCATION)

    model = ImageGenerationModel.from_pretrained(MODEL_ID)

    # 建立微調任務的配置 (示意)
    # 在實際環境中，您需要準備一個包含 GCS 路徑與 Prompt 的 JSONL 檔案
    dataset_gcs_uri = f"gs://{BUCKET_NAME}/training_set/"

    print(f"Starting tuning job for model {MODEL_ID} using data from {dataset_gcs_uri}...")

    # 注意：此處調用的具體微調方法取決於您的 Google Cloud 權限與具體版本
    # 部分用戶端使用 model.tune_model(...) 或透過 Pipeline
    print("Note: Actual tuning requires a JSONL annotation file and specific IAM roles.")
    print("Wait for the background job to complete (this can take hours).")

if __name__ == "__main__":
    # 第一步：上傳圖片 (需要 gcloud 認證)
    # try:
    #     upload_to_gcs(BUCKET_NAME, TRAINING_DATA_DIR, "training_set")
    # except Exception as e:
    #     print(f"GCS Upload failed: {e}")

    # 第二步：啟動訓練
    start_tuning_job()
