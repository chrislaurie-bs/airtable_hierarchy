import {
    initializeBlock, 
    useBase,
    useRecords,
    useGlobalConfig,
    expandRecord,
    useSettingsButton,
    TextButton,
    Button,    
    Input,
    Box,
    ConfirmationDialog,
    Dialog,
    Text,
    Heading,
} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import SettingsPage from './settings.js';
import logThis from './logthis.js';


function HierarchyBlock() {
    const entryWidth = "300px";
    logThis('------------------------------ Start of hierarchy block ---------------------------------------------------');

    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(function() {
        setIsShowingSettings(!isShowingSettings);
    });

    let [pruneThis, setPruneThis] = useState('');
    logThis('pruneThis=' + pruneThis);

    const base = useBase();
    const globalConfig = useGlobalConfig();

    const treeTableId = globalConfig.get('treeTableId');
    const treeTable = base.getTableByIdIfExists(treeTableId);
    logThis('tree table=' + treeTable?.name);

    const viewId = globalConfig.get('viewId');
    const treeView = treeTable?.getViewByIdIfExists(viewId);
    logThis('view id field=' + viewId + '; view=' + treeView?.name);


    const parentIdFieldId = globalConfig.get('parentIdFieldId');
    logThis('parent id field=' + parentIdFieldId);

    
    var rootWord = globalConfig.get('rootWord');

    const wrapCrumbs = globalConfig.get('wrapCrumbs');
    logThis('wrapCrumbs=' + wrapCrumbs);

    // const [enableQuickAdd, setEnableQuickAdd, canSetEnableQuickAdd] = useSynced('enableQuickAdd');
    const enableQuickAdd = globalConfig.get('enableQuickAdd');
    logThis('enableQuickAdd=' + enableQuickAdd);

    const descriptionFieldId = (!enableQuickAdd) ? null : globalConfig.get('descriptionFieldId');
    const descriptionField = (descriptionFieldId) ? treeTable.getFieldByIdIfExists(descriptionFieldId) : null;
    logThis('descriptionField field id=' + parentIdFieldId + '; name=' + descriptionField?.name);

    if(!isShowingSettings && (!treeTable || !parentIdFieldId)){
        setIsShowingSettings(true);
    }

    var fetchFields = [];
    fetchFields.push(parentIdFieldId);
    fetchFields.push(descriptionFieldId);    
    const treeOpts = {
        fields: fetchFields,
    };

    let [parentId, setparentId] = useState('');
    parentId = parentId ? parentId : '';
    logThis('parentId=' + parentId);
    let backparentId = '';


    const treeRecords = useRecords(treeView, treeOpts);
    logThis('There be trees ' + treeRecords?.length);

    var treeNodes = (treeRecords && treeView  && parentIdFieldId) ? treeRecords.filter(node => {
        let nodeId = node.id;
        let childOf = '';
        const parents = node.getCellValue(parentIdFieldId);
        if(parents){
            childOf = parents[0].id
        }
        
        // childOf = childOf ? childOf : '';
        if(nodeId == parentId){
            backparentId = childOf;
            logThis('treeNodes.setBackParent ' + backparentId);
        }
        return (childOf == parentId) ;
    } ) : null;
    logThis('backparentId=' + backparentId);

//crumb navigation starts here  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    let crumbParent = parentId
    let crumbNames = '';
    let nodeTree = [];
    let insurance = 10;
   
    while (true && treeRecords){
        insurance --;
        
        const parentNode = treeRecords.filter((node) => node.id == crumbParent);
        if(!parentNode || parentNode.length == 0 || insurance == 0){
            break
        }
        nodeTree.push(parentNode[0]);
        crumbNames = parentNode[0].name + ' ' + crumbNames;
        const parents = parentNode[0].getCellValue(parentIdFieldId);
        if(parents){
            crumbParent = parents[0].id;
        } else {
            crumbParent = null;
        }
    }

    if(treeRecords){
        var rootNode = {id: '', name: rootWord};
        nodeTree.push(rootNode);
    }
    
    nodeTree.reverse()
    logThis('There be ancestry: ' + nodeTree.length);
    
    let nodeTreeRows = nodeTree ? nodeTree.map(node => (        
        <NodeTreeRow
            key = {node.id}
            name = {node.name}
            nodeId = {node.id}
            setparentId = {setparentId}
            wrapCrumbs = {wrapCrumbs}
        />
    )) : null ;

    //crumb navigation end here <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    const parentName = 
        (nodeTree != null && nodeTree.length > 0) 
        ? (wrapCrumbs ? '[' : '') + nodeTree[nodeTree.length-1].name + (wrapCrumbs ? ']' : '')
        : '';

    const emptyMessage = (treeTableId && parentIdFieldId)
        ? "No children were found for: " + parentName + ". Use the navigation links above"
            + ((!enableQuickAdd) ? '' :  " or use the quick add form below to add one") +"."
        : "Hierarchy has not been set up properly. Please use the settings button to define your hierarchy view.";

    logThis('In crumbs ');

    const nodeRows = (treeNodes?.length > 0) ? treeNodes.map(node => (
        <NodeRow
            key = {node.id}
            node = {node}
            setparentId = {setparentId}
            setPruneThis = {setPruneThis}
        />
    )) : <div style={{padding: 10, alignItems: "center"}}>{emptyMessage}</div>;


    const gotoRoot = <Button onClick = {() => {setparentId('')}}>Goto Root</Button>

    // var addDescription ='';
    const quickAddForm = (treeTable && nodeTree) 
        ?   <AddFormButton
                descriptionFieldName = {descriptionField?.name}
                parentName = {parentName}
                tableName = {treeTable.name}
                parentId = {parentId}
                table = {treeTable}
                descriptionFieldId = {descriptionFieldId}
                parentfieldId = {parentIdFieldId}
                wrapCrumbs = {wrapCrumbs}
            />
        : 'Enable quick add by configuring a description field in settings.'


// Settings ui >>>>>>>>>>>>>>>>>>>>>>>>
    if(isShowingSettings){
        return <SettingsPage />
    }
// Settings ui <<<<<<<<<<<<<<<<<<<<<<

    var pruneThisRecord;
    if(pruneThis && pruneThis != '') {
        const pruneRecords = treeRecords.filter(rec => rec.id == pruneThis);
        pruneThisRecord = pruneRecords[0];
    }


    const graftButton = <GraftHere
        table = {treeTable}
        parentId = {parentId}
        parentFieldId = {parentIdFieldId}
        pruneThisRecord = {pruneThisRecord}
        setPruneThis = {setPruneThis}
        parentName = {parentName}
        wrapCrumbs = {wrapCrumbs}
    />

//ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>    
    return <div>
            <div style={{padding: 10}}>
                {graftButton}
            </div>            
            <div style={{padding: 5}}>{nodeTreeRows}</div>
            {nodeRows}
            {enableQuickAdd && (<div style = {{margin:15}}>{quickAddForm}</div>)}
        </div>;
//ui <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<        

} // end <HierarchyBlock>

