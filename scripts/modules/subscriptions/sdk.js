define([], function () {
    var subscriptionConfiguration = {
        "get": {
            "template": "{+subscriptionService}{id}{?responseFields}",
            "shortcutParam": "id",
            "includeSelf": true
        },
        "update": {
            "template": "{+subscriptionService}{id}",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        },
        "skip": {
            "template": "{+subscriptionService}{id}/skip",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        },
        "order-now": {
            "template": "{+subscriptionService}{id}/ordernow",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT",
            "returnType": "subscription"
        },
        "update-next-order-date": {
            "template": "{+subscriptionService}{id}/nextorderdate",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT",
            "returnType": "subscription"
        },
        "update-frequency": {
            "template": "{+subscriptionService}{id}/frequency",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT",
            "returnType": "subscription"
        },
        "update-item-quantity": {
            "template": "{+subscriptionService}{id}/items/{itemId}/quantity/{quantity}",
            "includeSelf": true,
            "verb": "PUT",
            "returnType": "subscription"
        },
        "get-shipping-methods": {
            "template": "{+subscriptionService}{id}/shipments/methods",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "GET"
        },
        "perform-action": {
            "template": "{+subscriptionService}{id}/actions",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        },
        "update-payment": {
            "template": "{+subscriptionService}{id}/payment",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        }
    };
    var subscriptionsConfiguration = {
        "get": {
            "template": "{+subscriptionService}{?startIndex,pageSize,filter,responseFields}",
            "collectionOf": "subscription",
            "verb": "GET",
            "defaultParams": {
                "startIndex": 0,
                "pageSize": 5
            }
        }
    };

    var subscriptionFunctions = function () {
        return {
            updateItemQuantity: function (conf) {
                var itemId = conf.itemId, quantity = conf.quantity;
                var self = this;

                return self.api.action('subscription', 'update-item-quantity', { id: self.data.id, itemId: itemId, quantity: quantity })
                    .then(function (data) {
                        return data;
                    });
            },
            orderNow: function () {
                var self = this;
                var today = new Date().toISOString();
                return self.api.action('subscription', 'order-now', { id: self.data.id }, {
                    nextOrderDate: today
                }).then(function(res){
                    return res.data;
                });
            }
        };
    };

    var configure = function (api) {
        this.ApiReference.methods.subscription = subscriptionConfiguration;
        this.ApiReference.methods.subscriptions = subscriptionsConfiguration;
        this.ApiObject.types.subscription = subscriptionFunctions(api);
    };

    var getActions = function (config) {
        return Object.keys(config).map(function(key) {
            var keyArr = key.split('-');
            if (keyArr.length === 1) {
                return key;
            } else {
                return keyArr.map(function (keyItem, i) {
                    if (i > 0) {
                        return keyItem.charAt(0).toUpperCase() + keyItem.substring(1);
                    } else {
                        return keyItem;
                    }
                }).join('');
            }
        });
    };

    var getSubscriptionActions = function () {
        return getActions(subscriptionConfiguration);
    };
    var getSubscriptionsActions = function () {
        return getActions(subscriptionsConfiguration);
    };

    return {
        configure: configure,
        getSubscriptionActions: getSubscriptionActions,
        getSubscriptionsActions: getSubscriptionsActions
    };
});