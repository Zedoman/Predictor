const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const cors = require("cors");
const yahooFinance = require('yahoo-finance2').default;
const { log } = require("console");
require("dotenv").config(); // Load environment variables from .env file
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

const { PythonShell } = require("python-shell");
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
const newsApiKey = process.env.ALPHA_VANTAGE_API_KEY;

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());
app.use(cors());

app.get("/", (req, res) => {
  res.send("app is working..");
});

app.post("/getStockData", async (req, res) => {
  try {
    const { stockSymbol, startDate, endDate } = req.body;

    const df = await yahooFinance.historical(stockSymbol, {
      period1: startDate, // start date in 'YYYY-MM-DD' format
      period2: endDate,   // end date in 'YYYY-MM-DD' format
    });

    res.json({ success: true, data: df });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});




app.post("/predictstock/:startdate/:enddate/:stocksymbol", async (req, res) => {
  // const { startDate, endDate, stockSymbol } = req.params;
  const startDate = req.params.startdate;
  const endDate = req.params.enddate;
  const stockSymbol = req.params.stocksymbol;

  // console.log(startDate,endDate,stockSymbol);
  // res.json({ success: true, sdate: startDate , edate: endDate, ssymbol: stockSymbol});

  try {
    const combinedArgs = [startDate, endDate, stockSymbol].join(",");
    // console.log("I am from backend", combinedArgs);
    const pythonProcess = spawn("python", ["get_stockdata.py", combinedArgs]);

    let pythonOutput = "";

    // Listen for data from the Python process (optional)
    pythonProcess.stdout.on("data", (data) => {
      if (data.toString()[0] == "[" && data.toString()[1] == "[") {
        pythonOutput += data.toString();
      }
    });

    // Listen for errors from the Python process (optional)
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python stderror: ${data}`);
    });

    // When the Python process closes
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        // console.log("Prediction data:", pythonOutput);
        const innerArrayStrings = pythonOutput.slice(2, -2).split("], [");
        const parsedArray = innerArrayStrings.map((inner) =>
          inner.split(",").map(Number)
        );
        // console.log(parsedArray);
        res.json({ success: true, predictionDataInJSON: parsedArray });
      } else {
        res.status(500).send("Error running the Python script");
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/alpha", (req, res) => {
  "use strict";
  var request = require("request");

  var url =
    "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=ved&apikey=" +
    apiKey;

  var url2 =
    "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=" +
    apiKey;

  var topics = "financial_markets"; // Add more topics as needed

  var url3 =
    "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=" +
    topics +
    "&apikey=" +
    newsApiKey;

  request.get(
    {
      url: url3,
      json: true,
      headers: { "User-Agent": "request" },
    },
    (err, response, data) => {
      if (err) {
        console.log("Error:", err);
      } else if (response.statusCode !== 200) {
        console.log("Status:", response.statusCode);
      } else {
        // Check if data and bestMatches are defined
        console.log(data);
        res.send(data);
      }
    }
  );
});

app.listen(3001, () => {
  console.log("started on 3001...");
});