function GraftHere({table, parentId, parentFieldId, setPruneThis, pruneThisRecord, parentName, wrapCrumbs}){
    logThis('Graft pruneThis=' + pruneThisRecord?.name + '; table=' + table?.name + '; parentId=' + parentId);
    if (!pruneThisRecord) {        
        return null;
    }
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const graftText = (wrapCrumbs ? '[' : '') + pruneThisRecord?.name + (wrapCrumbs ? ']' : '') + ' to ' + parentName;
    const [isGraftDialogOpen, setIsGraftDialogOpen] = useState(false);
    const messageTitle = 'Graft ' + graftText + '?';
    const messageBody = 'This move ' + pruneThisRecord?.name +' to be under parent ' + parentName
        + '. Are you SURE you want to do this';
    return <div>
                <div>
                <Button
                    variant="danger"                
                    onClick={() => setIsGraftDialogOpen(true)}
                >
                    Graft {graftText}
                </Button>
            </div>
            <React.Fragment>
            {isGraftDialogOpen && (
                <ConfirmationDialog
                    title={messageTitle}
                    body={messageBody}
                    confirmButtonText = 'Graft'
                    onConfirm={() => {                                
                        setIsGraftDialogOpen(false);
                        const parents = (!parentId ? null : [{'id': parentId}]);
                        const recordFields = { [parentFieldId]: parents };
                        setPruneThis('');
                        if (table.hasPermissionToUpdateRecord(pruneThisRecord, recordFields)) {
                            const newRecordId = table.updateRecordAsync(pruneThisRecord,recordFields);                            
                        } else {
                            setIsErrorDialogOpen(true)
                        }
                    }}
                    onCancel={() => {
                        setPruneThis('');
                        setIsGraftDialogOpen(false);
                    }}
                />
            )}
            {isErrorDialogOpen && (
                <Dialog onClose={() => setIsErrorDialogOpen(false)} width="320px">
                    <Heading>Cannot graft entry</Heading>
                    <Text variant="paragraph">
                        Could not graft {graftText}.
                    </Text>
                    <Button onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
                </Dialog>
            )}
        </React.Fragment>
    </div>
    ;
}


function AddFormButton({descriptionFieldName, parentName, tableName, parentId, table, descriptionFieldId, parentfieldId, wrapCrumbs}){
    const [showForm, setShowform] = useState(true);
    return <div>
        <Button
            onClick={() => setShowform(!showForm)}
            size="small"
            icon = {(showForm) ? "chevronUp" : "chevronDown"}
            aria-label="Add"
            style={{marginBottom: 10}}
        > 
            Quick add to: {parentName}
        </Button>

        {showForm && (
            <AddForm 
                descriptionFieldName = {descriptionFieldName}
                parentName = {parentName}
                tableName = {tableName}
                parentId = {parentId}
                table = {table}
                descriptionFieldId = {descriptionFieldId}
                parentfieldId = {parentfieldId}
                wrapCrumbs = {wrapCrumbs}
            />
        )}
        
    </div>
}

