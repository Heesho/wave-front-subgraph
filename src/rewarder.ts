import { BigInt } from "@graphprotocol/graph-ts";
import {
  Rewarder__Deposited as Rewarder__DepositedEvent,
  Rewarder__Withdrawn as Rewarder__WithdrawnEvent,
  Rewarder__RewardPaid as Rewarder__RewardPaidEvent,
} from "../generated/templates/Rewarder/Rewarder";
import { Rewarder, Token, TokenPosition } from "../generated/schema";
import { ZERO_BD, USDC_ADDRESS } from "./constants";
import { convertTokenToDecimal } from "./helpers";

export function handleRewarder__Deposited(
  event: Rewarder__DepositedEvent
): void {
  let rewarder = Rewarder.load(event.address.toHexString())!;
  let token = Token.load(rewarder.token)!;
  token.contentBalance = token.contentBalance.plus(
    convertTokenToDecimal(event.params.amount, BigInt.fromI32(6))
  );
  token.save();

  let tokenPosition = TokenPosition.load(
    token.id + "-" + event.params.user.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      token.id + "-" + event.params.user.toHexString()
    );
    tokenPosition.token = token.id;
    tokenPosition.user = event.params.user.toHexString();
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.contentBalance = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.ownerRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  tokenPosition.contentBalance = tokenPosition.contentBalance.plus(
    convertTokenToDecimal(event.params.amount, BigInt.fromI32(6))
  );
  tokenPosition.save();
}

export function handleRewarder__Withdrawn(
  event: Rewarder__WithdrawnEvent
): void {
  let rewarder = Rewarder.load(event.address.toHexString())!;
  let token = Token.load(rewarder.token)!;
  token.contentBalance = token.contentBalance.minus(
    convertTokenToDecimal(event.params.amount, BigInt.fromI32(6))
  );
  token.save();

  let tokenPosition = TokenPosition.load(
    token.id + "-" + event.params.user.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      token.id + "-" + event.params.user.toHexString()
    );
    tokenPosition.token = token.id;
    tokenPosition.user = event.params.user.toHexString();
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.contentBalance = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.ownerRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  tokenPosition.contentBalance = tokenPosition.contentBalance.minus(
    convertTokenToDecimal(event.params.amount, BigInt.fromI32(6))
  );
  tokenPosition.save();
}

export function handleRewarder__RewardPaid(
  event: Rewarder__RewardPaidEvent
): void {
  let rewarder = Rewarder.load(event.address.toHexString())!;
  let tokenPosition = TokenPosition.load(
    rewarder.token + "-" + event.params.user.toHexString()
  );
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(
      rewarder.token + "-" + event.params.user.toHexString()
    );
    tokenPosition.token = rewarder.token;
    tokenPosition.user = event.params.user.toHexString();
    tokenPosition.contribution = ZERO_BD;
    tokenPosition.balance = ZERO_BD;
    tokenPosition.debt = ZERO_BD;
    tokenPosition.contentBalance = ZERO_BD;
    tokenPosition.creatorRevenueQuote = ZERO_BD;
    tokenPosition.ownerRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueQuote = ZERO_BD;
    tokenPosition.affiliateRevenueToken = ZERO_BD;
    tokenPosition.curatorRevenueQuote = ZERO_BD;
    tokenPosition.curatorRevenueToken = ZERO_BD;
  }
  if (event.params.rewardsToken.toHexString() == USDC_ADDRESS) {
    tokenPosition.curatorRevenueQuote = tokenPosition.curatorRevenueQuote.plus(
      convertTokenToDecimal(event.params.reward, BigInt.fromI32(6))
    );
  } else {
    tokenPosition.curatorRevenueToken = tokenPosition.curatorRevenueToken.plus(
      convertTokenToDecimal(event.params.reward, BigInt.fromI32(18))
    );
  }
  tokenPosition.save();
}
