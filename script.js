const seedProducts=[
{id:1,name:"Wireless Mouse",sku:"WM-101",category:"Electronics",location:"A-01",quantity:45,reorder:10,price:18.99},
{id:2,name:"Mechanical Keyboard",sku:"MK-202",category:"Electronics",location:"A-02",quantity:8,reorder:10,price:59.99},
{id:3,name:"USB-C Hub",sku:"UH-303",category:"Accessories",location:"B-01",quantity:32,reorder:8,price:24.50},
{id:4,name:"Laptop Stand",sku:"LS-404",category:"Office",location:"B-04",quantity:5,reorder:8,price:29.99},
{id:5,name:"Webcam HD",sku:"WC-505",category:"Electronics",location:"C-02",quantity:21,reorder:7,price:39.99}
];
const seedOrders=[
{id:"ORD-1001",customer:"Aarav Sharma",items:"Wireless Mouse × 2",total:37.98,date:"2026-10-02",status:"Delivered"},
{id:"ORD-1002",customer:"Neha Singh",items:"Mechanical Keyboard × 1",total:59.99,date:"2026-10-03",status:"Processing"},
{id:"ORD-1003",customer:"TechNova Pvt Ltd",items:"USB-C Hub × 4",total:98,date:"2026-10-04",status:"Pending"}
];
let products=JSON.parse(localStorage.getItem("wms_products"))||seedProducts;
let orders=JSON.parse(localStorage.getItem("wms_orders"))||seedOrders;
let movements=JSON.parse(localStorage.getItem("wms_movements"))||[];
const $=id=>document.getElementById(id);
function save(){localStorage.setItem("wms_products",JSON.stringify(products));localStorage.setItem("wms_orders",JSON.stringify(orders));localStorage.setItem("wms_movements",JSON.stringify(movements));}
function money(n){return "$"+Number(n).toFixed(2)}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("toast-show");setTimeout(()=>$("toast").classList.remove("toast-show"),2200)}
function statusBadge(s){return `<span class="badge ${s.toLowerCase().replace(" ","-")}">${s}</span>`}
function render(){
 $("totalProducts").textContent=products.length;
 $("totalUnits").textContent=products.reduce((a,p)=>a+p.quantity,0);
 $("lowStock").textContent=products.filter(p=>p.quantity<=p.reorder).length;
 $("inventoryValue").textContent=money(products.reduce((a,p)=>a+p.quantity*p.price,0));
 renderCategories(); renderInventory(); renderOrders(); renderMovements(); renderDashboard(); fillProductSelects();
}
function renderCategories(){
 let cats=[...new Set(products.map(p=>p.category))]; let f=$("categoryFilter");let old=f.value;
 f.innerHTML='<option value="all">All Categories</option>'+cats.map(c=>`<option>${c}</option>`).join("");f.value=cats.includes(old)?old:"all";
}
function renderInventory(){
 let q=$("inventorySearch").value.toLowerCase(),cat=$("categoryFilter").value;
 let list=products.filter(p=>(p.name+" "+p.sku+" "+p.category).toLowerCase().includes(q)&&(cat==="all"||p.category===cat));
 $("inventoryCount").textContent=`${list.length} product${list.length!==1?"s":""}`;
 $("inventoryTable").innerHTML=list.length?list.map(p=>`<tr>
<td><b>${p.name}</b></td><td>${p.sku}</td><td>${p.category}</td><td>${p.location}</td><td><b>${p.quantity}</b></td><td>${money(p.price)}</td>
<td>${p.quantity===0?'<span class="badge out">Out of Stock</span>':p.quantity<=p.reorder?'<span class="badge low">Low Stock</span>':'<span class="badge in-stock">In Stock</span>'}</td>
<td><button class="action" onclick="editProduct(${p.id})">Edit</button><button class="action danger" onclick="deleteProduct(${p.id})">Delete</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty">No products found.</td></tr>`;
}
function renderDashboard(){
 let recent=orders.slice().reverse().slice(0,5);
 $("recentOrders").innerHTML=recent.length?`<table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>${recent.map(o=>`<tr><td>${o.id}</td><td>${o.customer}</td><td>${money(o.total)}</td><td>${statusBadge(o.status)}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">No orders yet.</div>';
 let low=products.filter(p=>p.quantity<=p.reorder);
 $("lowStockList").innerHTML=low.length?low.map(p=>`<div class="alert"><b>${p.name}</b><span>${p.quantity} units left • Reorder at ${p.reorder}</span></div>`).join(""):'<div class="empty">✓ All products have healthy stock.</div>';
}
function renderOrders(){
 let q=$("orderSearch").value.toLowerCase(),st=$("orderStatusFilter").value;
 let list=orders.filter(o=>(o.id+" "+o.customer).toLowerCase().includes(q)&&(st==="all"||o.status===st));
 $("ordersTable").innerHTML=list.length?list.map(o=>`<tr><td><b>${o.id}</b></td><td>${o.customer}</td><td>${o.items}</td><td>${money(o.total)}</td><td>${o.date}</td><td>${statusBadge(o.status)}</td><td><select onchange="changeOrderStatus('${o.id}',this.value)"><option ${o.status==="Pending"?"selected":""}>Pending</option><option ${o.status==="Processing"?"selected":""}>Processing</option><option ${o.status==="Shipped"?"selected":""}>Shipped</option><option ${o.status==="Delivered"?"selected":""}>Delivered</option><option ${o.status==="Cancelled"?"selected":""}>Cancelled</option></select></td></tr>`).join(""):'<tr><td colspan="7" class="empty">No orders found.</td></tr>';
}
function renderMovements(){
 $("movementTable").innerHTML=movements.length?movements.slice().reverse().map(m=>`<tr><td>${m.date}</td><td>${m.type==="IN"?'<span class="badge in-stock">Stock In</span>':'<span class="badge out">Stock Out</span>'}</td><td>${m.product}</td><td>${m.sku}</td><td><b>${m.quantity}</b></td><td>${m.reason}</td></tr>`).join(""):'<tr><td colspan="6" class="empty">No stock movements recorded.</td></tr>';
}
function fillProductSelects(){
 let opts=products.map(p=>`<option value="${p.id}">${p.name} (${p.quantity} available)</option>`).join("");
 $("oProduct").innerHTML=opts;$("mProduct").innerHTML=opts;
}
function openModal(id){$(id).classList.remove("hidden")}
function closeModals(){document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))}
function editProduct(id){
 let p=products.find(x=>x.id===id);$("productModalTitle").textContent="Edit Product";$("productId").value=p.id;$("pName").value=p.name;$("pSku").value=p.sku;$("pCategory").value=p.category;$("pLocation").value=p.location;$("pQuantity").value=p.quantity;$("pReorder").value=p.reorder;$("pPrice").value=p.price;openModal("productModal");
}
function deleteProduct(id){if(confirm("Delete this product?")){products=products.filter(p=>p.id!==id);save();render();toast("Product deleted")}}
function changeOrderStatus(id,status){let o=orders.find(x=>x.id===id);o.status=status;save();render();toast("Order status updated")}
document.querySelectorAll(".nav-btn").forEach(btn=>btn.onclick=()=>showSection(btn.dataset.section));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showSection(b.dataset.go));
function showSection(id){document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.section===id));$("pageTitle").textContent=id==="stock"?"Stock Movement":id[0].toUpperCase()+id.slice(1)}
$("quickAdd").onclick=$("addProduct").onclick=()=>{ $("productForm").reset();$("productId").value="";$("productModalTitle").textContent="Add Product";openModal("productModal") };
$("newMovement").onclick=()=>openModal("movementModal");
$("addOrder").onclick=()=>openModal("orderModal");
document.querySelectorAll(".close").forEach(b=>b.onclick=closeModals);
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
$("productForm").onsubmit=e=>{e.preventDefault();let id=Number($("productId").value);let data={name:$("pName").value.trim(),sku:$("pSku").value.trim(),category:$("pCategory").value.trim(),location:$("pLocation").value.trim(),quantity:Number($("pQuantity").value),reorder:Number($("pReorder").value),price:Number($("pPrice").value)};if(id){Object.assign(products.find(p=>p.id===id),data);toast("Product updated")}else{products.push({id:Date.now(),...data});toast("Product added")}save();render();closeModals()};
$("movementForm").onsubmit=e=>{e.preventDefault();let p=products.find(x=>x.id==$("mProduct").value),qty=Number($("mQuantity").value),type=$("mType").value;if(type==="OUT"&&qty>p.quantity){toast("Not enough stock available");return}p.quantity+=type==="IN"?qty:-qty;movements.push({date:new Date().toISOString().slice(0,10),type,product:p.name,sku:p.sku,quantity:qty,reason:$("mReason").value.trim()});save();render();closeModals();$("movementForm").reset();toast("Stock movement recorded")};
$("orderForm").onsubmit=e=>{e.preventDefault();let p=products.find(x=>x.id==$("oProduct").value),qty=Number($("oQuantity").value);if(qty>p.quantity){toast("Not enough stock for this order");return}p.quantity-=qty;let id="ORD-"+(1000+orders.length+1);orders.push({id,customer:$("oCustomer").value.trim(),items:`${p.name} × ${qty}`,total:p.price*qty,date:new Date().toISOString().slice(0,10),status:"Pending"});movements.push({date:new Date().toISOString().slice(0,10),type:"OUT",product:p.name,sku:p.sku,quantity:qty,reason:"Order fulfillment"});save();render();closeModals();$("orderForm").reset();toast("Order created and stock reserved")};
$("inventorySearch").oninput=renderInventory;$("categoryFilter").onchange=renderInventory;$("orderSearch").oninput=renderOrders;$("orderStatusFilter").onchange=renderOrders;
render();