#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, Vec, Map, token,
};

// ─── Data Structures ─────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct Bill {
    pub creator: Address,
    pub total_amount: i128,
    pub per_share: i128,
    pub participants: Vec<Address>,
    pub paid: Map<Address, bool>,
    pub released: bool,
    pub cancelled: bool,
    pub token: Address,
}

#[contracttype]
pub enum DataKey {
    Bill(u64),
    BillCount,
}

// ─── Contract ────────────────────────────────────────────────────

#[contract]
pub struct SplitBillContract;

#[contractimpl]
impl SplitBillContract {

    // Create a new bill
    pub fn create_bill(
        env: Env,
        creator: Address,
        total_amount: i128,
        participants: Vec<Address>,
        token: Address,
    ) -> u64 {
        creator.require_auth();

        assert!(participants.len() > 0, "Need at least 1 participant");
        assert!(total_amount > 0, "Amount must be positive");

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BillCount)
            .unwrap_or(0);

        let num = participants.len() as i128;
        let per_share = total_amount / num;

        let mut paid_map: Map<Address, bool> = Map::new(&env);
        for p in participants.iter() {
            paid_map.set(p.clone(), false);
        }

        let bill = Bill {
            creator: creator.clone(),
            total_amount,
            per_share,
            participants: participants.clone(),
            paid: paid_map,
            released: false,
            cancelled: false,
            token: token.clone(),
        };

        let bill_id = count + 1;
        env.storage()
            .instance()
            .set(&DataKey::Bill(bill_id), &bill);
        env.storage()
            .instance()
            .set(&DataKey::BillCount, &bill_id);

        bill_id
    }

    // Pay your share — transfers real XLM to contract
    pub fn pay_share(env: Env, bill_id: u64, payer: Address) {
        payer.require_auth();

        let mut bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        assert!(!bill.released, "Bill already released");
        assert!(!bill.cancelled, "Bill is cancelled");
        assert!(
            bill.paid.get(payer.clone()).is_some(),
            "Not a participant"
        );
        assert!(
            !bill.paid.get(payer.clone()).unwrap(),
            "Already paid"
        );

        // Transfer XLM from payer to this contract
        let token_client = token::Client::new(&env, &bill.token);
        token_client.transfer(
            &payer,
            &env.current_contract_address(),
            &bill.per_share,
        );

        bill.paid.set(payer.clone(), true);
        env.storage()
            .instance()
            .set(&DataKey::Bill(bill_id), &bill);

        // Auto release if all paid
        Self::try_release(&env, bill_id);
    }

    // Internal — try to release funds if all paid
    fn try_release(env: &Env, bill_id: u64) {
        let mut bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        if bill.released || bill.cancelled {
            return;
        }

        let all_paid = bill
            .participants
            .iter()
            .all(|p| bill.paid.get(p.clone()).unwrap_or(false));

        if all_paid {
            // Transfer full amount to creator
            let token_client = token::Client::new(env, &bill.token);
            token_client.transfer(
                &env.current_contract_address(),
                &bill.creator,
                &bill.total_amount,
            );

            bill.released = true;
            env.storage()
                .instance()
                .set(&DataKey::Bill(bill_id), &bill);
        }
    }

    // Manual release — creator can trigger
    pub fn release_funds(env: Env, bill_id: u64) -> bool {
        let bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        assert!(!bill.released, "Already released");
        assert!(!bill.cancelled, "Bill is cancelled");

        let all_paid = bill
            .participants
            .iter()
            .all(|p| bill.paid.get(p.clone()).unwrap_or(false));

        if all_paid {
            Self::try_release(&env, bill_id);
            return true;
        }

        false
    }

    // Cancel bill and refund everyone
    pub fn cancel_bill(env: Env, bill_id: u64, caller: Address) {
        caller.require_auth();

        let mut bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        assert!(!bill.released, "Already released");
        assert!(!bill.cancelled, "Already cancelled");
        assert!(bill.creator == caller, "Only creator can cancel");

        // Refund everyone who already paid
        let token_client = token::Client::new(&env, &bill.token);
        for p in bill.participants.iter() {
            if bill.paid.get(p.clone()).unwrap_or(false) {
                token_client.transfer(
                    &env.current_contract_address(),
                    &p,
                    &bill.per_share,
                );
            }
        }

        bill.cancelled = true;
        env.storage()
            .instance()
            .set(&DataKey::Bill(bill_id), &bill);
    }

    // Get bill status
    pub fn get_bill(env: Env, bill_id: u64) -> Bill {
        env.storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found")
    }

    // Check if a specific person paid
    pub fn has_paid(env: Env, bill_id: u64, participant: Address) -> bool {
        let bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        bill.paid.get(participant).unwrap_or(false)
    }

    // Get total collected so far
    pub fn get_collected(env: Env, bill_id: u64) -> i128 {
        let bill: Bill = env
            .storage()
            .instance()
            .get(&DataKey::Bill(bill_id))
            .expect("Bill not found");

        let paid_count = bill
            .participants
            .iter()
            .filter(|p| bill.paid.get(p.clone()).unwrap_or(false))
            .count() as i128;

        paid_count * bill.per_share
    }
}

