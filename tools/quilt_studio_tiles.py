"""Bake tileable illustrated textures from the concept's mirror-symmetric source art.
Deterministic patch quilting breaks obvious 4-fold mandala repetition. No AI-image
invented seam texture, no runtime CPU/GPU quilting cost.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
import random

ROOT=Path(__file__).resolve().parents[1]/"assets"/"studio_hd"/"tiles"

def quilt(primary, secondary, seed, alternate=.30, n=768, patch=256, stride=128):
    rng=random.Random(seed)
    a=np.asarray(Image.open(ROOT/primary).convert("RGB"))
    b=np.asarray(Image.open(ROOT/secondary).convert("RGB"))
    accum=np.zeros((n,n,3),np.float32)
    weights=np.zeros((n,n),np.float32)
    y,x=np.mgrid[:patch,:patch]
    feather=(np.sin(np.pi*(x+.5)/patch)*np.sin(np.pi*(y+.5)/patch))**.70
    for gy in range(-1,n//stride+1):
        for gx in range(-1,n//stride+1):
            src=b if rng.random()<alternate else a
            px=rng.randint(0,src.shape[1]-patch)
            py=rng.randint(0,src.shape[0]-patch)
            piece=np.rot90(src[py:py+patch,px:px+patch],rng.randrange(4))
            x0=gx*stride+rng.randint(-19,19)
            y0=gy*stride+rng.randint(-19,19)
            ix=(x0+np.arange(patch))%n
            iy=(y0+np.arange(patch))%n
            accum[np.ix_(iy,ix)]+=piece*feather[:,:,None]
            weights[np.ix_(iy,ix)]+=feather
    assert weights.min()>0, "Uncovered tile pixels"
    image=Image.fromarray(np.uint8(np.clip(accum/weights[:,:,None],0,255)),"RGB")
    return image.filter(ImageFilter.UnsharpMask(radius=1.5,percent=55,threshold=3))

for name,a,b,seed,mix in [
    ("rock_quilt.webp","rock.webp","rock_moss.webp",7122,.19),
    ("grass_quilt.webp","grass.webp","grass_dense.webp",17928,.42)]:
    tile=quilt(a,b,seed,mix)
    tile.save(ROOT/name,format="WEBP",quality=88,method=6)
    pixels=np.asarray(tile).astype(np.float32)
    delta=np.abs(pixels[:,0]-pixels[:,-1]).mean()
    assert delta<12.0, (name,"edge mismatch",delta)
    print(name,tile.size,"mean edge delta",round(float(delta),2))
