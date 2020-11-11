import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';

import { binarySearch, bnDirection } from '@augurproject/utils';
import { AMMExchangeAbi } from '../abi/AMMExchangeAbi';
import { SignerOrProvider, YES_NO_NUMTICKS } from '../constants';

export class AMMExchange {
  static readonly ABI = AMMExchangeAbi;
  readonly contract: ethers.Contract;
  readonly address: string;
  readonly signerOrProvider: SignerOrProvider;

  constructor(signerOrProvider: SignerOrProvider, address: string) {
    this.contract = new ethers.Contract(address, AMMExchangeAbi, signerOrProvider);
    this.address = address;
    this.signerOrProvider = signerOrProvider;
  }

  // Ratio of Yes:No shares.
  async price(): Promise<BigNumber> {
    const { _no, _yes } = await this.contract.yesNoShareBalances(this.contract.address);
    if (_no.eq(0)) return new BigNumber(0);
    return _yes.div(_no);
  }

  async rateEnterPosition(cash: BigNumber, buyYes: boolean): Promise<BigNumber> {
    return this.contract.rateEnterPosition(cash.toFixed(), buyYes);
  }

  async doEnterPosition(cash: BigNumber, buyYes: boolean, minShares: BigNumber): Promise<TransactionResponse> {
    console.log(String(cash), buyYes, String(minShares))
    return this.contract.enterPosition(cash.toFixed(), buyYes, minShares.toFixed());
  }

  async rateCashEnterPosition(shares: Shares, buyYes: boolean): Promise<BigNumber> {
      const cash = await binarySearch(
        new BigNumber(1),
        new BigNumber(shares.times(YES_NO_NUMTICKS)),
        100,
        async (cash) => {
          const yesShares = await this.contract.rateEnterPosition(cash, buyYes);
          return bnDirection(shares, yesShares);
        }
      );
      return cash;
    }


  async rateExitPosition(invalidShares: BigNumber, noShares: BigNumber, yesShares: BigNumber): Promise<BigNumber> {
    return this.contract.rateExitPosition(invalidShares, noShares, yesShares);
  }

  async doExitPosition(invalidShares: Shares, noShares: Shares, yesShares: Shares, minCash: BigNumber): Promise<TransactionResponse> {
    return this.contract.exitPosition(invalidShares, noShares, yesShares, minCash);
  }

  async exitAll(): Promise<Cash> {
    const { _cashPayout } = await this.contract.rateExitAll();
    await this.contract.exitAll(_cashPayout);
    return _cashPayout;
  }

  async swapForYes(noShares: Shares): Promise<Shares> {
    return this.swap(noShares, false);
  }

  async swapForNo(yesShares: Shares): Promise<Shares> {
    return this.swap(yesShares, true);
  }

  async getRateSwap(inputShares: BigNumber, inputIsYesShares: boolean): Promise<Shares> {
    return this.contract.rateSwap(inputShares, inputIsYesShares);
  }

  async swap(inputShares: Shares, inputYes: boolean): Promise<Shares> {
    const noShares = await this.contract.rateSwap(inputShares, inputYes);
    await this.contract.swap(inputShares, inputYes, noShares);
    return noShares;
  }

  async doSwap(inputShares: Shares, inputYes: boolean, minShares: Shares): Promise<TransactionResponse> {
    console.log('doSwap', String(inputShares), inputYes, String(minShares))
    return this.contract.swap(inputShares, inputYes, minShares);
  }

  async doAddInitialLiquidity(recipient: string, cash: Cash, yesPercent = new BigNumber(50), noPercent = new BigNumber(50)): Promise<TransactionResponse> {
    const keepYes = noPercent.gt(yesPercent);

    let ratio = keepYes // more NO shares than YES shares
      ? new BigNumber(10**18).times(yesPercent).div(noPercent)
      : new BigNumber(10**18).times(noPercent).div(yesPercent);

    // must be integers
    cash = cash.idiv(1);
    ratio = ratio.idiv(1);

    return this.contract.addInitialLiquidity(cash, ratio, keepYes, recipient);
  }

  async addLiquidity(recipient: string, cash: Cash): Promise<TransactionResponse> {
    console.log(String(cash), recipient)
    return this.contract.addLiquidity(cash.toFixed(), recipient);
  }

