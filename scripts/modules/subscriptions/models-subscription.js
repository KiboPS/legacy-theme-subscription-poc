define(['modules/backbone-mozu', 'underscore', 'modules/api', 'hyprlive', 'modules/models-orders'], function (Backbone, _, api, Hypr, OrderModels) {

    var Subscription = Backbone.MozuModel.extend({
        mozuType: 'subscription',
        idAttribute: 'id',
        relations: {
            items: OrderModels.OrderItemsList
        },
        saveChanges: function(props) {
            var self = this;
            console.log(props);
            this.set(props);
            this.apiUpdate().then(function(res) {
                self.set(res);
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
            console.log('pause');
            this.apiPerformAction(
                {
                    actionName: 'Pause',
                    reason: reason
                }
            ).then(function(res) {
                this.set(res);
            });
        },
        cancel: function (reason) {
            console.log('cancel');
            this.apiPerformAction(
                {
                    actionName: 'Cancel',
                    reason: reason
                }
            ).then(function(res) {
                this.set(res);
            });
        },
        activate: function () {
            console.log('activate');
            this.apiPerformAction(
                {
                    actionName: 'Activate',
                    reason: {
                        reasonCode: "FoundBetterPrice",
                        description: "Found Better Price",
                        needsMoreInfo: false
                    }
                }
            ).then(function(res) {
                this.set(res);
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