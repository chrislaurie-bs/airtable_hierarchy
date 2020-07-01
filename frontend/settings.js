import {
    FieldPickerSynced,    
    ViewPickerSynced,
    useBase,
    useGlobalConfig,
    useSynced,
    TablePickerSynced,
    FormField, 
    Input,
    Switch,
    Heading,
    Label,
    Box,
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
        style={{marginLeft: "5px"}}
    />
    return <div><Prompt prompt = "Table:"/>{tablePicker}</div>;
}

function ViewSettingsRow(){
    const viewPicker = <ViewPickerSynced 
            table = {treeTable} 
            globalConfigKey = "viewId" 
            placeholder = "Pick view to use."
            width = {entryWidth}
            style={{marginLeft: "5px"}}
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
        style={{marginLeft: "5px"}}
    />
    return (!treeTable) ? null : <div><Prompt prompt = "Parent field:"/>{parentIdFieldPicker}</div>;
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

function DescriptionFieldRow (){
    const enableQuickAdd = useGlobalConfig().get('enableQuickAdd');
    const descriptionFieldPicker = (!enableQuickAdd) ? null : <FieldPickerSynced 
            shouldAllowPickingNone={true}
            allowedTypes = {[FieldType.SINGLE_LINE_TEXT]}
            table = {treeTable} 
            globalConfigKey = "descriptionFieldId" 
            placeholder = "Pick description column for quick add."
            width = {entryWidth - 30}
            style = {{marginLeft: "30px"}}
        />
    return  (!enableQuickAdd) ? null : <div><Prompt prompt = "Description field:" indent = {true}/>{descriptionFieldPicker}</div>;

}

function RootWordRow(){
    const globalConfig = useGlobalConfig();
    var rootWord = globalConfig.get('rootWord');    
    if(!rootWord){rootWord = '<Root>'}
    const rootWordField = (!treeTable) ? null : <FormField 
            label='Root word:'
            width = {entryWidth}
            style = {{paddingLeft: "5px"}}
        >
            <Input value={rootWord} onChange={e => globalConfig.setAsync('rootWord', e.target.value)} />
        </FormField>
    return (!treeTable) ? null : <div>{rootWordField}</div>;
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

function Prompt ({prompt, indent=false}){
    return <div>
            <Label
                size="small"
                // textColor="light"
                style={{ 
                    paddingLeft: "5px" ,
                    marginLeft: (!indent) ? "" : "30px",
                }}
            >
                {prompt}
            </Label>
        </div>
}

function MySettingsPage(){
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const treeTableId = globalConfig.get('treeTableId');
    treeTable = base.getTableByIdIfExists(treeTableId);

    return (<Box
            flex="none"
            display="flex"
            flexDirection="column"
            width="300px"
            backgroundColor="white"
            style = {{marginRight: "20px"}}
        >
            <div>
                <div>
                    <Heading size="large" style={{marginLeft: "10px"}}>Hierarchy Set-up</Heading>
                    <TableSettingsRow/>
                    <ViewSettingsRow/>
                    <ParentFieldSettingsRow/>
                    <QuickAddRow/>
                    <DescriptionFieldRow/>
                    <RootWordRow/>
                    <WrapCrumbsRow/>
                </div>
            </div>
        </Box>
    );
}

export default function SettingsPage() {return MySettingsPage()}