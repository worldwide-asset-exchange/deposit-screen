#include <eosio/eosio.hpp>
#include <eosio/singleton.hpp>
#include <eosio/asset.hpp>
#include <string>

using namespace eosio;
using std::string;

static constexpr symbol WAX_SYMBOL = symbol("WAX", 8);

CONTRACT deposit_screen : public contract
{
public:
   deposit_screen(eosio::name receiver, eosio::name code, eosio::datastream<const char *> ds)
      : eosio::contract(receiver, code, ds), _global(_self, _self.value)
   {}

   using contract::contract;

   ACTION init();
   ACTION setmin(const asset &min);

   using init_action = action_wrapper<"init"_n, &deposit_screen::init>;
   using setmin_action = action_wrapper<"setmin"_n, &deposit_screen::setmin>;

   // listen on eosio.token transfer
   [[eosio::on_notify("eosio.token::transfer")]]
   void on_wax_transfer(
      const name &from,
      const name &to,
      const asset &quantity,
      const string &memo
   );

private:
   TABLE global_state
   {
      string version = "1.0.0";
      asset min = asset(0, symbol("WAX", 8));
   };
   typedef singleton<name("global"), global_state> global_t;
   // https://github.com/EOSIO/eosio.cdt/issues/280
   typedef multi_index<name("global"), global_state> global_t_for_abi;

   global_t _global;
};