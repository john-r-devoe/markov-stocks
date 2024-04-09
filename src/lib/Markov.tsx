export function predict(data:Array<{date:string, value:number}>, tolerance:number, months:number) : Array<{date:string, value:number}> | Error {
    let countStates:Array<{from:number, to:number, count:number, weight?:number}> = [];
    const getState = (slope:number):number|Error => {
        let state = undefined;
        if(slope > 0){
            if(slope <= tolerance){
                state = tolerance;
            }
            for(let i = 0; i <= slope + tolerance; i += tolerance){
                if(i >= slope){
                    state = i;
                }
            }
        }
        else if(slope < 0){
            if(slope >= -tolerance){
                state = -tolerance;
            }
            for(let i = 0; i >= slope - tolerance; i -= tolerance){
                if(i <= slope){
                    state = i;
                }
            }
        }
        else{
            state = 0;
        }
        return state ?? new Error("There was an error getting the state");
    }
    //populate countStates with number of times each state occurs
    let lastState = getState(data[1].value - data[0].value);
    for(let i = 2; i < data.length; i++){
        if(lastState instanceof Error){throw lastState;}
        const thisState = getState(data[i].value - data[i-1].value);
        if(thisState instanceof Error){throw thisState;}
        const existingItemIndex = countStates.findIndex((e) => e.from == lastState && e.to == thisState);
        if(existingItemIndex != -1){
            countStates[existingItemIndex].count += 1;
        }
        else{
            countStates.push({from:lastState, to:thisState, count:1});
        }
        lastState = thisState;
    }
    countStates = countStates.sort((a, b) => (a.from > b.from ? 1 : -1));
    //create states array
    const states = [countStates[0].from];
    let currentCountedState = states[0];
    for(let i = 0; i < countStates.length; i++){
        if(countStates[i].from != currentCountedState){
            currentCountedState = countStates[i].from;
            states.push(currentCountedState);
        }
    }
    //add weight to each item
    for(let i = 0; i < states.length; i++){
        let filteredCountStates = countStates.filter((e) => e.from == states[i]);
        let totalCount = 0;
        filteredCountStates.forEach((e) => {
            totalCount += e.count;
        });
        countStates.forEach((e) => {
            if(e.from == states[i]){
                e.weight = e.count / totalCount;
            }
        })
    }
    //create markov chain
    let markovChain:Array<Array<number>> = []
    for(let i = 0; i < states.length; i++){
        markovChain.push([]);
        for(let j = 0; j < states.length; j++){
            markovChain[i].push(0);
        }
    }
    countStates.forEach((e) => {
        markovChain[states.indexOf(e.from)][states.indexOf(e.to)] = e.weight ?? -1;
    });
    console.log("states: " + states);
    console.log("markov chain: ");
    console.log(markovChain);
    //generate new data
    const predictedData:Array<{date:string, value:number}> = [];
    let currentDate = new Date(data[data.length-1].date);
    let currentState = getState(data[data.length - 1].value - data[data.length - 2].value);
    let currentValue = data[data.length-1].value;
    if(currentState instanceof Error){throw currentState;}
    const length = Math.floor(months * 30.4167);
    for(let i = 0; i < length; i++){
        currentDate.setDate(currentDate.getDate() + 1);
        const weights = markovChain[states.indexOf(currentState)];
        const cummulativeWeights = [weights[0]];
        for(let j = 1; j < weights.length; j++){
            cummulativeWeights.push(cummulativeWeights[j-1] + weights[j]);
        }
        let randomNum = parseFloat((Math.random() * (cummulativeWeights[cummulativeWeights.length - 1] - 0) + 0).toFixed(4));
        let found = false;
        cummulativeWeights.forEach((e) => {
            if(e >= randomNum && !found){
                currentState = states[cummulativeWeights.indexOf(e)];
                found = true;
            }
        })
        currentValue += parseFloat((currentState > 0 ? currentState - (tolerance/2) : currentState + (tolerance/2)).toFixed(2))
        let day:number|string = currentDate.getDate();
        let month:number|string = currentDate.getMonth() + 1;
        let year:number|string = currentDate.getFullYear();
        if (day < 10) {
            day = '0' + day.toString();
        }
        if (month < 10) {
            month = `0${month}`;
        }
        const formattedDate = `${month}/${day}/${year}`;
        predictedData.push({date:`${month}/${day}/${year}`, value:currentValue});
    }
    return predictedData;
}