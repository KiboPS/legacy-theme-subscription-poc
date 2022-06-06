define(['modules/backbone-mozu', 'underscore', 'modules/api', 'hyprlive', 'modules/models-orders'], function(Backbone, _, api, Hypr, OrderModels) {

    var Subscription = Backbone.MozuModel.extend({
        mozuType: 'subscription',
        idAttribute: 'id',
        relations: {
            items: OrderModels.OrderItemsList
        },
        // initialize: function() {
        //     // _.extend(this, Backbone.Events);
        //     // this.setUrls();
        //     // this.set('accountModel', window.accountModel.toJSON());
        //     // this.setDate();
        //     // this.initializeAddresses();
        // },
        skip: function() {
            this.apiSkip();
        },
        orderNow: function() {
            this.apiOrderNow();
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