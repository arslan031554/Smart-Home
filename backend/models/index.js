import User from './User.js';
import BuildingType from './BuildingType.js';
import RoomType from './RoomType.js';
import SmartFunction from './SmartFunction.js';
import SmartFunctionRoomType from './SmartFunctionRoomType.js';
import BuildingTypeRoomType from './BuildingTypeRoomType.js';
import Project from './Project.js';
import ProjectLevel from './ProjectLevel.js';
import ProjectRoom from './ProjectRoom.js';
import RoomFunctionSelection from './RoomFunctionSelection.js';
import ProductRange from './ProductRange.js';
import Color from './Color.js';
import Product from './Product.js';
import ProductRangeProduct from './ProductRangeProduct.js';
import ProductColorProduct from './ProductColorProduct.js';
import ProductFunctionMapping from './ProductFunctionMapping.js';
import Service from './Service.js';
import DiscountRule from './DiscountRule.js';
import Offer from './Offer.js';
import OfferProduct from './OfferProduct.js';
import OfferService from './OfferService.js';
import OfferFile from './OfferFile.js';
import OfferFollowup from './OfferFollowup.js';
import ConfiguratorDraft from './ConfiguratorDraft.js';
import OfferCondition from './OfferCondition.js';
import Disclaimer from './Disclaimer.js';
import ServiceSmartFunction from './ServiceSmartFunction.js';
import FollowupTemplate from './FollowupTemplate.js';
import FollowupLog from './FollowupLog.js';
import NewsletterSubscriber from './NewsletterSubscriber.js';

const models = {
    User,
    BuildingType,
    RoomType,
    SmartFunction,
    SmartFunctionRoomType,
    BuildingTypeRoomType,
    Project,
    ProjectLevel,
    ProjectRoom,
    RoomFunctionSelection,
    ProductRange,
    Color,
    Product,
    ProductRangeProduct,
    ProductColorProduct,
    ProductFunctionMapping,
    Service,
    DiscountRule,
    Offer,
    OfferProduct,
    OfferService,
    OfferFile,
    OfferFollowup,
    ConfiguratorDraft,
    OfferCondition,
    Disclaimer,
    ServiceSmartFunction,
    FollowupTemplate,
    FollowupLog,
    NewsletterSubscriber
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});

export {
    User,
    BuildingType,
    RoomType,
    SmartFunction,
    SmartFunctionRoomType,
    BuildingTypeRoomType,
    Project,
    ProjectLevel,
    ProjectRoom,
    RoomFunctionSelection,
    ProductRange,
    Color,
    Product,
    ProductRangeProduct,
    ProductColorProduct,
    ProductFunctionMapping,
    Service,
    DiscountRule,
    Offer,
    OfferProduct,
    OfferService,
    OfferFile,
    OfferFollowup,
    ConfiguratorDraft,
    OfferCondition,
    Disclaimer,
    ServiceSmartFunction,
    FollowupTemplate,
    FollowupLog,
    NewsletterSubscriber
};

export default models;
