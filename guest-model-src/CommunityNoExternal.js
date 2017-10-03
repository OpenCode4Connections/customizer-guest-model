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
 
//  RegExp for the "CommunityCreate" page
//
var commExp = new RegExp('/communities/service/html/communitycreate');
if (commExp.test(document.location.pathname)) {
    //
    //  We are actually creating a new Community !!
    //
    var dojoCommunityNoExternal = new __GuestModel_WaitForDojo('CommunityNoExternal');
    dojoCommunityNoExternal.do(function () {
        __GuestModel_myLog('CommunityNoExternal : Dojo is defined !');
        try {
            var removeAccess = function (externalCheckBox, externalLabel) {
                //
                //  Making the checkbox UNCHECKED and INVISIBLE (so by default the community will not be open to outside
                //  and the user cannot modify this behavior)
                //
                __GuestModel_unCheckBox(externalCheckBox);
                if (hideNoDestroy) {
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
            };

            //
            // Start of Processing
            //
            __GuestModel_myLog('CommunityNoExternal: start');
            __GuestModel_firstACL.checkUser('CommunityNoExternal', function (isAllowed) {
                if (!isAllowed) {
                    //
                    //  Current user is not a member of the Membership Community
                    //  Thus, the user cannot create an extenral community
                    //
                    let waitForById = new __GuestModel_WaitForById('CommunityNoExternal');
                    waitForById.do(
                        function (externalCheckBox) {
                            try {
                                var externalLabel = dojo.byId('allowExternalLabel');
                                if ((externalCheckBox !== undefined) && (externalLabel !== undefined)) {
                                    removeAccess(externalCheckBox, externalLabel);
                                    __GuestModel_myLog('CommunityNoExternal: access removed to user !');
                                } else {
                                    alert('CommunityNoExternal: not community create page');
                                }
                            } catch (ex) {
                                alert("CommunityNoExternal: comm nav title mover error: COMMON: " + ex);
                            }
                        }, "allowExternal");
                } else {
                    __GuestModel_myLog('CommunityNoExternal: user is Allowed to access: nothing to do...');
                }
                __GuestModel_myLog('CommunityNoexternal: finish');
            });
        } catch (ex) {
            alert("CommunityNoExternal error: MAIN: " + ex);
        }
    });
} else {
    __GuestModel_myLog('CommunityNoExternal : NOTHING TO DO for ' + document.location + ' !');
}
