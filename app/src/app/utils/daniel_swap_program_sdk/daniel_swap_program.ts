export type DanielSwapProgram = {
  "version": "0.1.0",
  "name": "daniel_swap_program",
  "instructions": [
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "fundPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Liquidity Pool"
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The asset is deposited into the pool"
          ]
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The Liquidity Pool's ata"
          ]
        },
        {
          "name": "payerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The payer's ata"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapUsingConstantProductFormula",
      "docs": [
        "this is intended to be in real production"
      ],
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountToSwap",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapUsingConstantPriceFormula",
      "docs": [
        "this is for requirement"
      ],
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountToSwap",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assets",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAssetKey",
      "msg": "Invalid asset key"
    },
    {
      "code": 6001,
      "name": "InvalidPayAmount",
      "msg": "Invalid amount payment"
    },
    {
      "code": 6002,
      "name": "OverLiquidityAllocatable",
      "msg": "Invalid amount allocatable"
    },
    {
      "code": 6003,
      "name": "InvalidSwapAssets",
      "msg": "Asset key cannot be the same"
    },
    {
      "code": 6004,
      "name": "InvalidSwapZeroAmount",
      "msg": "Zero amount"
    }
  ]
};

export const IDL: DanielSwapProgram = {
  "version": "0.1.0",
  "name": "daniel_swap_program",
  "instructions": [
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "fundPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Liquidity Pool"
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The asset is deposited into the pool"
          ]
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The Liquidity Pool's ata"
          ]
        },
        {
          "name": "payerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The payer's ata"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapUsingConstantProductFormula",
      "docs": [
        "this is intended to be in real production"
      ],
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountToSwap",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapUsingConstantPriceFormula",
      "docs": [
        "this is for requirement"
      ],
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerPayTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountToSwap",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assets",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAssetKey",
      "msg": "Invalid asset key"
    },
    {
      "code": 6001,
      "name": "InvalidPayAmount",
      "msg": "Invalid amount payment"
    },
    {
      "code": 6002,
      "name": "OverLiquidityAllocatable",
      "msg": "Invalid amount allocatable"
    },
    {
      "code": 6003,
      "name": "InvalidSwapAssets",
      "msg": "Asset key cannot be the same"
    },
    {
      "code": 6004,
      "name": "InvalidSwapZeroAmount",
      "msg": "Zero amount"
    }
  ]
};
