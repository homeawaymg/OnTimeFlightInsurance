var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "shove tissue access sheriff taxi hammer silver salad motion original refuse logic";
//var mnemonic = "swarm ice lawsuit picnic route fiscal rifle joy style struggle actor spirit";
//var mnemonic = "kingdom lawn salute remind slide park destroy world maximum smooth brown ten";
//var mnemonic ="0x2e8B706b03A3464edc3cE4899e6354E9CdC2bc30";

module.exports = {
  networks: {
    develop: {
       provider: function() {
         //return new HDWalletProvider(mnemonic, "HTTP://127.0.0.1:8545/", 0, 50);
          return new HDWalletProvider(mnemonic, "http://127.0.0.1:9545/", 0, 50);
       },
//       network_id: '*',
//       gas: 4600000,
//       gasPrice: 1
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
//      gasPrice: 1,
      gas: 46123880,
      accounts: 25,
      gasLimit: 2100000,
      defaultEtherBalance: 500
    }
  },
  compilers: {
    solc: {
      version: "^0.4.25"
    }
  }
}; 