"""Bake artist-licensed 3D tree renders into self-hosted transparent PNG atlases."""
from PIL import Image, ImageEnhance
import zipfile, io, os
SOURCE='art-audit/itch/trees.zip'
TARGET='assets/studio_hd/trees'
PREVIEWS='artifacts'
TREES={
 'pine':['tree_a0001.png','tree_a0003.png','tree_b0002.png',
         'tree_b0003.png','tree_c0001.png','tree_c0003.png'],
 'broadleaf':['tree_d0001.png','tree_d0003.png','tree_e0001.png',
              'tree_e0003.png','tree_f0001.png']
}
os.makedirs(TARGET,exist_ok=True)
os.makedirs(PREVIEWS,exist_ok=True)
with zipfile.ZipFile(SOURCE) as bundle:
 license_text=bundle.read('.license.txt').decode('utf-8').lower()
 if 'copy, modify, distribute' not in license_text or 'commercial purposes' not in license_text:
  raise RuntimeError('Reuse rights unverified; refusing to bake')
 for family,names in TREES.items():
  atlas=Image.new('RGBA',(1536,1024))
  preview=Image.new('RGB',(1536,1024),(207,220,214))
  for i,name in enumerate(names):
   original=Image.open(io.BytesIO(bundle.read(name))).convert('RGBA')
   if original.size!=(512,512):raise RuntimeError('Bad tree image: '+name)
   alpha=original.getchannel('A')
   bbox=alpha.point(lambda v:255 if v>12 else 0).getbbox()
   if not bbox:raise RuntimeError('Empty tree: '+name)
   trimmed=original.crop(bbox)
   rgb=trimmed.convert('RGB')
   rgb=rgb.point([int(255*((v/255)**.75)) for v in range(256)]*3)
   rgb=ImageEnhance.Color(rgb).enhance(1.12)
   rgb=ImageEnhance.Brightness(rgb).enhance(1.02)
   graded=rgb.convert('RGBA')
   graded.putalpha(trimmed.getchannel('A'))
   maxwidth=470 if family=='broadleaf' else 440
   ratio=min(maxwidth/graded.width,480/graded.height)
   scaled=graded.resize((max(1,int(graded.width*ratio)),max(1,int(graded.height*ratio))),Image.Resampling.LANCZOS)
   x=(i%3)*512+(512-scaled.width)//2
   y=(i//3)*512+510-scaled.height
   atlas.alpha_composite(scaled,(x,y))
   preview.paste(scaled,(x,y),scaled)
  out=f'{TARGET}/tree-{family}-atlas.png'
  atlas.save(out,optimize=True)
  preview.save(f'{PREVIEWS}/trees-{family}-art-preview.jpg',quality=88)
  if os.path.getsize(out)<100000:raise RuntimeError('Invalid PNG '+out)
  print(family,len(names),'sprites',os.path.getsize(out),'bytes')
