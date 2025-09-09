function get(key, def){ try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }catch(e){ return def; } }
function set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function $(id){ return document.getElementById(id); }


if(!localStorage.getItem("prods")){
  set("prods",[
    {"id": Date.now(),   "code":"KR-TS-001","name":"Polera KRIMEN Gothic","price":14990,"img":"img/kr_polera1.png"},
    {"id": Date.now()+1, "code":"KR-TS-002","name":"Polera KRIMEN Outline","price":15990,"img":"img/kr_polera2.png"},
    {"id": Date.now()+2, "code":"KR-TS-003","name":"Polera KRIMEN Logo","price":13990,"img":"img/kr_polera3.png"}
  ]);
}
if(!localStorage.getItem("users")) set("users",[]);

function dominioPermitido(email){
  email=(email||"").trim().toLowerCase();
  if(email==="admin"||email==="admin@admin") return true;
  if(email.length>100) return false;

 
  if(email.indexOf("@") === -1){
    return false; 
  }

  return /@duoc\.cl$|@profesor\.duoc\.cl$|@gmail\.com$/.test(email);
}

function isAdminCreds(email,pass){
  var e=(email||"").toLowerCase(); return e==="admin" && pass==="admin";
}

function showMenuAuth(){
  var auth = get("auth", null);
  var lAdmin = $("link_admin"), lLogin = $("link_login"), lReg = $("link_register"), lLogout = $("link_logout");
  if(auth){
    if(lAdmin) lAdmin.style.display = (auth.role==="Administrador") ? "inline-block" : "none";
    if(lLogin) lLogin.style.display = "none";
    if(lReg) lReg.style.display = "none";
    if(lLogout) lLogout.style.display = "inline-block";
  }else{
    if(lAdmin) lAdmin.style.display = "none";
    if(lLogin) lLogin.style.display = "inline-block";
    if(lReg) lReg.style.display = "inline-block";
    if(lLogout) lLogout.style.display = "none";
  }
}

function logout(){ localStorage.removeItem("auth"); alert("Sesión cerrada"); location.href="index.html"; }


function loginSubmit(e){
  e.preventDefault();
  var email=$("login_email"), pass=$("login_pass");
  $("e_login_email").textContent=""; $("e_login_pass").textContent="";
  var ok=true;
  if(!dominioPermitido(email.value)){ $("e_login_email").textContent="Correos: duoc.cl / profesor.duoc.cl / gmail.com (≤100)"; ok=false; }
  if((pass.value||'').length<4 || (pass.value||'').length>10){ $("e_login_pass").textContent="Contraseña 4–10"; ok=false; }
  if(!ok) return;
  if(isAdminCreds(email.value,pass.value)){
    localStorage.setItem("auth", JSON.stringify({email:"admin@admin", role:"Administrador"}));
    alert("Bienvenido Admin"); location.href="index.html"; return;
  }
  var users=get("users",[]), i, u=null;
  for(i=0;i<users.length;i++){ var x=users[i]; if(x.email.toLowerCase()===email.value.toLowerCase() && x.pass===pass.value){ u=x; break; } }
  if(!u){ $("e_login_pass").textContent="Credenciales inválidas"; return; }
  localStorage.setItem("auth", JSON.stringify({email:u.email, role:"Cliente"})); alert("Bienvenido"); location.href="index.html";
}


function registerSubmit(e){
  e.preventDefault();
  var name=$("reg_name"), email=$("reg_email"), pass=$("reg_pass"), pass2=$("reg_pass2"), terms=$("reg_terms");
  $("e_reg_name").textContent="";$("e_reg_email").textContent="";$("e_reg_pass").textContent="";$("e_reg_pass2").textContent="";$("e_reg_terms").textContent="";
  var ok=true;
  if((name.value||'').trim()===''){ $("e_reg_name").textContent="Nombre requerido"; ok=false; }
  if(!dominioPermitido(email.value)){ $("e_reg_email").textContent="Correo permitido: duoc.cl / profesor.duoc.cl / gmail.com (≤100)"; ok=false; }
  if((pass.value||'').length<4 || (pass.value||'').length>10){ $("e_reg_pass").textContent="4–10 caracteres"; ok=false; }
  if(pass2.value!==pass.value){ $("e_reg_pass2").textContent="No coincide"; ok=false; }
  if(!terms.checked){ $("e_reg_terms").textContent="Debes aceptar"; ok=false; }
  if(!ok) return;
  var users=get("users",[]), i;
  for(i=0;i<users.length;i++){ if(users[i].email.toLowerCase()===email.value.toLowerCase()){ $("e_reg_email").textContent="Ya existe una cuenta con este correo"; return; } }
  users.push({name:name.value.trim(), email:email.value.trim(), pass:pass.value, role:"Cliente"}); set("users",users);
  alert("Cuenta creada"); location.href="login.html";
}


