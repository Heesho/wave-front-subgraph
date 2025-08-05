import {
  Sale__Contributed as Sale__ContributedEvent,
  Sale__MarketOpened as Sale__MarketOpenedEvent,
  Sale__Redeemed as Sale__RedeemedEvent,
} from "../generated/templates/Sale/Sale";
import { Directory, User, Token, TokenPosition } from "../generated/schema";
import { ZERO_BD, ZERO_BI } from "./constants";

export function handleSale__Contributed(event: Sale__ContributedEvent): void {}

export function handleSale__MarketOpened(
  event: Sale__MarketOpenedEvent
): void {}

export function handleSale__Redeemed(event: Sale__RedeemedEvent): void {}
