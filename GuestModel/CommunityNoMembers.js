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
    __cBill_logger('CommunityNoMembers : The browser supports the hashchange event!');
    window.addEventListener("hashchange", CommunityNoMemberHashChanged, false);
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
if (window.location.hash === "#fullpageWidgetId=Members") {
    __cBill_logger('CommunityNoMembers : triggering listener IMMEDIATELY as we are already on that page...');
    CommunityNoMemberHashChanged();
} else {
    __cBill_logger('CommunityNoMembers : waiting the user to go to the HASHED page...');
}


function CommunityNoMemberHashChanged() {
    __cBill_logger('CommunityNoMembers : in EventListener....');
    if (document.location.hash === '#fullpageWidgetId=Members') {
        __cBill_logger('CommunityNoMembers : this is a member page. We redefine behavior');
        let dojoCommunityNoMembers = new __cBill_waitForDojo('CommunityNoMembers');
        //
        //  Since this script is applied to GLOBAL, there are some pages (mycontacts, mynetork) which load Dojo very lazily.
        //  So we need to wait until Dojo is fully loaded before testing and using it
        //
        dojoCommunityNoMembers.do(function () {
            try {
                    function removeAccess(theWidget) {
                        dojo.setStyle(theWidget, 'display', 'none');
                    };
                    //
                    // Start of Processing
                    //
                    __cBill_logger('CommunityNoMembers : start');
                    //
                    //  Now. We need to enable the "SendInvite" button on the form ONLY if the user is allowed
                    //
                    __GuestModel_secondACL.checkUser('CommunityNoMembers', function (isAllowed) {
                        if (!isAllowed) {
                            require(['dojo/on', 'dojo/_base/window', 'dojo/query'],
                                function (on, win) {
                                    //
                                    //  We want to capture when the container of the Add/Invite form is created
                                    //
                                    on(win.doc,
                                        '.dijit.dijitReset.dijitInline.dijitLeft.typeAhead.dijitTextBox:DOMNodeInserted',
                                        function (evt) {
                                            __cBill_logger('CommunityNoMembers: In eventHandler for the + Buttons...');
                                            //
                                            //  When an HTML element is inserted...
                                            //
                                            let thisElement = evt.target;
                                            //
                                            //  ...we search the "+" buttons in the page
                                            //
                                            let myChild = dojo.query('[id="communitiesAddButton"]');
                                            myChild.forEach(function (child) {
                                                __cBill_logger('CommunityNoMembers: making communitiesAddButton invisible');
                                                removeAccess(child);
                                                //
                                                //  Since some postprocessing is performed on the form which changes the visibility of the "+"
                                                //  button, we add an observer which will reset the "display:none" whenever the style of the
                                                //  "+" button will be modified elsewhere
                                                //
                                                //  create an observer instance
                                                //
                                                let observer = new MutationObserver(function (mutations) {
                                                    let toBeChanged = false;
                                                    mutations.forEach(function (mutation) {
                                                        __cBill_logger('CommunityNoMembers: getting a STYLE mutation (' + mutation.oldValue + '...');
                                                        if (mutation.target.style.display !== 'none') {
                                                            toBeChanged = true;
                                                        } else {
                                                            toBeChanged = false;
                                                        }
                                                    });
                                                    //
                                                    //  Our own "removeAccess" will cause a mutation... so the risk is to enter a
                                                    //  neverending loop
                                                    //  For this reason we ONLY perform a "removeAccess" if the "style" does not contain 
                                                    //  "display: none" :-)
                                                    //
                                                    if (toBeChanged) {
                                                        __cBill_logger('CommunityNoMembers: making communitiesAddButton invisible FROM MUTATION !!!!');
                                                        removeAccess(child);
                                                    } else {
                                                        __cBill_logger('CommunityNoMembers: communitiesAddButton ALREADY invisible FROM MUTATION !!!!');
                                                    }
                                                });
                                                //
                                                //  pass in the target node, as well as the observer options
                                                //
                                                observer.observe(child, {
                                                    attributes: true,
                                                    childList: true,
                                                    characterData: true,
                                                    attributeOldValue: true,
                                                    attributeFilter: ["style"]
                                                });
                                            });
                                        })
                                    //
                                    //  We want to capture when the container of the "Members were not added or invited" form is created
                                    //
                                    on(win.doc,
                                        '.dijitDialogPaneContent:DOMNodeInserted',
                                        function (evt) {
                                            __cBill_logger('CommunityNoMembers: In eventHandler for the final Form...');
                                            //
                                            //  When an HTML element is inserted...
                                            //
                                            let thisElement = evt.target;
                                            //
                                            //  Verify that this is the correct element to modify
                                            //  In principle it should be the one containing the FORM...
                                            //
                                            let myForm = dojo.query('.lotusForm2', thisElement);
                                            if ((myForm) && (myForm.length > 0)) {
                                                __cBill_logger('CommunityNoMembers: In eventHandler for the final Form. FORM FOUND !!');
                                                //
                                                //  ...we search the "SUBMIT" buttons in the page
                                                //
                                                let myChild = dojo.query('.lotusFormButton.submit', thisElement);
                                                myChild.forEach(function (child) {
                                                    //
                                                    //  ... and we replace them with a custom message
                                                    //
                                                    let theTable = dojo.create('table');
                                                    let theRow = dojo.create('tr');
                                                    let theCol1 = dojo.create('td');
                                                    let theCol2 = dojo.create('td');
                                                    let theLink = dojo.create('a', {
                                                        innerHTML: 'Link',
                                                        class: 'invite',
                                                        target: '_parent',
                                                        role: 'menuitem',
                                                        tabindex: '0',
                                                        href: __GuestModel_serviceDeskURL
                                                    });
                                                    let theLabel = dojo.create('label', {
                                                        innerHTML: 'Please open Service Desk IT Ticket to request an external User: '
                                                    });
                                                    dojo.place(theLink, theCol2, 'first');
                                                    dojo.place(theLabel, theCol1, 'first');
                                                    dojo.place(theCol2, theRow, 'first');
                                                    dojo.place(theCol1, theRow, 'first'),
                                                        dojo.place(theRow, theTable, 'first');
                                                    dojo.place(theTable, child.parentNode, 'first');
                                                    //
                                                    //  Making the original SUBMIT button invisible
                                                    //
                                                    dojo.setStyle(child, 'display', 'none');
                                                    __cBill_logger('CommunityNoMembers: hiding the SUBMIT button');
                                                });
                                            } else {
                                                __cBill_logger('CommunityNoMembers: In eventHandler for the final Form. FORM NOT FOUND !! NOTHING TO DO');                                                
                                            }
                                        })
                                }
                            );
                    } else {
                        __cBill_logger('CommunityNoMembers: user is Allowed to access: nothing to do...');
                    }
                    __cBill_logger('CommunityNoMembers: finish');
                });
            } catch (ex) {
                alert("CommunityNoMembers error: MAIN: " + ex);
            }
        });
    } else {
        __cBill_logger('CommunityNoMembers : this is a NOT member page: ' + document.location + '. Nothing to do...');
    }
}