// ─── Tests ───────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        Address, Env, Vec,
        token,
    };
    use soroban_sdk::token::Client as TokenClient;
    use soroban_sdk::token::StellarAssetClient;

    fn create_token(env: &Env, admin: &Address) -> Address {
        let token_contract = env.register_stellar_asset_contract_v2(admin.clone());
        token_contract.address().clone()
    }

    fn mint_tokens(env: &Env, token: &Address, admin: &Address, to: &Address, amount: i128) {
        StellarAssetClient::new(env, token).mint(to, &amount);
    }

    #[test]
    fn test_create_bill() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, SplitBillContract);
        let client = SplitBillContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token = create_token(&env, &admin);

        let mut participants = Vec::new(&env);
        participants.push_back(p1.clone());
        participants.push_back(p2.clone());

        let bill_id = client.create_bill(&creator, &1000, &participants, &token);

        assert_eq!(bill_id, 1);
        let bill = client.get_bill(&bill_id);
        assert_eq!(bill.total_amount, 1000);
        assert_eq!(bill.per_share, 500);
        assert_eq!(bill.released, false);
        assert_eq!(bill.cancelled, false);
    }

    #[test]
    fn test_pay_share_transfers_tokens() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, SplitBillContract);
        let client = SplitBillContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token = create_token(&env, &admin);
        mint_tokens(&env, &token, &admin, &p1, 1000);
        mint_tokens(&env, &token, &admin, &p2, 1000);

        let mut participants = Vec::new(&env);
        participants.push_back(p1.clone());
        participants.push_back(p2.clone());

        let bill_id = client.create_bill(&creator, &1000, &participants, &token);

        client.pay_share(&bill_id, &p1);
        assert_eq!(client.has_paid(&bill_id, &p1), true);
        assert_eq!(client.get_collected(&bill_id), 500);
    }

    #[test]
    fn test_auto_release_when_all_paid() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, SplitBillContract);
        let client = SplitBillContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token = create_token(&env, &admin);
        mint_tokens(&env, &token, &admin, &p1, 1000);
        mint_tokens(&env, &token, &admin, &p2, 1000);

        let token_client = TokenClient::new(&env, &token);

        let mut participants = Vec::new(&env);
        participants.push_back(p1.clone());
        participants.push_back(p2.clone());

        let bill_id = client.create_bill(&creator, &1000, &participants, &token);

        client.pay_share(&bill_id, &p1);
        client.pay_share(&bill_id, &p2);

        let bill = client.get_bill(&bill_id);
        assert_eq!(bill.released, true);

        // Creator should have received 1000 tokens
        assert_eq!(token_client.balance(&creator), 1000);
    }

    #[test]
    fn test_cancel_and_refund() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, SplitBillContract);
        let client = SplitBillContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token = create_token(&env, &admin);
        mint_tokens(&env, &token, &admin, &p1, 1000);
        mint_tokens(&env, &token, &admin, &p2, 1000);

        let token_client = TokenClient::new(&env, &token);

        let mut participants = Vec::new(&env);
        participants.push_back(p1.clone());
        participants.push_back(p2.clone());

        let bill_id = client.create_bill(&creator, &1000, &participants, &token);

        // p1 pays
        client.pay_share(&bill_id, &p1);
        assert_eq!(token_client.balance(&p1), 500);

        // Creator cancels
        client.cancel_bill(&bill_id, &creator);

        // p1 should be refunded
        assert_eq!(token_client.balance(&p1), 1000);

        let bill = client.get_bill(&bill_id);
        assert_eq!(bill.cancelled, true);
    }

    #[test]
#[should_panic]
fn test_cannot_pay_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SplitBillContract);
    let client = SplitBillContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let p1 = Address::generate(&env);
    let p2 = Address::generate(&env);

    let token = create_token(&env, &admin);
    mint_tokens(&env, &token, &admin, &p1, 1000);
    mint_tokens(&env, &token, &admin, &p2, 1000);

    let mut participants = Vec::new(&env);
    participants.push_back(p1.clone());
    participants.push_back(p2.clone());

    let bill_id = client.create_bill(&creator, &1000, &participants, &token);

    client.pay_share(&bill_id, &p1);
    client.pay_share(&bill_id, &p1);
}
}