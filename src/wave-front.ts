import { WaveFront__TokenCreated as WaveFront__TokenCreatedEvent } from "../generated/WaveFront/WaveFront";
import { Directory, Token, TokenPosition, User } from "../generated/schema";
import {
  WAVEFRONT_ADDRESS,
  ZERO_BI,
  ONE_BI,
  ZERO_BD,
  INITIAL_LIQUIDITY,
  INITIAL_MARKET_CAP,
  INITIAL_TOTAL_SUPPLY,
  INITIAL_PRICE,
  INITIAL_QUOTE_RESERVE,
  INITIAL_TOKEN_RESERVE,
  SALE_DURATION,
  ADDRESS_ZERO,
} from "./constants";

export function handleWaveFront__TokenCreated(
  event: WaveFront__TokenCreatedEvent
): void {
  let directory = Directory.load(WAVEFRONT_ADDRESS);
  if (directory == null) {
    directory = new Directory(WAVEFRONT_ADDRESS);
    directory.index = ZERO_BI;
    directory.txCount = ZERO_BI;
    directory.volume = ZERO_BD;
    directory.liquidity = ZERO_BD;
    directory.totalRevenue = ZERO_BD;
  }

  directory.index = directory.index.plus(ONE_BI);
  directory.txCount = directory.txCount.plus(ONE_BI);

  directory.save();

  let user = User.load(event.params.owner.toHexString());
  if (user == null) {
    user = new User(event.params.owner.toHexString());
    user.txCount = ZERO_BI;
    user.referrer = ADDRESS_ZERO;
  }

  user.txCount = user.txCount.plus(ONE_BI);

  user.save();

  let token = Token.load(event.params.token.toHexString());
  if (token == null) {
    token = new Token(event.params.token.toHexString());
    token.name = event.params.name;
    token.symbol = event.params.symbol;
    token.uri = event.params.uri;
    token.owner = event.params.owner.toHexString();

    token.txCount = ZERO_BI;
    token.volume = ZERO_BD;
    token.liquidity = INITIAL_LIQUIDITY;
    token.totalSupply = INITIAL_TOTAL_SUPPLY;
    token.marketCap = INITIAL_MARKET_CAP;
    token.quoteReserve = INITIAL_QUOTE_RESERVE;
    token.tokenReserve = INITIAL_TOKEN_RESERVE;
    token.marketPrice = INITIAL_PRICE;
    token.floorPrice = INITIAL_PRICE;
    token.contributors = ZERO_BI;
    token.holders = ZERO_BI;

    token.createdAtTimestamp = event.block.timestamp;
    token.createdAtBlockNumber = event.block.number;
    token.marketOpen = false;
    token.marketOpensAt = event.block.timestamp.plus(SALE_DURATION);

    token.isPrivate = event.params.isPrivate;

    token.save();
  }

  token.txCount = token.txCount.plus(ONE_BI);

  token.save();

  let tokenPosition = TokenPosition.load(
    event.params.token.toHexString() + "-" + event.params.owner.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      event.params.token.toHexString() + "-" + event.params.owner.toHexString()
    );

    tokenPosition.token = event.params.token.toHexString();
    tokenPosition.user = event.params.owner.toHexString();
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;

    tokenPosition.save();
  }
}
