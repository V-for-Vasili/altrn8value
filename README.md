# project-altrn8-value
(Pronounced: "Alternate Value)

## Team Mebers: ##
- Sean van Wyk, 1003228946, vanwykse
- John Landon Edwards, 1004242161 , edwar361
- Vasili Skurydzin, 1002744658, skurydzi

## Project Description: ##
A financial screening tool for investing in publicly traded stocks. Allows for the analysis, visualization, and comparison of companies historic financial performance.
Users can create "virtual portfolios" with some amount of virtual money distributed across a selection of stocks and financial instruments and then track the virtual portfolio performance over time.
Offers the ability to back-test and track investment selections over time.

What sets us apart:
- We strive to create a minimalist application which is easy to understand for a person without a deep knowledge of finance and stock market
- Helps simulate buying selected stock portfolio with virtual money and track its performance over time
- We strive to make our tool easy to use, have good data visualisation and be educational and informative

## Beta Version Key Features: ##
- Select specific stock tickers to be analysed.
- Select metrics on which stocks are analysed. eg) EPS,ROE,ROA,OpEx,CapEx.
- Select time-period in which to analyse stocks over (Max 10 years historic) . eg) Quarterly & Number of past Quarters or annually & number of past years.
- Retrieve corresponding financial information using 3rd party API. 
- Display Time-series plot(s) of metric(s) for selected stock(s).

## Final Version Additional Features: ##
- User registration & Authorisation.
- User can save portfolio selection and their current price during the time of session and evaluate its change in price from that date at future sessions.
- User can save multiple different portfolio selections and compare their performances over time.
- Filter available stocks to be selected from based on past performance criteria. ex) AVG EPS > 15%


## Technology To Be Used ##
- graphQL; API defined using graph based query language
- nodejs and express; Javascript Backend Framework
- facebook login (using fb graph API); Optional facebook login option to be completed only if necessary
- Open API (SLATE API documentation);  Optional Api documentation server to allow users to use our service on the client of their choice
- financialmodelingprep API src:https://financialmodelingprep.com/developer/docs/; library for scraping finacial data
- Google Cloud Platform; cloud hosting
- MongoDB Atlas; cloud hosted MongoDB cluster

## Technological Challenges:  ##  
- Transforming financial data in meaningful way  
- Managing virtual portfolios based on up-to date data  
- Data visualisation of over different time series data. 
- Extracting  financial data from  efficent way - we anticipate the need to use 3rd party APIs to get access to accurate and updated financial data. 
- Managing virtual portfolios based on up-to date data - the bulk of back end work will deal with keeping track of changes to virtual portfolios 
- Data visualization - for historic performance data we will need to create 2D graphs and Pie charts on the fronten
- Hosting - we will use Google Cloud Platform to host our application with a Docker container 
