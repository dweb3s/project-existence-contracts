run local testnet:

```shell
docker run -it \
-p 9090:9090 \
--rm \
--name tron \
tronbox/tre
```

test particular contract:

```shell
tronbox test ./test/Contract.js
```
