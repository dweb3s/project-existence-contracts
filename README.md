## Deploy contract to the fantom testnet
1) Start Opera
2) In second terminal, run:
```shell 
npx hardhat run --network fantom_testnet scripts/deploy.ts
```

## Running Fantom Opera on localhost

- Start Opera and attach js-console to it:
```shell
docker compose up -d && docker attach fantom_opera_localhost
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
ftm.sendTransaction({from: ftm.accounts[1], to: ftm.accounts[2], value: web3.toWei(1.0, "ether")});
```

- To stop Opera, press ctrl-d.

## Deploy contract to the Opera
1) Start Opera
2) In second terminal, run:
```shell 
npx hardhat run --network fantom_opera_localhost scripts/deploy.ts
```
