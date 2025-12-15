/// MissionIndex: Append-only historical record of Mars Reserves missions
/// 
/// This contract records completed missions on-chain with sponsored gas.
/// No leaderboard, no per-turn state — just permanent history.
module mission_index::mission_index {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    /// Event emitted when a mission is recorded
    struct MissionRecorded has drop, store {
        commander: address,
        run_hash: vector<u8>,
        score: u64,
        ending_id: vector<u8>,
        recorded_at: u64,
        mission_number: u64,
    }

    /// Global registry storing mission count and event handle
    struct MissionRegistry has key {
        total_missions: u64,
        events: event::EventHandle<MissionRecorded>,
    }

    /// Initialize the registry (called once by deployer)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<MissionRegistry>(admin_addr), 1); // Already initialized
        
        move_to(admin, MissionRegistry {
            total_missions: 0,
            events: account::new_event_handle<MissionRecorded>(admin),
        });
    }

    /// Record a completed mission
    /// Called by backend with sponsored gas on behalf of the user
    public entry fun record_mission(
        commander: &signer,
        run_hash: vector<u8>,
        score: u64,
        ending_id: vector<u8>,
    ) acquires MissionRegistry {
        let commander_addr = signer::address_of(commander);
        
        // Get the registry (stored at module address)
        let registry = borrow_global_mut<MissionRegistry>(@mission_index);
        
        // Increment mission counter
        registry.total_missions = registry.total_missions + 1;
        
        // Emit event
        event::emit_event(&mut registry.events, MissionRecorded {
            commander: commander_addr,
            run_hash,
            score,
            ending_id,
            recorded_at: timestamp::now_seconds(),
            mission_number: registry.total_missions,
        });
    }

    /// View function to get total missions recorded
    #[view]
    public fun get_total_missions(): u64 acquires MissionRegistry {
        borrow_global<MissionRegistry>(@mission_index).total_missions
    }
}
