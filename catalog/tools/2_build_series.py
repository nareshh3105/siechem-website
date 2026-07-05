"""Consolidated series builder: dumps (JSONL) -> build/series_merged.json
   Includes: product-line title detection, continuation forward-fill, conduits
   special-case, marine index fix, junk filtering, column-split repair, merging."""
import json,re,hashlib,glob,os

BOILER=re.compile(r'www\.siechem|good faith|liable for any compensation|reserves the right|Chennai Jurisdiction|^\d{1,3}$|^Wires & Cables$|Caabb|aabbll|W+i+r+i+e+r*e*s+',re.I)
SKIP_TITLE=re.compile(r'index|profile|certificat|factory view|iso \d|as 9100|ohsas|part numbering|head office|range of products|manufacturing, laborator|ce certificate|external & internal',re.I)
HDR_KEY=re.compile(r'part\s*n|size|area|cores|conductor|awg|sq\.?\s*mm|diameter|thickness|dim\.|rdso',re.I)
JUNK_TBL=re.compile(r'^(iso|approvals|note :|no te :|siechem wires & cables|certificate)',re.I)
PRODLINE=re.compile(r'^Siechem\s+\S.{8,}',re.I)
JUNK_TITLE=re.compile(r'^(catalogue|part number|note :|2d view|ü|application|product construction|technical data|features|s\.no|number of cores|no$|no —|conductor$|siechem part|siechem dim|factories|siechem products meet|1 av |siechem have state|ul appliance wires and cables$)|^[\d\s.]+$',re.I)

def clean(c): return re.sub(r'\s+',' ',(c or '').replace('\n',' ')).strip()
def is_main_table(t,cat):
    if len(t)<2 or len(t[0])<4: return False
    hdr=' ; '.join(clean(c) for c in t[0])
    if JUNK_TBL.search(hdr.strip()): return False
    if 'Condiuts' in cat: return len(t)>=3
    if not HDR_KEY.search(hdr): return False
    return sum(1 for r in t[1:] if sum(1 for c in r if clean(c))>=2)>=1
def is_note_table(t):
    s=clean(t[0][0]) if t and t[0] else ''
    return bool(re.match(r'no\s*te\s*:',s,re.I))
def page_title(text):
    lines=[l.strip() for l in text.split('\n') if l.strip()]
    prods=[l for l in lines if PRODLINE.match(l) and not BOILER.search(l) and 'shall not be liable' not in l]
    if prods: return re.sub(r'\s*RoHS\s*$','',max(prods,key=len))[:180]
    cand=[]
    for l in lines[:10]:
        if BOILER.search(l) or JUNK_TITLE.match(l): continue
        cand.append(l)
        if len(cand)>=2: break
    return ' — '.join(cand)[:180] if cand else ''
def sections(text): return '\n'.join(l for l in text.split('\n') if l.strip() and not BOILER.search(l))
def canon_header(h):
    h2=h.lower()
    for pat,name in [(r'part\s*n','partNumber'),(r'awg|wire size','awg'),(r'cross.?section|area|sq\.?\s*mm|size','size'),
        (r'no\.?\s*of\s*cores?|cores','cores'),(r'strand','strands'),(r'overall.*dia|outer dia|cable dia|dia.*overall','od'),
        (r'weight','weight'),(r'resistance','resistance'),(r'current','current'),(r'insulation.*thick','insThk'),
        (r'sheath.*thick','sheathThk'),(r'voltage','voltage')]:
        if re.search(pat,h2): return name
    return None
def parse_attrs(title,body):
    t=title+' '+body[:2500]; a={}
    m=re.search(r'(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*kV|(\d{2,4})\s*/\s*(\d{3,4})\s*V\b|(\d{3,4})\s*V\b',t)
    if m: a['voltage']=m.group(0).replace(' ','')
    temps=re.findall(r'[-+±]?\s?\d{2,3}\s*[°º]?\s*[oO0]?\s*C\b',t)
    if temps: a['tempMentions']=list(dict.fromkeys(x.replace(' ','') for x in temps))[:4]
    ins=[]
    for kw,label in [('EBXL','EBXL'),('XLPE','XLPE'),('XLPO','XLPO'),('PVC','PVC'),('PTFE','PTFE'),('FEP','FEP'),
        ('Silicone','Silicone'),('EPR','EPR'),('Polyalkene','Polyalkene'),('Fluoroelastomer','Fluoroelastomer'),
        ('CSPE','CSPE'),('Polyamide','Polyamide'),('Rubber','Rubber'),('LSZH','LSZH'),('HFFR','HFFR'),('Polyurethane','PUR')]:
        if re.search(r'\b'+kw+r'\b',t,re.I): ins.append(label)
    if ins: a['materials']=ins
    cond=[]
    for kw,label in [('tinned copper','Tinned Copper'),('nickel coated','Nickel Coated Copper'),('silver coated','Silver Coated Copper'),
        ('bare copper','Bare Copper'),('annealed copper','Annealed Copper'),('aluminium','Aluminium'),('aluminum','Aluminium')]:
        if re.search(kw,t,re.I): cond.append(label)
    if cond: a['conductors']=list(dict.fromkeys(cond))
    if re.search(r'shield|screen|braid',t,re.I): a['shielded']=True
    if re.search(r'armour|armor',t,re.I): a['armoured']=True
    if re.search(r'halogen[- ]?free|LSZH|zero halogen',t,re.I): a['halogenFree']=True
    if re.search(r'fire resist|flame retard|FRLS|FRX',t,re.I): a['fireSafety']=True
    stds=re.findall(r'\b(?:IS|IEC|EN|BS|UL|SAE|JSS|MIL|DEF STAN|VDE|EDPS|LV|JASO|DIN|NF|IEEE)\s?[:/-]?\s?\d[\dA-Z .:/-]{1,18}',t)
    if stds: a['standardsFound']=list(dict.fromkeys(s.strip(' .,-') for s in stds))[:12]
    return a

