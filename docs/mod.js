var f=(t,e=new WeakMap,r)=>n=>e.has(n)?e.get(n):(e.set(n,r=t(n)),r);var x="\0",P=f(()=>({})),d=function(t,e,r){x.includes(`\0${t}\0`)||(globalThis.addEventListener(t,n=>P(n.target)[t]?.forEach?.(o=>o(n)),{passive:!0}),x+=t+"\0"),(P(r)[t]||=[]).push(e)};var a=(t,e)=>t?.constructor===e,p=t=>Object.isFrozen(t)&&a(t,Array);var{Promise:y,Function:b}=globalThis,T=Symbol.for("PTR_IDENTIFIER"),C={},$=()=>String.fromCharCode(...A()),l=t=>t?.[T],A=function*(t=52){let e=0;for(;e++<t;){let r=Math.floor(Math.random()*31);yield 127+r+(r>141)+(r>156)}},S={or:(t,e)=>t||e,and:(t,e)=>t&&e,xor:(t,e)=>t^e,sum:(t,e)=>t+e,sub:(t,e)=>t-e,mul:(t,e)=>t*e,div:(t,e)=>t/e,mod:(t,e)=>t%e},F=Object.assign({[Symbol.toPrimitive]([t],e){return typeof e=="string"?e==="string"&&a(t,b)?this.publish():t.toString():e===T},watch(t,e){return e&&t[2].set(e,[t[1].push(e)-1,!0]),this},abort(t,e){if(e){let r=t[2].get(e);r[1]=!1,delete t[1][r?.[0]]}return this},into([t],e=r=>r){let r=o=>{let i=e(o);return a(i,y)?(i.then(s=>n.$=s),void 0):n.$=i},n=u();return r(t),this.watch(r),n},until(t,e){return new y(r=>{let n=o=>(a(e,b)?e(o):o===e)?(this.abort(n),r(this)):0;this.watch(n)})},switch(){return this.$=!this.$,this},not(){return this.into(t=>!t)},bool(){return this.into(t=>!!t)},isit(t,e){return this.into(r=>r?t:e)},tick(){let t=!1;return this.into(()=>t=!t)},toString(t,e){let r=l(e),n=this.into(o=>o.toString(r?e.$:e));return r&&e.watch(o=>n.$=this.$.toString(o)),n},publish(t){let e=Symbol(t[3]);return C[e]=this,e},text(){let t=new Text(this.$);return this.watch(e=>t.textContent=e),[t]},timeout(t,e){let r=u(this.$),n;return this.watch(o=>{clearTimeout(n),n=setTimeout(()=>r.$=o,l(e)?e.$:e)}),r}},...Object.keys(S).map(t=>({[t](e,r){let n=l(r),o=S[t],i=this.into(s=>o(s,n?r.$:r));return n&&r.watch(s=>i.$=o(this.$,s)),i}}))),O=function(t,e,r,n){let o=t[2];return(r||e!==t[0])&&(t[0]=e,t[1].forEach(i=>o.get(i)?.[1]?i(e):0)),n},j=function(t,...e){let r=e.map((o,i)=>l(o)?o.watch(s=>(r[i]=s,n.$=t.$[prop](...r))).$:o),n=t.into(o=>o[prop](...r));return n},W=function(t,e,r,n,o){let[i]=t;return n==="$"?i:n==="refresh"?e.bind(null,i,!0,o):n==="constructor"||n===T?!0:n===Symbol.hasInstance?()=>!1:F[n]?.bind?.(o,t)||(a(i[n],b)?j.bind(null,o):o.into(s=>s[n]))},H=function(t,e,r,n,o,i,s){if(e.writable)if(i=="$"){let c=r?r(s):s;a(c,y)?c.then(n):n(c)}else t[0][i]=l(s)?s.watch(c=>t[0][i]=c).$:s;return!0},u=(t,[e,r]=[])=>{let n=[],o=new WeakMap,i=Object.assign({name:"$",writable:!0},r),s=[t,n,o,w+i.name],c=O.bind(null,s);return new Proxy(Object.defineProperties(Object(function(...m){let[h]=s;return a(h,b)?h.apply(null,m):h}),{name:{value:i.name}}),{get:W.bind(null,s,c),set:H.bind(null,s,i,e,c)})},w;for(;(w=$())in globalThis;);Object.defineProperty(globalThis,w,{value:t=>C[t],configurable:!1,enumerable:!1});var L=f(t=>{let e=$();return[t.join(e),new RegExp(e,"g")]}),k=(t,e)=>{let[r,n]=L(t),o=e.map((c,m)=>l(c)?c.watch(()=>(o[m]=c.$,s.$=i())).$:c),i=(c=0)=>r.replaceAll(n,()=>o[c++]),s=u(i());return s},E={};var ct=new Proxy({},{get(t,e){}}),lt=new Proxy((t,...e)=>(p(t)&&p(t?.raw)?k:u)(t,e),{get:(t,e)=>{if(e===Symbol.hasInstance)return l;if(e==="this")return;let r=E[e];return!r&&!a(globalThis[e],Function)&&(r=E[e]=u(globalThis[e]),d("resize",({target:n})=>r.$=n[e],globalThis)),r||N[e]}}),N=u(globalThis);var I=Symbol.for("HTML_IDENTIFIER"),_=document.createDocumentFragment(),z={[Symbol.toPrimitive](t){return typeof t=="string"?[...this[Symbol.iterator]().map(e=>e.outerHTML)].join(""):t===I},toString(){return this[Symbol.toPrimitive]("string")}},B={get(t,e){let r=t[e];return a(r,Function)?r.bind(t):r}},R=(t,e)=>Reflect.ownKeys(e).forEach(D.bind(null,t,e)),D=function(t,e,r){let[n,o]=t,i=e[r],s=typeof r;if(s=="symbol"){let c=globalThis[r.description.slice(0,52)]?.(r);if(!l(c))return;let m=c.$(i,o);if(m?.constructor!==Object)return;R(t,m)}else s=="string"&&(l(i)?(o[r]=i.watch(c=>o[r]=c).$,"\0value\0checked\0".includes(`\0${r}\0`)&&r in o&&d("input",({target:{[r]:c}})=>i.$="number\0range".includes(o.type)?Number(c):c,o)):o[r]=i,r=="id"&&!(i in n)&&(n[i]=new Proxy(o,B)))},G=function([t,e],r,n,o,i){let s=r[i];e[i]?R([n,o],s):o.replaceWith(...s[Symbol.toPrimitive]?.(I)?s:l(s)?s.text():[new Text(s)]),o.removeAttribute(t)},K=function(t,e){return e(t),this},Z=function(t,e){let r=t[2](),n={};return r.querySelectorAll(`[${t[0]}]`).forEach(G.bind(null,t,e,n)),Object.assign(r.childNodes,z,{then:K.bind(null,n)})},q=f(t=>{let e=t.join(""),r=0,n="t";for(;e.includes(n+=BigInt(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)).toString(36)););e=t.join(n);let o=n.length,i=[...e.matchAll(new RegExp(`<(?:(!--|\\/[^a-zA-Z])|(\\/?[a-zA-Z][^>\\s]*)|(\\/?$))[\\s].*?${n}`,"g"))].map(({0:{length:m},index:h})=>h+m),s=[],c=document.createElement("div");return _.appendChild(c),c.innerHTML=e.replaceAll(n,(m,h)=>(s[r++]=i.includes(h+o))?n:`<br ${n}>`),Z.bind(null,[n,s,c.cloneNode.bind(c,!0)])}),dt=(t,...e)=>q(t)(e);var g=(t,e)=>{let r={},n=new Proxy({},{get(s,c){return c===Symbol.toPrimitive?i:c==="$"?i():(r[c]||=u(t.bind(null,c),void 0,{name:e?e(c):""})).publish()}}),o=u(s=>{let c={};return Reflect.ownKeys(s).forEach(m=>c[n[m]]=s[m]),c}),i=()=>o.publish();return n};var $t=g(d,t=>"on."+t);var v=/[A-Z]{1}/g,Q={},X=t=>Q[t]||="-"+t.toLowerCase(),J={},M=t=>J[t]||=t.replaceAll(v,X),St=g(function(t,e,{style:r}){let n=M(t);r.setProperty(n,l(e)?e.watch(o=>r.setProperty(n,o)).$:e)},t=>"css-"+M(t));export{lt as $,St as css,dt as h,d as listen,$t as on};
