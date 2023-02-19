## Running Fantom Opera on localhost

- Start Opera and attach js-console to it:
```shell
./run_fantom_opera_localhost.sh
```
or
```shell
docker run -p 5050:5050 -p 18545:18545 -p 19090:19090 -ti catangent/opera:latest
```

- Check balance of one of 4 accounts:
```js
ftm.getBalance(ftm.accounts[4]);
```

- Send 1 token from one account to another:
```js
ftm.sendTransaction({from: ftm.accounts[1], to: ftm.accounts[2], value: web3.toWei(1.0, "ether")}
```

- To stop Opera, press ctrl-d.

## Deploy contracts to the Opera
1) Start Opera
2) In second terminal, run:
```shell 
npx hardhat run --network fantom_opera_localhost scripts/deploy.ts
```
Sample output:
```
Lock with 1 ETH and unlock timestamp 1708344798 deployed to 0xdb8c383Bf897d3fFD2145Da638966B23bA7176f7
```