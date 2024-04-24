# Daniel Swap

Welcome to the Daniel Swap project! This project is a sample of Solana-based decentralized exchange (DEX) that allows users to swap tokens efficiently and add liquidity to the pools.

## Setup

Before you begin, ensure you have the following prerequisites installed on your system:

- Anchor v0.28.0
- Rustc v1.77.2
- Solana CLI v1.18.4
- Node v18

### Building the Program

To build the Daniel Swap program, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run the following command to build the program:

```bash
anchor build
```

### Executing Tests

To execute the tests and ensure everything is set up correctly, run:

```bash
anchor test
```

## Entrypoints

The Daniel Swap program provides several entrypoints for interacting with the DEX. Below is a table outlining these entrypoints, their actions, and any notes related to them.

| Entrypoint                      | Action                                   | Notes                          |
|---------------------------------|------------------------------------------|--------------------------------|
| `createPool`                    | Initializes a new liquidity pool        |                                |
| `fundPool`                      | Adds liquidity to an existing pool      |                                |
| `swapUsingConstantProductFormula` | Executes a swap using the constant product formula | this is intended to be in real production |
| `swapUsingConstantPriceFormula` | Executes a swap using the constant price formula | this is for requirement |

## PDAs and Seeds

The program utilizes Program Derived Addresses (PDAs) for various functionalities. Below is a table of the PDAs used in this project along with their corresponding seeds.

| PDA           | Seeds                |
|---------------|----------------------|
| `pool` | `[LiquidityPool::SEED_PREFIX]` |

## Demonstration

To help you get started with Daniel Swap, we've provided two video demonstrations:

1. **How to Swap**: This video guides you through the process of swapping tokens on the Daniel Swap DEX.

[DEMO FOR SWAP](/assets/swap.mov)

2. **How to Fund Pool**: This video shows you how to add liquidity to a pool, enabling others to perform swaps.

[DEMO FOR FUND](/assets/fund.mov)

## Disclaimer

This project, Daniel Swap, is a demonstration of decentralized finance (DeFi) concepts on the Solana blockchain. It is important for users and developers to understand both the capabilities and limitations of this project. Below is an overview of what the project has achieved and areas where it may not fully address certain aspects of DeFi trading.

### What the Project Has Done:

- **Implemented Swapping Mechanisms**: Daniel Swap allows users to swap between different tokens using algorithms like the constant product formula, which ensures liquidity remains constant within a pool.
- **Liquidity Pool Creation and Funding**: Users can create liquidity pools for pairs of tokens and fund these pools, facilitating swaps and earning transaction fees in return.

### Limitations and Considerations:

- **Price Impact of Constant Product Formula**: While the constant product formula provides a simple and effective way to maintain liquidity, it can lead to significant price impact on large trades. This project does not implement mechanisms to mitigate this impact, which could result in less favorable rates for large swaps.
- **Price Slippage Caused by the Market**: The project does not currently address the issue of price slippage, where the actual price of a swap differs from the expected price due to changes in supply and demand within the pool during the transaction confirmation time.
- **Market Manipulation and Arbitrage**: As with any DeFi project, there is a risk of market manipulation and arbitrage opportunities that could affect the stability and fairness of the trading environment. Users should be aware of these risks when interacting with the platform.

This project is intended for educational and demonstration purposes. It showcases the potential of Solana for building DeFi applications but does not represent a fully-featured trading platform. Users should exercise caution and conduct their own research before engaging in cryptocurrency trading or investing in DeFi platforms.