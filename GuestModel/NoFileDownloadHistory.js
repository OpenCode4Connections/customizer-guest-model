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
//  Regexp for a File-Preview page of a standalone file
//  Please note the "alternative" bewteen "app" and "app#" inside the regexp
//
//var filesExp = new RegExp('/files/(app|app#)/file/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}');
var filesExp = new RegExp('/files/(app|app#)');
//
//  Regexp for a File-Preview page of a Community file
//
//var commExp = new RegExp('/communities/service/html/communitystart\\?communityUuid=[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}#fullpageWidgetId=[0-9a-zA-Z]{13}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{12}&file=[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}');
var commExp = new RegExp('/communities/service/html/communitystart\\?communityUuid=[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}');
//
//  To bypass the current limitation of MUSE "match url", we are forced to make this test to validate
//  if the current page is the one on which we actually want to apply the processing.
//
//if (filesExp.test(document.location.pathname) || commExp.test(document.location.pathname + document.location.search + document.location.hash)) {
if (filesExp.test(document.location.pathname) || commExp.test(document.location.pathname + document.location.search)) {
    __GuestModel_myLog(filesExp.test(document.location.pathname) ? 'NoFileDownloadHistory : This is a FILE !' : 'NoFileDownloadHistory : This is a Community FILE !');
    var dojoNoFileDownloadHistory = new __GuestModel_WaitForDojo('NoFileDownloadHistory');
    //
    //  There are some pages which load Dojo very lazily.
    //  So we need to wait until Dojo is fully loaded before testing and using it
    //
    dojoNoFileDownloadHistory.do(function () {
        __GuestModel_myLog('NoFileDownloadHistory : Dojo is defined !');
        try {
            //
            //  We require the Dojo modules that help us to transform an XML feed into a JSON document
            //
            dojo.require("dojox.atom.io.model");
            //
            //  This is the real trick that makes the whole working
            //  The Dojo ON module allows us to declare eventHandlers associated to classes. 
            //  See https://dojotoolkit.org/reference-guide/1.10/dojo/on.html
            //
            require(['dojo/on', 'dojo/_base/window', 'dojo/query'],
                //
                //  We want to capture when the container of the user records (for Likes, Comments, Downloads...)
                //  actually gets filled with the HTML elements that contain the information for the users
                //  who are liking, commenting, downloading...
                //
                function (on, win) {
                    on(win.doc,
                        '.panelContent.streamContent.bidiAware:DOMNodeInserted', //'.ics-viewer-user-count-widget:DOMNodeInserted', 
                        function (evt) {
                            //
                            //  When an HTML element is inserted...
                            //
                            var thisElement = evt.target;
                            //
                            //  ...we search the <span class="x-lconn-userid"> children of that element
                            //
                            var myChild = dojo.query('span.x-lconn-userid', thisElement);
                            if (myChild.length > 0) {
                                let downloadParent = myChild.closest(".ics-viewer-user-count-widget");
                                if (downloadParent) {
                                    //
                                    //  If a child is found and is a "download" child, then it contains the "userid" attribute of
                                    //  the record that is shown in the page
                                    //
                                    __GuestModel_myLog('NoFileDownloadHistory: going to get infos for user ' + myChild[0].innerHTML);
                                    //
                                    //  We can delegate to the hideUser method of the blackList object (which has 
                                    //  been instatiated withing commonTools.js) the task of hiding that record
                                    //  (if required)
                                    //
                                    __GuestModel_blackList.hideUser('NoFileDownloadHistory', myChild[0].innerHTML, thisElement);
                                } else {
                                    __GuestModel_myLog('NoFileDownloadHistory: ' + myChild[0].innerHTML + ' not found in Download... forgetting it...');
                                }
                            }
                        })
                }
            );
            __GuestModel_myLog('NoFileDownloadHistory: start');
            /*
            //
            //  This statement was the original choice of completely hiding the list of users who downloaded
            //  a given file
            //
            dojo.place(
                "<style>"+
                    ".ics-viewer-user-count-widget { display: none } !important"+
                 "</style>", dojo.body(),"first"); 
            __GuestModel_myLog('NoFileDownloadHistory: ics-viewer-user-count-widget class style change to noDisplay');
            //
            //  This statement was just an intermediate example
            //
            dojo.place(
                "<style>"+
                    ".ics-viewer-user-count-widget { color: red } !important"+
                "</style>", dojo.body(), "first"); 
            */
            __GuestModel_myLog('NoFileDownloadHistory : finish');
        } catch (ex) {
            alert("NoFileDownloadHistory error: MAIN: " + ex);
        }
    });
} else {
    __GuestModel_myLog('NoFileDownloadHistory : NOTHING TO DO for ' + document.location + ' !');
}