# conduits page titles
cond_titles={}
cpath='dump/Condiuts  catalogue 2020.jsonl'
if os.path.exists(cpath):
    for line in open(cpath):
        r=json.loads(line)
        t=''
        for l in [x.strip() for x in r['text'].split('\n') if x.strip()][:4]:
            if re.search(r'polyamide conduits|www\.siechem|^\d+$|RDSO',l,re.I): continue
            if re.match(r'^(SIECHEM PART|S\.? ?NO)',l,re.I): continue
            t=l; break
        cond_titles[r['p']]=t

series=[]
for f in sorted(glob.glob('dump/*.jsonl')):
    cat=os.path.splitext(os.path.basename(f))[0]
    if cat=='UL Cable': continue   # truncated original superseded by 'UL Cable v2'
    pages={}
    for line in open(f):
        r=json.loads(line); pages[r['p']]=r
    last_title=''
    for pi in sorted(pages):
        r=pages[pi]; text=r.get('text','')
        title=page_title(text)
        if 'Condiuts' in cat and cond_titles.get(pi): title=cond_titles[pi].title()
        if cat=='Marine Cable (1)' and pi in (21,22): title='Siechem MGCH APC, EMC Screened 0.6/1 kV Control Cable'
        if cat=='Automotive cable Updated (1)' and pi==5: title='Automotive Cables — Selection Table'
        if title and SKIP_TITLE.search(title): last_title=''; continue
        cont=False
        if (not title) or JUNK_TITLE.match(title): title=last_title; cont=True
        else: last_title=title
        mains=[t for t in r.get('tables',[]) if is_main_table(t,cat)]
        if not mains: continue
        notes=[clean(' '.join(clean(c) for row in t for c in row if clean(c))) for t in r.get('tables',[]) if is_note_table(t)]
        body=sections(text)
        for ti,t in enumerate(mains):
            hdrs=[clean(c) for c in t[0]]
            rows=[[clean(c) for c in row] for row in t[1:] if sum(1 for c in row if clean(c))>=2]
            if not rows: continue
            sid=hashlib.md5(f"{cat}|{pi}|{ti}".encode()).hexdigest()[:10]
            series.append({'id':sid,'catalog':cat,'page':pi,'tableIndex':ti,'title':title,'continuation':cont,
                'headers':hdrs,'rows':rows,'notes':notes,'attrs':parse_attrs(title,body),'bodyText':body[:3000]})

# repair split "Part Number" header columns
for s in series:
    h=s['headers']; merged=True
    while merged and len(h)>1:
        merged=False
        for i in range(len(h)-1):
            joined=re.sub(r'\s+','',(h[i]+h[i+1])).lower()
            if joined in ('partnumber','partno','partnumber.') and h[i+1] and h[i+1][0].islower():
                h[i]=h[i].rstrip()+h[i+1]; del h[i+1]
                for r in s['rows']:
                    if i+1<len(r): r[i]=(r[i] or '')+(r[i+1] or ''); del r[i+1]
                merged=True; break
    s['headers']=h
    s['canonical']=[canon_header(x) for x in h]

# fold two-level headers: first "data" row that has no digits is a sub-header row
for s in series:
    while s['rows']:
        r0=s['rows'][0]
        if any(re.search(r'\d',c or '') for c in r0): break
        nonempty=[c for c in r0 if (c or '').strip()]
        if len(nonempty)<2: break
        s['headers']=[(h+' — '+c).strip(' —') if (c or '').strip() and (c or '').strip().lower() not in (h or '').lower() else (h or c or '') for h,c in zip(s['headers'],r0+['']*(len(s['headers'])-len(r0)))]
        s['rows']=s['rows'][1:]
    s['canonical']=[canon_header(x) for x in s['headers']]

# merge continuation tables
# (same catalog+title+headers)
merged={}; order=[]
for s in series:
    sig=(s['catalog'],s['title'],'|'.join(s['headers']))
    if sig in merged:
        m=merged[sig]; seen=set(map(tuple,m['rows']))
        m['rows'].extend(r for r in s['rows'] if tuple(r) not in seen)
        m['pages'].append(s['page'])
        for n in s['notes']:
            if n not in m['notes']: m['notes'].append(n)
    else:
        s['pages']=[s.pop('page')]; merged[sig]=s; order.append(sig)
M=[merged[k] for k in order]
json.dump(M,open('build/series_merged.json','w'),indent=0)
print('series after merge:',len(M))
