const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const Web3 = require('web3');

router.get('/', (req, res, next) => {
  res.render('index', {
    path: 'index',
    error: req.query.error,
    success: req.query.success
  });
});

router.post('/erc20', (req, res, next) => {
  var api = require('etherscan-api').init(process.env.etherscan_key);
  var tokentx = api.account.tokentx(req.body.address);
  tokentx.then(function (txs) {
    txs.result.forEach((element, index, arr) => {
      // set label for inputs or outputs
      if (element.from.toLowerCase() == req.body.address.toLowerCase()) {
        arr[index].direction = "OUT"
      } else {
        arr[index].direction = "IN"
      }
      //convert unix timestamps to human readable dates
      arr[index].date = new Date(element.timeStamp * 1000).toGMTString()
      //convert Wei to Ether using the decimals
      var decimals = "1"
      for (i = 0; i < parseInt(element.tokenDecimal); i++) {
        decimals += "0"
      }
      arr[index].ether = Number(element.value) / Number(decimals)
    })
    filtered = txs.result.filter(function (elem) {
      //filter out transactions lower than the given block number
      return (parseInt(elem.blockNumber) > parseInt(req.body.blocknum))
    });
    res.render('erc20', {
      path: 'erc20',
      transactions: filtered.reverse(),
      address: req.body.address
    });
  }).catch(error => {
    // Error handling
    res.redirect('/?' +
      querystring.stringify({
        error: error
      }));
  });
});

router.post('/', (req, res, next) => {
  var api = require('etherscan-api').init(process.env.etherscan_key);
  var txlist = api.account.txlist(req.body.address, req.body.blocknum);
  txlist.then(function (txs) {
    txs.result.forEach((element, index, arr) => {
      // set label for inputs or outputs
      if (element.from.toLowerCase() == req.body.address.toLowerCase()) {
        arr[index].direction = "OUT"
      } else {
        arr[index].direction = "IN"
      }
      //convert unix timestamps to human readable dates
      arr[index].date = new Date(element.timeStamp * 1000).toGMTString()
      //convert Wei to Ether
      arr[index].ether = Web3.utils.fromWei(element.value, 'ether');
      //determine transfers and contract interactions
      if (element.input === "0x") {
        arr[index].interaction = "Ethereum Transfer"
      } else {
        arr[index].interaction = "Contract Interaction"
      }
    })
    res.render('transactions', {
      path: 'transactions',
      transactions: txs.result.reverse(),
      address: req.body.address
    });
  }).catch(error => {
    // Error handling
    res.redirect('/?' +
      querystring.stringify({
        error: error
      }));
  });
});

module.exports = router;
