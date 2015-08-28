/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
         var pushNotification;
         var fdmSite = null;
         var offlinePage = null;
         var siteIsLoaded = false;
         var connection = null;
         var offlinePage = null;
            
            function onDeviceReady() {
                StatusBar.hide();
                checkConnectionAndRedirect();
                document.addEventListener("backbutton", function(e)
                {   
                    navigator.app.backHistory();

                }, false);
                document.addEventListener("offline", goOffline, false);
                document.addEventListener("online", goOnline, false);
            
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
            
            // handle GCM notifications for Android
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
                        //pushNotificationTokenReceived(e.payload.message);
                        if (e.foreground)
                        {
                               
                        } 
                        
                    break;
                    
                    case 'error':
                        $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                    break;
                    
                    default:
                        $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
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

            function goOnline() { 

                fdmSite = cordova.InAppBrowser.open("http://fdm.brainhub.pl/app_dev.php/catalog/grid#/", "_blank", "location=no", "zoom=yes");
                fdmSite.addEventListener('loadstart', inAppBrowserLoadStart);
                fdmSite.addEventListener('loadstop', inAppBrowserLoadStop);
           
                    
                fdmSite.addEventListener('exit', exitApp);
                
            }

            function goOffline() {

                offlinePage = cordova.InAppBrowser.open("offline.html", "_blank", "location=no", "zoom=yes");
                offlinePage.addEventListener('exit', exitApp);
            }

            function inAppBrowserLoadStart() {
                siteIsLoaded=false;
            };
            function inAppBrowserLoadStop() {
                siteIsLoaded = true;
            };

            function exitApp() {
                if (fdmSite != null ) {
                    fdmSite.removeEventListener('loadstart', inAppBrowserLoadStart);
                    fdmSite.removeEventListener('loadstop', inAppBrowserLoadStop);
                }
                if (offlinePage != null ) {
                    offlinePage.removeEventListener('exit', exitApp);
                }

                document.removeEventListener("offline", goOffline, false);
                document.removeEventListener("online", goOnline, false);
                
                navigator.app.exitApp(); 
            }
            
            document.addEventListener('deviceready', onDeviceReady, true);


