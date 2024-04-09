"use client"

import { parseCsv } from "@/lib/CSV";
import { FormEvent, useEffect, useState } from "react";
import Alert from "./Alert";

export default function Modal({modalId, predictedData}:{modalId:string, predictedData:Array<{date:string, value:number}>}){
    const [csv, setCsv] = useState<File|undefined>();
    const [formattedRealData, setFormattedRealData] = useState<Array<{date:string, value:number}>|undefined>(undefined);
    const [errorValues, setErrorValues] = useState<{count:number, total:number}>({count:0, total:0});
    const [alert, setAlert] = useState<{show:boolean, type:string, strong:string, message:string, onClose: () => any}|undefined>(undefined);
    const [loading, setLoading] = useState<boolean>();
    const [tableItems, setTableItems] = useState<Array<{index:number, date:string, realValue:number, predictedValue:number|undefined, difference:number|undefined}>>([]);
    const [tableView, setTableView] = useState<boolean>(false);

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try
        {
          let parsedFile:string|undefined = await csv?.text();
          let realData = parseCsv(parsedFile ?? "");
          if(realData instanceof Error){
            throw realData;
          }
          setFormattedRealData(realData);
          setLoading(true);
        }
        catch(error)
        {
            setAlert({show: true, type:"danger", strong:"Something went wrong uploading your file...", message:"Try again and make sure you are using nasdaq historical data CSV files!", onClose: () => setAlert(undefined)});
            console.error(error);
        }
    }

    useEffect(() => {
        if(formattedRealData?.length != undefined && tableItems.length < formattedRealData.length){
            formattedRealData?.forEach((item, index) => {
                const predictedDataValue = predictedData.find((e) => e.date == item.date)?.value;
                const matchingDates = predictedDataValue != undefined;
                setTableItems( prev => [...prev, {index: index, date:item.date, realValue: item.value, predictedValue: predictedDataValue, difference: matchingDates ? parseFloat((predictedDataValue - item.value).toFixed(2)) : undefined}])
                console.log(tableItems);
                if(matchingDates){
                    setErrorValues((prev) => ({count: prev.count + 1, total: prev.total + Math.abs(predictedDataValue - item.value)}))
                }  
            })
            setLoading(false);
            setTableView(true);
        }
    }, [formattedRealData, predictedData, tableItems])

    return(
        <div className="modal modal-xl fade" id={modalId} tabIndex={-1} aria-labelledby="modalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="modalLabel">Comparison</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                    {!tableView ?
                        (<form onSubmit={(e) => handleSubmit(e)} className="mb-5">
                            <div className="mb-3">
                                <label htmlFor="fileUploadInput" className="form-label">Upload Actual CSV Stock Data for Predicted Period</label>
                                <input type="file" accept=".csv" className="form-control" id="fileUploadInput" onChange={(e) => setCsv(e.target.files?.[0])}/>
                            </div>
                            <div className="d-flex align-items-center">
                                <button type="submit" className="btn btn-primary me-5">Submit</button>
                                {loading ? 
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                :
                                ""}
                            </div>
                        </form>)
                    :
                    (<table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Real Value</th>
                                <th scope="col">Predicted Value</th>
                                <th scope="col">Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                tableItems.map((item) => (
                                    <tr key={item.index}>
                                        <th scope="row">{item.date}</th>
                                        <td>{item.realValue}</td>
                                        <td>{item.predictedValue?.toFixed(2)}</td>
                                        <td>{item.difference?.toFixed(2)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>)
                    }
                    </div>
                    <div className="modal-footer">
                        {alert ? <Alert type={alert.type} strong={alert.strong} message={alert.message} onClose={alert.onClose} /> : ""}
                        <p className="mx-5">Average Error: {(errorValues.total / errorValues.count).toFixed(2)}</p>
                        <button type="button" id="closeModal" className="btn btn-secondary ml-5" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="discardChanges" className="btn btn-warning" data-bs-dismiss="modal" onClick={() => {
                            setCsv(undefined);
                            setFormattedRealData(undefined);
                            setErrorValues({count:0, total:0});
                            setTableView(false);
                        }}>
                            Close and Discard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}