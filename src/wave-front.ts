import {
  OwnershipTransferred as OwnershipTransferredEvent,
  WaveFront__ContentFactorySet as WaveFront__ContentFactorySetEvent,
  WaveFront__RewarderFactorySet as WaveFront__RewarderFactorySetEvent,
  WaveFront__SaleFactorySet as WaveFront__SaleFactorySetEvent,
  WaveFront__TokenCreated as WaveFront__TokenCreatedEvent,
  WaveFront__TokenFactorySet as WaveFront__TokenFactorySetEvent,
  WaveFront__TreasurySet as WaveFront__TreasurySetEvent
} from "../generated/WaveFront/WaveFront"
import {
  OwnershipTransferred,
  WaveFront__ContentFactorySet,
  WaveFront__RewarderFactorySet,
  WaveFront__SaleFactorySet,
  WaveFront__TokenCreated,
  WaveFront__TokenFactorySet,
  WaveFront__TreasurySet
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__ContentFactorySet(
  event: WaveFront__ContentFactorySetEvent
): void {
  let entity = new WaveFront__ContentFactorySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newContentFactory = event.params.newContentFactory

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__RewarderFactorySet(
  event: WaveFront__RewarderFactorySetEvent
): void {
  let entity = new WaveFront__RewarderFactorySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRewarderFactory = event.params.newRewarderFactory

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__SaleFactorySet(
  event: WaveFront__SaleFactorySetEvent
): void {
  let entity = new WaveFront__SaleFactorySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newSaleFactory = event.params.newSaleFactory

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__TokenCreated(
  event: WaveFront__TokenCreatedEvent
): void {
  let entity = new WaveFront__TokenCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.index = event.params.index
  entity.token = event.params.token
  entity.sale = event.params.sale
  entity.content = event.params.content
  entity.rewarder = event.params.rewarder
  entity.name = event.params.name
  entity.symbol = event.params.symbol
  entity.uri = event.params.uri

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__TokenFactorySet(
  event: WaveFront__TokenFactorySetEvent
): void {
  let entity = new WaveFront__TokenFactorySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newTokenFactory = event.params.newTokenFactory

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWaveFront__TreasurySet(
  event: WaveFront__TreasurySetEvent
): void {
  let entity = new WaveFront__TreasurySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newTreasury = event.params.newTreasury

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
