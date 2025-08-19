import { Core__TokenCreated as Core__TokenCreatedEvent } from "../generated/Core/Core";
import {
  Token as TokenTemplate,
  Content as ContentTemplate,
  Rewarder as RewarderTemplate,
} from "../generated/templates";
import {
  Directory,
  Token,
  TokenPosition,
  User,
  Sale,
  Content,
  Rewarder,
} from "../generated/schema";
import {
  CORE_ADDRESS,
  ZERO_BI,
  ONE_BI,
  ZERO_BD,
  INITIAL_LIQUIDITY,
  INITIAL_MARKET_CAP,
  INITIAL_TOTAL_SUPPLY,
  INITIAL_PRICE,
  INITIAL_QUOTE_VIRT_RESERVE,
  INITIAL_TOKEN_RESERVE,
  ADDRESS_ZERO,
} from "./constants";

export function handleCore__TokenCreated(event: Core__TokenCreatedEvent): void {
  let directory = Directory.load(CORE_ADDRESS);
  if (directory == null) {
    directory = new Directory(CORE_ADDRESS);
    directory.index = ZERO_BI;
    directory.txCount = ZERO_BI;
    directory.swapVolume = ZERO_BD;
    directory.liquidity = ZERO_BD;
    directory.curateVolume = ZERO_BD;
    directory.contents = ZERO_BI;
  }
  directory.index = directory.index.plus(ONE_BI);
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.liquidity = directory.liquidity.plus(INITIAL_LIQUIDITY);
  directory.save();

  let user = User.load(event.params.owner.toHexString());
  if (user == null) {
    user = new User(event.params.owner.toHexString());
    user.txCount = ZERO_BI;
    user.referrer = ADDRESS_ZERO;
  }
  user.txCount = user.txCount.plus(ONE_BI);
  user.save();

  TokenTemplate.create(event.params.token);
  let token = Token.load(event.params.token.toHexString());
  if (token == null) {
    token = new Token(event.params.token.toHexString());
    token.name = event.params.name;
    token.symbol = event.params.symbol;
    token.uri = event.params.uri;
    token.owner = event.params.owner.toHexString();

    token.txCount = ZERO_BI;
    token.swapVolume = ZERO_BD;
    token.liquidity = INITIAL_LIQUIDITY;
    token.totalSupply = INITIAL_TOTAL_SUPPLY;
    token.marketCap = INITIAL_MARKET_CAP;
    token.quoteVirtReserve = INITIAL_QUOTE_VIRT_RESERVE;
    token.quoteRealReserve = ZERO_BD;
    token.tokenReserve = INITIAL_TOKEN_RESERVE;
    token.marketPrice = INITIAL_PRICE;
    token.floorPrice = INITIAL_PRICE;
    token.holders = ZERO_BI;

    token.contents = ZERO_BI;
    token.contentBalance = ZERO_BD;
    token.curateVolume = ZERO_BD;

    token.creatorRewardsQuote = ZERO_BD;
    token.curatorRewardsQuote = ZERO_BD;
    token.holderRewardsQuote = ZERO_BD;

    token.treasuryRevenueQuote = ZERO_BD;
    token.treasuryRevenueToken = ZERO_BD;
    token.contentRevenueQuote = ZERO_BD;
    token.contentRevenueToken = ZERO_BD;

    token.createdAtTimestamp = event.block.timestamp;
    token.createdAtBlockNumber = event.block.number;

    token.isModerated = event.params.isModerated;
  }
  token.txCount = token.txCount.plus(ONE_BI);
  token.save();

  ContentTemplate.create(event.params.content);
  let content = Content.load(event.params.content.toHexString());
  if (content == null) {
    content = new Content(event.params.content.toHexString());
  }
  content.token = event.params.token.toHexString();
  content.save();

  RewarderTemplate.create(event.params.rewarder);
  let rewarder = Rewarder.load(event.params.rewarder.toHexString());
  if (rewarder == null) {
    rewarder = new Rewarder(event.params.rewarder.toHexString());
    rewarder.token = event.params.token.toHexString();
  }
  rewarder.save();

  let tokenPosition = TokenPosition.load(
    event.params.token.toHexString() + "-" + event.params.owner.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      event.params.token.toHexString() + "-" + event.params.owner.toHexString()
    );
    tokenPosition.token = event.params.token.toHexString();
    tokenPosition.user = event.params.owner.toHexString();
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
  tokenPosition.save();
}
