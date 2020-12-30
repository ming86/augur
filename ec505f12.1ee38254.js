(window.webpackJsonp=window.webpackJsonp||[]).push([[437],{493:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return o})),a.d(t,"metadata",(function(){return l})),a.d(t,"rightToc",(function(){return c})),a.d(t,"default",(function(){return u}));var r=a(2),n=a(6),i=(a(0),a(530)),o={},l={unversionedId:"architecture/layer2",id:"architecture/layer2",isDocsHomePage:!1,title:"layer2",description:"Augur Trading on L2 Specification",source:"@site/../docs/architecture/layer2.md",permalink:"/docs/architecture/layer2",editUrl:"https://github.com/AugurProject/augur/edit/documentation/augur.sh/../docs/architecture/layer2.md",sidebar:"docs",previous:{title:"overview",permalink:"/docs/contracts/overview"},next:{title:"Contracts",permalink:"/docs/api/contracts/index"}},c=[{value:"Goal",id:"goal",children:[]},{value:"Para Architecture",id:"para-architecture",children:[{value:"Overview",id:"overview",children:[]},{value:"Markets",id:"markets",children:[]},{value:"Reporting and Forking",id:"reporting-and-forking",children:[]},{value:"Trading",id:"trading",children:[]},{value:"OINexus and Fee Calculations",id:"oinexus-and-fee-calculations",children:[]}]},{value:"L1 Data Availability on L2",id:"l1-data-availability-on-l2",children:[{value:"User Assets",id:"user-assets",children:[]},{value:"Market Data",id:"market-data",children:[]},{value:"Fee Data",id:"fee-data",children:[]},{value:"How to Develop with Para Augur",id:"how-to-develop-with-para-augur",children:[]}]}],s={rightToc:c};function u(e){var t=e.components,a=Object(n.a)(e,["components"]);return Object(i.b)("wrapper",Object(r.a)({},s,a,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h1",{id:"augur-trading-on-l2-specification"},"Augur Trading on L2 Specification"),Object(i.b)("h2",{id:"goal"},"Goal"),Object(i.b)("p",null,"The security of the Augur v2 Oracle was designed to be independent of trading, so long as sufficient trading fees can be extracted such that the total REP market cap grows to be able to maintain security of the oracle via Augur's forking mechanism. Because of this design decision it is possible to moving Augur v2 Trading off of Layer 1 (ethereum) and on to any other plaform under the constrain that the assets used for trading must be locked up on ethereum when participating."),Object(i.b)("p",null,'Also, since releasing Augur v2, work has been done to implement support for multiple collateral types in Augur. This feature is referred to as "ParaAugur", meaning Parallel Augur. This implementation allows multiple trading implementations, collateralized in arbitrary tokens, to pool their Open Interest such that the security guarantees above remain true. This opens the opportunity for side-chains to interact with a specific collateralization of Augur depending on their use case, and also opens to the door to contract modifications which make side chain support cleaner.'),Object(i.b)("p",null,"We will be defining a specification for what a Layer 2 (or sidechain) needs to implement in order to fully support augur trading on that chain. This will require bridging, potentially some contract code implemented for Ethereum, and the ability to access certain data on the sidechain."),Object(i.b)("h2",{id:"para-architecture"},"Para Architecture"),Object(i.b)("p",null,"Architecture Diagram."),Object(i.b)("h3",{id:"overview"},"Overview"),Object(i.b)("p",null,"Each collateral for which trading is enabled will have the set of contracts deployed to Layer 1 which exist in the ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/tree/para_deploys/packages/augur-core/src/contracts/para"}),Object(i.b)("inlineCode",{parentName:"a"},"para")," folder of the Augur Monorepo"),". These contracts are deployed via a factory to ensure that all collaterals are deployed with the exact same set of contracts -- which eases verifiability."),Object(i.b)("p",null,"Sidechain deployments consist of a deployment onto Layer 2 of the contracts in the ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/tree/para_deploys/packages/augur-core/src/contracts/sidechain"}),Object(i.b)("inlineCode",{parentName:"a"},"sidechain")," folder of the Augur Monorepo"),". The intention is that for each Para deploy that needs to exist on a sidechain, a separate deployment of any bridging logic, as well as sidechain contracts will be deployed."),Object(i.b)("h3",{id:"markets"},"Markets"),Object(i.b)("p",null,"Markets are defined on the core Augur V2 deploy and are shared by all Para Augur instances. During the market lifecycle it will be necessary to bridge the following data to any side chain deployments: Market Creation, Market Finalization, and Market Migration to a Child Universe."),Object(i.b)("p",null,"This market data will be exposed on L2 by a contract which adheres to the ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/blob/para_deploys/packages/augur-core/src/contracts/sidechain/IMarketGetter.sol"}),Object(i.b)("inlineCode",{parentName:"a"},"IMarketGetter")," interface"),". When deploying the sidechain contracts, it will be necessary to specify:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"The contract which implements IMarketGetter"),Object(i.b)("li",{parentName:"ul"},"The sidechain collateral token (this is a generic ERC-20 in which people will trade on the sidechain, minted specifically for Augur)."),Object(i.b)("li",{parentName:"ul"},"An address where fees will be extracted during trading, which will ultimately be exited to Layer1 for collection by REP holders.")),Object(i.b)("h3",{id:"reporting-and-forking"},"Reporting and Forking"),Object(i.b)("p",null,'Reporting and Forking occur on the core Augur V2 deploy and are not a part of the Para Deploy. This means that all Augur Oracle functionality stays on Layer 1. The only data that is required to be bridged is the Reporting Fee (discussed later in "OINexus") and markets as they\'re migrated to a new child unverse after a fork.'),Object(i.b)("h3",{id:"trading"},"Trading"),Object(i.b)("p",null,"Para Augur consists of a new set of trading contracts, collateralized in an ERC-20 token, which will be deployed via on on-chain factory. Para Augur deploys do not have to relate to side chains: they can be for Layer 1 collateral. For those that do relate to sidechains, each will require an independent bridge to that sidechain."),Object(i.b)("h3",{id:"oinexus-and-fee-calculations"},"OINexus and Fee Calculations"),Object(i.b)("p",null,'The OINexus is a single contract that is deployed for all of the Para Augurs. During the operation of each Para Augur, trading fees are extracted during trading, and are sent the Para-Augur\'s "FeePot" contract. As trading occurs, or as collateral is locked in a ParaOICash contracts, the total Open Interest in each Para Augur is tracked and reported back to the OINexus contract. The OINexus calculates a total reporting fee based upon the total OI across all Augur instances. This reporting fee changes at most every three days, and this value must be available to any sidechain deployments as it is used when extracting trading fees on the side chain.'),Object(i.b)("h2",{id:"l1-data-availability-on-l2"},"L1 Data Availability on L2"),Object(i.b)("p",null,"In order for the sidechain Augur to work, certain data must be accessible on Layer 2 from Layer 1, and occassionally some assets must be able to be transferred from Layer 2 back to Layer 1. These fall into the the categories of User Assets, Market Data, and Fees."),Object(i.b)("h3",{id:"user-assets"},"User Assets"),Object(i.b)("p",null,"Users wanting to trade on a Sidechain deployment of Augur need to move assets onto the sidechain, and at the same time the Augur oracle has a requirement that it able to account for all Open Interest across all platforms. To solve this problem we employ the OICash contract. Collateral will be deposited into OICash by a user. When assets are deposited in OICash, they must also be bridged over to the Layer 2. Whence on Layer 2, these assets should be made available to the user to trade on Augur."),Object(i.b)("h4",{id:"bridge-via-push"},"Bridge via Push"),Object(i.b)("p",null,"These balances should be migrated similarly to any ERC-20. When a user deposits into the collateral ParaOICash it will mint ParaOICash tokens which can be deposited into your sidechain's deposit contracts."),Object(i.b)("h4",{id:"bridge-via-events"},"Bridge via Events"),Object(i.b)("p",null,"Assets must be locked on Layer 1 and made available on Layer 2."),Object(i.b)("h3",{id:"market-data"},"Market Data"),Object(i.b)("p",null,"Market Data must be made available on Layer 2 when markets are Created, Finalized, or Migrated to a new universe after a successful Fork."),Object(i.b)("p",null,"The data that must be bridged over is:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"owner"),Object(i.b)("li",{parentName:"ul"},"numOutcomes"),Object(i.b)("li",{parentName:"ul"},"affiliateFeeDivisor"),Object(i.b)("li",{parentName:"ul"},"feeDivisor"),Object(i.b)("li",{parentName:"ul"},"numTicks"),Object(i.b)("li",{parentName:"ul"},"universe"),Object(i.b)("li",{parentName:"ul"},"finalized"),Object(i.b)("li",{parentName:"ul"},"winningPayout")),Object(i.b)("h4",{id:"bridge-via-push-1"},"Bridge via Push"),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"bridgeMarket")," function on ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/blob/para_deploys/packages/augur-core/src/contracts/sidechain/AugurPushBridge.sol#L12"}),"AugurPushBridge.sol")," will return a struct with all the data needed for Layer 2. To integrate with the Augur UI, wrapper contracts will need to be integrated with the UI to make sure these events are called in the appropriate place(s). This is yet to be implemented."),Object(i.b)("h4",{id:"bridge-via-events-1"},"Bridge via Events"),Object(i.b)("p",null,"If data can be made accessible by proving the existence of Ethereum Events, the data can be retrieved via the following events, all emitted from the ",Object(i.b)("inlineCode",{parentName:"p"},"ParaAugur")," contract instance for the deployed collateral."),Object(i.b)("h5",{id:"marketcreated"},"MarketCreated"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"owner"),Object(i.b)("li",{parentName:"ul"},"numOutcomes"),Object(i.b)("li",{parentName:"ul"},"affiliateFeeDivisor"),Object(i.b)("li",{parentName:"ul"},"feeDivisor"),Object(i.b)("li",{parentName:"ul"},"numTicks"),Object(i.b)("li",{parentName:"ul"},"universe")),Object(i.b)("h5",{id:"marketfinalized"},"MarketFinalized"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"finalized (true, if this event was emitted)"),Object(i.b)("li",{parentName:"ul"},"winningPayout")),Object(i.b)("h5",{id:"marketmigrated"},"MarketMigrated"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"newUniverse")),Object(i.b)("h3",{id:"fee-data"},"Fee Data"),Object(i.b)("p",null,"In the course of normal operation of Augur, the fee rate needed for Oracle security is adjusted at most every three days. This data must be available on L2 so that trading on L2 can extrac the appropriate fees. There is no need for this adjustment to be immediate and any normal delays in making the data available on L2 are acceptable."),Object(i.b)("h4",{id:"bridge-via-push-2"},"Bridge via Push"),Object(i.b)("p",null,"he ",Object(i.b)("inlineCode",{parentName:"p"},"bridgeReportingFee")," function on ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/blob/para_deploys/packages/augur-core/src/contracts/sidechain/AugurPushBridge.sol#L28"}),"AugurPushBridge.sol")," will return a uint256 with all the data needed for Layer 2."),Object(i.b)("h4",{id:"bridge-via-event"},"Bridge via Event"),Object(i.b)("p",null,"There is a single event, emitted from the ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/AugurProject/augur/blob/para_deploys/packages/augur-core/src/contracts/para/ParaAugur.sol#L27"}),"ParaAugur")," instance for the collateral."),Object(i.b)("h5",{id:"reportingfeechanged"},"ReportingFeeChanged"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"universe -- the universe for this deploy"),Object(i.b)("li",{parentName:"ul"},"reportingFee -- The current reporting fee for the uinverse"),Object(i.b)("li",{parentName:"ul"},"para -- The ShareToken address of the parallel augur deploy.")),Object(i.b)("h3",{id:"how-to-develop-with-para-augur"},"How to Develop with Para Augur"),Object(i.b)("h4",{id:"file-layout"},"File Layout"),Object(i.b)("h4",{id:"deployment-local"},"Deployment (Local)"),Object(i.b)("p",null,"To develop connected to Para Augur it is most efficient to use a local ethereum instance with the various contracts deployed. Augur has default Geth docker images which can be used to quickly spin up a node that has ETH allocated to development private keys, which can be spun up with ",Object(i.b)("inlineCode",{parentName:"p"},"yarn")," scripts from the root of the monorepo."),Object(i.b)("p",null,"Deploying the contracts for local development involes using the Augur command line tool ",Object(i.b)("inlineCode",{parentName:"p"},"flash")," which is available from the root of monorepo using the command ",Object(i.b)("inlineCode",{parentName:"p"},"yarn flash"),". ",Object(i.b)("inlineCode",{parentName:"p"},"flash")," has a huge variety of tools available for working with Augur instances, in this case we will use it to deploy the base Augur contracts, deploy the Para Augur Factory, and then to use that Factory to deploy an Augur instance collateralized in the currency of our choosing."),Object(i.b)("h4",{id:"deployment-remote"},"Deployment (Remote)"))}u.isMDXComponent=!0},530:function(e,t,a){"use strict";a.d(t,"a",(function(){return d})),a.d(t,"b",(function(){return p}));var r=a(0),n=a.n(r);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function c(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=n.a.createContext({}),u=function(e){var t=n.a.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=u(e.components);return n.a.createElement(s.Provider,{value:t},e.children)},h={inlineCode:"code",wrapper:function(e){var t=e.children;return n.a.createElement(n.a.Fragment,{},t)}},b=n.a.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),d=u(a),b=r,p=d["".concat(o,".").concat(b)]||d[b]||h[b]||i;return a?n.a.createElement(p,l(l({ref:t},s),{},{components:a})):n.a.createElement(p,l({ref:t},s))}));function p(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=b;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var s=2;s<i;s++)o[s]=a[s];return n.a.createElement.apply(null,o)}return n.a.createElement.apply(null,a)}b.displayName="MDXCreateElement"}}]);