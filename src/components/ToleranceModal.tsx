"use client"

import { parseCsv } from "@/lib/CSV";
import { FormEvent, useState } from "react"
import Alert from "./Alert";

export default function ToleranceModal({modalId, historicalData, callback}:{modalId:string, historicalData:Array<{date:string, value:number}>, callback: (tolerance:number) => any}){
    const [loading, setLoading] = useState<boolean>();
    const [csv, setCsv] = useState<File|undefined>();
    const [formattedRealData, setFormattedRealData] = useState<Array<{date:string, value:number}>|undefined>(undefined);
    const [alert, setAlert] = useState<{show:boolean, type:string, strong:string, message:string, onClose: () => any}|undefined>(undefined);

    const runSimulation = async (historicalData:Array<{date:string, value:number}>, realData:Array<{date:string, value:number}>, depth:number) : Promise<number> => {
        return 2;
    }

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try
        {
          let parsedFile:string|undefined = await csv?.text();
          let realData = parseCsv(parsedFile ?? "");
          if(realData instanceof Error){
            throw realData;
          }
          setFormattedRealData(realData);
          let tolerance = await runSimulation(historicalData, realData, 100);
          callback(tolerance);
          setLoading(false);
        }
        catch(error)
        {
            setAlert({show: true, type:"danger", strong:"Something went wrong uploading your file...", message:"Try again and make sure you are using nasdaq historical data CSV files!", onClose: () => setAlert(undefined)});
            console.error(error);
            setLoading(false);
        }
    }

    return(
        <div className="modal fade" id={modalId} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title" id="exampleModalLabel">Auto Tolerance</h4>
                </div>
                <div className="modal-body">
                    {formattedRealData == undefined ?
                        (
                            <form onSubmit={(e) => handleSubmit(e)} className="mb-5">
                                <div className="mb-3">
                                    <label htmlFor="fileUploadInput" className="form-label">Upload Actual CSV Stock Data for Predicted Period</label>
                                    <input type="file" accept=".csv" className="form-control" id="fileUploadInput" onChange={(e) => setCsv(e.target.files?.[0])}/>
                                </div>
                                <div className="d-flex align-items-center">
                                    <button type="submit" className="btn btn-primary me-5">Simulate</button>
                                    {loading ? 
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    :
                                    ""}
                                </div>
                            </form>
                        ) :
                        (
                            <h5>Success! Click <i>Close</i> to continue</h5>
                        )
                    }
                    
                </div>
                <div className="modal-footer">
                    {alert ? <Alert type={alert.type} strong={alert.strong} message={alert.message} onClose={alert.onClose} /> : ""}
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
        </div>
    )
}