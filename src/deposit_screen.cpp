#include <deposit_screen.hpp>

ACTION deposit_screen::init()
{
   require_auth(get_self());
   _global.get_or_create(get_self(), global_state{});
}

ACTION deposit_screen::setmin(const asset &min)
{
   require_auth(get_self()); // only admin can set min

   // min value should not be negative
   check(min.amount >= 0, "Min value should be positive");

   // store min in global state
   auto gstate = _global.get();
   gstate.min = min;
   _global.set(gstate, get_self());
}

void deposit_screen::on_wax_transfer(
    const name &from,
    const name &to,
    const asset &quantity,
    const string &memo)
{
   if (from == get_self() || to != get_self()) {
      return;
   }
   check(get_first_receiver() == "eosio.token"_n, "Invalid token contract");   
   check(quantity.symbol == WAX_SYMBOL, "Only accept token with symbol name: " + WAX_SYMBOL.code().to_string());

   auto gstate = _global.get();

   // check if quanntity is greater than or equal to min else reject
   check(quantity >= gstate.min, "Quantity must be greater than or equal to " + gstate.min.to_string());
}