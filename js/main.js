function onLoadIndex() {
    document.getElementById("current-date").value = new Date().toISOString().split('T')[0];
    document.getElementById("b-generate-report").addEventListener("click", onGenerateReport);
    document.getElementById("b-compute").addEventListener("click", onCompute);

    console.info(`
        const input = {
            name: String,
            surname: String,
            contactDate: YYYY-MMM-DD,
            firstSymptomsDate: YYYY-MMM-DD,
            testDate: YYYY-MMM-DD,
            currentDate: YYYY-MMM-DD,
            incubation: int,
            infectionGap: int,
            quarantineTime: int,
            szur: bool
        }
        console.log(compute(input))`)
}


function onGenerateReport(e) {
    e.preventDefault();
    const input = receiveInputs()   
    genereateReport(input.name, input.surname, compute(input))
    return false;
    
}
function onCompute() {
    const input = receiveInputs()
    document.getElementById("result").innerText = compute(input)

}
function receiveInputs() {
    const form = document.getElementById("form").elements
    const formValues = {
        name: form["name"].value,
        surname: form["surname"].value,      
        contactDate: form["contact-date"].value,
        firstSymptomsDate:form["first-sympotms-date"].value,
        testDate: form["test-date"].value,
        currentDate: form["current-date"].value,
        incubation: parseInt(form["incubation"].value),
        infectionGap: parseInt(form["infecting-gap"].value),
        quarantineTime: parseInt(form["quarantine-time"].value),
        szur: form["szur"].checked

    }
    return formValues 
}

function validate(input) {
    return (input.currentDate >= input.contactDate &&
        input.currentDate >= input.testDate &&
        input.currentDate >= input.firstSymptomsDate)
}

function compute(input) {
    if ( ! validate(input)) {
        return 'Niieprawidłowa data'
    }
    var confirmedCase, computedCase
    var youAreInfected = false
    const contactDate = new Date(input.contactDate)
    const firstSymptomsDate = new Date(input.firstSymptomsDate)
    const currentDate = new Date(input.currentDate)

    confirmedCase = transmissionInfectionPeriod(input.incubation, 
                                                input.infectionGap, 
                                                firstSymptomsDate, 
                                                input.quarantineTime)

    if (contactDate >= confirmedCase.startTrans &&
        contactDate <= confirmedCase.endTrans) {
            youAreInfected = true
            const firstSymptomsDate = new Date()
            firstSymptomsDate.setDate(contactDate.getDate() + input.incubation - input.infectionGap)
            computedCase = transmissionInfectionPeriod(input.incubation,
                                                        input.infectionGap,
                                                        firstSymptomsDate,
                                                        input.quarantineTime)
            
            if (currentDate <= computedCase.endTrans) {   
                return prepareResponse(youAreInfected, computedCase.endTrans)
            }           
    } 
    return prepareResponse(youAreInfected)
}
function prepareResponse(infection, quarantineEnd) {
    var response = ''
    if (infection) {
        response += 'Możliwość zarażenia'
    } else {
        response += 'Brak możliwości zarażenia'
    }
    if (quarantineEnd) {
        response += '\nIzolacja do ' + quarantineEnd.toISOString().split('T')[0]
    } else {
        response += '\nBrak potrzeby izolacji'
    }
    return response
}

function transmissionInfectionPeriod(incubation, infectionGap, firstSymptomsDate, quarantineTime) {
    // zarażenie -> inkubacja -> objawy
    //           |
    //           |
    //            -> czas od kiedy zarazamy -> transmisja -> kwarantanna -> koniec transmisji
    const MS_IN_DAY = 24 * 60 * 60 * 1000
    const startTransmission = new Date()
    startTransmission.setTime(firstSymptomsDate.getTime() - incubation * MS_IN_DAY + infectionGap * MS_IN_DAY)
    const endTransmission = new Date()
    endTransmission.setTime(startTransmission.getTime() + quarantineTime * MS_IN_DAY)
    const confirmedCase = {
        startTrans: startTransmission,
        endTrans: endTransmission
    }
    return confirmedCase
}

function genereateReport(name, surname, response) {
    var w = window.open("");
    const report = w.document.createElement("pre")
    report.innerText = name + " " + surname + 
        "\nWynik obliczeń:\n" + response + "\n\n" +
        'Wygenerowano: ' + new Date().toISOString()

    w.document.title = 'Raport COVID-19'
    w.document.body.appendChild(report); 
}
