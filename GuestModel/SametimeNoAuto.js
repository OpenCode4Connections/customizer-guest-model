/*
 * © Copyright IBM Corp. 2017
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */
    

//
//  A special Custom cookie allows overriding the default behavior of ST Autologin
//  If CustomCookie exists then
//      The user wants to autoLogin.
//      the standard ST AutoLogin cookie is removed
//  else
//      The behavior is redefined. No automatic Login will be enabled
//      the standard ST AutoLogin cookie is set to "no-auto-connect"
//  end 
//
//  When the user forces the Autologin from the UI, the CustomCookie is set. Otherwise it is removed
//
var __mySametimeCookie = "CustomizerSametimeCookie";
var __stdSametimeCookie = "stproxy.dock.notremembered";


if ((document.location.pathname === '/homepage/orgadmin/orgadmin.jsp') || (document.location.pathname === '/news/web/jsp/notificationCenter/ncFlyout.jsp')) {
    //
    //  These pages are do not support Embedded Sametime
    //
    __cBill_logger('SametimeNoAuto : This page is not supprted !!');
} else {
    //
    //  Let's override the standard ST AutoLogin mechanism
    //
    if (__cBill_getCookie(__mySametimeCookie) === "") {
        //
        //  The special Sametime cookie is not set. 
        //  We force the user NOT TO AUTOLOGIN in Sametime
        //
        document.cookie = __stdSametimeCookie + "=no-auto-connect";
    } else {
        //
        //  The special Sametime cookie is set
        //  this means that the user wants to login automatically
        //  So we FORCE REMOVE the Sametime AutoLogin cookie
        //
        document.cookie = __stdSametimeCookie + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }    
    //
    //  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetork) which load Dojo very lazily.
    //  So we need to wait until Dojo is fully loaded before testing and using it
    //
    let dojoSametimeNoAuto = new __cBill_waitForDojo('SametimeNoAuto');
    dojoSametimeNoAuto.do(function () {
        //
        //  Dojo is loaded
        //
        try {
            __cBill_logger('SametimeNoAuto : Dojo is defined !');
            let theWidget = null;
            let __cBill_ManageCookie = function () {
                if (theWidget.checked) {
                    //
                    //  the checkbox is Checked
                    //  This means that we wnt to AutoLogin
                    //  Thus we enable our Custom Cookie
                    //
                    document.cookie = __mySametimeCookie + "=ON";
                } else {
                    //
                    //  the checkbox is NOT Checked
                    //  This means that we DO NOT want to AutoLogin
                    //  Thus we "remove our Custom cookie"
                    //
                    document.cookie = __mySametimeCookie + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
                }
            };

            //
            // Start of Processing
            //
            __cBill_logger('SametimeNoAuto : start');
            //
            //  We retrieve the checkbox that allows the user to define if she 
            //  wants AUTOLOGIN or not
            //
            let waitForSametime = new __cBill_waitByQuery('SametimeNoAuto');
            waitForSametime.do(
                function (STcheckBox) {
                    try {
                        theWidget = STcheckBox[0];
                        //
                        //  Now we need to listen to the "click" event on the checkbox in order to modify the behavior
                        //
                        if (STcheckBox[0].addEventListener) {
                            //
                            //  NOT IE ....
                            //
                            STcheckBox[0].addEventListener('click', __cBill_ManageCookie, false);
                        } else {
                            //
                            //  IE ...
                            //
                            STcheckBox[0].attachEvent('onclick', __cBill_ManageCookie);
                        }
                        __cBill_logger('SametimeNoAuto: setting listener on checkBox !');
                    } catch (ex) {
                        alert("SametimeNoAuto: error adding listener: " + ex);
                    }
                }, "input.stproxy_dock_opacity");
        } catch (ex) {
            alert("SametimeNoAuto error: MAIN: " + ex);
        }
    });
}