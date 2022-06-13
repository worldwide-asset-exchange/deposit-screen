# deposit-screen Project

Contract to dictate a minimum transfer amount to an account.

- `setmin(const asset &min);` will allow admin to config the minimum value.

# Deployment

1. Following build instruction below to build the project.
2. Deploy the contract to a protected account.
3. Run `init` function to set initial configuration.
4. Push action `setmin` to change the default value (default minimum transfer is 0).

```sh
make build-local

# NOTE: change the admin to the target account
export CONTRACT_ACCOUNT=admin
export EOSIO_ENDPOINT=http://localhost:8888
make deploy
make init

# NOTE: change the minimum value as expected
export MININMUM_TRANSFER="1.00000000 WAX"
make setmin
```

# Development

- eiosio.cdt https://developers.eos.io/manuals/eosio.cdt/latest/installation/index
- make (tested with GNU Make 4.1)

## Build

```sh
make build-local
```

## Unit test

- Require node version > `v16.13.0`

```sh
# intall dependencies
yarn

# build (optional)
yarn build

# test
yarn test
```
