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
var dojoNoGuestUser = new __GuestModel_WaitForDojo('NoGuestUser');
//
//  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetwork) which load Dojo very lazily.
//  So we need to wait until Dojo is fully loaded before testing and using it
//
dojoNoGuestUser.do(function () {
    __GuestModel_myLog('NoGuestUser : Dojo is defined !');
    //
    //  Check the Dojo version (this is in order to keep in cosideration iFrames)
    //
    if (dojo.version.major >= 1 && dojo.version.minor >= 10) {
        try {
            var removeAccess = function (bssUsersMenuWidget) {
                var widgets = dojo.query("a.invite", bssUsersMenuWidget);
                if (widgets[0]) {
                    if (hideNoDestroy) {
                        //
                        //  Create replacing text
                        //
                        var newLabel = dojo.create('label');
                        dojo.setAttr(newLabel, 'innerHTML', 'NO Right to INVITE');
                        dojo.setStyle(newLabel, 'color', 'red');
                        dojo.setStyle(newLabel, 'font-weight', 'bold');
                        dojo.setStyle(newLabel, 'padding-left', '0.75em');
                        dojo.setStyle(newLabel, 'padding-right', '0.75em');
                        dojo.place(newLabel, widgets[0].parentNode, "first");
                        dojo.setStyle(widgets[0], 'display', 'none');
                    } else {
                        //
                        //  physically remove the element
                        //
                        dojo.destroy(widgets[0].parentNode);
                    }
                } else {
                    alert('NoGuestUser : strange situation. INVITE element not found !!!');
                }
            };

            //
            // Start of Processing
            //
            __GuestModel_myLog('NoGuestUser : start');
            __GuestModel_firstACL.checkUser('NoGuestUser', function (isAllowed) {
                if (!isAllowed) {
                    //
                    //  Current user is not a member of the Membership Community
                    //  Thus, the user cannot create an extenral community
                    //
                    let waitForById = new __GuestModel_WaitForById('NoGuestUser');
                    waitForById.do(
                        function (bssUsersMenuWidget) {
                            try {
                                removeAccess(bssUsersMenuWidget);
                                __GuestModel_myLog('NoGuestUser: access removed to user !');
                            } catch (ex) {
                                alert("NoGuestUser: error removing access: " + ex);
                            }
                        }, "bss-usersMenu");
                } else {
                    __GuestModel_myLog('NoGuestUser: user is Allowed to access: nothing to do...');
                }
                __GuestModel_myLog('NoGuestUser: finish');
            });
        } catch (ex) {
            alert("NoGuestUser error: MAIN: " + ex);
        }
    } else {
        alert('NoGuestUser: BAD DOJO version !');
    }
});
