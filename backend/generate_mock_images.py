import os
from PIL import Image, ImageDraw

def create_preset_image(filename: str, color: tuple, text: str):
    # Create a 400x300 canvas
    img = Image.new("RGB", (400, 300), color=color)
    draw = ImageDraw.Draw(img)
    
    # Draw simple crosshair and text label for the mock simulation
    draw.rectangle([10, 10, 390, 290], outline=(255, 255, 255), width=2)
    draw.text((30, 130), text, fill=(255, 255, 255))
    
    # Ensure directory exists and save
    target_path = os.path.join("..", "web", "public", filename)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    img.save(target_path)
    print(f"Saved mock preset image to {target_path}")

if __name__ == "__main__":
    create_preset_image("oil_spill.png", (120, 60, 40), "PROTOTYPE: OIL SPILL SIMULATION")
    create_preset_image("coral_bleaching.png", (70, 130, 180), "PROTOTYPE: CORAL BLEACHING SIMULATION")
    create_preset_image("plastic_pollution.png", (100, 110, 120), "PROTOTYPE: PLASTIC POLLUTION SIMULATION")
    create_preset_image("algal_bloom.png", (40, 160, 90), "PROTOTYPE: ALGAL BLOOM SIMULATION")
