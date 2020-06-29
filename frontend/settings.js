import {
    FieldPickerSynced,    
    ViewPickerSynced,
    initializeBlock, 
    useBase,
    useRecords,
    useGlobalConfig,
    useSynced,
    expandRecord,
    useSettingsButton,
    TablePickerSynced,
    TextButton,
    Button,    
    FormField, 
    Input,
    Box,
    Switch,
    ConfirmationDialog,
    Dialog,
    Text,
    Heading,
    TablePicker,
    Label,
} from '@airtable/blocks/ui';
import {FieldType} from '@airtable/blocks/models';
import React, {useState} from 'react';
import logThis from './logthis.js';

const entryWidth = "300px";

var treeTable;


function TableSettingsRow(){
    const tablePicker =  <TablePickerSynced 
        globalConfigKey="treeTableId"             
        placeholder = "Pick a self related table."
        width = {entryWidth}
        style = {{margin: "5px"}}
    />
    return <div><Prompt prompt = "Table:"/>{tablePicker}</div>;
}

function ViewSettingsRow(){
    const viewPicker = <ViewPickerSynced 
            table = {treeTable} 
            globalConfigKey = "viewId" 
            placeholder = "Pick view to use."
            width = {entryWidth}
            style = {{margin: "5px"}}
        />
    return  (!treeTable) ? null :  <div><Prompt prompt = "View:"/>{viewPicker}</div>;

}

function ParentFieldSettingsRow(){
    const parentIdFieldPicker = <FieldPickerSynced 
        table = {treeTable} 
        allowedTypes = {[FieldType.MULTIPLE_RECORD_LINKS]}
        globalConfigKey = "parentIdFieldId" 
        placeholder = "Pick parent column."
        width = {entryWidth}
        style = {{margin: "5px"}}
    />
    return (!treeTable) ? null : <div><Prompt prompt = "Parent field:"/>{parentIdFieldPicker}</div>;
}

function FieldButton ({fieldName, onClick}){
    // return <span>{fieldName} </span>
    return <Button
            onClick = {onClick}
            variant="secondary"
            icon = "x"
            size = "small"
            style={{marginLeft:"5px"}}
        >
            {fieldName}
        </Button>
}

function DisplayFieldsRow(){
    const globalConfig = useGlobalConfig();
    var showFieldIds = globalConfig.get('showFieldIds') ?? [];
    const addShowFieldPicker = <FieldPickerSynced 
            table = {treeTable} 
            globalConfigKey = "addThisFieldId" 
            placeholder = "Add additional field to display"
            width = {entryWidth}
            
            style = {{margin: "5px"}}
        />

    const addThisFieldId = globalConfig.get('addThisFieldId');
    logThis('Add this field=' + addThisFieldId);
    if(addThisFieldId){
        if(!showFieldIds.find(id =>id == addThisFieldId)){            
            showFieldIds.push(addThisFieldId);
            globalConfig.setAsync('showFieldIds',showFieldIds);
        }        
        globalConfig.setAsync('addThisFieldId','');
        
    }    

    const fieldButtons = (!showFieldIds || showFieldIds.empty) ? null : showFieldIds.map((fieldId, index) => {
        return <FieldButton
                key = {fieldId}
                fieldName = {treeTable.getFieldByIdIfExists(fieldId)?.name}
                onClick = {() => {
                        showFieldIds = showFieldIds.filter(id => id != fieldId);
                        globalConfig.setAsync('showFieldIds',showFieldIds);
                    }
                }
            />
    });

    return (!treeTable) ? null :
        <div> 
            <Prompt prompt = "Additional display fields:"/>
            <div>
                {fieldButtons}
            </div>                
            <div>
                {addShowFieldPicker}
            </div>
        </div>
    ;    
}

function QuickAddRow(){
    const [enableQuickAdd, setEnableQuickAdd, canSetEnableQuickAdd] = useSynced('enableQuickAdd');
    return (!treeTable) ? null : <Switch
        value={enableQuickAdd}
        onChange={newValue => setEnableQuickAdd(newValue)}
        label="Enable Quick Add"
        width = {entryWidth}
        style = {{margin: "5px"}}
    />

}

function RootWordRow(){
    const globalConfig = useGlobalConfig();
    var rootWord = globalConfig.get('rootWord');    
    if(!rootWord){rootWord = '<Root>'}
    const rootWordField = (!treeTable) ? null : <FormField 
            label=''
            // description = 'Enter the word to use for the root level - records that have no parents.'
            width = {entryWidth}
            style = {{padding: "5px"}}
        >
            <Input value={rootWord} onChange={e => globalConfig.setAsync('rootWord', e.target.value)} />
        </FormField>
    return (!treeTable) ? null : <div><Prompt prompt = "Root word:"/>{rootWordField}</div>;
}

function WrapCrumbsRow(){
    const [wrapCrumbs, setWrapCrumbs, canSetWrapCrumbs] = useSynced('wrapCrumbs');
    return (!treeTable) ? null : <Switch
    value={wrapCrumbs}
    onChange={newValue => setWrapCrumbs(newValue)}
    label="Wrap navigation links (in [])"
    width = {entryWidth}
    style = {{margin: "5px"}}
  />
}

function DescriptionFieldRow (){
    const enableQuickAdd = useGlobalConfig().get('enableQuickAdd');
    const descriptionFieldPicker = (!enableQuickAdd) ? null : <FieldPickerSynced 
            shouldAllowPickingNone={true}
            allowedTypes = {[FieldType.SINGLE_LINE_TEXT]}
            table = {treeTable} 
            globalConfigKey = "descriptionFieldId" 
            placeholder = "Pick description column for quick add."
            width = {entryWidth}
            style = {{margin: "5px"}}
        />
    return  (!enableQuickAdd) ? null : <div><Prompt prompt = "QuickAdd description field:"/>{descriptionFieldPicker}</div>;

}

function Prompt ({prompt}){
    // return <span style={{verticalAlign: "middle",float: "left", paddingLeft: "5px", width: "120px"}}>{prompt}</span>
    // return <div style={{paddingLeft: "5px"}}>{prompt}</div>
    return <Heading size="xsmall" textColor="light" style={{paddingLeft:"5px"}}>{prompt}</Heading>
}

function MySettingsPage(){
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const treeTableId = globalConfig.get('treeTableId');
    treeTable = base.getTableByIdIfExists(treeTableId);

    return <div>
        <div>
            <Heading size="large" style={{marginLeft: "10px"}}>Hierarchy Set-up</Heading>
            <TableSettingsRow/>
            <ViewSettingsRow/>
            <ParentFieldSettingsRow/>
            <QuickAddRow/>
            <DescriptionFieldRow/>
            <DisplayFieldsRow/>
            <RootWordRow/>
            <WrapCrumbsRow/>
        </div>
    </div>
}

export default function SettingsPage() {return MySettingsPage()}