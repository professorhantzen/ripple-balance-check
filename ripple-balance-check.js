var accounts = [
  // replace or augment these with ripple addresses to check the balances of
  'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  'rGSRqpUQAschCY5rdoRAXnnCvoGpq5toZ1'
];

const WebSocket	= require('ws');
const ws 	= new WebSocket('wss://s1.ripple.com:51233');
const l		= console.log;	// declare war on console.log

const LINES 	= true;		// set to false for XRP balances only
const WARN	= true;		// set to false to suppress no_ripple flag warning
const CSV 	= false;	// set to true for CSV-formatted output. redirect script output to create CSV file, eg "node ripple-balance-check.js > ripple_balances.csv")
const DROPS	= false;	// set to true to output XRP values in RCL-native "drop" format (1 XRP = 1000000 drops)

var account_info 	= 0;
var account_lines 	= 0;
var xrp_balances 	= [];
var iou_balances 	= [];
var balances		= {};

ws.on('open', function (){
	if(!CSV) l('Requesting balances for ' + accounts.length + ' account(s)');
	accounts.forEach(function(account) {
		ws.send('{\"id\":\"account_info\",\"command\":\"account_info\", \"account\":\"'+account+'\"}');
		if(LINES) ws.send('{\"id\":\"account_lines\",\"command\":\"account_lines\", \"account\":\"'+account+'\"}');
	});
});

ws.on('message', function incoming(data, flags) {
	data = JSON.parse(data);
	if(data.result){
		switch(data.id){
			case 'account_info':
				account_info++;
				var address = data.result.account_data.Account;
				balances[address] = { XRP: data.result.account_data.Balance };
				if(!LINES && account_info===accounts.length) close_and_output();
				break;
			case 'account_lines':
				account_lines++;
				var address = data.result.account;
				balances[address].lines = data.result.lines;
				if(account_lines===accounts.length && account_info===accounts.length) close_and_output();
				break;
		}
	} else {
		l('Unexpected response (exiting):', data);
		process.exit();
	}
});

ws.on('error', function (error) { l('Websocket error:', error) });

function close_and_output(){
	ws.close();
	if(CSV) l('account, asset, balance');
	Object.keys(balances).forEach(function(address) {
		var account = balances[address];
		l(address + (DROPS ? ', XRP (drops), ' + account.XRP : ', XRP, ' + account.XRP/1000000) );			
		if(account.lines) {
			account.lines.forEach(function (line){
				var output_string = CSV ? (address + ', ' + line.currency + '.' + line.account + ', ' + line.balance) : ('  ' + line.currency + '.' + line.account + ', ' + line.balance);
				if(line.no_ripple != true && WARN) output_string += ', check no_ripple flag';
				l(output_string);
			});
		}
	});
}
