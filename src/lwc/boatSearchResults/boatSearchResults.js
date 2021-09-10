import { LightningElement, wire, api, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats'
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList'
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = [{label: 'Name', fieldName: 'Name', editable: true },
        {label: 'Length', fieldName: 'Length__c', editable: true },
        {label: 'Price', fieldName: 'Price__c', editable: true },
        {label: 'Description', fieldName: 'Description__c', editable: true }];
    boatTypeId = '';
    @track boats;
    isLoading = false;
    error
    rowOffset = 0;
    @track draftValues = []
    wiredBoatsResult
    
    // wired message context
    @wire(MessageContext) messageContext;
    // wired getBoats method 
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats({data, error}) {
        if (data) {
            console.log('Data from the wire getBoats: ', data)
            this.boats = data
            this.error = undefined
            this.isLoading = false
            this.notifyLoading(this.isLoading)
        } else if (error) {
            this.boats = undefined;
            this.error = error;
        }
    }
    
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.boatTypeId = boatTypeId
        this.isLoading = true
        this.notifyLoading(this.isLoading)
        this.boatTypeId = boatTypeId;
        
        getBoats({
            boatTypeId : this.boatTypeId
        }).then(res => {
            if(res) {
                console.log('boats: ', res)
                let resComplete = {
                    data : res,
                    error : ''
                }
                this.wiredBoats(resComplete)
            }
        }).catch(err => {
            this.boats = undefined;
            this.error = error;
            console.log('error', err)
        })
    }
    
    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId
        this.sendMessageService(this.selectedBoatId);
    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BoatMC, { recordId : boatId });
    }
    
    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        this.notifyLoading(true);
        //const updatedFields = event.detail.draftValues;
        const recordInputs = event.detail.draftValues.slice().map(draft=>{
            const fields = Object.assign({}, draft);
            return {fields};
        });
        // Update the records via Apex
        //updateBoatList({data: updatedFields})
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then((res) => {
            console.log('res', res)
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            this.handleSuccess(SUCCESS_TITLE, MESSAGE_SHIP_IT, SUCCESS_VARIANT)
            this.draftValues = []
            return this.refresh()
        })
        .catch(error => {
            console.log('error', error)
            this.error = error
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: CONST_ERROR,
                    variant: ERROR_VARIANT
                })
            );
            this.handleSuccess(ERROR_TITLE, ERROR_TITLE, ERROR_VARIANT)
            this.notifyLoading(false);
        })
        .finally(() => { this.draftValues = []});
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(CustomEvent('doneloading'));
        }
    }

    handleSuccess(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}