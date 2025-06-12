# backend/main.py

# --- Gerekli Tüm Kütüphaneler ---
import os
import asyncio
import base64
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
# from dotenv import load_dotenv # .env dosyasını artık kullanmıyoruz

# --- Arkadaşınızın Eklediği Kütüphaneler (Kullanıcı Yönetimi için) ---
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import models, schemas, auth 
from database import SessionLocal, engine 

# --- Sizin Eklediğiniz Kütüphaneler (AI için) ---
import fal_client
import torch
from PIL import Image
from io import BytesIO
import numpy as np
import cv2
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler

# --- Kurulum ---
# load_dotenv() # .env dosyasını artık kullanmıyoruz
models.Base.metadata.create_all(bind=engine) # Veritabanı tablolarını oluştur

# --- Global Değişkenler ve Konfigürasyon ---
model_cache = {}
lora_file_path = r"C:\Users\Asus\OneDrive\Belgeler\lora_katmani_bitirme\Graduation-Project-08.safetensors"
base_model_path = "runwayml/stable-diffusion-v1-5"
controlnet_model_path = "lllyasviel/sd-controlnet-canny"
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype_to_use = torch.float16 if device == "cuda" else torch.float32

# --- Yardımcı Fonksiyonlar ---
def get_canny_image(pil_image, low_threshold=100, high_threshold=200):
    image_np = np.array(pil_image.convert("RGB"))
    gray_image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    canny_edges_np = cv2.Canny(gray_image_np, low_threshold, high_threshold)
    return Image.fromarray(canny_edges_np)

def resize_for_pipeline(pil_image, target_size=512):
    original_width, original_height = pil_image.size
    if original_width > original_height:
        new_width, new_height = target_size, int(target_size * original_height / original_width)
    else:
        new_height, new_width = target_size, int(target_size * original_width / original_height)
    new_width = max(8, (new_width // 8) * 8)
    new_height = max(8, (new_height // 8) * 8)
    return pil_image.resize((new_width, new_height), Image.LANCZOS)

# --- FastAPI Lifespan (Sunucu Başlarken Modelleri Yükler) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Sunucu Başlatılıyor: Yerel Modeller Yükleniyor ---")
    try:
        controlnet = ControlNetModel.from_pretrained(controlnet_model_path, torch_dtype=dtype_to_use).to(device)
        pipeline = StableDiffusionControlNetPipeline.from_pretrained(
            base_model_path, controlnet=controlnet, torch_dtype=dtype_to_use, safety_checker=None
        ).to(device)
        pipeline.load_lora_weights(lora_file_path)
        pipeline.scheduler = UniPCMultistepScheduler.from_config(pipeline.scheduler.config)
        model_cache["pipeline"] = pipeline
        print("--- Yerel Modeller Başarıyla Yüklendi ---")
    except Exception as e:
        print(f"!!! YEREL MODEL YÜKLEME HATASI: {e} !!!")
    yield
    print("--- Sunucu Kapanıyor ---")
    model_cache.clear()

app = FastAPI(lifespan=lifespan)

# --- Veritabanı Bağımlılığı ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- CORS Ayarları ---
app.add_middleware(
    CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"]
)

# --- Pydantic Modelleri ---
class PromptRequest(BaseModel):
    user_prompt: str

# --- Kullanıcı Yönetimi Endpoint'leri ---
@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = models.User(username=user.username, hashed_password=auth.get_password_hash(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# --- AI Özellikleri Endpoint'leri ---

@app.post("/beautify-prompt")
async def beautify_prompt(request: PromptRequest, current_user: models.User = Depends(auth.get_current_active_user)):
    try:
        # !!! DÜZELTME: API Anahtarını doğrudan burada tanımlıyoruz !!!
        os.environ["FAL_KEY"] = "bb07e762-40f5-4df3-9696-e36937512a27:6e36d0727bfe3e7b9c19d9e4d06dfc7a"

        meta_prompt = f"""You are an expert prompt engineer... User idea: "{request.user_prompt}" Detailed and beautified prompt:"""
        result = fal_client.run(
            "fal-ai/any-llm", 
            arguments={"model": "meta-llama/llama-3.1-8b-instruct", "prompt": meta_prompt, "max_tokens": 200}
        )
        return {"beautified_prompt": result.get("output", "Could not generate a suggestion.").strip()}
    except Exception as e:
        print(f"Error calling fal.ai LLM: {e}")
        return {"beautified_prompt": "Sorry, an error occurred."}

@app.post("/generate-image-local/")
async def generate_image_local(
    prompt: str = Form(...),
    image: UploadFile = File(None),
    controlnet_scale: float = Form(1.0),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if "pipeline" not in model_cache:
        return {"error": "Models could not be loaded."}
    
    pipeline = model_cache["pipeline"]
    generator = torch.Generator(device=device).manual_seed(torch.randint(0, 1000000, (1,)).item())
    generated_image = None
    
    if image:
        image_bytes = await image.read()
        pil_image_input = Image.open(BytesIO(image_bytes))
        resized_pil_image = resize_for_pipeline(pil_image_input)
        control_image = get_canny_image(resized_pil_image)
        generated_image = pipeline(
            prompt, image=control_image, num_inference_steps=25, generator=generator,
            controlnet_conditioning_scale=controlnet_scale
        ).images[0]
    else:
        generated_image = pipeline(prompt, num_inference_steps=25, generator=generator, width=512, height=512).images[0]

    buffered = BytesIO()
    generated_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return {"images": [img_str]}
