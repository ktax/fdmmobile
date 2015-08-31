function onDeviceReady() {
   
    document.addEventListener("online", goOnline, false); 
}

function goOnline() {
    alert("online");
    window.history.back();
}

document.addEventListener("online", goOnline, false);