import { BigInt } from "@graphprotocol/graph-ts";
import {
  Sale__Contributed as Sale__ContributedEvent,
  Sale__MarketOpened as Sale__MarketOpenedEvent,
  Sale__Redeemed as Sale__RedeemedEvent,
} from "../generated/templates/Sale/Sale";
import {
  Directory,
  User,
  Token,
  TokenPosition,
  Sale,
} from "../generated/schema";
import {
  ZERO_BD,
  ZERO_BI,
  ADDRESS_ZERO,
  ONE_BI,
  WAVEFRONT_ADDRESS,
} from "./constants";
import { convertTokenToDecimal } from "./helpers";

export function handleSale__Contributed(event: Sale__ContributedEvent): void {
  let directory = Directory.load(WAVEFRONT_ADDRESS)!;
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.save();

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

  let sale = Sale.load(event.address.toHexString())!;
  let token = Token.load(sale.token)!;
  token.txCount = token.txCount.plus(ONE_BI);
  token.contribution = token.contribution.plus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(6))
  );
  token.save();

  let tokenPosition = TokenPosition.load(token.id + "-" + userTo.id);
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(token.id + "-" + userTo.id);
    tokenPosition.token = token.id;
    tokenPosition.user = userTo.id;
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  tokenPosition.contribution = tokenPosition.contribution.plus(
    convertTokenToDecimal(event.params.quoteRaw, BigInt.fromI32(6))
  );
  tokenPosition.save();
}

export function handleSale__MarketOpened(event: Sale__MarketOpenedEvent): void {
  let sale = Sale.load(event.address.toHexString())!;
  let token = Token.load(sale.token)!;
  token.marketOpen = true;
  token.save();
}

export function handleSale__Redeemed(event: Sale__RedeemedEvent): void {
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

  let sale = Sale.load(event.address.toHexString())!;
  let token = Token.load(sale.token)!;
  token.txCount = token.txCount.plus(ONE_BI);
  token.save();

  let tokenPosition = TokenPosition.load(token.id + "-" + userTo.id);
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(token.id + "-" + userTo.id);
    tokenPosition.token = token.id;
    tokenPosition.user = userTo.id;
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  tokenPosition.contribution = ZERO_BD;
  tokenPosition.save();
}
