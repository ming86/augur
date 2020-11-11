import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { RowFixed, RowBetween } from '../Row'
import { useMedia } from 'react-use'
import { useEthPrice } from '../../contexts/GlobalData'
import { calculateLiquidity, formatShares, formattedNum, localNumber } from '../../utils'
import { TYPE } from '../../Theme'
import { useMarketCashTokens, useTotalLiquidity, useVolumesByCash, useAmmTransactions } from '../../contexts/Markets'
import { useTokenDayPriceData } from '../../contexts/TokenData'
import { BigNumber as BN } from 'bignumber.js'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`
/*
const Medium = styled.span`
  font-weight: 500;
`
*/
export default function GlobalStats() {
  //  const below1295 = useMedia('(max-width: 1295px)')
  //  const below1180 = useMedia('(max-width: 1180px)')
  //  const below1024 = useMedia('(max-width: 1024px)')
  //  const below400 = useMedia('(max-width: 400px)')
  const below816 = useMedia('(max-width: 816px)')

  const [globalLiquidity, setGlobalLiquidity] = useState("-")
  const [oneDayVolume, setOneDayVolume] = useState("-")
  const [oneDayTx, setOneDayTx] = useState("-")
  const cashTokens = useMarketCashTokens()
  const cashData = useTokenDayPriceData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  const liquidities = useTotalLiquidity()
  const ammVolumes = useVolumesByCash()
  const ammTransactions = useAmmTransactions()

  useEffect(() => {
    let total = new BN("0")
    if (cashData && Object.keys(cashData).length > 0) {
      total = Object.keys(liquidities).reduce((p, cash) => {
        const cashValue = calculateLiquidity(Number(cashTokens[cash]?.decimals), String(liquidities[cash]), String(cashData[cash]?.priceUSD))
        return p.plus(new BN(cashValue))
      }, new BN(0))
    }
    const liq = formattedNum(String(total), true);
    setGlobalLiquidity(String(liq))

    const { totalDiff } = ammVolumes;
    const diffInUSD = totalDiff ? formatShares(totalDiff) : "0"
    setOneDayVolume(diffInUSD)

    const { totalDiff: tx } = ammTransactions;
    setOneDayTx(tx)
  }, [liquidities, cashData, cashTokens, ammVolumes, ammTransactions ])

  return (
    <Header>
      <RowBetween>
        <RowFixed
          style={
            below816 ? { flexFlow: 'column', alignItems: 'stretch', justifyContent: 'flex-start' } : { flexFlow: 'row' }
          }
        >
          <TYPE.boxed mb={'0.5rem'} mr={'0.25rem'}>
            <TYPE.boxedRow>
              <span>ETH price: </span>
            </TYPE.boxedRow>
            <TYPE.boxedRow>
              <TYPE.largeHeader>{formattedEthPrice}</TYPE.largeHeader>
            </TYPE.boxedRow>
          </TYPE.boxed>
          <TYPE.boxed mb={'0.5rem'} mr={'0.25rem'}>
            <TYPE.boxedRow>Total Liquidity</TYPE.boxedRow>
            <TYPE.boxedRow>
              <TYPE.largeHeader>{globalLiquidity}</TYPE.largeHeader>
            </TYPE.boxedRow>
          </TYPE.boxed>
          <TYPE.boxed mb={'0.5rem'} mr={'0.25rem'}>
            <TYPE.boxedRow>Volume (24 hrs): </TYPE.boxedRow>
            <TYPE.boxedRow>
              <TYPE.largeHeader>${oneDayVolume}</TYPE.largeHeader>
            </TYPE.boxedRow>
          </TYPE.boxed>
          <TYPE.boxed mb={'0.5rem'}>
            <TYPE.boxedRow>Transactions (24 hrs):</TYPE.boxedRow>
            <TYPE.boxedRow>
              <TYPE.largeHeader>{oneDayTx}</TYPE.largeHeader>
            </TYPE.boxedRow>
          </TYPE.boxed>
        </RowFixed>
      </RowBetween>
    </Header>
  )
}