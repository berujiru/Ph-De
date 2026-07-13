from PIL import Image

def count_frames(img_path, cols=8):
    img = Image.open(img_path)
    fw = img.width // cols
    fh = fw
    rows = img.height // fh
    for i in range(rows * cols - 1, -1, -1):
        x = (i % cols) * fw
        y = (i // cols) * fh
        crop = img.crop((x, y, x + fw, y + fh))
        if crop.getbbox():
            return i + 1
    return 0

print('jeepney_driver:', count_frames('public/assets/heroes/jeepney_driver_sprite.png'))
print('sales_lady:', count_frames('public/assets/heroes/sales_lady_sprite.png'))
print('nurse:', count_frames('public/assets/heroes/nurse_sprite.png'))
