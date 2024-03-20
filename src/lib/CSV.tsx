import Papa from 'papaparse';

export function parseCsv(csv:string) : Array<{date:string, value:number}>|Error {
    let parsedCsv = Papa.parse<Array<string>>(csv);
    const rows = parsedCsv.data;
    rows.shift();
    rows.pop();
    let data:Array<{date:string, value:number}> = [];
    rows.reverse().forEach(element => {
        data.push({date:element[0], value:parseFloat(element[5].substring(1))});
    });
    if(data.length < 1) {
        throw new Error;
    }
    console.log(data);
    return data;
}