import { LightningElement, wire, track } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
// imports
// import getBoatTypes from the BoatDataService => getBoatTypes method';
 
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';
    
    // Private
    error = undefined;
    
    searchOptions
    // searchOptions = [{ label: 'All Types', value: '' }];

    // connectedCallback() {
    //     var getBoatT = getBoatTypes()
    //     Promise.all([getBoatT]).then(results => {
    //         if(results && results[0]) {
    //             console.log('Results boat type:', results[0])
    //             for(let item of results[0]) {
    //                 console.log('Results boat type:', item)
    //                 this.searchOptions.push({ label: item.Name.trim().replace(' ', ''), value: item.Name })
    //             }
    //         }
    //     })
    // }
    
    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        if (data) {
            console.log('Data from the wire: ', data)
            this.searchOptions = data.map(type => ({
                // TODO: complete the logic
                label: type.Name, value: type.Id
            }));
            this.searchOptions.unshift({ label: 'All Types', value: '' });
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        let value = event.target.value.trim()
        let labelIndex = this.searchOptions.findIndex(x => x.value === value)
        let label = this.searchOptions[labelIndex].label
        console.log('Boat type Label: ', label)
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        this.selectedBoatTypeId = value
        const searchEvent = new CustomEvent('search', {
            detail : {
                value : value,
                label : label,
                boatTypeId: value
            }
        });
        this.dispatchEvent(searchEvent);
    }
  }