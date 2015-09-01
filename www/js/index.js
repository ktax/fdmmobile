var pushNotification;
var fdmSite = null;
var offlinePage = null;
var siteIsLoaded = false;
var connection = null;
var isOffline = null;
var recentUrl = null;
            
function onDeviceReady() {
    StatusBar.hide();
    checkConnectionAndRedirect();
   
    document.addEventListener("offline", goOffline, false);
    document.addEventListener("online", goOnline, false);
    //document.addEventListener("resume", onResume, false);
            

    try 
    { 
        pushNotification = window.plugins.pushNotification;
        pushNotification.register(successHandler, errorHandler, {"senderID":"348697062205","ecb":"onNotification"});        // required!  
    }
    catch(err) 
    { 
        txt="There was an error on this page.\n\n"; 
        txt+="Error description: " + err.message + "\n\n"; 
        alert(txt); 
    }
}

function onNotification(e) {
    
    switch( e.event )
    {
        case 'registered':
        if ( e.regid.length > 0 )
        {   
            var intervalHandler = setInterval(function(){
                if (siteIsLoaded == true) {
                    pushNotificationTokenReceived(e.regid);
                    clearInterval(intervalHandler);
                }
            }, 1000);
            console.log("regID = " + e.regid);
           
        }
        break;
        
        case 'message':
            if (siteIsLoaded == true)
                sendReceivedNotification(e.payload.message, e.payload.message);
            else {
                var intervalHandler = setInterval(function(){
                    if (siteIsLoaded == true) {
                        sendReceivedNotification(e.payload.message, e.payload.message);
                        clearInterval(intervalHandler);
                    }
                }, 1000);
            }
            if (e.foreground)
            {
                   
            } 
            
        break;
        
        case 'error':
            alert("Wystąpił błąd");
        break;
        
        default:
            
        break;
    }
}


function successHandler (result) {
}

function errorHandler (error) {
}

function checkConnection() {
    var networkState = navigator.network.connection.type;
   var states = {};
   states[Connection.UNKNOWN]  = 'Unknown connection';
   states[Connection.ETHERNET] = 'Ethernet connection';
   states[Connection.WIFI]     = 'WiFi connection';
   states[Connection.CELL_2G]  = 'Cell 2G connection';
   states[Connection.CELL_3G]  = 'Cell 3G connection';
   states[Connection.CELL_4G]  = 'Cell 4G connection';
   states[Connection.NONE]     = 'No network connection';
  
   return networkState;
}

function sendReceivedNotification(from, message) {
    var fromWrapper = "\'"+from+"\'";
    var messageWrapper = "\'"+message+"\'";
    var mycode = "pushNotificationReceived("+fromWrapper+","+messageWrapper+");";
    String(mycode);
    fdmSite.executeScript({
        code:mycode 
    });
}

function pushNotificationTokenReceived(token) {
    var tokenWrapper = "\'"+token+"\'";
    fdmSite.executeScript({
        code:"pushNotificationTokenReceived("+tokenWrapper+");"
    })
}

function checkConnectionAndRedirect() {             
   
    if (checkConnection() == Connection.NONE) {
        goOffline();
    } else {
        goOnline();
    }    

}

function onResume() {
    if (isOffline == true) {
        showOfflineScreen();
    }
}


function goOnline() { 
    navigator.splashscreen.show();
    if (isOffline !=false) {
        isOffline = false;
        if (offlinePage != null)
            offlinePage.close();
        if (recentUrl == null) {
            fdmSite = window.open("http://fdm.brainhub.pl/app_dev.php/", "_blank", "location=no", "zoom=no", "hidden=no");
            addListeners(fdmSite);
        } else { 
            fdmSite = window.open(recentUrl, "_blank", "location=no", "zoom=no", "hidden=no");
            addListeners(fdmSite);
        }
    }
    navigator.splashscreen.hide();
    
    
}

function goOffline() {
    navigator.splashscreen.show();
    if ( isOffline != true) {
        isOffline = true;
        if (fdmSite != null) {
            removeListeners(fdmSite);
            fdmSite.close();
        }
        openOfflinePage();      
    }
   navigator.splashscreen.hide();
}

function openOfflinePage() {
    offlinePage = window.open("offline.html", "_blank", "location=no", "zoom=no");
    offlinePage.addEventListener("loadstop", function() {
        offlinePage.show();
    });
}

function addListeners(ref) {
    ref.addEventListener('loadstart', inAppBrowserLoadStart);
    ref.addEventListener('loadstop', inAppBrowserLoadStop); 
    ref.addEventListener('loaderror', inAppBrowserLoadError);  
    ref.addEventListener('exit', confirmExit);
}

function removeListeners(ref) {
    fdmSite.removeEventListener('loadstart', inAppBrowserLoadStart);
    fdmSite.removeEventListener('loadstop', inAppBrowserLoadStop); 
    fdmSite.removeEventListener('loaderror', inAppBrowserLoadError);  
    fdmSite.removeEventListener('exit', confirmExit);
}

function showOfflineScreen() {
    navigator.splashscreen.show();
}

function hideOfflineScreen() {
    navigator.splashscreen.hide();
}

function inAppBrowserLoadStart(event) {
    siteIsLoaded=false;
};
function inAppBrowserLoadStop(event) {
    fdmSite.show();
    siteIsLoaded = true;
    recentUrl = event.url;
};

function inAppBrowserLoadError() {
    navigator.spashscreen.show();
}

function confirmExit(event) {
    event.preventDefault();
    if (confirm("Czy chcesz zamknąć aplikację?"))
        exitApp();
}

function exitApp() {
    if (fdmSite != null ) {
        fdmSite.removeEventListener('loadstart', inAppBrowserLoadStart);
        fdmSite.removeEventListener('loadstop', inAppBrowserLoadStop);
    }

    document.removeEventListener("offline", goOffline, false);
    document.removeEventListener("online", goOnline, false);
    
    navigator.app.exitApp(); 
}

document.addEventListener('deviceready', onDeviceReady, true);