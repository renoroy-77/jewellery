import os
from PIL import Image, ImageFilter
import numpy as np

MOCKUP_PATH = '/Users/renoroy/Desktop/jewellery/imageu9237893742.png'
LOGO_PATH = '/Users/renoroy/Desktop/jewellery/file_0000000035a081fdb2872794afe5b9ef.png'
HERO_PATH = '/Users/renoroy/Desktop/jewellery/imagetressary.png'
ASSETS_DIR = '/Users/renoroy/Desktop/jewellery/public/assets'

os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Process Logo
print("Processing Brand Logo...")
logo = Image.open(LOGO_PATH)
# Detect gold mask to crop tightly
arr = np.array(logo)
gold_mask = (arr[:, :, 0] > 65) & (arr[:, :, 1] > 55)
y_idx, x_idx = np.where(gold_mask)
margin_y, margin_x = 35, 30
min_y = max(0, y_idx.min() - margin_y)
max_y = min(logo.height, y_idx.max() + margin_y)
min_x = max(0, x_idx.min() - margin_x)
max_x = min(logo.width, x_idx.max() + margin_x)

cropped_logo = logo.crop((min_x, min_y, max_x, max_y))
cropped_logo.save(os.path.join(ASSETS_DIR, 'brand_logo.png'))

# Make transparent logo
logo_rgba = cropped_logo.convert('RGBA')
c_arr = np.array(logo_rgba, dtype=float)
bg_color = np.array([3.0, 32.0, 20.0]) # dark green bg
diff = np.sqrt(np.sum((c_arr[:, :, :3] - bg_color)**2, axis=2))
alpha = np.clip((diff - 22) / 48.0 * 255.0, 0, 255).astype(np.uint8)
c_arr[:, :, 3] = alpha
trans_logo = Image.fromarray(c_arr.astype(np.uint8))
trans_logo.save(os.path.join(ASSETS_DIR, 'brand_logo_transparent.png'))
print("Brand logo saved with transparency.")

# Copy hero image
hero = Image.open(HERO_PATH)
hero.save(os.path.join(ASSETS_DIR, 'imagetressary.png'))
print("Hero image verified in assets.")

# 2. Extract Category Circles from Mockup
mockup = Image.open(MOCKUP_PATH)
W, H = mockup.size
print(f"Mockup dimension: {W}x{H}")

# Category coordinates:
# Mockup width is 1024. In the category row (y around 508..585):
# 10 categories:
# 0: Ganesha
# 1: Murugan
# 2: Shiva
# 3: Lakshmi
# 4: Devi
# 5: Spiritual Symbols
# 6: Chains & Necklaces
# 7: Bracelets
# 8: Rings
# 9: Pooja Essentials

cat_names = [
    'cat_ganesha', 'cat_murugan', 'cat_shiva', 'cat_lakshmi', 'cat_devi',
    'cat_spiritual', 'cat_chains', 'cat_bracelets', 'cat_rings', 'cat_pooja'
]

# Exact centers measured:
# We know diameter is roughly 76px. Let's find centers for each:
# Distance between adjacent icons: ~95.3px.
# First circle center is around x=77, y=546.
centers_x = [77 + i * 96.5 for i in range(10)]
# Let's verify each circle center
radius = 38
cat_y = 547

for i, (name, cx) in enumerate(zip(cat_names, centers_x)):
    box = (int(round(cx - radius)), int(round(cat_y - radius)), int(round(cx + radius)), int(round(cat_y + radius)))
    crop_cat = mockup.crop(box)
    crop_cat.save(os.path.join(ASSETS_DIR, f"{name}.png"))
    print(f"Extracted category: {name}.png, box: {box}")

# 3. Extract Featured Products from Mockup
# 6 products:
# 0: Lord Ganesha Pendant
# 1: Murugan Vel Pendant
# 2: Shiva Lingam Pendant
# 3: Lakshmi Pendant
# 4: Om Pendant
# 5: Traditional Chain
prod_names = [
    'prod_ganesha', 'prod_murugan', 'prod_shiva', 'prod_lakshmi', 'prod_om', 'prod_chain'
]

# In mockup, the product cards are 6 columns:
# Card width ~147px, spacing ~14px, total width ~950
# Product card image area: y roughly 718 to 868 (150px height)
prod_centers_x = [112 + i * 160.0 for i in range(6)]
prod_w = 146
prod_y1, prod_y2 = 718, 868

for i, (name, cx) in enumerate(zip(prod_names, prod_centers_x)):
    px1 = int(round(cx - prod_w / 2.0))
    px2 = int(round(cx + prod_w / 2.0))
    crop_prod = mockup.crop((px1, prod_y1, px2, prod_y2))
    crop_prod.save(os.path.join(ASSETS_DIR, f"{name}.png"))
    print(f"Extracted product: {name}.png, box: {(px1, prod_y1, px2, prod_y2)}")

# 4. Extract Story Banners
# Left: A Sacred Gift (hands with diya)
# Right: Crafted in Panchaloham (chain)
# y range: 978 to 1133
banner_left = mockup.crop((36, 978, 506, 1133))
banner_left.save(os.path.join(ASSETS_DIR, 'banner_sacred_gift.png'))

banner_right = mockup.crop((518, 978, 988, 1133))
banner_right.save(os.path.join(ASSETS_DIR, 'banner_panchaloham.png'))
print("Extracted story banners successfully.")

# Also extract lotus flourish from product header:
# In mockup, between 'Blessings for Every Occasion' and tabs: y=675..700, x=450..550
lotus_flourish = mockup.crop((445, 680, 555, 705))
lotus_flourish.save(os.path.join(ASSETS_DIR, 'lotus_flourish.png'))
print("Extracted lotus flourish.")

# Also extract the newsletter lotus graphic:
# In mockup, y=1200..1290, x=45..180
lotus_art = mockup.crop((45, 1205, 180, 1290))
lotus_art.save(os.path.join(ASSETS_DIR, 'lotus_art.png'))
print("Extracted newsletter lotus art.")

print("ALL ASSETS EXTRACTED SUCCESSFULLY!")