  async rateAddInitialLiquidity(recipient: string, cash: Cash, yesPercent: BigNumber, noPercent: BigNumber): Promise<LPTokens> {
    const keepYes = noPercent.gt(yesPercent);

    let ratio = keepYes // more NO shares than YES shares
      ? new BigNumber(10**18).times(yesPercent).div(noPercent)
      : new BigNumber(10**18).times(noPercent).div(yesPercent);

    // must be integers
    cash = cash.idiv(1);
    ratio = ratio.idiv(1);

    return this.contract.callStatic.addInitialLiquidity(cash, ratio, keepYes, recipient);
  }

  async rateAddLiquidity(recipient: string, cash: BigNumber): Promise<LPTokens> {
    return this.contract.callStatic.addLiquidity(cash, recipient);
  }

  async getRemoveLiquidity(lpTokens: LPTokens, alsoSell = false): Promise<{noShares: BigNumber, yesShares: BigNumber, cashShares: BigNumber}> {
    const { _noShare, _yesShare, _cashShare } = await this.contract.rateRemoveLiquidity(lpTokens.toFixed(), alsoSell ? 1 : 0);
    return { noShares: _noShare, yesShares: _yesShare, cashShares: _cashShare}
  }

  async doRemoveLiquidity(lpTokens: LPTokens, alsoSell = false): Promise<TransactionResponse> {
    // if not selling them minSetsSold is 0
    // if selling them calculate how many sets you could get, then sell that many

    let minSetsSold: Sets;
    if (alsoSell) {
      // Selling more than zero sets sells as many sets as possible. So one atto set is enough to get the rate.
      const { _setsSold } = await this.contract.rateRemoveLiquidity(lpTokens, new BigNumber(1));
      minSetsSold = _setsSold;
    } else {
      minSetsSold = new BigNumber(0);
    }

    return this.contract.removeLiquidity(lpTokens.toFixed(), minSetsSold.toFixed());
  }

  calculateCashForSharesInSwap(desiredShares: Shares, yes: boolean): BigNumber {
    // X**2 - (PN + PY)X + (2PN(PY) - PN(Y))
    // Where X = cash required; Y = desired Shares, PN = pool No, PY = pool Yes
    const a = new BigNumber(1);
    const { _no, _yes } = this.contract.yesNoShareBalances(this.contract.address);
    const b = new BigNumber(_yes).plus(_no);
    const c = new BigNumber(2).multipliedBy(_no).multipliedBy(_yes).minus(desiredShares.multipliedBy(yes ? _no : _yes));
    return this.solveQuadratic(a, b, c);
  }

  solveQuadratic(a: BigNumber, b: BigNumber, c: BigNumber): BigNumber {
    const piece =  (b.multipliedBy(b).minus(a.multipliedBy(c).multipliedBy(4))).abs().sqrt();
    let resultPlus = b.multipliedBy(-1).plus(piece).dividedBy(a.multipliedBy(2));
    let resultMinus = b.multipliedBy(-1).plus(piece).dividedBy(a.multipliedBy(2));

    // Choose correct answer.
    if (resultPlus.lt(0)) {
      return resultMinus;
    } else if (resultMinus.lt(0)) {
      return resultPlus;
    } else if (resultPlus.lt(resultMinus)) {
      return resultPlus;
    } else {
      return resultMinus;
    }
  }

  async totalSupply(): Promise<LPTokens> {
    const lpTokens = await this.contract.totalSupply()
    return new BigNumber(lpTokens.toString());
  }

  extractLiquidityLog(tx: ethers.providers.TransactionReceipt): LiquidityLog {
    const logs = tx.logs
      .filter((log) => log.address === this.address)
      .map((log) => this.contract.interface.parseLog(log))
      .filter((log) => log.name === 'AddLiquidity')
      .map((log) => ({
        sender: log.args.sender,
        cash: new BigNumber(log.args.cash.toString()),
        noShares: new BigNumber(log.args.noShares.toString()),
        yesShares: new BigNumber(log.args.yesShares.toString()),
        lpTokens: new BigNumber(log.args.lpTokens.toString()),
      }));
    if (logs.length !== 1) throw Error(`Expected one log but got ${logs.length} logs.`);
    return logs[0];
  }
}

export interface RemoveLiquidityReturn {
  _invalidShare: Shares,
  _noShare: Shares,
  _yesShare: Shares,
  _setsSold: Sets,
}

export interface LiquidityLog {
  sender: string,
  cash: BigNumber,
  noShares: BigNumber,
  yesShares: BigNumber,
  lpTokens: BigNumber,
}

export type LPTokens = BigNumber;
export type Shares = BigNumber;
export type Sets = BigNumber;
export type Cash = BigNumber;