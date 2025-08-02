module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // match Ganache port
      network_id: "*", // match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.8.20", // Ensure this matches your pragma
    },
  },
};
