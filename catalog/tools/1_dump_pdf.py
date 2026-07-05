import fitz, sys, json, os, time
f=sys.argv[1]; deadline=time.time()+float(sys.argv[2])
name=os.path.splitext(os.path.basename(f))[0]
out=f"/sessions/magical-zealous-archimedes/extract/dump/{name}.jsonl"
done=set()
if os.path.exists(out):
    with open(out) as fh:
        for line in fh:
            try: done.add(json.loads(line)['p'])
            except: pass
doc=fitz.open(f); total=len(doc)
if len(done)>=total: print(f"COMPLETE {name} {total}"); sys.exit(0)
with open(out,'a') as fh:
    for i in range(total):
        if i in done: continue
        if time.time()>deadline: print(f"PARTIAL {name} {len(done)}/{total}"); sys.exit(3)
        p=doc[i]
        rec={'p':i,'text':p.get_text()}
        try:
            tf=p.find_tables()
            tbls=[t.extract() for t in tf.tables]
            if tbls: rec['tables']=tbls
        except Exception as e: rec['table_err']=str(e)[:80]
        fh.write(json.dumps(rec)+'\n'); fh.flush(); done.add(i)
print(f"COMPLETE {name} {total}")
