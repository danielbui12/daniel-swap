import BigNumber from "bignumber.js"

export const numberWDecimals = (num: BigNumber.Value, decimals: number): BigNumber => {
    const _decimals = new BigNumber(10).pow(new BigNumber(decimals));
    return new BigNumber(num).multipliedBy(_decimals);
}

export const numberWODecimals = (num: BigNumber.Value, decimals: number): number => {
    if (!BigNumber.isBigNumber(num)) {
        num = new BigNumber(num);
    }
    const _decimals = new BigNumber(10).pow(new BigNumber(decimals));    
    return num.dividedBy(_decimals).toNumber();
}