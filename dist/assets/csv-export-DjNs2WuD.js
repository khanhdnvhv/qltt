function s(e){return e.includes(",")||e.includes('"')||e.includes(`
`)||e.includes("\r")?`"${e.replace(/"/g,'""')}"`:e}function b(e,c,d="export.csv"){const a=c.map(n=>s(n.header)).join(","),i=e.map(n=>c.map(o=>{const l=o.format?o.format(n):String(n[o.key]??"");return s(l)}).join(",")),p="\uFEFF"+[a,...i].join(`\r
`),u=new Blob([p],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(u),t=document.createElement("a");t.href=r,t.download=d,t.style.display="none",document.body.appendChild(t),t.click(),setTimeout(()=>{document.body.removeChild(t),URL.revokeObjectURL(r)},100)}export{b as e};
