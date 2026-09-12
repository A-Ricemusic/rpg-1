from pathlib import Path
import html
regions=[('Whispering Wilds',0,0,'#416e4c'),('Emberfall Caldera',-1450,-1100,'#915447'),('Frostveil Reach',1050,-1550,'#78a9b8'),('Zephyr Mesa',1550,650,'#bc925a'),('Umbral Hollow',-1150,1250,'#76638d')]
roads=[ [(-576,0),(-760,-170),(-810,-640),(-874,-1100)], [(-80,-576),(140,-780),(590,-940),(970,-974)],[(576,0),(775,110),(870,450),(974,650)],[(20,576),(-230,780),(-520,1010),(-574,1250)],[(-1530,-1676),(-1230,-1920),(-420,-2160),(340,-2200),(970,-2126)],[(1626,-1550),(2020,-1120),(2190,-320),(2126,650)],[(1570,1226),(1320,1570),(610,1850),(-260,2070),(-1130,1826)],[(-1726,1250),(-2100,760),(-2210,-50),(-2150,-600),(-2026,-1100)]]
scale=.2
xy=lambda x,z:f'{520+x*scale:.1f},{565+z*scale:.1f}'
out=['<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="1080" viewBox="0 0 1040 1080">','<rect width="1040" height="1080" fill="#111d27"/>','<style>text{font-family:Georgia,serif;fill:#efe6cd} .small{font-family:Arial,sans-serif;font-size:13px}</style>','<text x="45" y="54" font-size="34">ELDORIA · THE PILGRIM BASINS</text>','<text class="small" x="45" y="82">Authored layout • north is −Z • five regions, branching trails and an outer circuit</text>']
for road in roads: out.append('<polyline points="'+' '.join(xy(*p) for p in road)+'" fill="none" stroke="#b9aa87" stroke-width="5" stroke-linejoin="round"/>')
loop=[(-85,-64),(-280,-70),(-380,-220),(-80,-340),(110,-310),(350,-230),(410,30),(280,290),(20,360),(-310,160),(-280,-70)]
for name,x,z,color in regions:
 X,Y=520+x*scale,565+z*scale
 out.append(f'<rect x="{X-115}" y="{Y-115}" width="230" height="230" rx="55" fill="{color}" stroke="#b9aa87" stroke-width="1.5"/>')
 out.append('<polyline points="'+' '.join(xy(x+a,z+b) for a,b in loop)+'" fill="none" stroke="#ecd8a8" stroke-width="2"/>')
 for a,b in [(-380,-220),(110,-310),(-310,160)]:
  cx,cy=xy(x+a,z+b).split(',');out.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="#f8d996"/>')
 for a,b in [(-85,-64),(280,290)]:
  cx,cy=xy(x+a,z+b).split(',');out.append(f'<rect x="{float(cx)-5}" y="{float(cy)-5}" width="10" height="10" fill="#f6eee0"/>')
 out.append(f'<text x="{X}" y="{Y+99}" text-anchor="middle" font-size="18">{html.escape(name)}</text>')
out.extend(['<text class="small" x="45" y="1030">● Outlying discoveries / gathering    ■ Settlement or boss sanctuary    Lines: connected walking routes</text>','<text class="small" x="45" y="1053">Each basin: 1,152 × 1,152 studs. Diagram shows organization; terrain and scenery are authored in Studio.</text>','</svg>'])
Path('assets/eldoria/expansion/World-map.svg').write_text('\n'.join(out))
