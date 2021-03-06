module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          chainskills:{
            host:"localhost",
            port:8545,
            network_id:"4224"
            // ,from: '0xae62a4f3d2e8018ea882aaa0a4fd5d41b487722c'
          },
          rinkeby: {
            host:"localhost",
            port:8545,
            network_id: 4, // rinkeby network id
            gas: 4700000,
            from: '0x54D2ced75Dfdc474D82dACe339953bB813A0F5c5'
          }
     }
};
