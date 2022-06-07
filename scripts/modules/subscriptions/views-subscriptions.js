define(['modules/jquery-mozu', 'modules/backbone-mozu', 'modules/editable-view'], function($, Backbone, EditableView) {
    var SubscriptionsView = Backbone.MozuView.extend({
        templateName: "modules/my-account/subscriptions/myaccount-subscriptions",
        additionalEvents: { 
            "click [data-mz-subscription]": "showDetail",
            "focus .focusWrap": "shiftFocus",
            "focus .focusWrapSubscription": "shiftFocusSubscription"
            
        },
        initialize: function() {
            this.account = window.accountModel || window.accountViews.settings.model;
        },
        render: function() {
            var self = this;
            self.subscriptionViews = [];
            Backbone.MozuView.prototype.render.apply(this, arguments);
            $.each(this.$el.find('.subscription-listing'), function(index, val) {
                var subscriptionId = $(this).data('subscriptionId');
                var subscription = self.model.get('items').get(subscriptionId);
                var subscriptionView = new SubscriptionView({
                    el: $(this),
                    model: subscription
                });
                subscriptionView.render();
                self.subscriptionViews.push(subscriptionView);
            });
        }
    });

    var SubscriptionView = EditableView.extend({
        templateName: 'modules/my-account/subscriptions/detail',
        initialize: function() {
            var self = this;
            this.listenTo(this.model, 'change', this.render, this);
        },
        constructor: function() {
            EditableView.apply(this, arguments);
            this.editing = false;
            this.invalidFields = {};
        },
        edit: function() {
            this.editing = true;
            this.render();
        },
        cancelEdit: function() {
            this.editing = false;
            this.render();
        },
        save: function() {
            var inputs = $('[subscription-input]');
            // console.log(inputs);
            var propsToUpdate = {};
            inputs.each(function(i, input) {
                var el = $(input)[0];
                var oldValue = el.dataset.oldValue;
                var newValue = el.value;

                switch(el.type) {
                    case 'date':
                        var date = new Date(newValue).toISOString();
                        propsToUpdate[el.dataset.mzValue] = date;
                        break;
                    default:
                        propsToUpdate[el.dataset.mzValue] = newValue;

                }


            });

            this.model.saveChanges(propsToUpdate);
            this.editing = false;
            this.render();
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
        },
        skip: function() {
            this.model.skip();
        },
        orderNow: function() {
            this.model.orderNow();
        },
        pause: function() {
            this.model.pause({
                reasonCode: "FoundBetterPrice",
                description: "Found Better Price",
                needsMoreInfo: false
            });
        },
        cancel: function() {
            this.model.cancel({
                reasonCode: "FoundBetterPrice",
                description: "Found Better Price",
                needsMoreInfo: false
            });
        },
        activate: function() {
            this.model.activate();
        }
    });

    return {
        SubscriptionsView: SubscriptionsView,
        SubscriptionView: SubscriptionView
    };
});