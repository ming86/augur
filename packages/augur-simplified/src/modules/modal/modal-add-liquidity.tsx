import React, { useState } from 'react';

import Styles from 'modules/modal/modal.styles.less';
import { Header } from './common';
import { YES_NO, BUY } from '../constants';
import { OutcomesGrid, AmountInput, InfoNumbers } from '../market/trading-form';
import { BuySellButton, SecondaryButton } from '../common/buttons';
import { ErrorBlock } from '../common/labels';
import { formatPercent } from '../../utils/format-number';
import { MultiButtonSelection } from '../common/selection';
import classNames from 'classnames';

const TRADING_FEE_OPTIONS = [
  {
    id: 0,
    label: '0.0%',
    value: 0,
  },
  {
    id: 1,
    label: '0.5%',
    value: 0.5,
  },
  {
    id: 2,
    label: '1%',
    value: 1,
  },
  {
    id: 3,
    label: '2%',
    value: 2,
  },
];

const fakeYesNoOutcomes = [
  {
    id: 0,
    name: 'yes',
    price: '$0',
  },
  {
    id: 1,
    name: 'No',
    price: '$0',
  },
];

const ModalAddLiquidity = ({ market }) => {
  const [outcomes, setOutcomes] = useState(fakeYesNoOutcomes);
  const [showBackView, setShowBackView] = useState(false);

  const [tradingFeeSelection, setTradingFeeSelection] = useState(
    TRADING_FEE_OPTIONS[0].id
  );
  const { amm } = market;
  const createLiquidity = !amm;
  const percentFormatted = formatPercent(amm?.feePercent).full;
  return (
    <section
      className={classNames(Styles.ModalAddLiquidity, {
        [Styles.showBackView]: showBackView,
      })}
    >
      {!showBackView ? (
        <>
          <Header
            title={'Add liquidity'}
            subtitle={{
              label: 'trading fee',
              value: amm?.feePercent ? percentFormatted : null,
            }}
          />
          <AmountInput />
          {createLiquidity && (
            <ErrorBlock text="Initial liquidity providers are required to set the odds before creating market liquidity." />
          )}
          {createLiquidity && (
            <>
              <span className={Styles.SmallLabel}>Set trading fee</span>
              <MultiButtonSelection
                options={TRADING_FEE_OPTIONS}
                selection={tradingFeeSelection}
                setSelection={(id) => setTradingFeeSelection(id)}
              />
            </>
          )}
          <span className={Styles.SmallLabel}>
            {createLiquidity ? 'Set the odds' : 'Current Odds'}
          </span>
          <OutcomesGrid
            outcomes={outcomes}
            selectedOutcome={null}
            setSelectedOutcome={() => null}
            marketType={YES_NO}
            orderType={BUY}
            nonSelectable
            editable={createLiquidity}
            setEditableValue={(price, index) => {
              const newOutcomes = outcomes;
              newOutcomes[index].price = price;
              setOutcomes(newOutcomes);
            }}
          />
          <span className={Styles.SmallLabel}>You'll receive</span>
          <InfoNumbers
            infoNumbers={[
              {
                label: 'yes shares',
                value: '0',
              },
              {
                label: 'no shares',
                value: '0',
              },
              {
                label: 'liquidity shares',
                value: '0',
              },
            ]}
          />
          <BuySellButton text="approve USDC" />
          <SecondaryButton
            action={() => setShowBackView(true)}
            text={createLiquidity ? 'Enter amount' : 'Add'}
          />
          <div className={Styles.FooterText}>
            {createLiquidity
              ? "By adding initial liquidity you'll earn your set trading fee percentage of all trades on this this market proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
              : `By adding liquidity you'll earn ${percentFormatted} of all trades on this this market proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
          </div>
        </>
      ) : (
        <>
          <div className={Styles.Header} onClick={() => setShowBackView(false)}>
            Back
          </div>
          <div className={Styles.MarketTitle}>
            <span>Market</span>
            <span>{market.description}</span>
          </div>
          <section>
            <span className={Styles.SmallLabel}>What you are depositing</span>
            <InfoNumbers
              infoNumbers={[
                {
                  label: 'amount',
                  value: '10.00 USDC',
                },
              ]}
            />
          </section>

          <section>
            <span className={Styles.SmallLabel}>What you will receive</span>
            <InfoNumbers
              infoNumbers={[
                {
                  label: 'yes shares',
                  value: '0',
                },
                {
                  label: 'no shares',
                  value: '1.72 ($0.94)',
                },
                {
                  label: 'liquidity shares',
                  value: '10.06 ($9.06)',
                },
              ]}
            />
          </section>
          <section>
            <span className={Styles.SmallLabel}>Market Liquidity Details</span>
            <InfoNumbers
              infoNumbers={[
                {
                  label: 'trading fee',
                  value: createLiquidity
                    ? `${TRADING_FEE_OPTIONS[tradingFeeSelection].value}%`
                    : percentFormatted,
                },
                {
                  label: 'your share of the pool',
                  value: '100%',
                },
              ]}
            />
          </section>

          <BuySellButton
            text={createLiquidity ? 'confirm market liquidity' : 'confirm add'}
          />
          <div className={Styles.FooterText}>
            Need some copy here explaining why the user will get shares and that
            they may recieve some shares when they remove their liquidity.
          </div>
        </>
      )}
    </section>
  );
};

export default ModalAddLiquidity;