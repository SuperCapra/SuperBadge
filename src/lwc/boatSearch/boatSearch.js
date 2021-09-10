import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
 // imports 
// { functions, context, scope } 
// import { ..., ..., ... } from 'lightning/messageService';
// import BOATMC from '@salesforce/...';
 // imports
 export default class BoatSearch extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    //boatTypeId = ''
    
    // Handles loading event
    handleLoading() { 
        this.isLoading = true
    }
    
    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false
    }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        console.log('Event boatTypeId: ', event.detail.boatTypeId)
        //this.boatTypeId = event.detail.boatTypeId
        this.template.querySelector("c-boat-search-results").searchBoats(event.detail.boatTypeId);
        // if(elemntBoatSearchResults) {
        //     //console.log('hey')
        //     elemntBoatSearchResults.searchBoats(this.boatTypeId)
        // }
    }
    
    createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        })
     }
  }