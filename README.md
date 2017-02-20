# ripple-balance-check
node.js script to view multiple Ripple account balances by connecting to Ripple's servers over websocket.

Dependencies:  `npm install ws`  

Usage: 

1. Add Ripple addresses into the `accounts` array.  
2. Set output flags. These are detailed in the code comments.  
3. Execute using node on the command-line, eg:  
   `node ripple-balance-check.js`  
   `node ripple-balance-check.js > ripple-balances.csv` (CSV output)  
