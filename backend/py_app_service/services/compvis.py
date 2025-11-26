# simpan sebagai: solar_panel_predict.py
# atau langsung taruh di file utils/inference.py

from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional

# GANTI PATH INI SESUAI LETAK best.pt DI SERVER / LOCAL
MODEL_PATH = r"./best.pt"
# Kalau nanti di server Linux: "/home/user/models/best.pt"

# Load model sekali di awal (biar cepet pas dipanggil berkali-kali)
model = YOLO(MODEL_PATH)

def predict_solar_panel(
    image: np.ndarray, 
    conf_threshold: float = 0.25,
    iou_threshold: float = 0.45
) -> Tuple[np.ndarray, List[Dict]]:
    """
    Input:  image = numpy array (BGR dari cv2.imread atau dari bytes)
    Output: 
        - annotated_image  = gambar dengan mask + bounding box
        - predictions      = list of dict berisi koordinat polygon + bbox + confidence
    """
    # Inference
    results = model(
        image, 
        imgsz=640, 
        conf=conf_threshold, 
        iou=iou_threshold,
        verbose=False
    )[0]

    # Gambar hasil dengan mask + box (warna cantik)
    annotated_image = results.plot()  # langsung BGR

    # Ambil data koordinat (untuk backend proses lebih lanjut)
    predictions = []
    if results.boxes is not None:
        for box, mask in zip(results.boxes, results.masks or []):
            pred = {
                "confidence": float(box.conf.cpu().numpy()),
                "bbox": [int(x) for x in box.xyxy[0].cpu().numpy()],   # [x1, y1, x2, y2]
                "polygon": []  # default
            }
            if mask is not None:
                # mask.xy[0] = list of [x,y] points (polygon)
                pred["polygon"] = [[float(x), float(y)] for x, y in mask.xy[0]]
            predictions.append(pred)

    return annotated_image, predictions


# ================== CONTOH PENGGUNAAN ==================
if __name__ == "__main__":
    # Test cepat (hapus kalau sudah dipakai backend)
    img_path = r"C:/Users/user\Downloads/ITB HACKATON\solar-panel-seg-local/cirata.jpg"  # ganti gambar test kamu
    img = cv2.imread(img_path)
    
    annotated, preds = predict_solar_panel(img)
    
    # Simpan gambar hasil
    cv2.imwrite("result_cirata.jpg", annotated)
    print(f"Terdeteksi {len(preds)} solar panel")
    print("Contoh 1 prediksi:", preds[0] if preds else "Tidak ada")