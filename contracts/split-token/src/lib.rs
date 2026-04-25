#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env,
};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
}

#[contract]
pub struct SplitToken;

#[contractimpl]
impl SplitToken {

    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).expect("Not initialized");
        admin.require_auth();
        assert!(amount > 0, "Amount must be positive");
        let balance = Self::balance(env.clone(), to.clone());
        env.storage().instance().set(&DataKey::Balance(to), &(balance + amount));
        let supply: i128 = env.storage().instance()
            .get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "Amount must be positive");
        let from_balance = Self::balance(env.clone(), from.clone());
        assert!(from_balance >= amount, "Insufficient balance");
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage().instance().set(&DataKey::Balance(from), &(from_balance - amount));
        env.storage().instance().set(&DataKey::Balance(to), &(to_balance + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "Amount must be positive");
        let balance = Self::balance(env.clone(), from.clone());
        assert!(balance >= amount, "Insufficient balance");
        env.storage().instance().set(&DataKey::Balance(from.clone()), &(balance - amount));
        let supply: i128 = env.storage().instance()
            .get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply - amount));
    }

    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage().instance()
            .get(&DataKey::Balance(address)).unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance()
            .get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn symbol(env: Env) -> soroban_sdk::Symbol {
        soroban_sdk::Symbol::new(&env, "SPLIT")
    }

    pub fn name(env: Env) -> soroban_sdk::Symbol {
        soroban_sdk::Symbol::new(&env, "SplitToken")
    }

    pub fn decimals(_env: Env) -> u32 { 7 }

    pub fn admin(env: Env) -> Address {
        env.storage().instance()
            .get(&DataKey::Admin).expect("Not initialized")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize_and_mint() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SplitToken);
        let client = SplitTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        client.initialize(&admin);
        client.mint(&user, &1000);
        assert_eq!(client.balance(&user), 1000);
        assert_eq!(client.total_supply(), 1000);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SplitToken);
        let client = SplitTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        client.initialize(&admin);
        client.mint(&user1, &1000);
        client.transfer(&user1, &user2, &400);
        assert_eq!(client.balance(&user1), 600);
        assert_eq!(client.balance(&user2), 400);
    }

    #[test]
    fn test_burn() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SplitToken);
        let client = SplitTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        client.initialize(&admin);
        client.mint(&user, &1000);
        client.burn(&user, &300);
        assert_eq!(client.balance(&user), 700);
        assert_eq!(client.total_supply(), 700);
    }

    #[test]
    fn test_token_metadata() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SplitToken);
        let client = SplitTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(&admin);
        assert_eq!(client.decimals(), 7);
        assert_eq!(client.decimals(), 7);
    }
}