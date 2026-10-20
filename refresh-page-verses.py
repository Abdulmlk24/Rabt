"""Refresh embedded starts using explicit Quran Complex Font V2 page boundaries."""
import json, re, subprocess
from pathlib import Path
BASE='https://api.qurancdn.com/api/qdc'
def get(path):
    return json.loads(subprocess.check_output(['curl.exe','--noproxy','*','-sSfL','--max-time','40',BASE+path]))
verses=get('/quran/verses/uthmani')['verses']
chapters=get('/chapters?language=ar')['chapters']
assert len(verses)==6236 and len(chapters)==114
pages={}
for i in range(0,len(verses),400):
    chunk=verses[i:i+400]
    result=get('/pages/lookup?mushaf=1&from='+chunk[0]['verse_key']+'&to='+chunk[-1]['verse_key'])
    for page,entry in result['pages'].items():
        if page in pages: assert pages[page]['first_verse_key']==entry['first_verse_key']
        pages[page]=entry
    print('Read boundaries through verse',i+len(chunk),flush=True)
assert set(pages)==set(map(str,range(1,605))), sorted(set(map(str,range(1,605)))-set(pages),key=int)
assert pages['534']['first_verse_key']=='55:70'
by_key={v['verse_key']:v for v in verses}
names={c['id']:c['name_arabic'] for c in chapters}
starts={}
for p in range(1,605):
    key=pages[str(p)]['first_verse_key']; surah,ayah=map(int,key.split(':'))
    starts[str(p)]={'text':by_key[key]['text_uthmani'],'surah':names[surah],'ayah':ayah,'verseKey':key}
    last_key=pages[str(p)]['last_verse_key']; last_surah,last_ayah=map(int,last_key.split(':'))
    starts[str(p)]['last']={'text':by_key[last_key]['text_uthmani'],'surah':names[last_surah],'ayah':last_ayah,'verseKey':last_key}
path=Path('rabt.html'); html=path.read_text(encoding='utf-8')
old=json.loads(re.search(r'const PAGE_VERSES=(.*?);\n',html).group(1))
changed=[p for p in starts if old[p]['ayah']!=starts[p]['ayah'] or re.sub(r'[\W\d_]+','',old[p]['text'])!=re.sub(r'[\W\d_]+','',starts[p]['text'])]
boundary_changes=[p for p in starts if old[p]['ayah']!=starts[p]['ayah']]
html=re.sub(r'const PAGE_VERSES=.*?;\n',lambda _: 'const PAGE_VERSES='+json.dumps(starts,ensure_ascii=False,separators=(',',':'))+';\n',html,count=1)
html=html.replace('https://alquran.cloud/api','https://api-docs.quran.com/docs/tutorials/fonts/page-layout/').replace('Al Quran Cloud','Quran Foundation — مصحف المدينة (QCF V2)')
if 'بدايات الأوجه وفق تخطيط' not in html:
    html=html.replace('الآيات مضمّنة من','بدايات الأوجه وفق تخطيط مصحف المدينة برواية حفص (604 صفحات، QCF V2). الآيات مضمّنة من')
path.write_text(html,encoding='utf-8')
Path('page-boundaries.json').write_text(json.dumps({'source':BASE+'/pages/lookup','mushaf':1,'layout':'QCF V2','pages':pages},ensure_ascii=False,indent=2),encoding='utf-8')
print('All 604 starts replaced. Changed verse-number boundaries:',boundary_changes)

