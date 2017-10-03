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
if (document.location.hash === '#fullpageWidgetId=Members') {
    __GuestModel_myLog('CommunityNoMembers : this is a member page. We redefine behavior');
    let dojoCommunityNoMembers = new __GuestModel_WaitForDojo('CommunityNoMembers');
    //
    //  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetork) which load Dojo very lazily.
    //  So we need to wait until Dojo is fully loaded before testing and using it
    //
    dojoCommunityNoMembers.do(function () {
        __GuestModel_myLog('CommunityNoMembers : Dojo is defined !');
        //
        //  Check the Dojo version (this is in order to keep in cosideration iFrames)
        //
        if (dojo.version.major >= 1 && dojo.version.minor >= 10) {
            try {
                //
                // Start of Processing
                //
                __GuestModel_myLog('CommunityNoMembers : start');
                __GuestModel_secondACL.checkUser('CommunityNoMembers', function (isAllowed) {
                    if (!isAllowed) {
                        //
                        //  Current user is not a member of the Membership Community
                        //  Thus, the user cannot add an NEW external member to the community
                        //
                        function removeAccess(theWidget) {
                            dojo.setStyle(theWidget, 'display', 'none');
                        };

                        function reactOnKeyPress() {
                            //
                            //  Once clicking on the ADD or INVITE button, we need to wait for the "+" button
                            //  to be created. This is the button that allows inviting external people (as
                            //  opposed to adding existing externals to a community...
                            //
                            __GuestModel_myLog('CommunityNoMembers.reactOnKeyPress: ....');
                            let waitForByQuery2 = new __GuestModel_WaitForByQuery('CommunityNoMembers');
                            waitForByQuery2.do(
                                function (theWidgets) {
                                    try {
                                        theWidgets.forEach(function (widget) {
                                            __GuestModel_myLog('CommunityNoMembers: making communitiesAddButton invisible');
                                            removeAccess(widget)
                                        });
                                    } catch (ex) {
                                        alert("CommunityNoMembers: error removing access: " + ex);
                                    }
                                }, '[id="communitiesAddButton"]');
                        };
                        let waitForById = new __GuestModel_WaitForById('CommunityNoMembers');
                        waitForById.do(
                            //
                            //  waiting for the DIV containing the ADD, INVITE, IMPORT, EXPORT to be creatd...
                            //
                            function (theWidget) {
                                //
                                //  Add eventListener to the ADD button
                                //
                                __GuestModel_myLog('CommunityNoMembers: add eventListener to memberAddButtonLink...');
                                theWidget.addEventListener("click", reactOnKeyPress);
                                //
                                //  Find the INVITE button and add an event listener to it
                                //
                                __GuestModel_myLog('CommunityNoMembers: add eventListener to memberInviteButtonLink...');
                                dojo.byId("memberInviteButtonLink").addEventListener("click", reactOnKeyPress);
                            }, "memberAddButtonLink");
                    } else {
                        __GuestModel_myLog('CommunityNoMembers: user is Allowed to access: nothing to do...');
                    }
                    __GuestModel_myLog('CommunityNoMembers: finish');
                });
            } catch (ex) {
                alert("CommunityNoMembers error: MAIN: " + ex);
            }
        } else {
            alert('CommunityNoMembers: BAD DOJO version !');
        }
    });
} else {
    __GuestModel_myLog('CommunityNoMembers : this is a NOT member page: ' + document.location + '. Nothing to do...');
}
