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
//  Checking if the Browser supports the OnHashChange event
//
if ("onhashchange" in window) {
    //
    //  Event is supported
    //  Attach the eventHandler to the event itself
    //
    __cBill_logger('ActivityNoExternal : The browser supports the hashchange event!');
    window.addEventListener("hashchange", ActivityNoExternalHashChanged, false);
    //window.onhashchange = ActivityNoExternalHashChanged;
} else {
    //
    //  Browser DOES NOT support the event
    //  a fallback strategy needs to be implemented by means of a timer
    //
    alert("The browser DOES NOT supports the hashchange event!");
}
//
//  In case we are already on the right HASH page, we immediately trigger the processing
//
if (window.location.hash === "#dashboard,myactivities") {
    __cBill_logger('ActivityNoExternal : triggering listener IMMEDIATELY as we are already on that page...');
    ActivityNoExternalHashChanged();
} else {
    __cBill_logger('ActivityNoExternal : waiting the user to go to the HASHED page...');
}


function ActivityNoExternalHashChanged() {
    __cBill_logger('ActivityNoExternal : in EventListener....');
    //
    //  Test for the "ActivityCreate" page
    //
    if (window.location.hash === "#dashboard,myactivities") {
        __cBill_logger('ActivityNoExternal : dealing with <#dashboard,myactivities> hash...');
        //
        //  We are actually creating a new Activity !!
        //
        let dojoActivityNoExternal = new __cBill_waitForDojo('ActivityNoExternal');
        dojoActivityNoExternal.do(function () {
            __cBill_logger('ActivityNoExternal : Dojo is defined !');        
            try {
                let removeAccess = function (externalCheckBox, externalLabel, isAllowed) {
                    //
                    //  Making the checkbox UNCHECKED and INVISIBLE (so by default the activity will not be open to outside
                    //  and the user cannot modify this behavior)
                    //
                    //  In the following we do not simply change the "checked" state of the checkbox, but we also programmatically
                    //  activate the dojo event handler associated to OnClick so that the "warning" widget will also 
                    //  disappear
                    //
                    __cBill_uncheckBox(externalCheckBox);
                    if (!isAllowed) {
                        //
                        //  Current user is not a member of the Membership Community
                        //  Thus, the user cannot create an extenral activity
                        if (__cBill_hideNoDestroy) {
                            dojo.replaceClass(externalCheckBox, 'lotusHidden');
                            //
                            //  Changing the label associated with the Checkbox to show the user that this action is forbidden
                            //
                            dojo.setAttr(externalLabel, 'innerHTML', 'You do not have the rights to create an Activity open to External people');
                            dojo.setStyle(externalLabel, 'color', 'red');
                            dojo.setStyle(externalLabel, 'font-weight', 'bold');
                        } else {
                            //
                            //  IN PRODUCTION, all the row should be simply made invisible also
                            //
                            dojo.addClass(externalLabel.parentNode.parentNode.parentNode.parentNode, 'lotusHidden');
                        }
                    } else {
                        __cBill_logger('ActivityNoExternal: user is Allowed to access: nothing to do...');
                    }
                };

                //
                // Start of Processing
                //
                __cBill_logger('ActivityNoExternal: start');
                __GuestModel_firstACL.checkUser('ActivityNoExternal', function (isAllowed) {
                    //
                    //  We need to proceed in two steps:
                    //      1. retrieve the "New Activity" button
                    //      2. When the button is clicked, THEN we can fetch the "external"-related items
                    //
                    //  Let's start getting the "New Activity" button
                    //
                    __cBill_logger('ActivityNoExternal: waiting for NEW button to be created...');
                    let waitForById = new __cBill_waitById('ActivityNoExternal');
                    waitForById.do(
                        function (newActivityButton) {
                            //
                            //  NewActivity button has been found. We need to add a listener to it
                            //  firstClick is used to avoid adding the same listeners more than once...
                            //
                            let firstClick = true;
                            __cBill_logger('ActivityNoExternal: add listener to NEW...');
                            newActivityButton.firstChild.addEventListener("click",
                                function () {
                                    if (firstClick) {
                                        firstClick = false;
                                        //
                                        //  The user has clicked on the NEW Button for the first time...
                                        //  Let's wait for the dropdown to be created...
                                        //
                                        __cBill_logger('ActivityNoExternal: waiting for external checkbox to be created...');
                                        let waitForByQuery = new __cBill_waitByQuery('ActivityNoExternal');
                                        waitForByQuery.do(
                                            function (externalCheckBox) {
                                                try {
                                                    let externalLabel = dojo.query('label.lotusCheckbox');
                                                    if ((externalCheckBox[0] !== undefined) && (externalLabel[0] !== undefined)) {
                                                        removeAccess(externalCheckBox[0], externalLabel[0], isAllowed);
                                                        __cBill_logger('ActivityNoExternal: access removed to user !');
                                                    } else {
                                                        alert('ActivityNoExternal: not a correct Activity create page');
                                                    }
                                                } catch (ex) {
                                                    alert("ActivityNoExternal: general error : " + ex);
                                                }
                                            }, 'input[name="externalAccess"]');
                                    } else {
                                        //
                                        //  Since it is NOT the first time we click on NEW, 
                                        //  it is not usefull to add again an event listener on the two sub-items
                                        //
                                        __cBill_logger('ActivityNoExternal: Clicking again on the NEW button. Ignoring ...');
                                    }
                                }
                            );
                        }, 'lconn_act_StartActivityButton_0');
                    __cBill_logger('ActivityNoExternal: finish');
                });
            } catch (ex) {
                alert("ActivityNoExternal error: MAIN: " + ex);
            }
        });
    } else {
        __cBill_logger('ActivityNoExternal : NOTHING TO DO for ' + document.location + ' !');
    }
} 
