var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "shove tissue access sheriff taxi hammer silver salad motion original refuse logic";
//var mnemonic = "swarm ice lawsuit picnic route fiscal rifle joy style struggle actor spirit";
//var mnemonic ="0x2e8B706b03A3464edc3cE4899e6354E9CdC2bc30";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:9545/", 0, 50);
//        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      },
      network_id: '*',
      gas: 9999999
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};