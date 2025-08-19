import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Directory,
  User,
  Token,
  TokenPosition,
  Swap,
  TokenDayData,
  TokenHourData,
  TokenMinuteData,
} from "../generated/schema";
import {
  Transfer as TransferEvent,
  Token__Swap as Token__SwapEvent,
  Token__SyncReserves as Token__SyncReservesEvent,
  Token__HealReserves as Token__HealReservesEvent,
  Token__BurnReserves as Token__BurnReservesEvent,
  Token__ProviderFee as Token__ProviderFeeEvent,
  Token__TreasuryFee as Token__TreasuryFeeEvent,
  Token__ContentFee as Token__ContentFeeEvent,
  Token__Borrow as Token__BorrowEvent,
  Token__Repay as Token__RepayEvent,
} from "../generated/templates/Token/Token";
import {
  ONE_BI,
  ZERO_BI,
  ADDRESS_ZERO,
  ZERO_BD,
  ALMOST_ZERO_BD,
  CORE_ADDRESS,
} from "./constants";
import { convertTokenToDecimal } from "./helpers";

export function handleToken__Transfer(event: TransferEvent): void {
  let token = Token.load(event.address.toHexString())!;

  let userWho = User.load(event.params.from.toHexString());
  if (userWho == null) {
    userWho = new User(event.params.from.toHexString());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.save();

  let userTo = User.load(event.params.to.toHexString());
  if (userTo == null) {
    userTo = new User(event.params.to.toHexString());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
  }
  userTo.save();

  let whoTokenPosition = TokenPosition.load(token.id + "-" + userWho.id);
  if (whoTokenPosition == null) {
    whoTokenPosition = new TokenPosition(token.id + "-" + userWho.id);
    whoTokenPosition.token = token.id;
    whoTokenPosition.user = userWho.id;
    whoTokenPosition.balance = ZERO_BD;
    whoTokenPosition.debt = ZERO_BD;

    whoTokenPosition.contentCreated = ZERO_BI;
    whoTokenPosition.createdCurations = ZERO_BI;
    whoTokenPosition.createdValue = ZERO_BD;

    whoTokenPosition.contentOwned = ZERO_BI;
    whoTokenPosition.contentBalance = ZERO_BD;
    whoTokenPosition.curationSpend = ZERO_BD;

    whoTokenPosition.creatorRevenueQuote = ZERO_BD;
    whoTokenPosition.ownerRevenueQuote = ZERO_BD;

    whoTokenPosition.affiliateRevenueQuote = ZERO_BD;
    whoTokenPosition.affiliateRevenueToken = ZERO_BD;

    whoTokenPosition.curatorRevenueQuote = ZERO_BD;
    whoTokenPosition.curatorRevenueToken = ZERO_BD;
  }
  let whoInitialBalance = whoTokenPosition.balance;
  whoTokenPosition.balance = whoInitialBalance.minus(
    convertTokenToDecimal(event.params.value, BigInt.fromI32(18))
  );
  if (
    whoInitialBalance.gt(ALMOST_ZERO_BD) &&
    whoTokenPosition.balance.lt(ALMOST_ZERO_BD)
  ) {
    token.holders = token.holders.minus(ONE_BI);
  }
  whoTokenPosition.save();

  let toTokenPosition = TokenPosition.load(token.id + "-" + userTo.id);
  if (toTokenPosition == null) {
    toTokenPosition = new TokenPosition(token.id + "-" + userTo.id);
    toTokenPosition.token = token.id;
    toTokenPosition.user = userTo.id;
    toTokenPosition.balance = ZERO_BD;
    toTokenPosition.debt = ZERO_BD;

    toTokenPosition.contentCreated = ZERO_BI;
    toTokenPosition.createdCurations = ZERO_BI;
    toTokenPosition.createdValue = ZERO_BD;

    toTokenPosition.contentOwned = ZERO_BI;
    toTokenPosition.contentBalance = ZERO_BD;
    toTokenPosition.curationSpend = ZERO_BD;

    toTokenPosition.creatorRevenueQuote = ZERO_BD;
    toTokenPosition.ownerRevenueQuote = ZERO_BD;
    toTokenPosition.affiliateRevenueQuote = ZERO_BD;
    toTokenPosition.affiliateRevenueToken = ZERO_BD;
    toTokenPosition.curatorRevenueQuote = ZERO_BD;
    toTokenPosition.curatorRevenueToken = ZERO_BD;
  }
  let toInitialBalance = toTokenPosition.balance;
  toTokenPosition.balance = toInitialBalance.plus(
    convertTokenToDecimal(event.params.value, BigInt.fromI32(18))
  );
  if (
    toInitialBalance.lt(ALMOST_ZERO_BD) &&
    toTokenPosition.balance.gt(ALMOST_ZERO_BD)
  ) {
    token.holders = token.holders.plus(ONE_BI);
  }
  toTokenPosition.save();
  token.save();
}

export function handleToken__Swap(event: Token__SwapEvent): void {
  let directory = Directory.load(CORE_ADDRESS)!;
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.swapVolume = directory.swapVolume.plus(
    convertTokenToDecimal(event.params.quoteInRaw, BigInt.fromI32(6))
  );
  directory.swapVolume = directory.swapVolume.plus(
    convertTokenToDecimal(event.params.quoteOutRaw, BigInt.fromI32(6))
  );
  directory.save();

  let userWho = User.load(event.params.from.toHexString());
  if (userWho == null) {
    userWho = new User(event.params.from.toHexString());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.txCount = userWho.txCount.plus(ONE_BI);
  userWho.save();

  let userTo = User.load(event.params.to.toHexString());
  if (userTo == null) {
    userTo = new User(event.params.to.toHexString());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
    userTo.save();
  }

  let token = Token.load(event.address.toHexString())!;
  token.txCount = token.txCount.plus(ONE_BI);
  token.swapVolume = token.swapVolume.plus(
    convertTokenToDecimal(event.params.quoteInRaw, BigInt.fromI32(6))
  );
  token.swapVolume = token.swapVolume.plus(
    convertTokenToDecimal(event.params.quoteOutRaw, BigInt.fromI32(6))
  );
  token.save();

  let swap = new Swap(event.transaction.hash.toHexString());
  swap.token = token.id;
  swap.user = event.params.from.toHexString();
  swap.blockNumber = event.block.number;
  swap.timestamp = event.block.timestamp;
  swap.quoteIn = convertTokenToDecimal(
    event.params.quoteInRaw,
    BigInt.fromI32(6)
  );
  swap.quoteOut = convertTokenToDecimal(
    event.params.quoteOutRaw,
    BigInt.fromI32(6)
  );
  swap.tokenIn = convertTokenToDecimal(
    event.params.tokenIn,
    BigInt.fromI32(18)
  );
  swap.tokenOut = convertTokenToDecimal(
    event.params.tokenOut,
    BigInt.fromI32(18)
  );
  swap.marketPrice = token.marketPrice;
  swap.floorPrice = token.floorPrice;
  swap.save();

  let timestamp = event.block.timestamp.toI32();

  let dayIndex = timestamp / 86400;
  let dayStartTimestamp = dayIndex * 86400;
  let dayTokenId = token.id + "-" + dayIndex.toString();
  let tokenDayData = TokenDayData.load(dayTokenId);
  if (tokenDayData == null) {
    tokenDayData = new TokenDayData(dayTokenId);
    tokenDayData.token = token.id;
    tokenDayData.timestamp = BigInt.fromI32(dayStartTimestamp);
    tokenDayData.volume = ZERO_BD;
  }
  tokenDayData.marketPrice = token.marketPrice;
  tokenDayData.floorPrice = token.floorPrice;
  tokenDayData.volume = tokenDayData.volume.plus(
    convertTokenToDecimal(event.params.quoteInRaw, BigInt.fromI32(6))
  );
  tokenDayData.volume = tokenDayData.volume.plus(
    convertTokenToDecimal(event.params.quoteOutRaw, BigInt.fromI32(6))
  );
  tokenDayData.save();

  let hourIndex = timestamp / 3600;
  let hourStartTimestamp = hourIndex * 3600;
  let hourTokenId = token.id + "-" + hourIndex.toString();
  let tokenHourData = TokenHourData.load(hourTokenId);
  if (tokenHourData == null) {
    tokenHourData = new TokenHourData(hourTokenId);
    tokenHourData.token = token.id;
    tokenHourData.timestamp = BigInt.fromI32(hourStartTimestamp);
    tokenHourData.volume = ZERO_BD;
  }
  tokenHourData.marketPrice = token.marketPrice;
  tokenHourData.floorPrice = token.floorPrice;
  tokenHourData.volume = tokenHourData.volume.plus(
    convertTokenToDecimal(event.params.quoteInRaw, BigInt.fromI32(6))
  );
  tokenHourData.volume = tokenHourData.volume.plus(
    convertTokenToDecimal(event.params.quoteOutRaw, BigInt.fromI32(6))
  );
  tokenHourData.save();

  let minuteIndex = timestamp / 60;
  let minuteStartTimestamp = minuteIndex * 60;
  let minuteTokenId = token.id + "-" + minuteIndex.toString();
  let tokenMinuteData = TokenMinuteData.load(minuteTokenId);
  if (tokenMinuteData == null) {
    tokenMinuteData = new TokenMinuteData(minuteTokenId);
    tokenMinuteData.token = token.id;
    tokenMinuteData.timestamp = BigInt.fromI32(minuteStartTimestamp);
    tokenMinuteData.volume = ZERO_BD;
  }
  tokenMinuteData.marketPrice = token.marketPrice;
  tokenMinuteData.floorPrice = token.floorPrice;
  tokenMinuteData.volume = tokenMinuteData.volume.plus(
    convertTokenToDecimal(event.params.quoteInRaw, BigInt.fromI32(6))
  );
  tokenMinuteData.volume = tokenMinuteData.volume.plus(
    convertTokenToDecimal(event.params.quoteOutRaw, BigInt.fromI32(6))
  );
  tokenMinuteData.save();
}

export function handleToken__SyncReserves(
  event: Token__SyncReservesEvent
): void {
  let token = Token.load(event.address.toHexString())!;
  token.quoteVirtReserve = convertTokenToDecimal(
    event.params.reserveVirtQuoteWad,
    BigInt.fromI32(18)
  );
  token.quoteRealReserve = convertTokenToDecimal(
    event.params.reserveRealQuoteWad,
    BigInt.fromI32(18)
  );
  token.tokenReserve = convertTokenToDecimal(
    event.params.reserveTokenAmt,
    BigInt.fromI32(18)
  );
  let reserveQuote = token.quoteVirtReserve.plus(token.quoteRealReserve);
  let initialLiquidity = token.liquidity;
  token.liquidity = reserveQuote.times(BigDecimal.fromString("2"));
  token.floorPrice = token.quoteVirtReserve.div(token.totalSupply);
  token.marketPrice = reserveQuote.div(token.tokenReserve);
  token.marketCap = token.marketPrice.times(token.totalSupply);
  token.save();

  let directory = Directory.load(CORE_ADDRESS)!;
  directory.liquidity = directory.liquidity
    .minus(initialLiquidity)
    .plus(token.liquidity);
  directory.save();
}

export function handleToken__HealReserves(
  event: Token__HealReservesEvent
): void {
  let token = Token.load(event.address.toHexString())!;
  token.quoteVirtReserve = token.quoteVirtReserve.plus(
    convertTokenToDecimal(event.params.virtAddWad, BigInt.fromI32(18))
  );
  token.quoteRealReserve = token.quoteRealReserve.plus(
    convertTokenToDecimal(event.params.quoteWad, BigInt.fromI32(18))
  );
  let reserveQuote = token.quoteVirtReserve.plus(token.quoteRealReserve);
  let initialLiquidity = token.liquidity;
  token.liquidity = reserveQuote.times(BigDecimal.fromString("2"));
  token.floorPrice = token.quoteVirtReserve.div(token.totalSupply);
  token.marketPrice = reserveQuote.div(token.tokenReserve);
  token.marketCap = token.marketPrice.times(token.totalSupply);
  token.save();

  let directory = Directory.load(CORE_ADDRESS)!;
  directory.liquidity = directory.liquidity
    .minus(initialLiquidity)
    .plus(token.liquidity);
  directory.save();
}

export function handleToken__BurnReserves(
  event: Token__BurnReservesEvent
): void {
  let token = Token.load(event.address.toHexString())!;
  token.tokenReserve = token.tokenReserve.minus(
    convertTokenToDecimal(event.params.reserveBurn, BigInt.fromI32(18))
  );
  token.totalSupply = token.totalSupply.minus(
    convertTokenToDecimal(event.params.reserveBurn, BigInt.fromI32(18)).minus(
      convertTokenToDecimal(event.params.tokenAmt, BigInt.fromI32(18))
    )
  );
  let reserveQuote = token.quoteVirtReserve.plus(token.quoteRealReserve);
  let initialLiquidity = token.liquidity;
  token.liquidity = reserveQuote.times(BigDecimal.fromString("2"));
  token.floorPrice = token.quoteVirtReserve.div(token.totalSupply);
  token.marketPrice = reserveQuote.div(token.tokenReserve);
  token.marketCap = token.marketPrice.times(token.totalSupply);
  token.save();

  let directory = Directory.load(CORE_ADDRESS)!;
  directory.liquidity = directory.liquidity
    .minus(initialLiquidity)
    .plus(token.liquidity);
  directory.save();
}

export function handleToken__ProviderFee(event: Token__ProviderFeeEvent): void {
  let user = User.load(event.params.to.toHexString());
  if (user == null) {
    user = new User(event.params.to.toHexString());
    user.txCount = ZERO_BI;
    user.referrer = ADDRESS_ZERO;
  }
  user.save();

  let tokenPosition = TokenPosition.load(
    event.address.toHexString() + "-" + event.params.to.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      event.address.toHexString() + "-" + event.params.to.toHexString()
    );
    tokenPosition.token = event.address.toHexString();
    tokenPosition.user = event.params.to.toHexString();
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;

    tokenPosition.contentCreated = ZERO_BI;
    tokenPosition.createdCurations = ZERO_BI;
    tokenPosition.createdValue = ZERO_BD;

    tokenPosition.contentOwned = ZERO_BI;
    tokenPosition.contentBalance = ZERO_BD;
    tokenPosition.curationSpend = ZERO_BD;

    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.ownerRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  tokenPosition.affiliateRevenueQuote =
    tokenPosition.affiliateRevenueQuote.plus(
      convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(6))
    );
  tokenPosition.affiliateRevenueToken =
    tokenPosition.affiliateRevenueToken.plus(
      convertTokenToDecimal(event.params.tokenAmt, BigInt.fromI32(18))
    );
  tokenPosition.save();
}

export function handleToken__TreasuryFee(event: Token__TreasuryFeeEvent): void {
  let token = Token.load(event.address.toHexString())!;
  token.treasuryRevenueQuote = token.treasuryRevenueQuote.plus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(6))
  );
  token.treasuryRevenueToken = token.treasuryRevenueToken.plus(
    convertTokenToDecimal(event.params.tokenAmt, BigInt.fromI32(18))
  );
  token.save();
}

