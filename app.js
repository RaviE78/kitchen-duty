let duties=[],index=0;const $=id=>document.getElementById(id);const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
async function loadDuties(){const {data,error}=await client.from("duties").select("id,duty_date,room_number").order("duty_date",{ascending:true}).order("id",{ascending:true});if(error){$("status").textContent="Database connection error.";return}duties=data||[];index=Math.min(index,Math.max(0,duties.length-1));render();renderAdminList()}
function render(){const c=$("card");if(!duties.length){$("date").textContent="No duties";$("room").textContent="—";$("dots").innerHTML="";$("status").textContent="No duties scheduled.";c.style.background="linear-gradient(135deg,#334155,#0f172a)";return}const d=duties[index];const dutyDay = new Date(d.duty_date + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dutyKey = dutyDay.toDateString();
  const todayKey = today.toDateString();
  const tomorrowKey = tomorrow.toDateString();

  if (dutyKey === todayKey) {
    $("date").textContent = "Today";
  } else if (dutyKey === tomorrowKey) {
    $("date").textContent = "Tomorrow";
  } else {
    $("date").textContent = dutyDay.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
  }$("room").textContent=d.room_number;const h=(index*67)%360;c.style.background=`linear-gradient(135deg,hsl(${h} 78% 58%),hsl(${(h+55)%360} 78% 42%))`;$("dots").innerHTML=duties.map((_,i)=>`<span class="dot ${i===index?"active":""}"></span>`).join("");$("status").textContent=`${index+1} of ${duties.length}`}
function move(dir){if(duties.length<2)return;$("card").classList.add(dir>0?"swipe-left":"swipe-right");setTimeout(()=>{index=(index+dir+duties.length)%duties.length;$("card").classList.remove("swipe-left","swipe-right");render()},180)}
$("prev").onclick=()=>move(-1);$("next").onclick=()=>move(1);let sx=0;$("card").addEventListener("touchstart",e=>sx=e.changedTouches[0].clientX,{passive:true});$("card").addEventListener("touchend",e=>{let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45)move(dx<0?1:-1)});
$("adminBtn").onclick=()=>$("adminPanel").classList.toggle("hidden");$("closeAdmin").onclick=()=>$("adminPanel").classList.add("hidden");
$("loginBtn").onclick=async()=>{const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)return alert(error.message);$("loginBox").classList.add("hidden");$("manageBox").classList.remove("hidden");renderAdminList()};
$("logoutBtn").onclick=async()=>{await client.auth.signOut();$("manageBox").classList.add("hidden");$("loginBox").classList.remove("hidden")};
$("dutyForm").onsubmit=async e=>{e.preventDefault();const {error}=await client.from("duties").insert({duty_date:$("dutyDate").value,room_number:$("roomNumber").value.trim()});if(error)return alert(error.message);$("roomNumber").value="";loadDuties()};
async function del(id){if(!confirm("Delete this duty?"))return;const {error}=await client.from("duties").delete().eq("id",id);if(error)return alert(error.message);loadDuties()}
async function edit(id,date,room){const nd=prompt("Date (YYYY-MM-DD)",date);if(nd===null)return;const nr=prompt("Room number",room);if(nr===null)return;const {error}=await client.from("duties").update({duty_date:nd,room_number:nr.trim()}).eq("id",id);if(error)return alert(error.message);loadDuties()}
function renderAdminList(){if($("manageBox").classList.contains("hidden"))return;$("dutyList").innerHTML=duties.map(d=>`<div class="duty-row"><span>${d.duty_date} — Room ${esc(d.room_number)}</span><span><button class="edit" onclick="edit(${d.id},'${d.duty_date}','${js(d.room_number)}')">Edit</button> <button class="delete" onclick="del(${d.id})">Delete</button></span></div>`).join("")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}function js(s){return String(s).replace(/\/g,"\\").replace(/'/g,"\'")}
client.auth.onAuthStateChange((_e,s)=>{if(s){$("loginBox").classList.add("hidden");$("manageBox").classList.remove("hidden")}else{$("loginBox").classList.remove("hidden");$("manageBox").classList.add("hidden")};renderAdminList()});loadDuties();