import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  WaveFront__ContentFactorySet,
  WaveFront__RewarderFactorySet,
  WaveFront__SaleFactorySet,
  WaveFront__TokenCreated,
  WaveFront__TokenFactorySet,
  WaveFront__TreasurySet
} from "../generated/WaveFront/WaveFront"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createWaveFront__ContentFactorySetEvent(
  newContentFactory: Address
): WaveFront__ContentFactorySet {
  let waveFrontContentFactorySetEvent =
    changetype<WaveFront__ContentFactorySet>(newMockEvent())

  waveFrontContentFactorySetEvent.parameters = new Array()

  waveFrontContentFactorySetEvent.parameters.push(
    new ethereum.EventParam(
      "newContentFactory",
      ethereum.Value.fromAddress(newContentFactory)
    )
  )

  return waveFrontContentFactorySetEvent
}

export function createWaveFront__RewarderFactorySetEvent(
  newRewarderFactory: Address
): WaveFront__RewarderFactorySet {
  let waveFrontRewarderFactorySetEvent =
    changetype<WaveFront__RewarderFactorySet>(newMockEvent())

  waveFrontRewarderFactorySetEvent.parameters = new Array()

  waveFrontRewarderFactorySetEvent.parameters.push(
    new ethereum.EventParam(
      "newRewarderFactory",
      ethereum.Value.fromAddress(newRewarderFactory)
    )
  )

  return waveFrontRewarderFactorySetEvent
}

export function createWaveFront__SaleFactorySetEvent(
  newSaleFactory: Address
): WaveFront__SaleFactorySet {
  let waveFrontSaleFactorySetEvent =
    changetype<WaveFront__SaleFactorySet>(newMockEvent())

  waveFrontSaleFactorySetEvent.parameters = new Array()

  waveFrontSaleFactorySetEvent.parameters.push(
    new ethereum.EventParam(
      "newSaleFactory",
      ethereum.Value.fromAddress(newSaleFactory)
    )
  )

  return waveFrontSaleFactorySetEvent
}

export function createWaveFront__TokenCreatedEvent(
  index: BigInt,
  token: Address,
  sale: Address,
  content: Address,
  rewarder: Address,
  name: string,
  symbol: string,
  uri: string
): WaveFront__TokenCreated {
  let waveFrontTokenCreatedEvent =
    changetype<WaveFront__TokenCreated>(newMockEvent())

  waveFrontTokenCreatedEvent.parameters = new Array()

  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("sale", ethereum.Value.fromAddress(sale))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("content", ethereum.Value.fromAddress(content))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("rewarder", ethereum.Value.fromAddress(rewarder))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  )
  waveFrontTokenCreatedEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )

  return waveFrontTokenCreatedEvent
}

export function createWaveFront__TokenFactorySetEvent(
  newTokenFactory: Address
): WaveFront__TokenFactorySet {
  let waveFrontTokenFactorySetEvent =
    changetype<WaveFront__TokenFactorySet>(newMockEvent())

  waveFrontTokenFactorySetEvent.parameters = new Array()

  waveFrontTokenFactorySetEvent.parameters.push(
    new ethereum.EventParam(
      "newTokenFactory",
      ethereum.Value.fromAddress(newTokenFactory)
    )
  )

  return waveFrontTokenFactorySetEvent
}

export function createWaveFront__TreasurySetEvent(
  newTreasury: Address
): WaveFront__TreasurySet {
  let waveFrontTreasurySetEvent =
    changetype<WaveFront__TreasurySet>(newMockEvent())

  waveFrontTreasurySetEvent.parameters = new Array()

  waveFrontTreasurySetEvent.parameters.push(
    new ethereum.EventParam(
      "newTreasury",
      ethereum.Value.fromAddress(newTreasury)
    )
  )

  return waveFrontTreasurySetEvent
}
