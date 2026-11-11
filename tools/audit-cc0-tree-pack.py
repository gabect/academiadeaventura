from PIL import Image, ImageDraw, ImageFont, ImageOps
import zipfile, io, os, json, math
os.makedirs("art-audit",exist_ok=True)
rows=[]
with zipfile.ZipFile("/tmp/trees.zip") as z:
 for name in z.namelist():
  if not name.lower().endswith(".png"): continue
  try:
   raw=z.read(name)
   im=Image.open(io.BytesIO(raw)).convert("RGBA")
   if im.width<64 or im.height<64: continue
   rows.append((name,im))
  except Exception as e:
   print("SKIP",name,e)
rows.sort(key=lambda v:v[0])
print("Total candidate pngs",len(rows))
data=[]
w=245; h=320; cols=5
sheet=Image.new("RGB",(w*cols,h*max(1,math.ceil(len(rows)/cols))),(224,234,227))
d=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(rows):
 x=i%cols*w; y=i//cols*h
 tile=Image.new("RGBA",(w-12,h-52),(0,0,0,0))
 im.thumbnail((w-18,h-60))
 tile.alpha_composite(im,((tile.width-im.width)//2,tile.height-im.height))
 sheet.paste(tile,(x+6,y+9),tile)
 d.text((x+7,y+h-40),str(i)+" "+os.path.basename(name)[:27],fill=(20,40,20))
 d.text((x+7,y+h-22),str((im.width,im.height)),fill=(20,40,20))
 data.append({"index":i,"name":name,"width":im.width,"height":im.height})
sheet.save("art-audit/overview.png")
open("art-audit/assets.json","w").write(json.dumps(data,indent=2))
print("Found",len(rows),"valid art sprites")
