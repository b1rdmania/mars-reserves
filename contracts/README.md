# Mars Reserves - Move Contract

## Contract: MissionIndex

A simple on-chain registry for verified game runs on Movement Bardock testnet.

### Features
- **Global Index**: Cumulative score tracking humanity's progress
- **Run Recording**: Stores run hash, score, ending, seed on-chain
- **Events**: Emits `RunRecorded` for indexing

### Deployment

1. **Install Aptos CLI** (Movement uses Aptos-compatible tooling):
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Initialize account** (first time only):
   ```bash
   cd contracts
   aptos init --network custom --rest-url https://aptos.devnet.imola.movementlabs.xyz/v1
   ```

3. **Compile**:
   ```bash
   aptos move compile --named-addresses mars_reserves=default
   ```

4. **Deploy**:
   ```bash
   aptos move publish --named-addresses mars_reserves=default
   ```

5. **Initialize the index** (one-time setup):
   ```bash
   aptos move run --function-id 'default::mission_index::initialize'
   ```

### Contract Interface

```move
// Initialize (admin only, once)
public entry fun initialize(admin: &signer)

// Record a verified run
public entry fun record_run(
    player: &signer,
    score: u64,
    ending_id: vector<u8>,
    run_hash: vector<u8>,
    seed: u64,
    index_address: address,
)

// View current state
#[view]
public fun get_index(index_address: address): (u64, u64, u64)
// Returns: (total_runs, global_index, last_updated)
```

### Events

```move
#[event]
struct RunRecorded {
    player: address,
    score: u64,
    ending_id: vector<u8>,
    run_hash: vector<u8>,
    seed: u64,
    timestamp: u64,
    index_contribution: u64,
}
```

### Environment

- **Network**: Movement Bardock (Devnet)
- **RPC**: https://aptos.devnet.imola.movementlabs.xyz/v1
- **Explorer**: https://explorer.movementnetwork.xyz
