# project-altrn8-value
(Pronounced: "Alternate Value)

## Team Mebers: ##
- Sean van Wyk, 1003228946, vanwykse
- John Landon Edwards, 1004242161 , edwar361
- Vasili Skurydzin, 1002744658, skurydzi

## Project Description: ##
A financial screening tool for investing in publicly traded stocks. Allows for the analysis, visualization, and comparison of companies histroic finacial preformance. Offers the ability to back-test and track investment selections over time.

## Beta Version Key Features: ##
- Select specfic stock tickers to be analyasied
- Select meterics on which stocks are analysied. eg) EPS,ROE,ROA,OpEx,CapEx.
- Select time-period in which to analyze stocks over (Max 10 years historic) . eg) Quarterly & Number of past Quaters , eg) Anually & Number of past years , eg) .
- Retrive corresponding financial infromation using 3rd party api 
- Display Time-series plot(s) of meteric(s) for selected stock(s).

## Final Version Additonal Features: ##
- User registration & Authorization
- User can save porfolio selection and their current price during the time of session and evaluate its change in price from that date at future sessions.
- User can save multiple differnt porfolio selections and compare their performances over time.
- Filter avalible stocks to be selected from based on past prefromance critera. ex) AVG EPS > 15%


## Technology To Be Used ##
- graphQL
- express
- facebook login (using fb graph API).
- JWT authorization
- Open API (SLATE API documentation)
- financialmodelingprep API src:https://financialmodelingprep.com/developer/docs/

## Technological Challenges:  ##  
- Scraping and transforming financial data in meaningful way  
- Managing virtual portfolios based on up-to date data  
- Data visualization  
- Using GraphQL to query based on complex metrics entered by user  
- Hosting  
