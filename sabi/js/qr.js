/* Tiny QR code generator for Sabi share links.
   Byte mode, error correction level M, versions 1 to 6 (up to 106 characters).
   QR.svg(text) returns an SVG string, or '' if the text is too long. */
const QR=(function(){
  const VERS=[null,
    {ec:10,b:[[1,16]]},{ec:16,b:[[1,28]]},{ec:26,b:[[1,44]]},
    {ec:18,b:[[2,32]]},{ec:24,b:[[2,43]]},{ec:16,b:[[4,27]]}
  ];
  const ALIGN=[null,null,18,22,26,30,34];

  /* Reed-Solomon over GF(256) */
  const EXP=new Array(512),LOG=new Array(256);
  (function(){
    let x=1;
    for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d;}
    for(let i=255;i<512;i++)EXP[i]=EXP[i-255];
  })();
  const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
  function rsGen(n){
    let g=[1];
    for(let i=0;i<n;i++){
      const ng=new Array(g.length+1).fill(0);
      for(let j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=mul(g[j],EXP[i]);}
      g=ng;
    }
    return g;
  }
  function rsEncode(data,n){
    const g=rsGen(n),r=data.concat(new Array(n).fill(0));
    for(let i=0;i<data.length;i++){
      const c=r[i];
      if(c)for(let j=0;j<g.length;j++)r[i+j]^=mul(g[j],c);
    }
    return r.slice(data.length);
  }

  function codewords(bytes,ver){
    const v=VERS[ver],lens=[];
    v.b.forEach(e=>{for(let i=0;i<e[0];i++)lens.push(e[1]);});
    const cap=lens.reduce((a,b)=>a+b,0),bits=[];
    const put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>i)&1);};
    put(4,4);put(bytes.length,8);
    bytes.forEach(b=>put(b,8));
    for(let i=0;i<4&&bits.length<cap*8;i++)bits.push(0);
    while(bits.length%8)bits.push(0);
    const data=[];
    for(let i=0;i<bits.length;i+=8){let x=0;for(let j=0;j<8;j++)x=(x<<1)|bits[i+j];data.push(x);}
    for(let pad=0xec;data.length<cap;pad^=0xec^0x11)data.push(pad);
    const blocks=[];let at=0;
    lens.forEach(n=>{const d=data.slice(at,at+n);at+=n;blocks.push({d:d,e:rsEncode(d,v.ec)});});
    const out=[];
    for(let i=0;i<Math.max.apply(null,lens);i++)blocks.forEach(b=>{if(i<b.d.length)out.push(b.d[i]);});
    for(let i=0;i<v.ec;i++)blocks.forEach(b=>out.push(b.e[i]));
    return out;
  }

  function build(ver,cw,mask){
    const size=17+4*ver,m=[],fn=[];
    for(let i=0;i<size;i++){m.push(new Array(size).fill(false));fn.push(new Array(size).fill(false));}
    const set=(x,y,dark)=>{m[y][x]=dark;fn[y][x]=true;};
    function finder(cx,cy){
      for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
        const x=cx+dx,y=cy+dy;
        if(x<0||y<0||x>=size||y>=size)continue;
        const d=Math.max(Math.abs(dx),Math.abs(dy));
        set(x,y,d!==2&&d!==4);
      }
    }
    finder(3,3);finder(size-4,3);finder(3,size-4);
    for(let i=0;i<size;i++){if(!fn[6][i])set(i,6,i%2===0);if(!fn[i][6])set(6,i,i%2===0);}
    if(ver>=2){
      const c=ALIGN[ver];
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(c+dx,c+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
    }
    /* format information: level M, chosen mask */
    const fdata=(0<<3)|mask;
    let rem=fdata;
    for(let i=0;i<10;i++)rem=(rem<<1)^((rem>>9)*0x537);
    const fbits=((fdata<<10)|rem)^0x5412,bit=i=>((fbits>>i)&1)===1;
    for(let i=0;i<=5;i++)set(8,i,bit(i));
    set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));
    for(let i=9;i<15;i++)set(14-i,8,bit(i));
    for(let i=0;i<8;i++)set(size-1-i,8,bit(i));
    for(let i=8;i<15;i++)set(8,size-15+i,bit(i));
    set(8,size-8,true);
    /* data, zig-zag from the bottom right */
    const bits=[];
    cw.forEach(b=>{for(let i=7;i>=0;i--)bits.push((b>>i)&1);});
    const maskFn=[
      (r,c)=>(r+c)%2===0,(r,c)=>r%2===0,(r,c)=>c%3===0,(r,c)=>(r+c)%3===0,
      (r,c)=>(Math.floor(r/2)+Math.floor(c/3))%2===0,(r,c)=>(r*c)%2+(r*c)%3===0,
      (r,c)=>((r*c)%2+(r*c)%3)%2===0,(r,c)=>((r+c)%2+(r*c)%3)%2===0
    ][mask];
    let k=0,up=true;
    for(let col=size-1;col>0;col-=2){
      if(col===6)col=5;
      for(let n=0;n<size;n++){
        const y=up?size-1-n:n;
        for(let dx=0;dx<2;dx++){
          const x=col-dx;
          if(fn[y][x])continue;
          let dark=k<bits.length?bits[k]===1:false;k++;
          if(maskFn(y,x))dark=!dark;
          m[y][x]=dark;
        }
      }
      up=!up;
    }
    return m;
  }

  function penalty(m){
    const n=m.length;let p=0;
    for(let pass=0;pass<2;pass++){
      for(let a=0;a<n;a++){
        let run=1,line='';
        for(let b=0;b<n;b++){
          const cur=pass?m[b][a]:m[a][b];
          line+=cur?'1':'0';
          if(b>0){
            const prev=pass?m[b-1][a]:m[a][b-1];
            if(cur===prev){run++;if(run===5)p+=3;else if(run>5)p++;}else run=1;
          }
        }
        const pats=line.match(/(?=(10111010000|00001011101))/g);
        if(pats)p+=40*pats.length;
      }
    }
    for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++){
      const c=m[y][x];
      if(c===m[y][x+1]&&c===m[y+1][x]&&c===m[y+1][x+1])p+=3;
    }
    let dark=0;
    m.forEach(r=>r.forEach(c=>{if(c)dark++;}));
    p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;
    return p;
  }

  function matrix(text){
    const bytes=Array.from(unescape(encodeURIComponent(text))).map(c=>c.charCodeAt(0));
    let ver=0;
    for(let v=1;v<VERS.length;v++){
      const cap=VERS[v].b.reduce((a,e)=>a+e[0]*e[1],0);
      if(4+8+bytes.length*8<=cap*8){ver=v;break;}
    }
    if(!ver)return null;
    const cw=codewords(bytes,ver);
    let best=null,bestP=1e9;
    for(let mask=0;mask<8;mask++){
      const m=build(ver,cw,mask),p=penalty(m);
      if(p<bestP){bestP=p;best=m;}
    }
    return best;
  }

  function svg(text,opts){
    const o=opts||{},m=matrix(text);
    if(!m)return '';
    const margin=o.margin===undefined?4:o.margin,n=m.length,w=n+margin*2;
    let path='';
    for(let y=0;y<n;y++){
      let x=0;
      while(x<n){
        if(m[y][x]){let e=x;while(e<n&&m[y][e])e++;path+='M'+(x+margin)+' '+(y+margin)+'h'+(e-x)+'v1h-'+(e-x)+'z';x=e;}
        else x++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+w+'" shape-rendering="crispEdges" role="img" aria-label="'+(o.label||'QR code')+'"><rect width="'+w+'" height="'+w+'" fill="#fff"/><path d="'+path+'" fill="#0b1020"/></svg>';
  }
  return {svg:svg,matrix:matrix};
})();
