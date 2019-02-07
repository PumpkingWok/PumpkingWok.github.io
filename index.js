window.addEventListener('load', async () => {

    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
        } catch (error) {
          console.error(error);
          console.error(`Refresh the page to approve/reject again`);
          window.web3 = null;
        }
    }
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    if (window.web3) {
      window.web3.eth.getAccounts(function (error, accounts) {
        console.log(accounts);
      })
    }
});
