define(['modules/backbone-mozu', 'underscore', 'modules/api', 'hyprlive', 'modules/models-orders'], function(Backbone, _, api, Hypr, OrderModels) {

    var Subscription = Backbone.MozuModel.extend({
        mozuType: 'subscription',
        idAttribute: 'id',
        relations: {
            items: OrderModels.OrderItemsList
        },
        skip: function() {
            this.apiSkip();
        },
        orderNow: function() {
            var self = this;
            this.apiOrderNow().then(function(res) {
                self.set('nextOrderDate', res.nextOrderDate);
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