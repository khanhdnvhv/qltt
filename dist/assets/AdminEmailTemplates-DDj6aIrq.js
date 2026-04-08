import{u as B,r as d,j as e,O as m,w as X,K as A,S as q,ar as H,W as K,p as M,h as k,m as j,X as U,x as u}from"./index-ahO5Kl7j.js";import{P as F}from"./plus-BJ9lskau.js";import{E as T}from"./eye-Bf-gzcOn.js";import{C}from"./check-CC6nAgoR.js";import{S as G}from"./square-pen-vOCZXiRZ.js";import{C as O}from"./copy-Dgbx3n0K.js";import{T as V}from"./trash-2-D1CwkfKE.js";import{S as Q}from"./save-CLBGUIm2.js";import{U as Y}from"./undo-2-Dq6n3Fb9.js";const _=[{id:"all",label:"Tat ca",icon:m},{id:"system",label:"He thong",icon:A},{id:"marketing",label:"Marketing",icon:q},{id:"transactional",label:"Giao dich",icon:H},{id:"notification",label:"Thong bao",icon:K}],z=[{id:"welcome",name:"Chao mung hoc vien moi",subject:"Chao mung {{name}} den voi IELTS Pro! 🎉",category:"system",body:`Xin chao {{name}},

Chao mung ban den voi IELTS Pro! Chung toi rat vui khi ban da tham gia cong dong hoc IELTS cua chung toi.

Tai khoan cua ban da duoc kich hoat thanh cong. Hay bat dau hanh trinh chinh phuc IELTS ngay hom nay:

✅ Lam bai test dau vao de xac dinh trinh do
✅ Chon khoa hoc phu hop voi muc tieu cua ban
✅ Tham gia cong dong hoc tap

Neu ban can ho tro, dung ngai lien he voi chung toi qua email support@ieltspro.vn hoac hotline 1900-xxxx.

Chuc ban hoc tap hieu qua!
IELTS Pro Team`,variables:["name","email"],lastEdited:"2 ngay truoc",active:!0,sentCount:12450,openRate:78.5},{id:"enrollment",name:"Xac nhan ghi danh khoa hoc",subject:"Ban da ghi danh thanh cong {{course_name}}",category:"transactional",body:`Xin chao {{name}},

Chuc mung! Ban da ghi danh thanh cong khoa hoc "{{course_name}}".

📋 Thong tin khoa hoc:
- Ten khoa hoc: {{course_name}}
- Thoi gian: {{duration}}
- Giang vien: {{teacher_name}}
- Ma ghi danh: {{enrollment_id}}

💰 Thanh toan:
- So tien: {{amount}}
- Phuong thuc: {{payment_method}}
- Trang thai: Thanh cong

Ban co the bat dau hoc ngay tai: {{course_link}}

Chuc ban hoc tot!
IELTS Pro Team`,variables:["name","course_name","duration","teacher_name","enrollment_id","amount","payment_method","course_link"],lastEdited:"5 ngay truoc",active:!0,sentCount:8920,openRate:92.1},{id:"reminder",name:"Nhac nho hoc tap",subject:"{{name}} oi, ban da hoc bai hom nay chua? 📚",category:"notification",body:`Xin chao {{name}},

Chung toi nhan thay ban chua hoc bai nao trong {{inactive_days}} ngay qua.

🔥 Streak hien tai: {{streak}} ngay
📊 Tien do khoa hoc: {{progress}}%

Hay danh it nhat 30 phut moi ngay de duy tri streak va tien bo nhanh hon nhe!

👉 Tiep tuc hoc: {{dashboard_link}}

Meo: Hoc sinh on bai moi ngay co ty le dat band cao hon 3 lan!

IELTS Pro Team`,variables:["name","inactive_days","streak","progress","dashboard_link"],lastEdited:"1 ngay truoc",active:!0,sentCount:34200,openRate:45.3},{id:"promotion",name:"Khuyen mai khoa hoc",subject:"🎊 Giam {{discount}}% tat ca khoa hoc IELTS — chi trong hom nay!",category:"marketing",body:`Xin chao {{name}},

🎉 KHUYEN MAI DAC BIET!

Giam {{discount}}% tat ca khoa hoc IELTS tu ngay {{start_date}} den {{end_date}}.

🏆 Cac khoa hoc noi bat:
- IELTS Foundation ({{price_foundation}})
- IELTS Intermediate ({{price_intermediate}})
- IELTS Advanced ({{price_advanced}})

Su dung ma: {{promo_code}}

⏰ Uu dai co han! Dang ky ngay: {{courses_link}}

IELTS Pro Team`,variables:["name","discount","start_date","end_date","price_foundation","price_intermediate","price_advanced","promo_code","courses_link"],lastEdited:"1 tuan truoc",active:!1,sentCount:5600,openRate:35.8},{id:"certificate",name:"Chung nhan hoan thanh",subject:"Chuc mung {{name}}! Ban da hoan thanh {{course_name}} 🏆",category:"system",body:`Xin chao {{name}},

🎓 CHUC MUNG! Ban da hoan thanh thanh cong khoa hoc "{{course_name}}"!

📊 Ket qua cua ban:
- Diem tong: {{final_score}}
- Band du doan: {{predicted_band}}
- Thoi gian hoc: {{total_hours}} gio
- Xep hang: Top {{rank}}%

📜 Chung nhan cua ban da san sang tai:
{{certificate_link}}

Tiep tuc hanh trinh IELTS voi cac khoa hoc nang cao!

IELTS Pro Team`,variables:["name","course_name","final_score","predicted_band","total_hours","rank","certificate_link"],lastEdited:"3 ngay truoc",active:!0,sentCount:2340,openRate:88.9},{id:"password_reset",name:"Dat lai mat khau",subject:"Yeu cau dat lai mat khau IELTS Pro",category:"transactional",body:`Xin chao {{name}},

Chung toi nhan duoc yeu cau dat lai mat khau cho tai khoan {{email}}.

Nhap vao link ben duoi de dat lai mat khau:
{{reset_link}}

⚠️ Link nay se het han sau 30 phut.

Neu ban khong yeu cau dat lai mat khau, hay bo qua email nay.

IELTS Pro Team`,variables:["name","email","reset_link"],lastEdited:"2 tuan truoc",active:!0,sentCount:1890,openRate:95.2}],J={system:{bg:"bg-blue-50 dark:bg-blue-500/10",text:"text-blue-700 dark:text-blue-400"},marketing:{bg:"bg-purple-50 dark:bg-purple-500/10",text:"text-purple-700 dark:text-purple-400"},transactional:{bg:"bg-emerald-50 dark:bg-emerald-500/10",text:"text-emerald-700 dark:text-emerald-400"},notification:{bg:"bg-amber-50 dark:bg-amber-500/10",text:"text-amber-700 dark:text-amber-400"}};function de(){B("Email Templates");const[o,l]=d.useState(z),[x,E]=d.useState("all"),[g,S]=d.useState(""),[b,p]=d.useState(null),[L,y]=d.useState(null),[c,h]=d.useState({subject:"",body:""}),N=o.filter(a=>{if(x!=="all"&&a.category!==x)return!1;if(g.trim()){const t=g.toLowerCase();return a.name.toLowerCase().includes(t)||a.subject.toLowerCase().includes(t)}return!0}),I=a=>{p(a.id),h({subject:a.subject,body:a.body}),y(null)},W=()=>{b&&(l(a=>a.map(t=>t.id===b?{...t,subject:c.subject,body:c.body,lastEdited:"Vua xong"}:t)),p(null),u.success("Da luu template!"))},P=a=>{l(n=>n.map(s=>s.id===a?{...s,active:!s.active}:s));const t=o.find(n=>n.id===a);u.success(t!=null&&t.active?"Da tat template":"Da bat template")},D=a=>{const t={...a,id:`${a.id}_copy_${Date.now()}`,name:`${a.name} (ban sao)`,lastEdited:"Vua xong",sentCount:0,openRate:0};l(n=>[t,...n]),u.success("Da tao ban sao!")},R=a=>{l(t=>t.filter(n=>n.id!==a)),u.success("Da xoa template")},f=o.reduce((a,t)=>a+t.sentCount,0),$=(o.reduce((a,t)=>a+t.openRate,0)/o.length).toFixed(1);return e.jsxs("div",{children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-[24px] lg:text-[28px] text-[#1a1a2e] dark:text-foreground",style:{fontWeight:800},children:"Email Templates"}),e.jsx("p",{className:"text-muted-foreground text-[13.5px] mt-0.5",children:"Quan ly mau email he thong"})]}),e.jsxs("button",{className:"flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-[13px] shadow-sm hover:bg-primary/90 transition-colors",style:{fontWeight:600},children:[e.jsx(F,{className:"w-4 h-4"})," Tao template"]})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3 mb-6",children:[{icon:m,label:"Templates",value:o.length,color:"#3b82f6"},{icon:X,label:"Da gui",value:f>=1e3?`${(f/1e3).toFixed(1)}K`:f,color:"#10b981"},{icon:T,label:"TB Open Rate",value:`${$}%`,color:"#dc2f3c"},{icon:C,label:"Active",value:o.filter(a=>a.active).length,color:"#f59e0b"}].map(a=>e.jsxs("div",{className:"bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4 flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl flex items-center justify-center",style:{backgroundColor:a.color+"12"},children:e.jsx(a.icon,{className:"w-4 h-4",style:{color:a.color}})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[18px] text-[#1a1a2e] dark:text-foreground",style:{fontWeight:800},children:a.value}),e.jsx("p",{className:"text-[10px] text-muted-foreground",children:a.label})]})]},a.label))}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5",children:[e.jsx("div",{className:"flex flex-wrap gap-1.5",children:_.map(a=>e.jsxs("button",{onClick:()=>E(a.id),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all ${x===a.id?"bg-primary/10 text-primary":"bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`,style:{fontWeight:600},children:[e.jsx(a.icon,{className:"w-3 h-3"})," ",a.label]},a.id))}),e.jsxs("div",{className:"flex-1 relative sm:max-w-xs ml-auto",children:[e.jsx(M,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"}),e.jsx("input",{type:"text",value:g,onChange:a=>S(a.target.value),placeholder:"Tim template...",className:"w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/30 transition-colors placeholder:text-muted-foreground/40"})]})]}),e.jsx("div",{className:"space-y-3",children:e.jsx(k,{mode:"popLayout",children:N.map((a,t)=>{var w;const n=J[a.category],s=b===a.id,v=L===a.id;return e.jsxs(j.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,height:0},transition:{delay:t*.03},layout:!0,className:"bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden",children:[e.jsxs("div",{className:"flex items-center gap-3 p-5",children:[e.jsx("div",{className:`w-10 h-10 rounded-xl flex items-center justify-center ${n.bg} shrink-0`,children:e.jsx(m,{className:"w-4 h-4",style:{color:n.text.includes("blue")?"#3b82f6":n.text.includes("purple")?"#8b5cf6":n.text.includes("emerald")?"#10b981":"#f59e0b"}})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h3",{className:"text-[14px] text-[#1a1a2e] dark:text-foreground truncate",style:{fontWeight:700},children:a.name}),e.jsx("span",{className:`text-[9px] px-1.5 py-0.5 rounded-full ${n.bg} ${n.text} shrink-0`,style:{fontWeight:600},children:(w=_.find(r=>r.id===a.category))==null?void 0:w.label}),!a.active&&e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-muted-foreground",style:{fontWeight:600},children:"Tat"})]}),e.jsx("p",{className:"text-[11.5px] text-muted-foreground truncate mt-0.5",children:a.subject})]}),e.jsxs("div",{className:"flex items-center gap-4 shrink-0",children:[e.jsxs("div",{className:"hidden sm:block text-right",children:[e.jsxs("p",{className:"text-[11px] text-[#1a1a2e] dark:text-foreground",style:{fontWeight:600},children:[a.sentCount.toLocaleString()," gui"]}),e.jsxs("p",{className:"text-[10px] text-muted-foreground",children:["Open: ",a.openRate,"%"]})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{onClick:()=>y(v?null:a.id),className:`p-2 rounded-lg transition-colors ${v?"bg-primary/10 text-primary":"hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground"}`,title:"Xem truoc",children:e.jsx(T,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>I(a),className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground",title:"Chinh sua",children:e.jsx(G,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>D(a),className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground",title:"Nhan ban",children:e.jsx(O,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>P(a.id),className:`p-2 rounded-lg transition-colors ${a.active?"hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600":"hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground"}`,title:a.active?"Tat":"Bat",children:a.active?e.jsx(C,{className:"w-4 h-4"}):e.jsx(U,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>R(a.id),className:"p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500",title:"Xoa",children:e.jsx(V,{className:"w-4 h-4"})})]})]})]}),e.jsx(k,{children:v&&!s&&e.jsx(j.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},className:"border-t border-gray-100 dark:border-border overflow-hidden",children:e.jsxs("div",{className:"p-5 bg-[#f8f9fb] dark:bg-muted",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:"text-[11px] text-muted-foreground",style:{fontWeight:600},children:"Subject:"}),e.jsx("span",{className:"text-[12px] text-[#1a1a2e] dark:text-foreground",style:{fontWeight:600},children:a.subject})]}),e.jsx("div",{className:"bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5",children:e.jsx("pre",{className:"text-[12.5px] text-[#333] dark:text-foreground/85 whitespace-pre-wrap leading-relaxed",style:{fontFamily:"inherit"},children:a.body})}),e.jsxs("div",{className:"flex items-center gap-2 mt-3 flex-wrap",children:[e.jsx("span",{className:"text-[10px] text-muted-foreground",style:{fontWeight:600},children:"Variables:"}),a.variables.map(r=>e.jsx("span",{className:"text-[9px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",style:{fontWeight:500},children:"{{"+r+"}}"},r))]}),e.jsxs("p",{className:"text-[9px] text-muted-foreground mt-2",children:["Cap nhat: ",a.lastEdited]})]})})}),e.jsx(k,{children:s&&e.jsx(j.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},className:"border-t border-gray-100 dark:border-border overflow-hidden",children:e.jsxs("div",{className:"p-5",children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{className:"text-[11px] text-muted-foreground mb-1 block",style:{fontWeight:600},children:"Subject"}),e.jsx("input",{type:"text",value:c.subject,onChange:r=>h(i=>({...i,subject:r.target.value})),className:"w-full bg-[#f8f9fb] dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/30 transition-colors"})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{className:"text-[11px] text-muted-foreground mb-1 block",style:{fontWeight:600},children:"Body"}),e.jsx("textarea",{value:c.body,onChange:r=>h(i=>({...i,body:r.target.value})),rows:10,className:"w-full bg-[#f8f9fb] dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3 text-[13px] text-foreground outline-none focus:border-primary/30 transition-colors resize-y"})]}),e.jsxs("div",{className:"flex items-center gap-2 mb-3 flex-wrap",children:[e.jsx("span",{className:"text-[10px] text-muted-foreground",style:{fontWeight:600},children:"Variables:"}),a.variables.map(r=>e.jsx("button",{onClick:()=>{h(i=>({...i,body:i.body+`{{${r}}}`}))},className:"text-[9px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors cursor-pointer",style:{fontWeight:500},children:"{{"+r+"}}"},r))]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:W,className:"flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-[12px] shadow-sm",style:{fontWeight:600},children:[e.jsx(Q,{className:"w-3.5 h-3.5"})," Luu"]}),e.jsxs("button",{onClick:()=>p(null),className:"flex items-center gap-2 bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground px-4 py-2 rounded-xl text-[12px]",style:{fontWeight:500},children:[e.jsx(Y,{className:"w-3.5 h-3.5"})," Huy"]})]})]})})})]},a.id)})})}),N.length===0&&e.jsxs("div",{className:"text-center py-12",children:[e.jsx(m,{className:"w-8 h-8 text-muted-foreground/20 mx-auto mb-3"}),e.jsx("p",{className:"text-muted-foreground text-[14px]",children:"Khong tim thay template nao"})]})]})}export{de as AdminEmailTemplates};
