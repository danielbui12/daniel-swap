import BigNumber from "bignumber.js"

export const numberWDecimals = (num: number, decimals: number): BigNumber => {
    const _decimals = new BigNumber(10).multipliedBy(new BigNumber(decimals));
    return new BigNumber(num).multipliedBy(_decimals);
}

export const numberWODecimals = (num: BigNumber, decimals: number): number => {
    const _decimals = new BigNumber(10).multipliedBy(new BigNumber(decimals));
    return num.dividedBy(_decimals).toNumber();
}