function renderCatalogo(){
  var box=$("lista"); if(!box) return;
  var prods=get("prods",[]), i, html="";
  for(i=0;i<prods.length;i++){ var p=prods[i];
    html += '<div class="card">'
         +  '<img src="'+p.img+'">'
         +  '<h3>'+p.name+'</h3>'
         +  '<p>$'+p.price+'</p>'
         +  '</div>';
  }
  box.innerHTML=html;
}

function adminCheck(){ var a=get("auth",null); if(!a||a.role!=="Administrador"){ alert("Solo admin"); location.href="login.html"; } }

function adminList(){
  var tbody=$("tbody"); if(!tbody) return;
  var prods=get("prods",[]), i, p, html="";
  for(i=0;i<prods.length;i++){ p=prods[i];
    html+='<tr><td>'+p.code+'</td><td>'+p.name+'</td><td>$'+p.price+'</td>'
        + '<td><button onclick="edit('+i+')" class="btn-sec">Editar</button> '
        + '<button onclick="delP('+i+')" class="btn-danger">Eliminar</button></td></tr>';
  }
  tbody.innerHTML=html;
}
function newProduct(){ localStorage.removeItem("editIndex"); location.href="admin_producto_form.html"; }
function edit(i){ localStorage.setItem("editIndex", i); location.href="admin_producto_form.html"; }
function delP(i){ var prods=get("prods",[]); prods.splice(i,1); set("prods",prods); adminList(); }
function loadForm(){
  var idx=localStorage.getItem("editIndex"); if(idx==null){ return; }
  var prods=get("prods",[]); idx=parseInt(idx,10);
  if(isNaN(idx)||idx<0||idx>=prods.length){ localStorage.removeItem("editIndex"); return; }
  var p=prods[idx]; $("p_code").value=p.code||""; $("p_name").value=p.name||""; $("p_price").value=p.price||""; $("p_img").value=p.img||"";
}
function saveProd(e){
  e.preventDefault();
  var code=$("p_code").value||"", name=$("p_name").value||"", priceStr=$("p_price").value||"", img=$("p_img").value||"img/kr_polera1.png";
  var price=parseFloat(priceStr), ok=true;
  $("e_code").textContent=""; $("e_name").textContent=""; $("e_price").textContent="";
  if(code.length<3){ $("e_code").textContent="Código mínimo 3"; ok=false; }
  if(name.length===0 || name.length>100){ $("e_name").textContent="Nombre requerido (≤100)"; ok=false; }
  if(isNaN(price) || price<0){ $("e_price").textContent="Precio ≥ 0"; ok=false; }
  if(!ok) return;
  var prods=get("prods",[]), idx=localStorage.getItem("editIndex");
  if(idx==null){ prods.push({id: Date.now(), code:code, name:name, price:price, img:img}); }
  else { idx=parseInt(idx,10); prods[idx]={id: prods[idx].id||Date.now(), code:code, name:name, price:price, img:img}; localStorage.removeItem("editIndex"); }
  set("prods",prods); alert("Guardado"); location.href="admin_productos.html";
}

function adminUsersList(){
  var tbody=$("tbody_users"); if(!tbody) return;
  var users=get("users",[]), i, u, html="";
  for(i=0;i<users.length;i++){ u=users[i];
    html+='<tr><td>'+ (i+1) +'</td><td>'+u.name+'</td><td>'+u.email+'</td>'
       + '<td><button onclick="delU('+i+')" class="btn-danger">Eliminar</button></td></tr>';
  }
  tbody.innerHTML=html;
}
function delU(i){
  var users=get("users",[]);
  users.splice(i,1); set("users",users); adminUsersList(); adminStats();
}

function adminStats(){
  var prods=get("prods",[]), users=get("users",[]);
  var sp = $("stat_products"); if(sp) sp.textContent = prods.length;
  var su = $("stat_users"); if(su) su.textContent = users.length;
}
window.addEventListener("DOMContentLoaded", function(){
  renderCatalogo();
  showMenuAuth();
  adminList();
  loadForm();
  adminUsersList();
  adminStats();
});