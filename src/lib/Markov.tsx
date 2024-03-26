import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

export function predict(data:Array<{date:string, value:number}>, tolerance:number, months:number) : Array<{date:string, value:number}> | Error {
    let countStates:Array<{from:number, to:number, count:number, weight?:number}> = [];
    console.log(data)

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

    const startingSlope = data[1].value - data[0].value;
    let lastState = getState(startingSlope);
    for(let i = 1; i < data.length; i++){
        if(lastState instanceof Error){throw lastState;}
        const thisState = getState(data[i].value - data[i-1].value);
        if(thisState instanceof Error){throw thisState;}
        const countStatesIndex = countStates.findIndex((e) => e.from == lastState && e.to == thisState);
        if(countStatesIndex != -1){
            countStates[countStatesIndex].count += 1;
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
    console.log("states: ");
    console.log(states)
    console.log("markovChain: ");
    console.log(markovChain);
    throw new Error("Error in markov");
}