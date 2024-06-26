import Papa from 'papaparse';

export function parseCsv(csv:string) : Array<{date:string, value:number}>|Error {
    let parsedCsv = Papa.parse<Array<string>>(csv);
    const rows = parsedCsv.data;
    rows.shift();
    rows.pop();
    let data:Array<{date:string, value:number}> = [];
    rows.reverse().forEach(element => {
        data.push({date:element[0], value:parseFloat(element[1].substring(1))});
    });
    if(data.length < 1) {
        throw new Error;
    }
    return data;
}

export function toCsv(data:Array<{date:string, value:number}>) : string|Error {
    return Papa.unparse(data);
}