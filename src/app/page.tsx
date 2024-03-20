"use client"

import Alert from "@/components/Alert";
import { parseCsv } from "@/lib/CSV";
import { FormEvent, useState } from "react";

interface formParams{
  csv:File|undefined,
  tolerance:number
}

export default function Home() {
  const [formParams, setFormParams] = useState<formParams>({csv: undefined, tolerance: 50});
  const [csvOutput, setCsvOutput] = useState<string|undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{show:boolean, type:string, strong:string, message:string, onClose: () => any}|undefined>(undefined);

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try
    {
      let parsedFile:string|undefined = await formParams.csv?.text();
      setCsvOutput(parsedFile);
      parseCsv(parsedFile ?? "");
      setLoading(false);
    }
    catch
    {
      setAlert({show: true, type:"danger", strong:"Something went wrong uploading your file...", message:"Try again and make sure you are using nasdaq historical data CSV files!", onClose: () => setAlert(undefined)});
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="row mb-3 mt-3 text-center">
        <h2>Markov Stock Predictor</h2>
      </div>
      <div className="px-5">
        <form onSubmit={(e) => handleSubmit(e)} className="mb-5">
          <div className="mb-3">
            <label htmlFor="fileUploadInput" className="form-label">Upload CSV Stock Data</label>
            <input type="file" accept=".csv" className="form-control" id="fileUploadInput" onChange={(e) => setFormParams((prevValue) => ({...prevValue, csv: e.target.files?.[0]}))}/>
          </div>
          <div className="mb-3">
            <label htmlFor="toleranceInput" className="form-label">Markov State Tolerance</label>
            <input type="range" className="form-range" id="fileUploadInput" min="1" max="500" aria-describedby="toleranceHelp" value={formParams.tolerance} onChange={(e) => setFormParams((prevValue) => ({...prevValue, tolerance:parseFloat(e.target.value)}))}/>
            <div id="toleranceHelp" className="form-text">{formParams.tolerance}</div>
          </div>
          <div className="d-flex align-items-center">
            <button type="submit" className="btn btn-primary me-5">Submit</button>
            {loading?
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            : ""}
          </div>
        </form>
        {alert ? <Alert type={alert.type} strong={alert.strong} message={alert.message} onClose={alert.onClose} /> : ""}
      </div>
    </main>
  );
}
