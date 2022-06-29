define([], function () {
    // these are the functions that the storefront sdk should be capable of making for a single subscription
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
            "includeSelf": true,
            "verb": "PUT"
        },
        "update-payment": {
            "template": "{+subscriptionService}{id}/payment",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        },
        "update-fulfillment-info": {
            "template": "{+subscriptionService}{id}/fulfillmentinfo",
            "shortcutParam": "id",
            "includeSelf": true,
            "verb": "PUT"
        },
        "add-item": {
            "template": "{+subscriptionService}{id}/items",
            "verb": "POST",
            "shortcutParam": "id"
        }
    };

    // this is the list of api functions that the storefront sdk should be able to make for a subscription collection
    var subscriptionsConfiguration = {
        "get": {
            "template": "{+subscriptionService}{?startIndex,pageSize,filter,responseFields}",
            "collectionOf": "subscription",
            "verb": "GET",
            "defaultParams": {
                "startIndex": 0,
                "pageSize": 5
            }
        },
        "get-reasons": {
            "template": "{+subscriptionService}reasons",
            "verb": "GET"
        }
    };

    // these functions will override the default functions provided by the subscription storefront sdk.
    // They can provide default parameters and enforce validation on payloads.
    // inside each, "this" will refer to the subscription object invoking the call.  
    // "this.data" will be the raw json version of the subscription if you need to get properties from them.
    var subscriptionFunctions = {
        updateItemQuantity: function (conf) {
            var itemId = conf.itemId,
                quantity = conf.quantity,
                oldQuantity = conf.oldQuantity;
            var self = this;

            var config = {
                id: self.data.id,
                itemId: itemId,
                quantity: quantity
            };

            if(quantity < oldQuantity) {
                // config.reason = {
                    config.reasonCode = "FoundBetterPrice",
                    config.description = "Found Better Price",
                    config.needsMoreInfo = false
                // };
            }

            return self.api.action('subscription', 'update-item-quantity', config)
                .then(function (data) {
                    return data;
                });
        },
        orderNow: function () {
            var self = this;
            var today = new Date().toISOString();
            return self.api.action('subscription', 'order-now', {
                id: self.data.id
            }, {
                nextOrderDate: today
            }).then(function (res) {
                return res.data;
            });
        },
        performAction: function (conf) {
            console.log(conf);
            var self = this;
            return self.api.action('subscription', 'perform-action', {
                id: self.data.id,
                actionName: conf.actionName,
                reason: conf.reason

            });
        },
        addItem: function(payload) {
            var self = this;
            return self.api.action('subscription', 'add-item', {
                id: self.data.id,
                product: payload.product,
                quantity: payload.quantity,
                fulfillmentMethod: payload.fulfillmentMethod
            });
        }
    };

    // adds required properties to the sdk object for use on the page.
    var configure = function () {
        console.log(this);
        // "this" refers to the sdk object exported by sdk-min.js or sdk-debug.js
        this.ApiReference.methods.subscription = subscriptionConfiguration;
        this.ApiReference.methods.subscriptions = subscriptionsConfiguration;
        this.ApiObject.types.subscription = subscriptionFunctions;
    };

    // transforms a list of function names like "order-now" into a list of function names like "orderNow".
    var getActions = function (config) {
        return Object.keys(config).map(function (key) {
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