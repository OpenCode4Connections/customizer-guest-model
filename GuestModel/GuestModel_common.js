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
if (__GuestModel_serviceDeskURL !== undefined) {
    console.log('******** GuestModel_common.js already done. SKIPPING *****************');
} else {
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
                        let theCookiesStr = __cBill_getCookie('ids');
                        let theCookies = theCookiesStr.split(":");
                        return theCookies[0];
            //      }
        }
        //
        //  Initialization
        //  ---------------
        //
        var thisUser = getConnectionsUser();
        var cookieName    = "Customizer-" + thisUser + "-" + uuid;
        this.retrieving   = false;
        this.communityArgs= {
            url          : __cBill_connectionsServer + "/communities/service/json/v1/community/activepersonmembers",
            handleAs     : "json",
            preventCache : false,
            sync         : false,
            //user:      NO Need since same Domain,
            //password:  NO Need since same Domain,
            content      :  {communityUuid: uuid, limit: '500'},
        }
        if (__cBill_getCookie(cookieName) !== "") {
            //
            //  The User's Cookie for this ACL is present. Initialize values with infos coming from that cookie
            //
            this.isAllowed    = __cBill_getCookie(cookieName) == 0 ? false : true;
            this.retrieved    = true;
            __cBill_logger('__GuestModel_UserAllowed.init for (' + uuid + ') : cookie exists and has value ' + this.isAllowed);
        } else {
            //
            //  Cookie is not defined 
            //  this means we need to go and check the current user
            //
            this.isAllowed    = false;
            this.retrieved    = false;
            __cBill_logger('__GuestModel_UserAllowed.init for (' + uuid + ') : cookie does not exist...');
        }
        
        this.setCommunityId = function(uuid) {
            this.communityArgs.content.communityUuid = uuid;
        }

        this.checkUser = function (label, callback) {
            var n = this;
            var communityId = this.communityArgs.content.communityUuid;
            if (!this.retrieved) {
                //
                //  Not yet retrieved. 
                //  Are we retrieving it already (a different script may already be executing this method on this instance.... ) ?
                //
                if (!this.retrieving) {
                    //
                    //  No other script is retrieving.
                    //  So this instance can start retrieving it
                    //  We signal we are going to retrieve it
                    //
                    this.retrieving = true;
                    //
                    // Now, we issue the XHR and we retrieve the results
                    //
                    __cBill_logger(label + ': going to validate authorization against user ' + thisUser + ' !');
                    var deferred = dojo.xhrGet(this.communityArgs);
                    deferred.then(
                        function (data) {
                            if (data && data.items && (data.items.length > 0)) {
                                for (var i=0; i < data.items.length; i++) {
                                    if (data.items[i].directory_uuid === thisUser) {
                                        //
                                        //  Hey, the current user is a member of the ACL community !!!
                                        //
                                        n.isAllowed = true;
                                        __cBill_logger(label + ': Setting user access for user ' + thisUser + ' to : ' + n.isAllowed);
                                        break;
                                    }
                                }
                            }
                            if (n.isAllowed) {
                                __cBill_logger(label + ': user ' + thisUser + 'is member of community ' + communityId);
                            } else {
                                __cBill_logger(label + ': user ' + thisUser + 'is NOT member of community ' + communityId);
                            }
                            //
                            //  set the cookie storing the rights of this user for this ACL
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
                            //
                            //  There was an error.
                            //  In any case, this means that the user IS NOT ALLOWED for the ACL
                            //
                            n.isAllowed = false;
                            //
                            //  set the cookie storing the rights of this user for this ACL
                            //
                            dojo.cookie(cookieName, n.isAllowed ? 1 : 0);
                            __cBill_logger(label + ': cookie ' + cookieName + ' set to value ' + n.isAllowed);
                            if (error.status === 403) {
                                //
                                //  This the 403 error (user is not member of the Community and if the Community is Restricted, the user cannot perform a read on the membership)
                                //
                                __cBill_logger(label + ': user ' + thisUser + 'is NOT member of community ' + communityId);
                                //
                                //  free the others waiting
                                //
                                n.retrieved = true;
                                n.retrieving = false;
                            } else {
                                alert(label + ".__GuestModel_UserAllowed : An unexpected error occurred in xhr(" + communityId + "): " + error);
                                //
                                //  free the others waiting
                                //
                                n.retrieved = false;
                                n.retrieving = false;
                            }
                            //
                            //  do the processing
                            //
                            callback(n.isAllowed);
                        }
                    );
                } else {
                    //
                    //  Some other script is retrieving but has not yet finished.
                    //  We need to wait until that script has finished
                    //
                    __cBill_logger(label + '.__GuestModel_UserAllowed : waiting until RETRIEVING becomes FALSE for community ' + communityId + ' ...');
                    var waitTime = 100;  // 1000=1 second
                    var maxInter = 50;  // number of intervals before expiring
                    var waitInter = 0;  // current interval
                    var intId = setInterval( function(){
                        __cBill_logger(label + '.__GuestModel_UserAllowed : waiting RETRIEVING for the ' + waitInter + 'th time...');
                        if (++waitInter < maxInter && n.retrieving) return;
                        clearInterval(intId);
                        if (waitInter >= maxInter) {
                            alert(label + '.__GuestModel_UserAllowed : TIMEOUT EXPIRED waiting for retrieving to become FALSE for community ' + communityId + ' ...');
                        } else {
                            // 
                            //  some other script rtrieved the information about the User being allowed or not.
                            //  We trust the result
                            //
                            __cBill_logger(label + '.__GuestModel_UserAllowed : now we can proceed setting user ' + thisUser + ' access to ' + n.isAllowed);
                            callback(n.isAllowed);
                        }
                    }, waitTime);
                }
            } else {
                //
                // Some oher script already validated the membership
                // We reuse the result
                //
                __cBill_logger(label + '.__GuestModel_UserAllowed : User ' + thisUser + ' access Already set to : ' + this.isAllowed);
                callback(this.isAllowed);
            }
        }
    }   
     //
    //  These are global variables reused throughout the scripts
    //  =========================================================

    //  This variable holds the link to the Service Desk site that is used to redirect users when they need to invite external people
    var __GuestModel_serviceDeskURL = 'http://tech.poglianis.net/';

    //  The following two variables hold the IDs of the ACL Communities
    var __GuestModel_firstACL = new __GuestModel_UserAllowed('7dd029ee-44d1-4fce-82df-c3e74d922446');
    var __GuestModel_secondACL = new __GuestModel_UserAllowed('b348aa12-3eea-49c0-a743-eb2ca7bb72e7');
}