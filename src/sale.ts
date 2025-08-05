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
}

export function handleSale__MarketOpened(
  event: Sale__MarketOpenedEvent
): void {}

export function handleSale__Redeemed(event: Sale__RedeemedEvent): void {}
