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
if (__GuestModel_debug !== undefined) {
    myLog('******** commonTools.js already done. SKIPPING *****************');
} else {
    //
    //  __GuestModel_debug needs to be declard NOW otherwise the following "myLog" statement will no work properly
    //
    var __GuestModel_debug = true;
    //
    //  __GuestModel_hideNoDestroy is a configuration that determines if the DOM elements needs to be hidden or destroyed fro the UI
    //  It is used to show the possibilities and to provide a late decision point
    //
    var __GuestModel_hideNoDestroy = false;
    //
    //  Starting ....
    //
    myLog('******** commonTools.js executed *****************');
    //
    //  These are global functions and classes
    //
    //
    //  Utiity to validate if the current user is a member of a given community
    //
    function __GuestModel_UserAllowed(uuid) {
        function getConnectionsUser() {
            //        if (gllConnectionsData && gllConnectionsData.userId) {
            //            return gllConnectionsData.userId;
            //        } else {
                        //
                        //
                        //  Getting "thisUser" from the Cookie since "gllConnectionsData" is not available on all pages
                        //  for instance it is not available on the "meetings" page
                        //
                        let theCookiesStr = __GuestModel_myGetCookie('ids');
                        let theCookies = theCookiesStr.split(":");
                        return theCookies[0];
            //      }
        }
        //
        //  Initialization
        //  ---------------
        //
        var thisUser = getConnectionsUser();
        var cookieName    = "Muse-" + thisUser + "-" + uuid;
        this.retrieving   = false;
        this.communityArgs= {
            url          : "/communities/service/json/v1/community/activepersonmembers",
            handleAs     : "json",
            preventCache : false,
            sync         : false,
            //user:      NO Need since same Domain,
            //password:  NO Need since same Domain,
            content      :  {communityUuid: uuid, limit: '500'},
        }
        if (__GuestModel_myGetCookie(cookieName) !== "") {
            //
            //  a cookie is present. Initialize values with infos coming from that cookie
            //
            this.isAllowed    = __GuestModel_myGetCookie(cookieName) == 0 ? false : true;
            this.retrieved    = true;
            myLog('__GuestModel_UserAllowed.init for (' + uuid + ') : cookie exists and has value ' + this.isAllowed);
        } else {
            //
            //  Cookie is not defined 
            //  this means we need to go and check the current user
            //
            this.isAllowed    = false;
            this.retrieved    = false;
            myLog('__GuestModel_UserAllowed.init for (' + uuid + ') : cookie does not exist...');
        }
        
        this.setCommunityId = function(uuid) {
            this.communityArgs.content.communityUuid = uuid;
        }

        this.checkUser = function (label, callback) {
            var n = this;
            var communityId = this.communityArgs.content.communityUuid;
            if (!this.retrieved) {
                //
                //  Not yet retrieved. Is some script currently retrieving it ?
                //
                if (!this.retrieving) {
                    //
                    //  No other script is retrieving.
                    //  So this script can start retrieving it
                    //  We signal we are going to retrieve it
                    //
                    this.retrieving = true;
                    //
                    // Now, we issue the SYNCHRONOUS XHR and we retrieve the results
                    //
                    myLog(label + ': going to validate authorization against user ' + thisUser + ' !');
                    var deferred = dojo.xhrGet(this.communityArgs);

                    deferred.then(
                        function (data) {
                            if (data && data.items && (data.items.length > 0)) {
                                for (var i=0; i < data.items.length; i++) {
                                    if (data.items[i].directory_uuid === thisUser) {
                                        n.isAllowed = true;
                                        myLog(label + ': Setting user access for user ' + thisUser + ' to : ' + n.isAllowed);
                                        break;
                                    }
                                }
                            }
                            if (n.isAllowed) {
                                myLog(label + ': user ' + thisUser + 'is member of community ' + communityId);
                            } else {
                                myLog(label + ': user ' + thisUser + 'is NOT member of community ' + communityId);
                            }
                            //
                            //  set the cookie
                            //
                            dojo.cookie(cookieName, n.isAllowed ? 1 : 0);
                            //
                            //  free the others waiting
                            //
                            n.retrieved = true;
                            n.retrieving = false;
                            //
                            //  do the processing
                            //
                            callback(n.isAllowed);
                        },
                        function (error) {
                            n.isAllowed = false;
                            //
                            //  set the cookie
                            //
                            dojo.cookie(cookieName, n.isAllowed ? 1 : 0);
                            myLog(label + ': cookie ' + cookieName + ' set to value ' + n.isAllowed);
                            if (error.status === 403) {
                                myLog(label + ': user ' + thisUser + 'is NOT member of community ' + communityId);
                                //
                                //  free the others waiting
                                //
                                n.retrieved = true;
                                n.retrieving = false;
                                //
                                //  do the processing
                                //
                                callback(n.isAllowed);
                            } else {
                                alert(label + ".__GuestModel_UserAllowed : An unexpected error occurred in xhr(" + communityId + "): " + error);
                                //
                                //  free the others waiting
                                //
                                n.retrieved = false;
                                n.retrieving = false;
                            }
                        }
                    );
                } else {
                    //
                    //  Some other script is retrieving but has not yet finished.
                    //  We need to wait until that script has finished
                    //
                    myLog(label + '.__GuestModel_UserAllowed : waiting until retrieving becomes FALSE for community ' + communityId + ' ...');
                    var waitTime = 100;  // 1000=1 second
                    var maxInter = 50;  // number of intervals before expiring
                    var waitInter = 0;  // current interval
                    var intId = setInterval( function(){
                        myLog(label + '.__GuestModel_UserAllowed : waiting RETRIEVING for the ' + waitInter + 'th time...');
                        if (++waitInter < maxInter && n.retrieving) return;
                        clearInterval(intId);
                        if (waitInter >= maxInter) {
                            alert(label + '.__GuestModel_UserAllowed : TIMEOUT EXPIRED waiting for retrieving to become FALSE for community ' + communityId + ' ...');
                        } else {
                            myLog(label + '.__GuestModel_UserAllowed : now we can proceed setting user ' + thisUser + ' access to ' + n.isAllowed);
                            callback(n.isAllowed);
                        }
                    }, waitTime);
                }
            } else {
                //
                // Some oher script already validated the membership
                // We reuse the result
                //
                myLog(label + '.__GuestModel_UserAllowed : User ' + thisUser + ' access Already set to : ' + this.isAllowed);
                callback(this.isAllowed);
            }
        }
    }   
    //
    //  Utility to validate if a given user can be shown as the author of a comment/like/download
    //
    function __GuestModel_UserDetails() {
        this.cache        = [];      
		
        this.profilesArgs = {
            url          : "/profiles/atom/profile.do",
            handleAs     : "xml",
            preventCache : false,
            sync         : false,
            //user:      NO Need since same Domain,
            //password:  NO Need since same Domain,
            content      :  {userid: null}
        }
        
        var n = this;
        
        this.userIsInCache = function(uuid) {
            for (var i=0; i < this.cache.length; i++) {
                if (this.cache[i].uuid === uuid) return i;
            }
            return -1; 
        }
        
        this.userCanShow = function(uuid) {
            var j = this.userIsInCache(uuid);
            if (j >= 0) return this.cache[j].canShow;
            return false;
        }
        
        this.userHasEmail = function(uuid) {
            var j = this.userIsInCache(uuid);
            if (j >= 0) return this.cache[j].email;
            return null;
        }
        
        this.addUserToCache = function(uuid, email, canShow) {
            var tmp = {};
            tmp.uuid = uuid;
            tmp.email = email;
            tmp.canShow = canShow;
            this.cache.push(tmp);
        }
        
        this.hideUser = function (label, uuid, element) {
            function checkEmailAddress(email) {
                if ((email === 'john@acme.com') || (email === 'marie@acme.com')){
                    return true;
                } else {
                    return false;
                }
            }
            function hideTheUser(label, email, element) {
                dojo.setStyle(element, 'display', 'none');
                myLog(label + '.__GuestModel_UserDetails: Element corresponding to user ' + email + ' has been hidden');
            }
            
            if (this.userIsInCache(uuid) >= 0) {
                myLog(label + ': user ' + this.userHasEmail(uuid) + ' has already been cached !');
                if (this.userCanShow(uuid)) {
                    //
                    //  User can be seen... Nothing to do
                    //
                    myLog(label + '__GuestModel_UserDetails: user ' + this.userHasEmail(uuid) + ' can be shown ! Nothing more to do.');
                } else {
                    //
                    //  User has been already checked and cannot be shown.
                    //  So we hide it
                    //
                    hideTheUser(label, this.userHasEmail(uuid), element);
                }
            } else {
                myLog(label + '__GuestModel_UserDetails: user ' + uuid + ' has NOT been found in the cache. Going to fetch its profile !');
                //
                //  User is NOT in cache. Needs to be retrieved
                //
                this.profilesArgs.content.userid = uuid;
                var deferred = dojo.xhrGet(this.profilesArgs);            
                deferred.then(
                    function (data) {
                        myLog(label + '__GuestModel_UserDetails: Profile for user ' + uuid + ' has been fetched... processing it...');
                        try {
                            var feed = new dojox.atom.io.model.Feed();
                            feed.buildFromDom(data.documentElement);
                            if (feed.entries && feed.entries[0] && feed.entries[0].contributors && feed.entries[0].contributors[0]) {
                                let email = feed.entries[0].contributors[0].email;
                                if (checkEmailAddress(email)) {
                                    //
                                    //  User cannot be shown.
                                    //  Hiding the element corresponding to the user
                                    //
                                    hideTheUser(label, email, element);
                                    //
                                    //  Add the user to the cache
                                    //
                                    n.addUserToCache(uuid, email, false);
                                } else {
                                    //
                                    //  Add the user to the cache
                                    //
                                    n.addUserToCache(uuid, email, true);
                                    myLog(label + '__GuestModel_UserDetails: User ' + email + ' can be shown ! Nothing more to do.');
                                }
                            } else {
                                alert(label + "__GuestModel_UserDetails: error in deferred.then : User " + uuid + ' not found !!');
                            }
                        } catch(ex) {
                            alert(label + "__GuestModel_UserDetails: error in deferred.then : " + ex);
                        }
                    },
                    function (error) {
                        alert(label + "__GuestModel_UserDetails: An unexpected error occurred in xhr(" + uuid + "): " + error);
                    }
                );
            }
        }
    }   
    //
    //  
    //
    function ___GuestModel_WaitForById(label) {
        this.label = '***UNKNOWN***';
        if (label) this.label = label;
        myLog(this.label + '.__GuestModel_WaitForById : initialising !');
        this.do = function(callback, elXpath, maxInter, waitTime) {
            var n = this;
            myLog(this.label + '.__GuestModel_WaitForById : executing !');
            if(!maxInter) maxInter = 50;  // number of intervals before expiring
            if(!waitTime) waitTime = 100;  // 1000=1 second
            if(!elXpath) return;

            var waitInter = 0;  // current interval
            var intId = setInterval( function(){
                myLog(n.label + '.__GuestModel_WaitForById.do : waiting ' + elXpath + ' for the ' + waitInter + 'th time...');
                var theWidget = dojo.byId(elXpath);
                if (++waitInter < maxInter && !theWidget) return;
                clearInterval(intId);
                if (waitInter >= maxInter) {
                    console.log(n.label + '.__GuestModel_WaitForById : TIMEOUT EXPIRED for ' + elXpath + ' !');
                } else {
                    myLog(n.label + '.__GuestModel_WaitForById : element ' + elXpath + ' retrieved !');
                    myLog(theWidget);
                    callback(theWidget);
                }
            }, waitTime);
        };
        
    }
    function __GuestModel_WaitForByQuery(label) {
        this.label = '***UNKNOWN***';
        this.onlyWhenVisible = false;
        this.onlyWhenParentVisible = false;
        this.parentToBeVisible = "";
        if (label) this.label = label;
        myLog(this.label + '.__GuestModel_WaitForByQuery : initialising !');
        this.do = function(callback, elXpath, maxInter, waitTime) {
            var n = this;
            myLog(this.label + '.__GuestModel_WaitForByQuery : executing !');
            if(!maxInter) maxInter = 50;  // number of intervals before expiring
            if(!waitTime) waitTime = 100;  // 1000=1 second
            if(!elXpath) return;

            var waitInter = 0;  // current interval
            var intId = setInterval( function(){
                myLog(n.label + '.__GuestModel_WaitForByQuery.do : waiting ' + elXpath + ' for the ' + waitInter + 'th time...');
                //
                //  Perform the query
                //
                var theQuery = dojo.query(elXpath);
                //
                //  If results have NOT been found within the allowed range of trials we wait for another timeout to retry
                //
                if (++waitInter < maxInter && !theQuery.length) return;
                //
                //  If we arrive here, either we had a timeout or we found something....
                //
                if (waitInter >= maxInter) {
                    //
                    //  Timeout..
                    //  Stopping the Interval, logging and finishing....
                    //
                    clearInterval(intId);
                    console.log(n.label + '.__GuestModel_WaitForByQuery : TIMEOUT EXPIRED for ' + elXpath + ' !');
                } else {
                    //
                    //  Apparently we found something
                    //  Let's check if there are visible elements and, in that case, return them
                    //
                    if (n.onlyWhenVisible || n.onlyWhenParentVisible) {
                        //
                        //  Now we have to filter ONLY the elemets that are visible
                        //
                        myLog(n.label + '.__GuestModel_WaitForByQuery : checking for visibility of ' + theQuery.length + ' candidates....');
                        let theResult = [];
                        theQuery.forEach(function(elem) {
                            let newElem = elem;
                            if (n.onlyWhenParentVisible) {
                                newElem = elem.closest(n.parentToBeVisible);
                            }
                            if (newElem) {
                                myLog(n.label + '.__GuestModel_WaitForByQuery : checking for visibility of ' + newElem);
                                myLog(n.label + '.__GuestModel_WaitForByQuery : visibility is  ' + newElem.offsetHeight);
                                if (newElem.offsetHeight > 0) theResult.push(elem);
                            } else {
                                myLog(n.label + '.__GuestModel_WaitForByQuery : skipping visibility of a NULL element');
                            }
                        });
                        if (theResult.length > 0){
                            //
                            //  We have found the candidates..
                            //  Stopping the Interval, logging and issuing the callback....
                            //
                            clearInterval(intId);
                            myLog(n.label + '.__GuestModel_WaitForByQuery : candidates ' + elXpath + ' retrieved !');
                            myLog(theResult);
                            callback(theResult);
                        } else {
                            //
                            //  Maybe we need to continue searching, right ? 
                            //
                            myLog(n.label + '.__GuestModel_WaitForByQuery : NO VISIBLE element ' + elXpath + ' retrieved ! Continuing');
                            return;
                        }
                    } else {
                        //
                        //  We have found the candidates..
                        //  Stopping the Interval, logging and issuing the callback....
                        //
                        clearInterval(intId);
                        myLog(n.label + '.__GuestModel_WaitForByQuery : element ' + elXpath + ' retrieved !');
                        myLog(theQuery);
                        callback(theQuery);
                    }
                }
            }, waitTime);
        };
    }
    function __GuestModel_WaitForDojo(label) {
        this.label = '***UNKNOWN***';
        if (label) this.label = label;
        myLog(this.label + '.__GuestModel_WaitForDojo : initialising !');
        this.do = function(callback, maxInter, waitTime) {
            var n = this;
            myLog(this.label + '.__GuestModel_WaitForDojo.do : executing !');
            if(!maxInter) maxInter = 50;  // number of intervals before expiring
            if(!waitTime) waitTime = 100;  // 1000=1 second

            var waitInter = 0;  // current interval
            var intId = setInterval(function() {
                myLog(n.label + '.__GuestModel_WaitForDojo.do : waiting for the ' + waitInter + 'th time...');
                if ((++waitInter < maxInter) && (typeof dojo === "undefined")) return;
                clearInterval(intId);
                if (waitInter >= maxInter) {
                    alert(n.label + '.__GuestModel_WaitForDojo.do : TIMEOUT EXPIRED !');
                } else {
                    myLog(n.label + '.__GuestModel_WaitForDojo.do : DOJO is defined !');
                    myLog(n.label + '.__GuestModel_WaitForDojo.do : Issuing Dojo/DomReady!... ');
                    dojo.require("dojo.cookie");
                    require(["dojo/domReady!"], callback());
                }
            }, waitTime);
        };
    }
    function __GuestModel_unCheckBox(theWidget) {
        //
        //  Makes sure the checkBox is really UNCHECKED by dispatching all the related events
        //
        if (dojo.getAttr(theWidget, "checked")) {
            myLog('__GuestModel_unCheckBox : changing checkbox to UNCHECKED...');
            let ownerDoc = theWidget.ownerDocument;
            let myEvent = ownerDoc.createEvent('MouseEvents');
            myEvent.initEvent('click', true, true);
            myEvent.synthetic = true;
            theWidget.dispatchEvent(myEvent, true);
            dojo.setAttr(theWidget, "value", false);
            dojo.setAttr(theWidget, "checked", false);
            dojo.removeAttr(theWidget, "disabled");
        } else {
            myLog('__GuestModel_unCheckBox : checkbox already UNCHECKED. Nothing to do...');
        }
    }
    //
    //
    //
    function __GuestModel_myAlert(theString) {
        if (__GuestModel_debug) alert(theString);
    }
    function __GuestModel_myLog(theString) {
        if (__GuestModel_debug) console.log(theString);
    }
    function __GuestModel_myGetCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    //
    //  These are global variables reused throughout the scripts
    //
    var __GuestModel_firstACL = new __GuestModel_UserAllowed('2415d4db-e250-4b48-b9ea-b0a511e20db4');
    var __GuestModel_secondACL = new __GuestModel_UserAllowed('3c429794-2cfe-4cd9-af9e-8f2905ca65b3');
    
    var __GuestModel_blackList = new __GuestModel_UserDetails();
    
    
    dojo.cookie('stproxy.dock.notremembered', 'no-auto-connect')
}