function AddForm ({descriptionFieldName, parentName, tableName, parentId, table, descriptionFieldId, parentfieldId, wrapCrumbs}){
    const [addDescription, setaddDescription] = useState('');
    const descriptionPlaceHolder = 'Enter ' + descriptionFieldName
    // const formLabel = 'Quick add to: '  + parentName;
    const messageTitle = 'Add ' + (wrapCrumbs ? '[' : '') + addDescription + (wrapCrumbs ? ']' : '')  
        + ' to ' + parentName + '?';
    const messageBody = 'This will add a new ' + tableName +  ' row with ' + descriptionFieldName 
        + ' of "' +  addDescription + ' under ' + parentName 
        +'. Are you SURE you want to do this?';
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);


    return <Box
            padding="5px"
            border="default"
            borderRadius="large"
            overflow="auto"
        >
        <div>
            <div>
                <Input
                    placeholder = {descriptionPlaceHolder}
                    value = {addDescription}
                    onChange={e => setaddDescription(e.target.value)}
                    width = "70%"
                />
                <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    disabled = {!addDescription || addDescription == ''}
                    style = {{width: "80px", marginLeft: "10px"}}
                >
                    Add
                </Button>
            </div>
            <React.Fragment>
                {isAddDialogOpen && (
                    <ConfirmationDialog
                        title={messageTitle}
                        body={messageBody}
                        confirmButtonText = 'Add'
                        onConfirm={() => {                                
                            logThis('AddForm.confirm descriptionFieldId=' + descriptionFieldId + '; addDescription=' + addDescription 
                                + '; parentfieldId=' + parentfieldId + '; parentId=' + parentId + '; table.name=' + table.primaryField.name
                                + '; id=' + table.primaryField.id
                            );
                            setIsAddDialogOpen(false);
                            const parents = (!parentId ? null : [{'id': parentId}]);                            
                            const recordFields = (descriptionFieldId) 
                                ? {[descriptionFieldId]: addDescription, [parentfieldId]: parents}
                                : {[table.primaryField.id]: addDescription, [parentfieldId]: parents};
                            
                            if (table.hasPermissionToCreateRecord(recordFields)) {
                                const newRecordId = table.createRecordAsync(recordFields);
                            } else {
                                setIsErrorDialogOpen(true)
                            }
                            setaddDescription('');
                        }}
                        onCancel={() => setIsAddDialogOpen(false)}
                    />
                )}
                {isErrorDialogOpen && (<Dialog onClose={() => setIsErrorDialogOpen(false)} width="320px">
                        <Heading>Cannot add a new entry</Heading>
                        <Text variant="paragraph">
                            The new entry could not be added. This can happen if the description column
                            is a fomula, or link, or no longer exists.
                        </Text>
                        <Button onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
                    </Dialog>
                )}
            </React.Fragment>
        </div>
    </Box>
}

function NodeTreeRow({name, nodeId, setparentId, wrapCrumbs}){
    logThis('Entering nodetreeRow');
    name = (wrapCrumbs ? '[' : '') +  name + (wrapCrumbs ? ']' : '')
    return <span style = {{margin:5}}>
        <TextButton
            variant = "dark"
            size = "small"
            aria-label = "Go to"
            style = {{color: "blue"}}
            onClick = {() => {
                logThis('NodeTreeRow Set new parent nodeId=' + nodeId);                
                setparentId(nodeId);
                // setBackparentId(currentparentId);
            }}                
        >
            {name}
        </TextButton>
    </span>
}

function NodeRow({node, setparentId, setPruneThis}){
    const rowStyle = {
        display: 'flex',
        justifyContent: 'spaceBetween',
        fontSize: 12,
        padding: 6,
        borderBottom: '1px solid #ddd',
    };
    const spanStyle = {
        display: 'flex',
        alignItems: 'start',
    };
    return (node.name === '') ? null : (
        <div style={rowStyle} >
            <Button
                icon = "edit"
                size="small"
                aria-label ="Expand record"
                variant="secondary"
                style={{marginRight: "5px"}}
                onClick = {() => {
                    expandRecord(node);                   
                }}
            />
            <TextButton
                variant = "dark"
                size = "large"
                width = "80%"
                style={{justifyContent: "left"}}
                onClick = {() => {
                    logThis('NodeRow Set new parent id=' + node.id);
                    setparentId(node.id ?? '');
                }}                
            >
                <Text>{node.name}</Text>
            </TextButton>
            
            <Button 
                onClick={() => {
                    logThis('NodeRow Set prune id=' + node.id);
                    setPruneThis(node.id ?? '');
                }} 
                size="small"
            >
                <Text>Prune</Text>
            </Button>

            
        </div>
    );
}





initializeBlock(() => <HierarchyBlock />);
