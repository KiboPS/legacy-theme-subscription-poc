define(['modules/backbone-mozu', 'underscore', 'modules/api', 'hyprlive', 'modules/models-orders'], function (Backbone, _, api, Hypr, OrderModels) {

    var SubscriptionItem = OrderModels.OrderItem.extend({
        idAttribute: 'id'
    });

    var Subscription = Backbone.MozuModel.extend({
        mozuType: 'subscription',
        idAttribute: 'id',
        relations: {
            items: Backbone.Collection.extend({
                model: SubscriptionItem
            })
        },
        initialize: function () {
            var self = this;
            self.configureValidFrequencies();
        },
        configureValidFrequencies: function () {
            var self = this;
            var items = self.get('items');
            var validFrequencyValues = [];
            var validFrequencyUnits = [];

            items.forEach(function (item) {
                var itemFrequencies = item.get('product').get('properties').find(function (prop) {
                    return prop.attributeFQN === 'system~subscription-frequency';
                });
                itemFrequencies.values.forEach(function (value) {
                    validFrequencyUnits.push(value.value.charAt(0) === 'W' ? 'Week' : 'Day');
                    validFrequencyValues.push(value.value.substring(1));
                });
            });

            self.set('validFrequencyUnits', Array.from(new Set(validFrequencyUnits)));
            self.set('validFrequencyValues', Array.from(new Set(validFrequencyValues)));
        },
        updateNextOrderDate: function (props) {
            var self = this;
            this.set(props);
            return this.apiUpdateNextOrderDate({ nextOrderDate: props.nextOrderDate }).then(function (res) {
                self.apiGet();
            });
        },
        updateFrequency: function (frequency) {
            var self = this;
            this.set('frequency', frequency);
            return this.apiUpdateFrequency(frequency).then(function (res) {
                self.apiGet();
            });
        },
        skip: function () {
            this.apiSkip();
        },
        orderNow: function () {
            var self = this;
            this.apiOrderNow().then(function (res) {
                self.set('nextOrderDate', res.nextOrderDate);
            });
        },
        pause: function (reason) {
            var self = this;
            this.apiPerformAction(
                {
                    actionName: 'Pause',
                    reason: reason
                }
            ).then(function (res) {
                self.apiGet();
            });
        },
        cancel: function (reason) {
            var self = this;
            this.apiPerformAction(
                {
                    actionName: 'Cancel',
                    reason: reason
                }
            ).then(function (res) {
                self.apiGet();
            });
        },
        activate: function () {
            var self = this;
            var payment = self.get('payment');
            delete payment.billingInfo.purchaseOrder;
            delete payment.billingInfo.check;
            this.apiPerformAction(
                {
                    actionName: 'Activate',
                    reason: {
                        reasonCode: "FoundBetterPrice",
                        description: "Found Better Price",
                        needsMoreInfo: false
                    }
                }
            ).then(function (res) {
                self.apiGet();
            });
        },
        updateQuantity: function (newQuantity, itemId) {
            var self = this;
            var conf = {
                quantity: newQuantity,
                itemId: itemId,
                id: self.get('id'),
                oldQuantity: self.get('items').get(itemId).get('quantity')
            };

            self.apiUpdateItemQuantity(conf).then(function (res) {
                self.apiGet();
            });
            

        },
        addItem: function (product, quantity) {
            var self = this;
            var payload = {
                product: {
                    productCode: product,
                    options: [{
                        attributeFQN: "Tenant~one-shot-price-extra",
                        dataType: "Bool",
                        name: "One Shot Price Extra",
                        shopperEnteredValue: ""
                    }]
                },
                quantity: quantity || 1,
                fulfillmentMethod: 'Ship'
            };

            self.apiAddItem(payload).then(function (res) {
                self.apiGet();
            });
        },
        updateFulfillmentInfo: function (payload) {
            var self = this;
            this.apiUpdateFulfillmentInfo(payload).then(function (res) {
                self.apiGet();
            });
        },
        updatePayment: function (card, address) {
            var self = this;
            var payment = self.get('payment');
            card.contactId = address.id;
            payment.billingInfo.billingContact = address;
            payment.billingInfo.card = card;
            delete payment.id;
            delete payment.billingInfo.purchaseOrder;
            delete payment.billingInfo.check;
            self.apiUpdatePayment(payment).then(function (res) {
                self.apiGet();
            });
        }
    });

    var SubscriptionCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'subscriptions',
        defaults: {
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: Subscription
            })
        }
    });

    return {
        Subscription: Subscription,
        SubscriptionCollection: SubscriptionCollection
    };
});