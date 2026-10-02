# Βγάζει κυματομορφή (peaks) για κάθε beat preview και τη γράφει στο beats.json
import json, subprocess, numpy as np
p='src/data/beats.json'; d=json.load(open(p,encoding='utf-8'))
for b in d['beatslist']:
    raw=subprocess.run(['ffmpeg','-v','error','-i',b['audioSrc'],'-ac','1','-ar','8000','-f','s16le','-'],capture_output=True).stdout
    a=np.abs(np.frombuffer(raw,np.int16).astype(float))
    if not len(a): continue
    n=160; seg=np.array_split(a,n); pk=np.array([s.max() for s in seg]); pk=pk/pk.max()
    b['peaks']=[round(float(x),2) for x in pk]; b['duration']=round(len(a)/8000,1)
    print(b['title'],b['duration'])
open(p,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
