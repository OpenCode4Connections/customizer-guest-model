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
if ((document.location.pathname === '/homepage/orgadmin/orgadmin.jsp') || (document.location.pathname === '/news/web/jsp/notificationCenter/ncFlyout.jsp')) {
    //
    //  We need to trap page URLs which do not load DOJO
    //
    __cBill_logger('AddInviteGuest : This page is not supported !!');
} else {
    var dojoAddInviteGuest = new __cBill_waitForDojo('AddInviteGuest');
    //
    //  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetwork) which load Dojo very lazily.
    //  So we need to wait until Dojo is fully loaded before testing and using it
    //
    dojoAddInviteGuest.do(function () {
        try {
            __cBill_logger('AddInviteGuest : Dojo is defined !');
            var giveAccess = function (bssUsersMenuWidget) {
                //
                //  Find the LOGOUT <li> element
                //
                let logoutWidget = dojo.query("li.logout", bssUsersMenuWidget);
                if (logoutWidget[0]) {
                    __cBill_logger('AddInviteGuest.giveAccess : LOGOUT item found...');
                    //
                    //  create the new <LI> element
                    //
                    let inviteLI = dojo.create('li', { class: 'invite' })
                    __cBill_logger('AddInviteGuest.giveAccess : LI element created...');
                    //
                    //  Create the new <A> element
                    //  Depending on your region, you may need to use apps.ce or apps.ap instead of apps.na URL below
                    //
                    let inviteA = dojo.create('a', { innerHTML: 'Invite GUEST', class: 'invite', target: '_parent', role: 'menuitem', tabindex: '0', href: '/manage/subscribers/showInviteGuestDialog/input' }, inviteLI);
                    __cBill_logger('AddInviteGuest.giveAccess : A element created...');
                    //
                    //  Now place the LI in the menu
                    //
                    dojo.place(inviteLI, logoutWidget[0], 'before');
                    __cBill_logger('AddInviteGuest.giveAccess : LI element placed in menu...');
                } else {
                    alert('AddInviteGuest.giveAccess : strange situation. LOGOUT element not found !!!');
                }
            };

            //
            // Start of Processing
            //
            __cBill_logger('AddInviteGuest : start');
            __GuestModel_firstACL.checkUser('AddInviteGuest', function (isAllowed) {
                if (isAllowed) {
                    //
                    //  Current user is a member of the Membership Community
                    //  Thus, the user can invite external Guests
                    //
                    let waitForById = new __cBill_waitById('AddInviteGuest');
                    waitForById.do(
                        function (bssUsersMenuWidget) {
                            try {
                                giveAccess(bssUsersMenuWidget);
                                __cBill_logger('AddInviteGuest: access GRANTED to user !');
                            } catch (ex) {
                                alert("AddInviteGuest: error granting access: " + ex);
                            }
                        }, "bss-usersMenu");
                } else {
                    __cBill_logger('AddInviteGuest: user is NOT Allowed to access: nothing to do...');
                }
                __cBill_logger('AddInviteGuest: finish');
            });
        } catch (ex) {
            alert("AddInviteGuest error: MAIN: " + ex);
            }
    });
}