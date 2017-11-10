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
//  RegExp for the "CommunityCreate" page
//
var commExp = new RegExp('/communities/service/html/communitycreate');
if (commExp.test(document.location.pathname)) {
    //
    //  We are actually creating a new Community !!
    //
    var dojoCommunityNoExternal = new __cBill_waitForDojo('CommunityNoExternal');
    dojoCommunityNoExternal.do(function () {
        try {
            __cBill_logger('CommunityNoExternal : Dojo is defined !');
            let removeAccess = function (externalCheckBox, externalLabel, isAllowed) {
                //
                //  Making the checkbox UNCHECKED.
                //  This modifies the default and is valid for ALL THE USERS
                //  
                __cBill_logger('CommunityNoExternal: changing Checkbox default to UNSET...');
                __cBill_uncheckBox(externalCheckBox);
                //
                //  Now, make the Checkbox INVISIBLE for the users who are not authorized
                //
                if (!isAllowed) {
                    //
                    //  Current user is not a member of the Membership Community
                    //  Thus, the user cannot create an External community
                    //
                    if (__cBill_hideNoDestroy) {
                        dojo.replaceClass(externalCheckBox, 'lotusHidden');
                        //
                        //  Changing the label associated with the Checkbox to show the user that this action is forbidden
                        //
                        dojo.setAttr(externalLabel, 'innerHTML', 'You do not have the rights to create a community open to External people');
                        dojo.setStyle(externalLabel, 'color', 'red');
                        dojo.setStyle(externalLabel, 'font-weight', 'bold');
                    } else {
                        //
                        //  IN PRODUCTION, all the row should be simply made invisible also
                        //
                        dojo.addClass(externalLabel.parentNode, 'lotusHidden');
                    }
                } else {
                    __cBill_logger('CommunityNoExternal: user is Allowed to access: nothing to do...');
                }
            };

            //
            // Start of Processing
            //
            __cBill_logger('CommunityNoExternal: start');
            __GuestModel_firstACL.checkUser('CommunityNoExternal', function (isAllowed) {
                let waitForCheckbox = new __cBill_waitById('CommunityNoExternal');
                waitForCheckbox.do(
                    function (externalCheckBox) {
                        try {
                            var externalLabel = dojo.byId('allowExternalLabel');
                            if ((externalCheckBox !== undefined) && (externalLabel !== undefined)) {
                                removeAccess(externalCheckBox, externalLabel, isAllowed);
                                __cBill_logger('CommunityNoExternal: access removed to user !');
                            } else {
                                alert('CommunityNoExternal: not community create page');
                            }
                        } catch (ex) {
                            alert("CommunityNoExternal: comm nav title mover error: COMMON: " + ex);
                        }
                    }, "allowExternal");
                __cBill_logger('CommunityNoexternal: finish');
            });
        } catch (ex) {
            alert("CommunityNoExternal error: MAIN: " + ex);
        }
    });
} else {
    __cBill_logger('CommunityNoExternal : NOTHING TO DO for ' + document.location + ' !');
}
