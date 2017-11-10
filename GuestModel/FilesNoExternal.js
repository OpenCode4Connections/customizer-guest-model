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

var dojoFilesNoExternal = new __cBill_waitForDojo('FilesNoExternal');
dojoFilesNoExternal.do(function () {
    __cBill_logger('FilesNoExternal : Dojo is defined !');
    try {
        let removeAccess = function (idName, theWidgets, fatherClass, isAllowed) {
            if (theWidgets) {
                __cBill_logger('FilesNoExternal.removeAccess : starting...');
                for (let i = 0; i < theWidgets.length; i++) {
                    //
                    //  Convolution for InternetExplorer !!!
                    //
                    let testResult = false;
                    if ((navigator.appVersion.indexOf("Trident")!= -1) || (navigator.appVersion.indexOf("Edge")!= -1)) {
                        testResult = (theWidgets[i].id.indexOf(idName) == 0);
                    } else {
                        testResult = theWidgets[i].id.startsWith(idName);
                    }                                            
                    if (testResult) {
                        //
                        // Force the Checkbox to be UNCHECKED
                        //
                        __cBill_uncheckBox2(theWidgets[i]);
                        if (!isAllowed) {
                            //
                            //  Current user is not a member of the Membership Community
                            //  Thus, the user cannot create an external community
                            //
                            let divFilesExt = theWidgets[i].parentNode;
                            if (__cBill_hideNoDestroy) {
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
                                    //  Convolution for InternetExplorer !!!
                                    //
                                    let newElem = null;
                                    if ((navigator.appVersion.indexOf("Trident")!= -1) || (navigator.appVersion.indexOf("Edge")!= -1)) {
                                        newElem = dojo.query(divFilesExt).closest('tbody');
                                        newElem = newElem[0];
                                    } else {
                                        newElem = divFilesExt.closest('tbody');
                                    }                                    
                                    //
                                    //  Removing the advertisement
                                    //
                                    dojo.addClass(newElem.children[1], "lotusHidden");
                                }
                            }
                        } else {
                            __cBill_logger('FilesNoExternal.removeAccess: user is Allowed to access: nothing to do...');                            
                        }
                    }
                }
            } else {
                alert('FilsNoExternal.removeAccess : Error : UploadFile : External access checkbox does not exist');
            }
        };
        let waitForSetExt = function(label, widgetName, fatherClass, isAllowed) {
            __cBill_logger('FilesNoExternal.waitForSetExt: start for ' + label + '...');
            let waitForWidget = new __cBill_waitByQuery('FilesNoExternal.waitForSetExt.' + label);
            waitForWidget.onlyWhenParentVisible = true;
            waitForWidget.parentToBeVisible = fatherClass;
            waitForWidget.do(function (theWidgets) {
                __cBill_logger('FilesNoExternal.waitForSetExt: remove access to ' + label + '...');
                try {
                    removeAccess(widgetName, theWidgets, fatherClass, isAllowed);
                    __cBill_logger('FilesNoExternal.waitForSetExt: ' + label + ' access removed for user !');
                } catch (ex) {
                    alert('FilesNoExternal.waitForSetExt: Error executing the processing for the ' + label + ' Checkbox : ' + ex);
                }
            }, '[name="_setExt"]');
        }

        //
        // Start of Processing
        //
        __cBill_logger('FilesNoExternal: start');
        __GuestModel_firstACL.checkUser('FilesNoExternal', function (isAllowed) {
            //
            //  Wait for the NEW button to be created ...
            //
            let waitForById = new __cBill_waitById('FilesNoExternal');
            waitForById.do(function (newButtonWidget) {
                try {
                    //
                    //  The NEW Button has been created. We assume the whole page is ready now
                    //
                    //  Add an eventListener for the Drag/drop function of a file on the page
                    //
                    __cBill_logger('FilesNoExternal : adding DRAG/DROP EventListener....');
                    dojo.byId('lotusFrame').addEventListener('drop', function (e) {
                        __cBill_logger('FilesNoExternal : inside DRAG/DROP EventListener....');
                        waitForSetExt('DragDrop', 'lconn_files_widget_UploadFile_', '.lotusDialogWrapper.dijitDialog', isAllowed);
                    });
                    //
                    //  Add an eventListener to be triggered IF and WHEN the user clicks on "NEW"...
                    //  All the "create" functions are triggered from the dropdown on the NEW button.
                    //
                    //  firstClick is used to avoid adding the same listeners more than once...
                    //
                    let firstClick = true;
                    __cBill_logger('FilesNoExternal: add listener to NEW...');
                    newButtonWidget.addEventListener("click", function () {
                        if (firstClick) {
                            firstClick = false;
                            //
                            //  The user has clicked on the NEW Button for the first time...
                            //  Let's wait for the dropdown to be created...
                            //
                            let waitForById2 = new __cBill_waitById('FilesNoExternal');
                            waitForById2.do(function (uploadFileWidget) {
                                try {
                                    //
                                    //  The dropdown under NEW has been created.
                                    //  Now we need to add eventListeners on the "Folder..." and "Upload..." items...
                                    //
                                    //  This is the eventListener for the "Upload File" button...
                                    //
                                    __cBill_logger('FilesNoExternal: add listener to upload...');
                                    uploadFileWidget.addEventListener("click", function () {
                                        //
                                        //  In the "Upload..." listener, let's wait for the Upload form to be created 
                                        //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                        //
                                        __cBill_logger('FilesNoExternal: clicking upload...');
                                        waitForSetExt('Upload', 'lconn_files_widget_UploadFile_', '.lotusDialogWrapper.dijitDialog', isAllowed);
                                    });
                                    //
                                    //  This is the eventListener for the "Folder" button...
                                    //
                                    __cBill_logger('FilesNoExternal: add listener to folder...');
                                    dojo.byId("lconn_files_action_createcollection_0_text").addEventListener("click", function () {
                                        //
                                        //  In the "Folder..." listener, let's wait for the Create Folder form to be created...
                                        //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                        //
                                        __cBill_logger('FilesNoExternal: clicking folder...');
                                        waitForSetExt('Folder', 'lconn_share_widget_Dialog_', '.lotusDialogWrapper.dijitDialog', isAllowed);
                                    });
                                    //
                                    //  This is the eventListener for the "New Document" button...
                                    //
                                    __cBill_logger('FilesNoExternal: add listener to NewDocument...');
                                    dojo.byId("com_ibm_concord_lcext_newconcorddoc_0_text").addEventListener("click", function () {
                                        //
                                        //  In the "New Document..." listener, let's wait for the Create Document form to be created...
                                        //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                        //
                                        __cBill_logger('FilesNoExternal: clicking NewDocument...');
                                        waitForSetExt('NewDocument', 'lconn_share_widget_LotusDialog_', '.dijitDialog', isAllowed);
                                    });
                                    //
                                    //  This is the eventListener for the "New Presentation" button...
                                    //
                                    __cBill_logger('FilesNoExternal: add listener to NewPres...');
                                    dojo.byId("com_ibm_concord_lcext_newconcordpres_0_text").addEventListener("click", function () {
                                        //
                                        //  In the "New Presentation..." listener, let's wait for the Create Document form to be created...
                                        //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                        //
                                        __cBill_logger('FilesNoExternal: clicking NewPres...');
                                        waitForSetExt('NewPres', 'lconn_share_widget_LotusDialog_', '.dijitDialog', isAllowed);
                                    });
                                    //
                                    //  This is the eventListener for the "New Spreadsheet" button...
                                    //
                                    __cBill_logger('FilesNoExternal: add listener to NewSheet...');
                                    dojo.byId("com_ibm_concord_lcext_newconcordsheet_0_text").addEventListener("click", function () {
                                        //
                                        //  In the "New Spreadsheet..." listener, let's wait for the Create Document form to be created...
                                        //  (more precisely, let's wait for the chekbox that allows to share externally...)
                                        //
                                        __cBill_logger('FilesNoExternal: clicking NewSheet...');
                                        waitForSetExt('NewSheet', 'lconn_share_widget_LotusDialog_', '.dijitDialog', isAllowed);
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
                            __cBill_logger('FilesNoExternal: Clicking again on the NEW button. Ignoring ...');
                        }
                    });
                } catch (ex) {
                    alert("FilesNoExternal: Error creating listeners for the buttons under NEW : " + ex);
                }
            }, "lconn_files_action_createitem_0");
            __cBill_logger('FilesNoExternal: finish');
        });
    } catch (ex) {
        alert("FilesNoExternal error: MAIN: " + ex);
    }
});
