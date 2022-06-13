project(deposit_screen)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract( deposit_screen deposit_screen deposit_screen.cpp )
target_include_directories( deposit_screen PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( deposit_screen ${CMAKE_SOURCE_DIR}/../ricardian )