export function handleToken__ContentFee(event: Token__ContentFeeEvent): void {
  let token = Token.load(event.address.toHexString())!;
  token.contentRevenueQuote = token.contentRevenueQuote.plus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(6))
  );
  token.contentRevenueToken = token.contentRevenueToken.plus(
    convertTokenToDecimal(event.params.tokenAmt, BigInt.fromI32(18))
  );
  token.save();
}

export function handleToken__Borrow(event: Token__BorrowEvent): void {
  let userWho = User.load(event.params.who.toHexString());
  if (userWho == null) {
    userWho = new User(event.params.who.toHexString());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.txCount = userWho.txCount.plus(ONE_BI);
  userWho.save();

  let userTo = User.load(event.params.to.toHexString());
  if (userTo == null) {
    userTo = new User(event.params.to.toHexString());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
  }
  userTo.save();

  let tokenPosition = TokenPosition.load(
    event.address.toHexString() + "-" + event.params.who.toHexString()
  )!;
  tokenPosition.debt = tokenPosition.debt.plus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(18))
  );
  tokenPosition.save();

  let directory = Directory.load(CORE_ADDRESS)!;
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.save();

  let token = Token.load(event.address.toHexString())!;
  token.txCount = token.txCount.plus(ONE_BI);
  token.save();
}

export function handleToken__Repay(event: Token__RepayEvent): void {
  let userWho = User.load(event.params.who.toHexString());
  if (userWho == null) {
    userWho = new User(event.params.who.toHexString());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.txCount = userWho.txCount.plus(ONE_BI);
  userWho.save();

  let userTo = User.load(event.params.to.toHexString());
  if (userTo == null) {
    userTo = new User(event.params.to.toHexString());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
  }
  userTo.save();

  let tokenPosition = TokenPosition.load(
    event.address.toHexString() + "-" + event.params.to.toHexString()
  )!;
  tokenPosition.debt = tokenPosition.debt.minus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(18))
  );
  tokenPosition.save();

  let directory = Directory.load(CORE_ADDRESS)!;
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.save();

  let token = Token.load(event.address.toHexString())!;
  token.txCount = token.txCount.plus(ONE_BI);
  token.save();
}
