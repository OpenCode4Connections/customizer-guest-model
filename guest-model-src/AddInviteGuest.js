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
var dojoAddInviteGuest = new __GuestModel_WaitForDojo('AddInviteGuest');
//
//  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetwork) which load Dojo very lazily.
//  So we need to wait until Dojo is fully loaded before testing and using it
//
dojoAddInviteGuest.do(function () {
    __GuestModel_myLog('AddInviteGuest : Dojo is defined !');
    //
    //  Check the Dojo version (this is in order to keep in cosideration iFrames)
    //
    if (dojo.version.major >= 1 && dojo.version.minor >= 10) {
        try {
            var giveAccess = function (bssUsersMenuWidget) {
                //
                //  Find the LOGOUT <li> element
                //
                let logoutWidget = dojo.query("li.logout", bssUsersMenuWidget);
                if (logoutWidget[0]) {
                    __GuestModel_myLog('AddInviteGuest.giveAccess : LOGOUT item found...');
                    //
                    //  create the new <LI> element
                    //
                    let inviteLI = dojo.create('li', {class : 'invite'})
                    __GuestModel_myLog('AddInviteGuest.giveAccess : LI element created...');
                    //
                    //  Create the new <A> element
					//  Depending on your region, you may need to use apps.ce or apps.ap instead of apps.na URL below
                    //
                    let inviteA = dojo.create('a', {innerHTML: 'Invite GUEST', class : 'invite', target: '_parent', role: 'menuitem', tabindex: '0', href: '/manage/subscribers/showInviteGuestDialog/input'}, inviteLI);
                    __GuestModel_myLog('AddInviteGuest.giveAccess : A element created...');
                    //
                    //  Now place the LI in the menu
                    //
                    dojo.place(inviteLI, logoutWidget[0], 'before');
                    //dojo.place(inviteLI, logoutWidget[0].parentNode, 'first');


                    //let pippo = dojo.clone(logoutWidget[0]);
                    //dojo.setAttr(pippo, 'href', 'https://apps.na.collabserv.com/manage/subscribers/showInviteGuestDialog/input');
                    __GuestModel_myLog('AddInviteGuest.giveAccess : LI element placed in menu...');
                    console.log(inviteLI);
                    /*
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
                    */
                } else {
                    alert('AddInviteGuest.giveAccess : strange situation. LOGOUT element not found !!!');
                }
            };

            //
            // Start of Processing
            //
            __GuestModel_myLog('AddInviteGuest : start');
            __GuestModel_firstACL.checkUser('AddInviteGuest', function (isAllowed) {
                if (isAllowed) {
                    //
                    //  Current user is a member of the Membership Community
                    //  Thus, the user can invite external Guests
                    //
                    let waitForById = new __GuestModel_WaitForById('AddInviteGuest');
                    waitForById.do(
                        function (bssUsersMenuWidget) {
                            try {
                                giveAccess(bssUsersMenuWidget);
                                __GuestModel_myLog('AddInviteGuest: access GRANTED to user !');
                            } catch (ex) {
                                alert("AddInviteGuest: error granting access: " + ex);
                            }
                        }, "bss-usersMenu");
                } else {
                    __GuestModel_myLog('AddInviteGuest: user is NOT Allowed to access: nothing to do...');
                }
                __GuestModel_myLog('AddInviteGuest: finish');
            });
        } catch (ex) {
            alert("AddInviteGuest error: MAIN: " + ex);
        }
    } else {
        alert('AddInviteGuest: BAD DOJO version !');
    }
});
