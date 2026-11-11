"""Build HD alpha PNG atlases from freely redistributable klamtii tree sprites.
Source: https://klamtii.itch.io/tree-sprites. Preserve licensing notice.
Each 512x512 atlas cell contains an entire rooted tree, centered at x=256,
with its lowest opaque foot pixel at y=509. No extra bottom gap.
"""
from PIL import Image, ImageEnhance
from pathlib import Path
import zipfile,io,sys

SRC=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/academia-trees.zip')
OUT=Path('assets/studio_hd/trees'); OUT.mkdir(parents=True,exist_ok=True)
# A/B/C conifers and D/E/F hardwood trees. Do not include dead/snowy groups.
VARIANTS={
 'pine':['tree_a0001.png','tree_a0003.png','tree_b0002.png','tree_b0003.png','tree_c0001.png','tree_c0003.png'],
 'broadleaf':['tree_d0001.png','tree_d0003.png','tree_e0001.png','tree_e0003.png','tree_f0001.png']}
with zipfile.ZipFile(SRC) as archive:
 names={s.split('/')[-1].lower():s for s in archive.namelist()}
 for family,source_names in VARIANTS.items():
  canvas=Image.new('RGBA',(1536,1024),(0,0,0,0))
  for idx,filename in enumerate(source_names):
   if filename not in names: raise RuntimeError(f'Missing source sprite: {filename}')
   raw=Image.open(io.BytesIO(archive.read(names[filename]))).convert('RGBA')
   alpha=raw.getchannel('A');bbox=alpha.point(lambda a:255 if a>8 else 0).getbbox()
   if not bbox: raise RuntimeError(f'Empty source alpha: {filename}')
   raw=raw.crop(bbox)
   # Balance deep source greens for the brighter stylized mountain art.
   rgb=raw.convert('RGB')
   # Lift dark needle shadows without destroying the detailed natural branches.
   gamma=[min(255,round(255*(v/255)**.72)) for v in range(256)]
   rgb=rgb.point(gamma*3)
   rgb=ImageEnhance.Color(rgb).enhance(1.10)
   rgb=ImageEnhance.Brightness(rgb).enhance(1.04)
   raw=rgb.convert('RGBA');raw.putalpha(alpha.crop(bbox))
   max_w=460 if family=='broadleaf' else 440
   ratio=min(max_w/raw.width,490/raw.height,1.24)
   resized=raw.resize((max(1,round(raw.width*ratio)),max(1,round(raw.height*ratio))),Image.Resampling.LANCZOS)
   px=(idx%3)*512+(512-resized.width)//2
   py=(idx//3)*512+509-resized.height
   canvas.alpha_composite(resized,(px,py))
  out=OUT/f'tree-{family}-atlas.png';canvas.save(out,optimize=True)
  print(f'Baked {family}: {len(source_names)} transparent 512px sprites into {out}, {out.stat().st_size} bytes')
