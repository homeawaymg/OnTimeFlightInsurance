
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;
    let operationalStatus = true;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            var flight = DOM.elid('check-insured-flight').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('change-op-status').addEventListener('click', () => {
            operationalStatus  = operationalStatus ? false : true;

            contract.setOperationalStatus(operationalStatus, (error, result) => {
                console.log(error, result);
                DOM.elid('find-op-status').click;

            })
        })
        DOM.elid('find-op-status').addEventListener('click', () => {
            contract.isOperational((error, result) => {
                console.log(error,result);
                display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
            });
    
        })

        DOM.elid('purchase-insurance').addEventListener('click', () => {
            var flight = DOM.elid('flight-insured').value;
            var amount = DOM.elid('flight-insurance-amount').value;
            contract.purchaseInsurance(flight,amount, (error, result) => {
                console.log(error,result);
                display('Insurance', 'Purchasing Insurnace', [ { label: 'Insurance Purchase Status', error: error, value: result} ]);
            });
    
        })

        DOM.elid('request-credit').addEventListener('click', () => {
            
            contract.creditInsurance((error, result) => {
                console.log(error,result);
                display('Insurance', 'Credit Requested', [ { label: 'Credit Status', error: error, value: result} ]);
            });
    
        })

        DOM.elid('request-payout').addEventListener('click', () => {
            
            contract.requestPayout((error, result) => {
                console.log(error,result);
                display('Insurance', 'Credit Requested', [ { label: 'Credit Status', error: error, value: result} ]);
            });
    
        })


    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    displayDiv.innerHTML = "";
    let section = DOM.section();
    
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? "ERROR " + String(result.error) : "Success " + String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







