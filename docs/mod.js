var g=t=>{let e=new WeakMap;return r=>{let n=e.get(r);return n||e.set(r,n=t(r)),n}};var M="\0",R=g(()=>({})),d=function(t,e,r){M.includes(`\0${t}\0`)||(globalThis.addEventListener(t,n=>R(n.target)[t]?.forEach?.(o=>o(n)),{passive:!0}),M+=t+"\0"),(R(r)[t]||=[]).push(e)};var f=(t,e)=>t?.constructor===e,x=t=>Object.isFrozen(t)&&f(t,Array);var{Promise:P,Function:T}=globalThis,S=Symbol.for("PTR_IDENTIFIER"),m=t=>t?.[S],C=()=>String.fromCharCode(...B()),A={},B=function*(t=52){let e=0;for(;e++<t;){let r=Math.floor(Math.random()*31);yield 127+r+(r>141)+(r>156)}},j={or:(t,e)=>t||e,and:(t,e)=>t&&e,xor:(t,e)=>t^e,sum:(t,e)=>t+e,sub:(t,e)=>t-e,mul:(t,e)=>t*e,div:(t,e)=>t/e,mod:(t,e)=>t%e},W=Object.assign({[Symbol.toPrimitive]([t],e){return typeof e=="string"?e==="string"&&f(t,T)?this.publish():t.toString():e===S},watch(t,e){return e&&t[2].set(e,[t[1].push(e)-1,!0]),this},abort(t,e){if(e){let r=t[2].get(e);r[1]=!1,delete t[1][r?.[0]]}return this},into([t],e=r=>r){let r=o=>{let c=e(o);return f(c,P)?(c.then(s=>n.$=s),void 0):n.$=c},n=b();return r(t),this.watch(r),n},until(t,e){return new P(r=>{let n=o=>(f(e,T)?e(o):o===e)?(this.abort(n),r(this)):0;this.watch(n)})},switch(){return this.$=!this.$,this},not(){return this.into(t=>!t)},bool(){return this.into(t=>!!t)},isit(t,e){return this.into(r=>r?t:e)},tick(){let t=!1;return this.into(()=>t=!t)},toString(t,e){let r=m(e),n=this.into(o=>o.toString(r?e.$:e));return r&&e.watch(o=>n.$=this.$.toString(o)),n},publish(t){let e=Symbol(t[3]);return A[e]=this,e},text(){let t=new Text(this.$);return this.watch(e=>t.textContent=e),[t]},timeout(t,e){let r=b(this.$),n;return this.watch(o=>{clearTimeout(n),n=setTimeout(()=>r.$=o,m(e)?e.$:e)}),r}},...Object.keys(j).map(t=>({[t](e,r){let n=m(r),o=j[t],c=this.into(s=>o(s,n?r.$:r));return n&&r.watch(s=>c.$=o(this.$,s)),c}}))),b=(t,[e,r]=[])=>{let n=[],o=new WeakMap,c=Object.assign({name:"$",writable:!0},r),s=function(u,l,a){return(l||u!==i[0])&&(i[0]=u,n.forEach(h=>o.get(h)?.[1]?h(u):0)),a},i=[t,n,o,E+(r?.name||"")];return new Proxy(Object.defineProperties(Object(function(...u){let[l]=i;return f(l,T)?l.apply(null,u):l}),{name:{value:c.name}}),{get(u,l,a){let[h]=i;return l==="$"?h:l==="refresh"?s.bind(null,h,!0,a):l==="constructor"||l===S?!0:l===Symbol.hasInstance?()=>!1:W[l]?.bind?.(a,i)||(f(h[l],T)?function(...y){let w=y.map((p,N)=>m(p)?p.watch(z=>(w[N]=z,I.$=a.$[l](...w))).$:p),I=a.into(p=>p[l](...w));return I}:a.into(y=>y[l]))},set(u,l,a){if(c.writable)if(l=="$"){let h=e?e(a):a;f(h,P)?h.then(s):s(h)}else i[0][l]=m(a)?a.watch(h=>i[0][l]=h).$:a;return!0}})},E;for(;(E=C())in globalThis;);Object.defineProperty(globalThis,E,{value:t=>A[t],configurable:!1,enumerable:!1});var _=g(t=>{let e=C();return[t.join(e),new RegExp(e,"g")]}),k=(t,e)=>{let[r,n]=_(t),o=e.map((i,u)=>m(i)?i.watch(()=>(o[u]=i.$,s.$=c())).$:i),c=(i=0)=>r.replaceAll(n,()=>o[i++]),s=b(c());return s},F={};var mt=new Proxy((t,...e)=>(x(t)&&x(t?.raw)?k:b)(t,e),{get:(t,e)=>{if(e===Symbol.hasInstance)return m;let r=F[e];return!r&&!f(globalThis[e],Function)&&(r=F[e]=b(globalThis[e]),d("resize",({target:n})=>r.$=n[e],globalThis)),r||D[e]}}),D=b(globalThis);var O=Symbol.for("HTML_IDENTIFIER"),G=document.createDocumentFragment(),K={[Symbol.toPrimitive](t){return typeof t=="string"?[...this[Symbol.iterator]().map(e=>e.outerHTML)].join(""):t===O},toString(){return this[Symbol.toPrimitive]("string")}},Z={get(t,e){let r=t[e];return f(r,Function)?r.bind(t):r}},H=(t,e)=>Reflect.ownKeys(e).forEach(q.bind(null,t,e)),q=function(t,e,r){let[n,o]=t,c=e[r],s=typeof r;if(s=="symbol"){let i=globalThis[r.description.slice(0,52)]?.(r);if(!m(i))return;let u=i.$(c,o);if(u?.constructor!==Object)return;H(t,u)}else s=="string"&&(m(c)?(o[r]=c.watch(i=>o[r]=i).$,"\0value\0checked\0".includes(`\0${r}\0`)&&r in o&&d("input",({target:{[r]:i}})=>c.$="number\0range".includes(o.type)?Number(i):i,o)):r=="id"&&!(c in n)?n[c]=new Proxy(o,Z):o[r]=c)},Q=function([t,e],r,n,o,c){let s=r[c];e[c]?H([n,o],s):o.replaceWith(...s[Symbol.toPrimitive]?.(O)?s:m(s)?s.text():[new Text(s)]),o.removeAttribute(t)},X=function(t,e){let r=t[2](),n={};return r.querySelectorAll(`[${t[0]}]`).forEach(Q.bind(null,t,e,n)),Object.assign(r.childNodes,K,{then(o){return o(n),this}})},J=g(t=>{let e=t.join(""),r=0,n="t";for(;e.includes(n+=BigInt(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)).toString(36)););e=t.join(n);let o=n.length,c=[...e.matchAll(new RegExp(`<(?:(!--|\\/[^a-zA-Z])|(\\/?[a-zA-Z][^>\\s]*)|(\\/?$))[\\s].*?${n}`,"g"))].map(({0:{length:u},index:l})=>l+u),s=[],i=document.createElement("div");return G.appendChild(i),i.innerHTML=e.replaceAll(n,(u,l)=>(s[r++]=c.includes(l+o))?n:`<br ${n}>`),X.bind(null,[n,s,i.cloneNode.bind(i,!0)])}),dt=(t,...e)=>J(t)(e);var $=(t,e)=>{let r={},n=new Proxy({},{get(s,i){return i===Symbol.toPrimitive?c:i==="$"?c():(r[i]||=b(t.bind(null,i),void 0,{name:e?e(i):""})).publish()}}),o=b(s=>{let i={};return Reflect.ownKeys(s).forEach(u=>i[n[u]]=s[u]),i}),c=()=>o.publish();return n};var xt=$(d,t=>"on."+t);var U=/[A-Z]{1}/g,Y={},v=t=>Y[t]||="-"+t.toLowerCase(),V={},L=t=>V[t]||=t.replaceAll(U,v),Et=$(function(t,e,{style:r}){let n=L(t);r.setProperty(n,m(e)?e.watch(o=>r.setProperty(n,o)).$:e)},t=>"css-"+L(t));export{mt as $,Et as css,dt as h,xt as on};
