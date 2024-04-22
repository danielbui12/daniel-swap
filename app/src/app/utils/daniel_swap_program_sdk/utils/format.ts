
export function toBigIntQuantity(quantity: number, decimals: number): bigint {
    return BigInt(quantity) * BigInt(10) ** BigInt(decimals)
}

export function fromBigIntQuantity(quantity: bigint, decimals: number): string {
    return (Number(quantity) / 10 ** decimals).toFixed(6)
}