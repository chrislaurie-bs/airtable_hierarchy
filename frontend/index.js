import {
    FieldPickerSynced,    
    ViewPickerSynced,
    initializeBlock, 
    useBase,
    useRecords,
    useGlobalConfig,
    expandRecord,
    useSettingsButton,
    TablePickerSynced,
    TextButton,
    Button,    
    FormField, 
    Input,
    Box,
} from '@airtable/blocks/ui';
import React, {useState} from 'react';

function HierarchyBlock() {
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(function() {
        setIsShowingSettings(!isShowingSettings);
    });
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const treeTableId = globalConfig.get('treeTableId');
    const tablePicker = <TablePickerSynced globalConfigKey="treeTableId" placeholder = "Pick a self related table."/>;    
    const treeTable = base.getTableByIdIfExists(treeTableId);
    console.log('tree table=' + treeTable?.name);

    const viewId = globalConfig.get('viewId');
    var treeView;
    const viewPicker = <ViewPickerSynced 
        table = {treeTable} 
        globalConfigKey = "viewId" 
        placeholder = "Pick view to use."/
    >
    console.log('view id field=' + viewId);

    if(treeTable && viewId){
        const view = treeTable.views.filter((view) => view.id == viewId);
        treeView = view ? view[0] : null;
    }

    const parentIdFieldId = globalConfig.get('parentIdFieldId');
    const parentIdFieldPicker = <FieldPickerSynced table = {treeTable} globalConfigKey = "parentIdFieldId" placeholder = "Pick parent column."/>
    console.log('parent id field=' + parentIdFieldId);

    const descriptionFieldId = globalConfig.get('descriptionFieldId');
    const descriptionField = treeTable.getFieldByIdIfExists(descriptionFieldId);
    const descriptionFieldPicker = <FieldPickerSynced 
            table = {treeTable} 
            globalConfigKey = "descriptionFieldId" 
            placeholder = "Pick description column for quick add."
        />
    console.log('descriptionField field id=' + parentIdFieldId);


    var rootWord = globalConfig.get('rootWord');
    if(!rootWord){rootWord = '<Root>'}
    const enterRootWord =     <FormField 
            label='Root word:'
            description = 'Enter the word to use for the root level - records that have no parents.'
            style = {{padding: 10}}
        >
            <Input value={rootWord} onChange={e => globalConfig.setAsync('rootWord', e.target.value)} />
        </FormField>


    const treeOpts = {
        fields: [parentIdFieldId],
    };

    let [parentId, setparentId] = useState('');
    parentId = parentId ? parentId : '';
    console.log('parentId=' + parentId);
    let backparentId = '';


    const treeRecords = useRecords(treeView, treeOpts);
    console.log('There be trees ' + treeRecords?.length);

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
            console.log('treeNodes.setBackParent ' + backparentId);
        }
        return (childOf == parentId) ;
    } ) : null;
    console.log('backparentId=' + backparentId);

//crumb navigation starts here  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    let crumbParent = parentId
    let crumbNames = '';
    let nodeTree = [];
    let insurance = 10;


    
    while (true && treeRecords){
            insurance --;
        
        const parentNode = treeRecords.filter((node) => node.id == crumbParent);
        console.log('while true filtered crumbParent=' + crumbParent 
            + '; records=' + parentNode.length 
            + '; name=' + parentNode[0]?.name  
            + '; id=' + parentNode[0]?.id
        );
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
    console.log('There be ancestry: ' + nodeTree.length);
    
    let nodeTreeRows = nodeTree ? nodeTree.map(node => (        
        <NodeTreeRow
            key = {node.id}
            name = {node.name}
            nodeId = {node.id}
            setparentId = {setparentId}
        />
    )) : null ;
//crumb navigation end here <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    const parentName = (nodeTree) ? nodeTree[nodeTree.length-1].name : '';

    const emptyMessage = (treeTableId && parentIdFieldId)
        ? "No children were found for " + parentName + ". Use the navigation links above or use the quick add form below to add one."
        : "Hierarchy has not been set up properly. Please use the settings button to define your hierarchy view.";

    const nodeRows = (treeNodes?.length > 0) ? treeNodes.map(node => (
        <NodeRow
            key = {node.id}
            node = {node}
            currentparentId = {parentId}
            setparentId = {setparentId}
            viewId = {viewId}
        />
    )) : <div style={{padding: 10, alignItems: "center"}}>{emptyMessage}</div>;


    const gotoRoot = <Button onClick = {() => {setparentId('')}}>Goto Root</Button>

    // var addDescription ='';
    const [addDescription, setaddDescription] = useState("");
    const descriptionPlaceHolder = "Enter " + descriptionField.name;
    const formLabel = "Quick add to: "  + parentName;
    const quickAddForm = (nodeTree && descriptionFieldId ) 
        ?   <Box
                padding="20px"
                border="thick"
                borderRadius="large"
                overflow="autos"
            >
                <div>
                    <FormField
                        label= {formLabel}
                    >
                        <Input
                            placeholder = {descriptionPlaceHolder}
                            value = {addDescription}
                            onChange={e => setaddDescription(e.target.value)}
                        />
                    </FormField>
                    <Button 
                        onClick = {() => {
                            alert("Don't press this  button again! " + addDescription);
                        }}
                        width = "100%"
                    >
                        Add
                    </Button>
                </div>
            </Box>
        : 'Enable quick add by configuring a description field in settings.'


// Settings ui >>>>>>>>>>>>>>>>>>>>>>>>
    if(isShowingSettings){
        return <div>
            {tablePicker}
            {viewPicker}
            {parentIdFieldPicker}
            {descriptionFieldPicker}
            {enterRootWord}
        </div>
    }
// Settings ui <<<<<<<<<<<<<<<<<<<<<<
    

//ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>    
    return <div>
            <div style={{padding: 10}}>{nodeTreeRows}</div>
            {nodeRows}
            <div style = {{margin:15}}>{quickAddForm}</div>
        </div>;
//ui <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<        

}

function NodeTreeRow({name, nodeId, setparentId}){
    console.log('nodeTreeRow name=' + name + '; nodeId=' + nodeId + '; setparentId=' + setparentId);
    name = '<' + name +'>'
    return <span style = {{
            // padding: 5,
             margin:5,
         }}>
        <TextButton
            variant = "dark"
            size = "small"
            aria-label = "Go to"
            style = {{color: "blue"}}
            onClick = {() => {
                console.log('NodeTreeRow Set new parent nodeId=' + nodeId);                
                setparentId(nodeId);
                // setBackparentId(currentparentId);
            }}                
        >
            {name}
        </TextButton>
    </span>
}


function NodeRow({node, currentparentId, setparentId, viewId}){
    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        padding: 6,
        borderBottom: '1px solid #ddd',
    };
    const spanStyle = {
        display: 'flex',
        alignItems: 'center',
    };
    return (node.name === '') ? null : (
        <div style={rowStyle} >
            <TextButton
                variant = "dark"
                size = "large"
                onClick = {() => {
                    console.log('NodeRow Set new parent id=' + node.id);
                    setparentId(node.id);
                }}                
            >
                {node.name}
            </TextButton>
            
            <TextButton
                icon = "expand"
                aria-label ="Expand record"
                variant="dark"
                onClick = {() => {
                    expandRecord(node);
                   
                }}
            />
        </div>
    );
}

function quickAdd(parentId, descripion, table){

}


initializeBlock(() => <HierarchyBlock />);
