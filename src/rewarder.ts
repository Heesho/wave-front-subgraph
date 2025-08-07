import {
  Rewarder__Deposited as Rewarder__DepositedEvent,
  Rewarder__Withdrawn as Rewarder__WithdrawnEvent,
  Rewarder__RewardPaid as Rewarder__RewardPaidEvent,
} from "../generated/templates/Rewarder/Rewarder";

export function handleRewarder__Deposited(
  event: Rewarder__DepositedEvent
): void {}

export function handleRewarder__Withdrawn(
  event: Rewarder__WithdrawnEvent
): void {}

export function handleRewarder__RewardPaid(
  event: Rewarder__RewardPaidEvent
): void {}
