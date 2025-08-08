import { BigInt, BigDecimal } from "@graphprotocol/graph-ts/index";
import {
  Content__Created as Content__CreatedEvent,
  Content__Curated as Content__CuratedEvent,
  Content__CoverUriSet as Content__CoverUriSetEvent,
  Content__IsPrivateSet as Content__IsPrivateSetEvent,
  Content__CreatorsSet as Content__CreatorsSetEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/templates/Content/Content";
import {
  User,
  Directory,
  Token,
  Content,
  ContentPosition,
  TokenPosition,
  Creator,
  Curate,
  ContentDayData,
  ContentHourData,
  ContentMinuteData,
} from "../generated/schema";
import {
  ZERO_BI,
  ADDRESS_ZERO,
  ZERO_BD,
  ONE_BD,
  ONE_BI,
  WAVEFRONT_ADDRESS,
} from "./constants";
import { convertTokenToDecimal } from "./helpers";

export function handleContent__Created(event: Content__CreatedEvent): void {
  let userWho = User.load(event.params.who.toHex());
  if (!userWho) {
    userWho = new User(event.params.who.toHex());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.txCount = userWho.txCount.plus(ONE_BI);
  userWho.save();

  let userTo = User.load(event.params.to.toHex());
  if (!userTo) {
    userTo = new User(event.params.to.toHex());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
    userTo.save();
  }

  let directory = Directory.load(WAVEFRONT_ADDRESS)!;
  directory.contents = directory.contents.plus(ONE_BI);
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.save();

  let content = Content.load(event.address.toHexString())!;
  let token = Token.load(content.token)!;
  token.contents = token.contents.plus(ONE_BI);
  token.txCount = token.txCount.plus(ONE_BI);
  token.save();

  let contentPosition = new ContentPosition(
    content.token + "-" + event.params.tokenId.toString()
  );
  contentPosition.token = content.token;
  contentPosition.creator = userTo.id;
  contentPosition.owner = userTo.id;
  contentPosition.tokenId = event.params.tokenId;
  contentPosition.uri = event.params.uri;
  contentPosition.price = ZERO_BD;
  contentPosition.nextPrice = ONE_BD;
  contentPosition.save();
}

export function handleContent__Curated(event: Content__CuratedEvent): void {
  let userWho = User.load(event.params.who.toHex());
  if (!userWho) {
    userWho = new User(event.params.who.toHex());
    userWho.txCount = ZERO_BI;
    userWho.referrer = ADDRESS_ZERO;
  }
  userWho.txCount = userWho.txCount.plus(ONE_BI);
  userWho.save();

  let userTo = User.load(event.params.to.toHex());
  if (!userTo) {
    userTo = new User(event.params.to.toHex());
    userTo.txCount = ZERO_BI;
    userTo.referrer = ADDRESS_ZERO;
    userTo.save();
  }

  let directory = Directory.load(WAVEFRONT_ADDRESS)!;
  directory.curateVolume = directory.curateVolume.plus(
    convertTokenToDecimal(event.params.price, BigInt.fromI32(6))
  );
  directory.txCount = directory.txCount.plus(ONE_BI);
  directory.save();

  let content = Content.load(event.address.toHexString())!;
  let token = Token.load(content.token)!;
  token.curateVolume = token.curateVolume.plus(
    convertTokenToDecimal(event.params.price, BigInt.fromI32(6))
  );
  token.txCount = token.txCount.plus(ONE_BI);

  let contentPosition = ContentPosition.load(
    content.token + "-" + event.params.tokenId.toString()
  )!;
  let prevOwner = contentPosition.owner;
  let prevPrice = contentPosition.price;
  contentPosition.owner = userTo.id;
  contentPosition.price = convertTokenToDecimal(
    event.params.price,
    BigInt.fromI32(6)
  );
  contentPosition.nextPrice = contentPosition.price
    .times(BigDecimal.fromString("1.1"))
    .plus(BigDecimal.fromString("1"));
  contentPosition.save();

  let surplus = contentPosition.price.minus(prevPrice);
  let creatorTokenPosition = TokenPosition.load(
    contentPosition.token + "-" + contentPosition.creator
  );
  if (creatorTokenPosition == null) {
    creatorTokenPosition = new TokenPosition(
      contentPosition.token + "-" + contentPosition.creator
    );
    creatorTokenPosition.token = content.token;
    creatorTokenPosition.user = contentPosition.creator;
    creatorTokenPosition.contribution = ZERO_BD;
    creatorTokenPosition.balance = ZERO_BD;
    creatorTokenPosition.debt = ZERO_BD;
    creatorTokenPosition.contentBalance = ZERO_BD;
    creatorTokenPosition.creatorRevenueQuote = ZERO_BD;
    creatorTokenPosition.ownerRevenueQuote = ZERO_BD;
    creatorTokenPosition.affiliateRevenueQuote = ZERO_BD;
    creatorTokenPosition.affiliateRevenueToken = ZERO_BD;
    creatorTokenPosition.curatorRevenueQuote = ZERO_BD;
    creatorTokenPosition.curatorRevenueToken = ZERO_BD;
  }
  creatorTokenPosition.creatorRevenueQuote =
    creatorTokenPosition.creatorRevenueQuote.plus(
      surplus.div(BigDecimal.fromString("3"))
    );
  creatorTokenPosition.save();

  let ownerTokenPosition = TokenPosition.load(
    contentPosition.token + "-" + prevOwner
  );
  if (ownerTokenPosition == null) {
    ownerTokenPosition = new TokenPosition(
      contentPosition.token + "-" + prevOwner
    );
    ownerTokenPosition.token = content.token;
    ownerTokenPosition.user = prevOwner;
    ownerTokenPosition.contribution = ZERO_BD;
    ownerTokenPosition.balance = ZERO_BD;
    ownerTokenPosition.debt = ZERO_BD;
    ownerTokenPosition.contentBalance = ZERO_BD;
    ownerTokenPosition.creatorRevenueQuote = ZERO_BD;
    ownerTokenPosition.ownerRevenueQuote = ZERO_BD;
    ownerTokenPosition.affiliateRevenueQuote = ZERO_BD;
    ownerTokenPosition.affiliateRevenueToken = ZERO_BD;
    ownerTokenPosition.curatorRevenueQuote = ZERO_BD;
    ownerTokenPosition.curatorRevenueToken = ZERO_BD;
  }
  ownerTokenPosition.ownerRevenueQuote =
    ownerTokenPosition.ownerRevenueQuote.plus(
      surplus.div(BigDecimal.fromString("3"))
    );
  ownerTokenPosition.save();

  token.creatorRewardsQuote = token.creatorRewardsQuote.plus(
    surplus.div(BigDecimal.fromString("3"))
  );
  token.curatorRewardsQuote = token.curatorRewardsQuote.plus(
    surplus.div(BigDecimal.fromString("3"))
  );
  token.holderRewardsQuote = token.holderRewardsQuote.plus(
    surplus.div(BigDecimal.fromString("3"))
  );
  token.save();

  let curate = new Curate(event.transaction.hash.toHexString());
  curate.token = content.token;
  curate.creator = contentPosition.creator;
  curate.prevOwner = prevOwner;
  curate.user = userTo.id;
  curate.blockNumber = event.block.number;
  curate.timestamp = event.block.timestamp;
  curate.price = contentPosition.price;
  curate.surplus = surplus;
  curate.save();

  let timestamp = event.block.timestamp.toI32();

  let dayIndex = timestamp / 86400;
  let dayStartTimestamp = dayIndex * 86400;
  let dayContentId = token.id + "-" + dayIndex.toString();
  let dayContent = ContentDayData.load(dayContentId);
  if (dayContent == null) {
    dayContent = new ContentDayData(dayContentId);
    dayContent.token = token.id;
    dayContent.timestamp = BigInt.fromI32(dayStartTimestamp);
    dayContent.volume = ZERO_BD;
    dayContent.surplus = ZERO_BD;
  }
  dayContent.volume = dayContent.volume.plus(curate.price);
  dayContent.surplus = dayContent.surplus.plus(surplus);
  dayContent.save();

  let hourIndex = timestamp / 3600;
  let hourStartTimestamp = hourIndex * 3600;
  let hourContentId = token.id + "-" + hourIndex.toString();
  let hourContent = ContentHourData.load(hourContentId);
  if (hourContent == null) {
    hourContent = new ContentHourData(hourContentId);
    hourContent.token = token.id;
    hourContent.timestamp = BigInt.fromI32(hourStartTimestamp);
    hourContent.volume = ZERO_BD;
    hourContent.surplus = ZERO_BD;
  }
  hourContent.volume = hourContent.volume.plus(curate.price);
  hourContent.surplus = hourContent.surplus.plus(surplus);
  hourContent.save();

  let minuteIndex = timestamp / 60;
  let minuteStartTimestamp = minuteIndex * 60;
  let minuteContentId = token.id + "-" + minuteIndex.toString();
  let minuteContent = ContentMinuteData.load(minuteContentId);
  if (minuteContent == null) {
    minuteContent = new ContentMinuteData(minuteContentId);
    minuteContent.token = token.id;
    minuteContent.timestamp = BigInt.fromI32(minuteStartTimestamp);
    minuteContent.volume = ZERO_BD;
    minuteContent.surplus = ZERO_BD;
  }
  minuteContent.volume = minuteContent.volume.plus(curate.price);
  minuteContent.surplus = minuteContent.surplus.plus(surplus);
  minuteContent.save();
}

export function handleContent__CoverUriSet(
  event: Content__CoverUriSetEvent
): void {
  let content = Content.load(event.address.toHexString())!;
  let token = Token.load(content.token)!;
  token.uri = event.params.coverUri;
  token.save();
}

export function handleContent__IsPrivateSet(
  event: Content__IsPrivateSetEvent
): void {
  let content = Content.load(event.address.toHexString())!;
  let token = Token.load(content.token)!;
  token.isPrivate = event.params.isPrivate;
  token.save();
}

export function handleContent__CreatorsSet(
  event: Content__CreatorsSetEvent
): void {
  let user = User.load(event.params.account.toHexString());
  if (user == null) {
    user = new User(event.params.account.toHexString());
    user.txCount = ZERO_BI;
    user.referrer = ADDRESS_ZERO;
    user.save();
  }

  let content = Content.load(event.address.toHexString())!;
  let creator = Creator.load(
    content.token + "-" + event.params.account.toHexString()
  )!;
  if (creator == null) {
    creator = new Creator(
      content.token + "-" + event.params.account.toHexString()
    );
    creator.user = event.params.account.toString();
    creator.token = content.token;
  }
  creator.isCreator = event.params.isCreator;
  creator.save();
}

export function handleContent__OwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let content = Content.load(event.address.toHexString());
  if (content != null) {
    let token = Token.load(content.token)!;

    let newOwner = User.load(event.params.newOwner.toHex());
    if (newOwner == null) {
      newOwner = new User(event.params.newOwner.toHex());
      newOwner.txCount = ZERO_BI;
      newOwner.referrer = ADDRESS_ZERO;
      newOwner.save();
    }

    token.owner = newOwner.id;
    token.save();
  }
}
