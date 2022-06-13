SHELL:= /bin/bash

CONTRACT_NAME?=deposit_screen
CONTRACT_ACCOUNT?=deposit_screen # default value is intended to a failed one
MININMUM_TRANSFER?=0.00000000 WAX
EOSIO_ENDPOINT?=http://localhost:8888
BUILD_DEFS?=

make-build-dir:
	-mkdir -p ./build

clean:
	-rm -rf ./build

build-production: make-build-dir
	eosio-cpp ${BUILD_DEFS} -abigen ./src/${CONTRACT_NAME}.cpp -o build/${CONTRACT_NAME}.wasm  -I ./include/

build-local: clean make-build-dir
	eosio-cpp -D LOCAL_DEV ${BUILD_DEFS} ./src/${CONTRACT_NAME}.cpp -o ./build/${CONTRACT_NAME}.wasm -I ./include/ -abigen_output ./build/${CONTRACT_NAME}.abi

deploy:
	cleos -u ${EOSIO_ENDPOINT} set contract ${CONTRACT_ACCOUNT} ./build/ "${CONTRACT_NAME}.wasm" "${CONTRACT_NAME}.abi" -p ${CONTRACT_ACCOUNT}@active

init:
	cleos -u ${EOSIO_ENDPOINT} push action ${CONTRACT_ACCOUNT} init '[]' -p ${CONTRACT_ACCOUNT}

setmin:
	cleos -u ${EOSIO_ENDPOINT} push action ${CONTRACT_ACCOUNT} setmin '["${MININMUM_TRANSFER}"]' -p ${CONTRACT_ACCOUNT}
