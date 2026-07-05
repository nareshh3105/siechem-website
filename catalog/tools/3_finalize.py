import json,re,sys,os
sys.path.insert(0,'.')
from families_meta import FAMILIES,MERGE_INTO,PDF_FILE
S=json.load(open('build/series_merged.json'))
OUT='/sessions/magical-zealous-archimedes/mnt/siechem-redesign/catalog/data'
os.makedirs(OUT+'/products',exist_ok=True)

def famkey(cat):
    k=MERGE_INTO.get(cat,cat)
    return k
def volt_bucket(v):
    if not v: return None
    v=v.lower().replace(' ','')
    m=re.search(r'(\d+(?:\.\d+)?)/(\d+(?:\.\d+)?)kv',v)
    if m: x=float(m.group(2))*1000
    else:
        m=re.search(r'(\d+(?:\.\d+)?)kv',v)
        if m: x=float(m.group(1))*1000
        else:
            m=re.search(r'(\d+)/(\d+)v',v)
            if m: x=float(m.group(2))
            else:
                m=re.search(r'(\d+)v',v)
                x=float(m.group(1)) if m else None
    if x is None: return None
    if x<300: return 'Below 300V'
    if x<=750: return '300–750V'
    if x<=1100: return '751–1100V'
    if x<=3300: return '1.1–3.3kV'
    return 'Above 3.3kV'

# size parsing helpers for row-level attributes
def parse_sizes(series):
    canon=series['canonical']; rows=series['rows']
    idx={}
    for i,c in enumerate(canon):
        if c and c not in idx: idx[c]=i
    sizes=set(); awgs=set(); cores=set(); parts=[]
    for r in rows:
        def cell(k):
            i=idx.get(k)
            return r[i] if i is not None and i<len(r) else ''
        pn=cell('partNumber')
        if pn and re.search(r'\d',pn): parts.append(pn)
        sz=cell('size')
        for m in re.findall(r'\d+(?:\.\d+)?',sz)[:2]:
            f=float(m)
            if 0.01<f<1000: sizes.add(f)
        aw=cell('awg')
        m=re.match(r'^\s*(\d{1,3})\s*$',aw or '')
        if m: awgs.add(int(m.group(1)))
        co=cell('cores')
        m=re.match(r'^\s*(\d{1,3})\s*$',co or '')
        if m: cores.add(int(m.group(1)))
        m=re.match(r'\s*(\d{1,3})\s*[xX×]',sz or '')
        if m: cores.add(int(m.group(1)))
    return sorted(sizes),sorted(awgs),sorted(cores),parts

families={}; fam_series={}
for s in S:
    fk=famkey(s['catalog'])
    meta=FAMILIES.get(fk)
    if meta is None: meta=FAMILIES.get(s['catalog'])
    if meta is None: continue
    fid=meta['id']
    families.setdefault(fid,{**meta,'sourcePdfs':[],'segments':[meta['segment']]})
    if PDF_FILE.get(s['catalog']) and PDF_FILE[s['catalog']] not in families[fid]['sourcePdfs']:
        families[fid]['sourcePdfs'].append(PDF_FILE[s['catalog']])
    fam_series.setdefault(fid,[]).append(s)

products_index=[]; all_series_out={}
for fid,ser in fam_series.items():
    out=[]
    fvolts=set(); fmats=set(); fconds=set(); fstds=set(); fsizes=set(); fcores=set(); fawg=set()
    flags={'shielded':False,'armoured':False,'halogenFree':False,'fireSafety':False}
    for s in ser:
        sizes,awgs,cores,parts=parse_sizes(s)
        a=s['attrs']
        vb=volt_bucket(a.get('voltage'))
        rec={'id':s['id'],'family':fid,'name':re.sub(r'^Siechem\s+','',s['title']).strip(),
             'pages':s['pages'],'headers':s['headers'],'rows':s['rows'],'notes':s['notes'],
             'attrs':{**a,'voltBucket':vb,'sizesSqmm':sizes,'awg':awgs,'cores':cores},
             'partNumbers':parts[:200]}
        out.append(rec)
        if vb: fvolts.add(vb)
        for m in a.get('materials',[]): fmats.add(m)
        for c in a.get('conductors',[]): fconds.add(c)
        for st in a.get('standardsFound',[]): fstds.add(st)
        fsizes.update(sizes); fcores.update(cores); fawg.update(awgs)
        for k in flags:
            if a.get(k): flags[k]=True
        products_index.append({'id':s['id'],'family':fid,'name':rec['name'],
            'search':' '.join([rec['name'],' '.join(parts[:60]),' '.join(a.get('materials',[])),
                               ' '.join(a.get('standardsFound',[])),families[fid]['name'],
                               ' '.join(families[fid]['keywords'])])[:1500],
            'voltBucket':vb,'materials':a.get('materials',[]),'conductors':a.get('conductors',[]),
            'shielded':bool(a.get('shielded')),'armoured':bool(a.get('armoured')),
            'halogenFree':bool(a.get('halogenFree')),'fireSafety':bool(a.get('fireSafety')),
            'sizesSqmm':sizes[:60],'awg':awgs,'cores':cores,'nRows':len(s['rows'])})
    F=families[fid]
    F['seriesCount']=len(out)
    F['voltBuckets']=sorted(fvolts); F['materials']=sorted(fmats); F['conductorMaterials']=sorted(fconds)
    F['standards']=sorted(fstds)[:25]; F['flags']=flags
    F['sizeRange']=[min(fsizes),max(fsizes)] if fsizes else None
    F['coreCounts']=sorted(fcores)[:40]; F['awgRange']=[min(fawg),max(fawg)] if fawg else None
    all_series_out[fid]=out

# write files
json.dump({'families':sorted(families.values(),key=lambda f:f['name'])},open(OUT+'/families.json','w'),indent=1)
for fid,out in all_series_out.items():
    json.dump({'series':out},open(f'{OUT}/products/{fid}.json','w'))
json.dump({'products':products_index},open(OUT+'/search-index.json','w'))

# filters.json — global facets with counts
from collections import Counter
def count(key):
    c=Counter()
    for p in products_index:
        v=p.get(key)
        if isinstance(v,list):
            for x in v: c[x]+=1
        elif v: c[v]+=1
    return dict(c.most_common())
segs=Counter(); 
for f in families.values(): segs[f['segment']]+=1
filters={'segments':dict(segs),'voltBuckets':count('voltBucket'),'materials':count('materials'),
 'conductors':count('conductors'),
 'flags':{k:sum(1 for p in products_index if p[k]) for k in ['shielded','armoured','halogenFree','fireSafety']}}
json.dump(filters,open(OUT+'/filters.json','w'),indent=1)

print('families:',len(families))
print('series total:',sum(len(v) for v in all_series_out.values()))
print('index entries:',len(products_index))
import subprocess
print(subprocess.run(['du','-sh',OUT],capture_output=True,text=True).stdout)
for fid in sorted(all_series_out): print(f"  {fid}: {len(all_series_out[fid])} series")
