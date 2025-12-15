/// Mars Reserves Mission Index
/// 
/// A simple on-chain registry that records verified game runs and maintains
/// a global "Frontier Index" - a cumulative score representing humanity's
/// progress in colonizing Mars.
///
/// Design principle: The chain is the audit trail. Leaderboard lives off-chain.
module mars_reserves::mission_index {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INVALID_SCORE: u64 = 3;

    /// The global mission index state
    struct MissionIndex has key {
        /// Total number of runs recorded
        total_runs: u64,
        /// Cumulative global index (sum of weighted scores)
        global_index: u64,
        /// Last update timestamp
        last_updated: u64,
    }

    /// Event emitted when a run is recorded
    #[event]
    struct RunRecorded has drop, store {
        /// Player's address
        player: address,
        /// The run's score
        score: u64,
        /// Ending identifier (hashed)
        ending_id: vector<u8>,
        /// Run hash for verification
        run_hash: vector<u8>,
        /// Original game seed
        seed: u64,
        /// Timestamp of recording
        timestamp: u64,
        /// Contribution to global index
        index_contribution: u64,
    }

    /// Initialize the mission index (called once by deployer)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<MissionIndex>(admin_addr), E_ALREADY_INITIALIZED);
        
        move_to(admin, MissionIndex {
            total_runs: 0,
            global_index: 0,
            last_updated: timestamp::now_seconds(),
        });
    }

    /// Record a verified game run
    /// Called by the backend after verification passes
    public entry fun record_run(
        player: &signer,
        score: u64,
        ending_id: vector<u8>,
        run_hash: vector<u8>,
        seed: u64,
        index_address: address,
    ) acquires MissionIndex {
        assert!(exists<MissionIndex>(index_address), E_NOT_INITIALIZED);
        assert!(score > 0, E_INVALID_SCORE);
        
        let player_addr = signer::address_of(player);
        let now = timestamp::now_seconds();
        
        // Calculate index contribution
        // Simple formula: score / 1_000_000 (scale down to reasonable index units)
        let index_contribution = score / 1_000_000;
        if (index_contribution == 0) {
            index_contribution = 1; // Minimum contribution
        };
        
        // Update global state
        let index = borrow_global_mut<MissionIndex>(index_address);
        index.total_runs = index.total_runs + 1;
        index.global_index = index.global_index + index_contribution;
        index.last_updated = now;
        
        // Emit event
        event::emit(RunRecorded {
            player: player_addr,
            score,
            ending_id,
            run_hash,
            seed,
            timestamp: now,
            index_contribution,
        });
    }

    /// View function to get current index state
    #[view]
    public fun get_index(index_address: address): (u64, u64, u64) acquires MissionIndex {
        assert!(exists<MissionIndex>(index_address), E_NOT_INITIALIZED);
        let index = borrow_global<MissionIndex>(index_address);
        (index.total_runs, index.global_index, index.last_updated)
    }
}
