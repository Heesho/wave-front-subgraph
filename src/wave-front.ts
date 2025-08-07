import { WaveFront__TokenCreated as WaveFront__TokenCreatedEvent } from "../generated/WaveFront/WaveFront";
import {
  Token as TokenTemplate,
  Sale as SaleTemplate,
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
  WAVEFRONT_ADDRESS,
  ZERO_BI,
  ONE_BI,
  ZERO_BD,
  INITIAL_LIQUIDITY,
  INITIAL_MARKET_CAP,
  INITIAL_TOTAL_SUPPLY,
  INITIAL_PRICE,
  INITIAL_QUOTE_VIRT_RESERVE,
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
    token.volume = ZERO_BD;
    token.liquidity = INITIAL_LIQUIDITY;
    token.totalSupply = INITIAL_TOTAL_SUPPLY;
    token.marketCap = INITIAL_MARKET_CAP;
    token.quoteVirtReserve = INITIAL_QUOTE_VIRT_RESERVE;
    token.quoteRealReserve = ZERO_BD;
    token.tokenReserve = INITIAL_TOKEN_RESERVE;
    token.marketPrice = INITIAL_PRICE;
    token.floorPrice = INITIAL_PRICE;
    token.contribution = ZERO_BD;
    token.holders = ZERO_BI;

    token.treasuryRevenueQuote = ZERO_BD;
    token.treasuryRevenueToken = ZERO_BD;
    token.contentRevenueQuote = ZERO_BD;
    token.contentRevenueToken = ZERO_BD;

    token.createdAtTimestamp = event.block.timestamp;
    token.createdAtBlockNumber = event.block.number;
    token.marketOpen = false;
    token.marketOpensAt = event.block.timestamp.plus(SALE_DURATION);

    token.isPrivate = event.params.isPrivate;

    token.save();
  }

  token.txCount = token.txCount.plus(ONE_BI);

  token.save();

  SaleTemplate.create(event.params.sale);
  let sale = Sale.load(event.params.sale.toHexString());
  if (sale == null) {
    sale = new Sale(event.params.sale.toHexString());
    sale.token = event.params.token.toHexString();
  }
  sale.save();

  let content = Content.load(event.params.token.toHexString());
  if (content == null) {
    content = new Content(event.params.token.toHexString());
    content.token = event.params.token.toHexString();
  }
  content.save();

  let rewarder = Rewarder.load(event.params.token.toHexString());
  if (rewarder == null) {
    rewarder = new Rewarder(event.params.token.toHexString());
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
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }

  tokenPosition.save();
}
