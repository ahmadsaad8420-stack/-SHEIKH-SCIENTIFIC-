(() => {
const $ = id => document.getElementById(id);
let expression = '', answer = 0, memory = 0, angleMode = 'DEG', justEvaluated = false;
const STORAGE_THEME = 'sheikhCalcTheme';
const LEGACY_STORAGE_HISTORY = 'sheikhCalcHistory';
const MAX_EXPRESSION_LENGTH = 240;
function safeGet(key){try{return localStorage.getItem(key)}catch{return null}}
function safeSet(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function safeRemove(key){try{localStorage.removeItem(key)}catch{}}
const systemColorScheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
let themeMode = safeGet(STORAGE_THEME);
if(!['system','light','dark'].includes(themeMode))themeMode='system';
function loadHistory(){
  try{
    const raw=safeGet(LEGACY_STORAGE_HISTORY);
    const parsed=raw?JSON.parse(raw):[];
    if(!Array.isArray(parsed))return [];
    return parsed.slice(0,40).filter(x=>x&&typeof x.expr==='string'&&typeof x.res==='string'
      &&x.expr.length<=MAX_EXPRESSION_LENGTH&&x.res.length<=80).map(x=>({expr:x.expr,res:x.res}));
  }catch{return []}
}
let history = loadHistory();
const display = () => { $('expression').textContent = expression || 'Ready for calculation'; $('result').textContent = expression ? preview() : '0'; };
function preview(){try{return format(evaluate(expression))}catch{return '…'}}
function format(n){
  if(!Number.isFinite(n)) throw Error('Math error');
  if(Math.abs(n)<1e-12)n=0;
  const magnitude=Math.abs(n);
  let text;
  if(magnitude>=1e12||magnitude>0&&magnitude<1e-9){
    text=n.toExponential(12).replace(/\.?0+e/,'e');
  }else{
    text=Number(n.toPrecision(12)).toString();
  }
  const scientific=text.match(/^(.+)e([+-]?\d+)$/);
  return scientific?`${scientific[1]}×10^${Number(scientific[2])}`:text;
}
function factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw Error('Invalid factorial');let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function evaluate(input){
 let s=input.replace(/×10\^/g,'*10^').replace(/π/g,'PI').replace(/\bAns\b/g,'ANS').replace(/\be\b/gi,'E');
 // Insert implicit multiplication for common adjacent tokens.
 s=s.replace(/(\d|\)|PI|E|ANS)(?=(PI|E|ANS|sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|floor|ceil|round|exp|\())/g,'$1*');
 s=s.replace(/\)(?=\d|\.)/g,')*');
 s=s.replace(/(PI|E|ANS)(?=\d)/g,'$1*');
 const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|(?:sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|floor|ceil|round|exp|PI|ANS|E)|[()+\-*/%^!]/g);
 if(!tokens||tokens.join('')!==s.replace(/\s/g,'')) throw Error('Invalid expression');
 let i=0;
 const peek=()=>tokens[i], take=()=>tokens[i++];
 const toRad=x=>angleMode==='DEG'?x*Math.PI/180:x;
 function primary(){
  let t=take(),v;
  if(t==='('){v=add();if(take()!==')')throw Error('Missing )');return v}
  if(/^(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|floor|ceil|round|exp)$/.test(t)){
   if(take()!=='(')throw Error('Expected (');v=add();if(take()!==')')throw Error('Missing )');
   switch(t){
    case'sin':return Math.sin(toRad(v));case'cos':return Math.cos(toRad(v));case'tan':{const radians=toRad(v);if(Math.abs(Math.cos(radians))<1e-12)throw Error('Domain error');return Math.tan(radians)}
    case'asin':if(v < -1 || v > 1)throw Error('Domain error');return angleMode==='DEG'?Math.asin(v)*180/Math.PI:Math.asin(v);
    case'acos':if(v < -1 || v > 1)throw Error('Domain error');return angleMode==='DEG'?Math.acos(v)*180/Math.PI:Math.acos(v);
    case'atan':return angleMode==='DEG'?Math.atan(v)*180/Math.PI:Math.atan(v);
    case'log':if(v<=0)throw Error('Domain error');return Math.log10(v);
    case'ln':if(v<=0)throw Error('Domain error');return Math.log(v);
    case'sqrt':if(v<0)throw Error('Domain error');return Math.sqrt(v);
    case'cbrt':return Math.cbrt(v);
    case'abs':return Math.abs(v);case'floor':return Math.floor(v);case'ceil':return Math.ceil(v);case'round':return Math.round(v);case'exp':return Math.exp(v)
   }
  }
  if(t==='PI')return Math.PI;if(t==='E')return Math.E;if(t==='ANS')return answer;
  if(t===undefined)throw Error('Incomplete');
  if(/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))return Number(t);
  throw Error('Unexpected token');
 }
 function postfix(){let x=primary();while(peek()==='!'){take();x=factorial(x)}return x}
 function power(){let x=postfix();if(peek()==='^'){take();x=Math.pow(x,unary())}return x}
 function unary(){if(peek()==='+'){take();return unary()}if(peek()==='-'){take();return -unary()}return power()}
 function mul(){let x=unary();while(['*','/','%'].includes(peek())){let op=take(),y=unary();if((op==='/'||op==='%')&&y===0)throw Error('Division by zero');x=op==='*'?x*y:op==='/'?x/y:x%y}return x}
 function add(){let x=mul();while(peek()==='+'||peek()==='-'){let op=take(),y=mul();x=op==='+'?x+y:x-y}return x}
 let out=add();if(i!==tokens.length)throw Error('Invalid expression');if(!Number.isFinite(out))throw Error('Math error');return out;
}
function calculate(){if(!expression)return;try{let val=evaluate(expression),formatted=format(val);answer=val;$('result').textContent=formatted;addHistory(expression,formatted);expression=formatted;justEvaluated=true;$('expression').textContent='= '+formatted;}catch(e){toast(['Math error','Domain error','Division by zero','Invalid factorial'].includes(e.message)?e.message:'Check expression')}}
function addHistory(expr,res){
  history.unshift({expr:String(expr).slice(0,MAX_EXPRESSION_LENGTH),res:String(res).slice(0,80)});
  history=history.slice(0,40);
  renderHistory()
}
function renderHistory(){let list=$('historyList');if(!history.length){list.innerHTML='<div class="empty">Your calculations will appear here.<br>Start calculating ✦</div>';return}list.innerHTML='';history.forEach(item=>{let el=document.createElement('button');el.className='history-item';el.type='button';el.setAttribute('aria-label',`Reuse calculation ${item.expr} equals ${item.res}`);let hx=document.createElement('div');hx.className='hx';hx.textContent=item.expr;let hr=document.createElement('div');hr.className='hr';hr.textContent='= '+item.res;el.append(hx,hr);el.addEventListener('click',()=>{expression=item.expr;justEvaluated=false;display()});list.appendChild(el)})}
function insert(v){
  if(justEvaluated){if(!['+','-','*','/','%','^','^2','!','×10^'].includes(v))expression='';justEvaluated=false}
  if(expression==='Error') expression='';
  if(expression.length + String(v).length > MAX_EXPRESSION_LENGTH){toast('Expression is too long');return}
  if(v==='.'&&!expression)v='0.';
  expression+=v;display()
}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1500)}
$('keys').addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;let a=b.dataset.action,v=b.dataset.value;if(a==='clear'){expression='';justEvaluated=false;$('expression').textContent='Cleared';$('result').textContent='0'}else if(a==='delete'){expression=expression.slice(0,-1);justEvaluated=false;display()}else if(a==='equals')calculate();else if(a==='toggle-sign'){if(expression){expression=expression.startsWith('-(')&&expression.endsWith(')')?expression.slice(2,-1):`-(${expression})`;justEvaluated=false;display()}}else if(a==='reciprocal'){try{const source=expression||format(answer);const n=evaluate(source);if(n===0)throw Error('Division by zero');expression=`1/(${source})`;justEvaluated=false;calculate()}catch(e){toast(e.message==='Division by zero'?e.message:'Enter a valid value first')}}else if(a==='memory-clear'){memory=0;toast('Memory cleared')}else if(a==='memory-recall'){insert(format(memory))}else if(a==='memory-add'||a==='memory-subtract'){try{const n=expression?evaluate(expression):answer;memory+=a==='memory-add'?n:-n;toast('Memory updated')}catch{toast('Enter a valid value first')}}else insert(v)});
$('degBtn').onclick=()=>setMode('DEG');$('radBtn').onclick=()=>setMode('RAD');
function setMode(m){angleMode=m;$('degBtn').classList.toggle('active',m==='DEG');$('radBtn').classList.toggle('active',m==='RAD');$('degBtn').setAttribute('aria-pressed',String(m==='DEG'));$('radBtn').setAttribute('aria-pressed',String(m==='RAD'));display()}
function applyTheme(isLight){document.body.classList.toggle('light',isLight);$('themeBtn').textContent=isLight?'☾':'☀';$('themeBtn').setAttribute('aria-label',isLight?'Switch to dark theme':'Switch to light theme');document.querySelector('meta[name="theme-color"]').setAttribute('content',isLight?'#f3f6fb':'#0b1220')}
function setThemeMode(mode,persist=true){themeMode=mode;applyTheme(mode==='system'?Boolean(systemColorScheme&&systemColorScheme.matches):mode==='light');$('autoThemeBtn').setAttribute('aria-pressed',String(mode==='system'));if(persist)safeSet(STORAGE_THEME,mode)}
$('themeBtn').onclick=()=>setThemeMode(document.body.classList.contains('light')?'dark':'light');
$('autoThemeBtn').onclick=()=>setThemeMode('system');
if(systemColorScheme){
  const handleSystemThemeChange=()=>{if(themeMode==='system')applyTheme(systemColorScheme.matches)};
  if(systemColorScheme.addEventListener)systemColorScheme.addEventListener('change',handleSystemThemeChange);
  else if(systemColorScheme.addListener)systemColorScheme.addListener(handleSystemThemeChange);
}
setThemeMode(themeMode,false);
$('copyResult').addEventListener('click',async()=>{
  const text=$('result').textContent;
  if(!text||text==='…'){toast('Copy not available in this browser');return}
  let fallback=null;
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(text);
    }else{
      fallback=document.createElement('textarea');
      fallback.value=text;
      fallback.style.position='fixed';
      fallback.style.opacity='0';
      document.body.appendChild(fallback);
      fallback.select();
      if(!document.execCommand('copy'))throw Error();
    }
    toast('Result copied');
  }catch{
    toast('Copy not available in this browser');
  }finally{
    if(fallback){fallback.remove()}
  }
});
$('clearHistory').onclick=()=>{
  history=[];
  safeRemove(LEGACY_STORAGE_HISTORY);
  renderHistory();
  toast('History cleared');
};
document.addEventListener('keydown',e=>{
  if(!$('privacyDialog').hidden||e.ctrlKey||e.metaKey||e.altKey)return;
  const target=e.target;
  const isInteractive=target instanceof Element&&target.closest('button,a,input,textarea,select,[contenteditable="true"]');
  if(/^[0-9.]$/.test(e.key)){insert(e.key)}
  else if(['+','-','*','/','(',')','%','^','!','e','E'].includes(e.key)){insert(e.key==='E'?'e':e.key)}
  else if((e.key==='Enter'||e.key==='=')&&!isInteractive){e.preventDefault();calculate()}
  else if(e.key==='Backspace'&&!isInteractive){expression=expression.slice(0,-1);justEvaluated=false;display()}
  else if(e.key==='Escape'){expression='';justEvaluated=false;display()}
});
let privacyOpener=null;
function openPrivacy(){
  privacyOpener=document.activeElement;
  $('privacyDialog').hidden=false;
  $('calculatorApp').inert=true;
  document.body.classList.add('modal-open');
  $('closePrivacy').focus();
}
function closePrivacy(){
  $('privacyDialog').hidden=true;
  $('calculatorApp').inert=false;
  document.body.classList.remove('modal-open');
  if(privacyOpener instanceof HTMLElement)privacyOpener.focus();
  else $('privacyBtn').focus();
}
$('privacyBtn').addEventListener('click',openPrivacy);
$('footerPrivacy').addEventListener('click',openPrivacy);
$('closePrivacy').addEventListener('click',closePrivacy);
$('privacyDialog').addEventListener('click',e=>{if(e.target===$('privacyDialog'))closePrivacy()});
$('privacyDialog').addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closePrivacy();return}
  if(e.key!=='Tab')return;
  const focusable=Array.from($('privacyDialog').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el=>!el.disabled);
  if(!focusable.length){e.preventDefault();return}
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
$('clearAllData').addEventListener('click',()=>{
  history=[];memory=0;safeRemove(LEGACY_STORAGE_HISTORY);safeRemove(STORAGE_THEME);setThemeMode('system',false);
  renderHistory();toast('All local app data cleared');
});
renderHistory();display();
if('serviceWorker'in navigator&&['http:','https:'].includes(location.protocol)){
  navigator.serviceWorker.register('./sw.js').catch(error=>{
    console.error('Service worker registration failed:',error);
    toast('Offline mode unavailable');
  });
}
})();
