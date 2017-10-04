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

var dojoFilesNoExternal = new __GuestModel_WaitForDojo('FilesNoExternal');
dojoFilesNoExternal.do(function () {
    __GuestModel_myLog('FilesNoExternal : Dojo is defined !');
    try {
        let removeAccess = function (idName, theWidgets, fatherClass) {
            if (theWidgets) {
                __GuestModel_myLog('FilsNoExternal.removeAccess : starting...');
                for (let i = 0; i < theWidgets.length; i++) {
                    if (theWidgets[i].id.startsWith(idName)) {
                        //
                        // Force the Checkbox to be UNCHECKED
                        //
                        __GuestModel_unCheckBox(theWidgets[i]);
                        //dojo.setAttr(theWidgets[i], "checked", false);
                        //
                        //  Current user is not a member of the Membership Community
                        //  Thus, the user cannot create an extenral community
                        //
                        let divFilesExt = theWidgets[i].parentNode;
                        if (__GuestModel_hideNoDestroy) {
                            //
                            //  first, create a new label to inform the user
                            //
                            let newLabel = dojo.create('label');
                            dojo.setAttr(newLabel, 'innerHTML', 'NO Right to SHARE Outside');
                            dojo.setStyle(newLabel, 'color', 'red');
                            dojo.setStyle(newLabel, 'font-weight', 'bold');
                            //
                            //  then, add the newly created label and HIDE the DIV containg the checkbox
                            //
                            dojo.place(newLabel, divFilesExt.parentNode, "first");
                            dojo.setStyle(divFilesExt, "display", "none");
                        } else {
                            //
                            //  In Production we use the lotusHidden class
                            //
                            if (fatherClass === '.lotusDialogWrapper.dijitDialog') {
                                //
                                //  Upload or Folder
                                //
                                dojo.addClass(divFilesExt.parentNode.parentNode, "lotusHidden");
                            } else {
                                //
                                //  Concord documents
                                //
                                dojo.addClass(divFilesExt, "lotusHidden");
                                //
                                //  Removing the advertisement
                                //
                                dojo.addClass(divFilesExt.closest('tbody').children[1], "lotusHidden");
                            }
                        }
                        //break;
                    }
                }
            } else {
                alert('FilsNoExternal.removeAccess : Error : UploadFile : External access checkbox does not exist');
            }
        };
        let waitForSetExt = function(label, widgetName, fatherClass) {
            __GuestModel_myLog('FilesNoExternal.waitForSetExt: start for ' + label + '...');
            let waitForWidget = new __GuestModel_WaitForByQuery('FilesNoExternal.waitForSetExt.' + label);
            waitForWidget.onlyWhenParentVisible = true;
            waitForWidget.parentToBeVisible = fatherClass;
            waitForWidget.do(function (theWidgets) {
                __GuestModel_myLog('FilesNoExternal.waitForSetExt: remove access to ' + label + '...');
                try {
                    removeAccess(widgetName, theWidgets, fatherClass);
                    __GuestModel_myLog('FilesNoExternal.waitForSetExt: ' + label + ' access removed for user !');
                } catch (ex) {
                    alert('FilesNoExternal.waitForSetExt: Error executing the processing for the ' + label + ' Checkbox : ' + ex);
                }
            }, '[name="_setExt"]');
        }

        //
        // Start of Processing
        //
        __GuestModel_myLog('FilesNoExternal: start');
        __GuestModel_firstACL.checkUser('FilesNoExternal', function (isAllowed) {
            if (!isAllowed) {
                //
                //  Current user is not authorized
                //  Thus, the user cannot create a file or folder open to external people
                //
                //  Wait for the NEW button to be created ...
                //
                let waitForById = new __GuestModel_WaitForById('FilesNoExternal');
                waitForById.do(function (newButtonWidget) {
                    try {
                        //
                        //  The NEW Button has been created. We assume the whole page is ready now
                        //
                        //  Add an eventListener for the Drag/drop function of a file on the page
                        //
                        __GuestModel_myLog('FilesNoExternal : adding DRAG/DROP EventListener....');
                        //window.addEventListener('drop', function(e) {
                        dojo.byId('lotusFrame').addEventListener('drop', function(e) {
                            __GuestModel_myLog('FilesNoExternal : inside DRAG/DROP EventListener....');
                            waitForSetExt('DragDrop', 'lconn_files_widget_UploadFile_', '.lotusDialogWrapper.dijitDialog');
                        });
                        //
                        //  Add an eventListener to be triggered IF and WHEN the user clicks on "NEW"...
                        //  All the "create" functions are triggered from the dropdown on the NEW button.
                        //
                        //  firstClick is used to avoid adding the same listeners more than once...
                        //
                        let firstClick = true;
                        __GuestModel_myLog('FilesNoExternal: add listener to NEW...');
                        newButtonWidget.addEventListener("click", function () {
                            if (firstClick) {
                                firstClick = false;
                                //
                                //  The user has clicked on the NEW Button for the first time...
                                //  Let's wait for the dropdown to be created...
                                //
                                let waitForById2 = new __GuestModel_WaitForById('FilesNoExternal');
                                waitForById2.do(function (uploadFileWidget) {
                                    try {
                                        //
                                        //  The dropdown under NEW has been created.
                                        //  Now we need to add eventListeners on the "Folder..." and "Upload..." items...
                                        //
                                        //  This is the eventListener for the "Upload File" button...
                                        //
                                        __GuestModel_myLog('FilesNoExternal: add listener to upload...');
                                        uploadFileWidget.addEventListener("click", function () {
                                            //
                                            //  In the "Upload..." listener, let's wait for the Upload form to be created 
                                            //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                            //
                                            __GuestModel_myLog('FilesNoExternal: clicking upload...');
                                            waitForSetExt('Upload', 'lconn_files_widget_UploadFile_', '.lotusDialogWrapper.dijitDialog');
                                        });
                                        //
                                        //  This is the eventListener for the "Folder" button...
                                        //
                                        __GuestModel_myLog('FilesNoExternal: add listener to folder...');
                                        dojo.byId("lconn_files_action_createcollection_0_text").addEventListener("click", function () {
                                            //
                                            //  In the "Folder..." listener, let's wait for the Create Folder form to be created...
                                            //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                            //
                                            __GuestModel_myLog('FilesNoExternal: clicking folder...');
                                            waitForSetExt('Folder', 'lconn_share_widget_Dialog_', '.lotusDialogWrapper.dijitDialog');
                                        });
                                        //
                                        //  This is the eventListener for the "New Document" button...
                                        //
                                        __GuestModel_myLog('FilesNoExternal: add listener to NewDocument...');
                                        dojo.byId("com_ibm_concord_lcext_newconcorddoc_0_text").addEventListener("click", function () {
                                            //
                                            //  In the "New Document..." listener, let's wait for the Create Document form to be created...
                                            //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                            //
                                            __GuestModel_myLog('FilesNoExternal: clicking NewDocument...');
                                            waitForSetExt('NewDocument', 'lconn_share_widget_LotusDialog_', '.dijitDialog');
                                        });
                                        //
                                        //  This is the eventListener for the "New Presentation" button...
                                        //
                                        __GuestModel_myLog('FilesNoExternal: add listener to NewPres...');
                                        dojo.byId("com_ibm_concord_lcext_newconcordpres_0_text").addEventListener("click", function () {
                                            //
                                            //  In the "New Presentation..." listener, let's wait for the Create Document form to be created...
                                            //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                            //
                                            __GuestModel_myLog('FilesNoExternal: clicking NewPres...');
                                            waitForSetExt('NewPres', 'lconn_share_widget_LotusDialog_', '.dijitDialog');
                                        });
                                        //
                                        //  This is the eventListener for the "New Spreadsheet" button...
                                        //
                                        __GuestModel_myLog('FilesNoExternal: add listener to NewSheet...');
                                        dojo.byId("com_ibm_concord_lcext_newconcordsheet_0_text").addEventListener("click", function () {
                                            //
                                            //  In the "New Spreadsheet..." listener, let's wait for the Create Document form to be created...
                                            //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                            //
                                            __GuestModel_myLog('FilesNoExternal: clicking NewSheet...');
                                            waitForSetExt('NewSheet', 'lconn_share_widget_LotusDialog_', '.dijitDialog');
                                        });
                                    } catch (ex) {
                                        alert("FilesNoExternal: Error creating listeners for the checkboxes : " + ex);
                                    }
                                }, "lconn_files_action_uploadfile_0_text");
                            } else {
                                //
                                //  Since it is NOT the first time we click on NEW, 
                                //  it is not usefull to add again an event listener on the two sub-items
                                //
                                __GuestModel_myLog('FilesNoExternal: Clicking again on the NEW button. Ignoring ...');
                            }
                        });
                    } catch (ex) {
                        alert("FilesNoExternal: Error creating listeners for the buttons under NEW : " + ex);
                    }
                }, "lconn_files_action_createitem_0");
            } else {
                __GuestModel_myLog('FilesNoExternal: user is Allowed to access: nothing to do...');
            }
            __GuestModel_myLog('FilesNoExternal: finish');
        });
    } catch (ex) {
        alert("FilesNoExternal error: MAIN: " + ex);
    }
});
