"use client"

import Alert from "@/components/Alert";
import { parseCsv, toCsv } from "@/lib/CSV";
import { predict } from "@/lib/Markov";
import { FormEvent, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { saveAs } from "file-saver";
import Modal from "@/components/Modal";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface formParams{
  csv:File|undefined,
  tolerance:number,
  months: number
}

interface chartParams{
  labels:Array<string>, 
  datasets:Array<{label:string, data:Array<number>, borderColor:string, backgroundColor:string, borderWidth:number}>
}

export default function Home() {
  const [formParams, setFormParams] = useState<formParams>({csv: undefined, tolerance: 2.5, months: 12});
  const [formattedHistoricalData, setFormattedHistoricalData] = useState<Array<{date:string, value:number}>>();
  const [formattedFutureData, setFormattedFutureData] = useState<Array<{date:string, value:number}>>();
  const [chartDataParams, setChartDataParams] = useState<Array<chartParams>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{show:boolean, type:string, strong:string, message:string, onClose: () => any}|undefined>(undefined);
  const emptyParams:chartParams = 
  {
    labels : [],
    datasets : 
    [
      {
        label: "",
        data : [],
        borderColor : "",
        backgroundColor: "",
        borderWidth: 3
      }
    ]
  };
  const chartOptions =
  {
    scales:{
      x:{
        display:true
      }
    },
    plugins:{
      legend:{
        display:false
      }
    },
    elements:{
      point:{
        radius: 0.2
      }
    }
  }
  

  useEffect( () => {
    const historicalAxisLabels = formattedHistoricalData?.map<string>((e) => {
      return e.date;
    }) ?? [];
    const predictedAxisLabels = formattedFutureData?.map<string>((e) => {
      return e.date;
    }) ?? [];

    setChartDataParams(
      [
        {
          labels:historicalAxisLabels, 
          datasets:
          [
            {
              label: "Historical",
              data: formattedHistoricalData?.map((e) => e.value) ?? [],
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgb(255, 99, 132, 0.5)",
              borderWidth: 2
            }
          ]
        },
        {
          labels:predictedAxisLabels,
          datasets:
          [
            {
              label: "Prediction",
              data: formattedFutureData?.map((e) => e.value) ?? [],
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgb(53, 162, 235, 0.5)",
              borderWidth: 1
            }
          ]
        }
      ]
    );
  }, [formattedHistoricalData, formattedFutureData])

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try
    {
      let parsedFile:string|undefined = await formParams.csv?.text();
      let historicalData = parseCsv(parsedFile ?? "");
      if(historicalData instanceof Error){
        throw historicalData;
      }
      setFormattedHistoricalData(historicalData);

      let futureData = predict(historicalData, formParams.tolerance, formParams.months);
      if(futureData instanceof Error){
        throw futureData;
      }
      setFormattedFutureData(futureData);
      setLoading(false);
    }
    catch(error)
    {
      setAlert({show: true, type:"danger", strong:"Something went wrong uploading your file...", message:"Try again and make sure you are using nasdaq historical data CSV files!", onClose: () => setAlert(undefined)});
      console.error(error);
      setLoading(false);
    }
  }

  const downloadPredictedCSV = async () => {
    try
    {
      const stringToSave = toCsv(formattedFutureData ?? []);
      if(stringToSave instanceof Error){throw stringToSave;}
      var blob = new Blob([stringToSave], {type: 'text/csv;charset=utf-8'});
      saveAs(blob, "PredictedData.csv");
    }
    catch(error)
    {
      setAlert({show: true, type:"danger", strong:"Something went wrong downloading your file...", message:"Try again and check the console for more details!", onClose: () => setAlert(undefined)});
      console.error(error); 
    }
  }

  return (
    <main>
      <div className="row mb-3 mt-3 text-center">
        <h2>Markov Stock Predictor</h2>
        <p>Find Historical Data <Link href="https://www.nasdaq.com/market-activity/quotes/historical" target="_blank">here!</Link></p>
        <p>Hit <i>F12</i> and look at the console to see the generated Markov Chain and corresponding States</p>
      </div>
      <div className="px-5">
        <form onSubmit={(e) => handleSubmit(e)} className="mb-5">
          <div className="mb-3">
            <label htmlFor="fileUploadInput" className="form-label">Upload CSV Stock Data</label>
            <input type="file" accept=".csv" className="form-control" id="fileUploadInput" onChange={(e) => setFormParams((prevValue) => ({...prevValue, csv: e.target.files?.[0]}))}/>
          </div>
          <div className="mb-3">
            <label htmlFor="toleranceInput" className="form-label">Markov State Tolerance</label>
            <input type="range" className="form-range" id="toleranceInput" min="0.01" max="5" step="0.01" aria-describedby="toleranceHelp" value={formParams.tolerance} onChange={(e) => setFormParams((prevValue) => ({...prevValue, tolerance:parseFloat(e.target.value)}))}/>
            <div id="toleranceHelp" className="form-text">{formParams.tolerance}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="monthsInput" className="form-label">Future Prediction Number of Months</label>
            <input type="range" className="form-range" id="monthsInput" min="1" max="60" aria-describedby="monthsHelp" value={formParams.months} onChange={(e) => setFormParams((prevValue) => ({...prevValue, months:parseFloat(e.target.value)}))}/>
            <div id="monthsHelp" className="form-text">{formParams.months}</div>
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
      <div className="row my-5 px-5">
        <div className="col d-flex flex-column align-items-center px-5">
          <h2>Historical</h2>
          <Line data={chartDataParams[0] ?? emptyParams} options={chartOptions}/>
        </div>
      </div>
      <div className="row my-5 px-5">
        <div className="col d-flex flex-column align-items-center px-5">
          <h2>Prediction</h2>
          <Line data={chartDataParams[1] ?? emptyParams} options={chartOptions}/>        
        </div>
      </div>
      { formattedFutureData ?
      <div className="row">
        <div className="col d-flex flex-column align-items-center px-5 gap-3 mb-5">
        <button type="button" className="btn btn-primary" onClick={downloadPredictedCSV}>Download CSV</button>
        <button type="button" className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#modal">
              Comparison Tool
        </button>
        </div>
      </div>
      : ""
      }
      
      <Modal modalId="modal" predictedData={formattedFutureData ?? []}/>
    </main>
  );
}
