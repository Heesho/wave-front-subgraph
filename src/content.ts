import { BigInt, BigDecimal } from "@graphprotocol/graph-ts/index";
import {
  Content__Created as Content__CreatedEvent,
  Content__Curated as Content__CuratedEvent,
  Content__CoverUriSet as Content__CoverUriSetEvent,
  Content__Approved as Content__ApprovedEvent,
  Content__IsModeratedSet as Content__IsModeratedSetEvent,
  Content__ModeratorsSet as Content__ModeratorsSetEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/templates/Content/Content";
import {
  User,
  Directory,
  Token,
  Content,
  ContentPosition,
  TokenPosition,
  Moderator,
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
  CORE_ADDRESS,
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

  let directory = Directory.load(CORE_ADDRESS)!;
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
  contentPosition.curationCount = ZERO_BI;
  if (token.isModerated) {
    contentPosition.isApproved = false;
  } else {
    contentPosition.isApproved = true;
  }
  contentPosition.save();

  let tokenPosition = TokenPosition.load(token.id + "-" + userTo.id);
  if (tokenPosition == null) {
    tokenPosition = new TokenPosition(token.id + "-" + userTo.id);
    tokenPosition.token = token.id;
    tokenPosition.user = userTo.id;
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
  tokenPosition.contentCreated = tokenPosition.contentCreated.plus(ONE_BI);
  tokenPosition.save();
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

  let directory = Directory.load(CORE_ADDRESS)!;
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
  contentPosition.curationCount = contentPosition.curationCount.plus(ONE_BI);
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
    creatorTokenPosition.balance = ZERO_BD;
    creatorTokenPosition.debt = ZERO_BD;

    creatorTokenPosition.contentCreated = ZERO_BI;
    creatorTokenPosition.createdCurations = ZERO_BI;
    creatorTokenPosition.createdValue = ZERO_BD;

    creatorTokenPosition.contentOwned = ZERO_BI;
    creatorTokenPosition.contentBalance = ZERO_BD;
    creatorTokenPosition.curationSpend = ZERO_BD;

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
  creatorTokenPosition.createdCurations =
    creatorTokenPosition.createdCurations.plus(ONE_BI);
  creatorTokenPosition.createdValue =
    creatorTokenPosition.createdValue.plus(surplus);
  creatorTokenPosition.save();

  let prevOwnerTokenPosition = TokenPosition.load(
    contentPosition.token + "-" + prevOwner
  );
  if (prevOwnerTokenPosition == null) {
    prevOwnerTokenPosition = new TokenPosition(
      contentPosition.token + "-" + prevOwner
    );
    prevOwnerTokenPosition.token = content.token;
    prevOwnerTokenPosition.user = prevOwner;
    prevOwnerTokenPosition.balance = ZERO_BD;
    prevOwnerTokenPosition.debt = ZERO_BD;

    prevOwnerTokenPosition.contentCreated = ZERO_BI;
    prevOwnerTokenPosition.createdCurations = ZERO_BI;
    prevOwnerTokenPosition.createdValue = ZERO_BD;

    prevOwnerTokenPosition.contentOwned = ZERO_BI;
    prevOwnerTokenPosition.contentBalance = ZERO_BD;
    prevOwnerTokenPosition.curationSpend = ZERO_BD;

    prevOwnerTokenPosition.creatorRevenueQuote = ZERO_BD;
    prevOwnerTokenPosition.ownerRevenueQuote = ZERO_BD;

    prevOwnerTokenPosition.affiliateRevenueQuote = ZERO_BD;
    prevOwnerTokenPosition.affiliateRevenueToken = ZERO_BD;

    prevOwnerTokenPosition.curatorRevenueQuote = ZERO_BD;
    prevOwnerTokenPosition.curatorRevenueToken = ZERO_BD;
  }
  prevOwnerTokenPosition.ownerRevenueQuote =
    prevOwnerTokenPosition.ownerRevenueQuote
      .plus(prevPrice)
      .plus(surplus.div(BigDecimal.fromString("3")));
  prevOwnerTokenPosition.save();

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
  curate.tokenId = event.params.tokenId;
  curate.uri = contentPosition.uri;
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

export function handleContent__Approved(event: Content__ApprovedEvent): void {
  let content = Content.load(event.address.toHexString())!;
  let contentPosition = ContentPosition.load(
    content.token + "-" + event.params.tokenId.toString()
  )!;
  contentPosition.isApproved = true;
  contentPosition.save();
}

export function handleContent__IsModeratedSet(
  event: Content__IsModeratedSetEvent
): void {
  let content = Content.load(event.address.toHexString())!;
  let token = Token.load(content.token)!;
  token.isModerated = event.params.isModerated;
  token.save();
}

export function handleContent__ModeratorsSet(
  event: Content__ModeratorsSetEvent
): void {
  let user = User.load(event.params.account.toHexString());
  if (user == null) {
    user = new User(event.params.account.toHexString());
    user.txCount = ZERO_BI;
    user.referrer = ADDRESS_ZERO;
    user.save();
  }

  let content = Content.load(event.address.toHexString())!;
  let moderator = Moderator.load(
    content.token + "-" + event.params.account.toHexString()
  )!;
  if (moderator == null) {
    moderator = new Moderator(
      content.token + "-" + event.params.account.toHexString()
    );
    moderator.user = event.params.account.toString();
    moderator.token = content.token;
  }
  moderator.isModerator = event.params.isModerator;
  moderator.save();
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
