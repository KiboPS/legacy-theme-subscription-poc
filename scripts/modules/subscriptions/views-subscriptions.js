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
            this.editing = {};
            this.invalidFields = {};
        },
        editNextOrderDate: function() {
            this.editing.nextOrderDate = true;
            this.render();
        },
        cancelEditNextOrderDate: function() {
            this.editing.nextOrderDate = false;
            this.render();
        },
        editFrequency: function() {
            this.editing.frequency = true;
            this.render();
        },
        cancelEditFrequency: function() {
            this.editing.frequency = false;
            this.render();
        },
        updateNextOrderDate: function(e) {
            e.preventDefault();
            var self = this;
            var inputs = $('input#subscription-nextorderdate-' + self.model.get('id'));
            var propsToUpdate = {};
            inputs.each(function(i, input) {
                var el = $(input)[0];
                var oldValue = el.dataset.oldValue;
                var newValue = el.value;

                switch(el.type) {
                    case 'date':
                        var date = newValue + 'T00:00:00.001Z';
                        propsToUpdate[el.dataset.mzValue] = date;
                        break;
                    default:
                        propsToUpdate[el.dataset.mzValue] = newValue;

                }


            });

            this.editing.nextOrderDate = false;
            this.model.updateNextOrderDate(propsToUpdate);
        },
        updateFrequency: function(e) {
            e.preventDefault();
            var self = this;
            var id = self.model.get('id');
            var unit = $('select#subscription-frequency-unit-' + id);
            var value = $('select#subscription-frequency-value-' + id);
            var frequency = {
                unit: unit.val(),
                value: value.val()
            };
            this.editing.frequency = false;
            this.model.updateFrequency(frequency);
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
        },
        updateQuantity: function(e) {
            var self = this;
            var itemId = e.target.dataset.itemId;
            var newQuantity = self.$el.find('input#quantity-input-' + itemId).val();
            this.model.updateQuantity(newQuantity, itemId);
        }
    });

    return {
        SubscriptionsView: SubscriptionsView,
        SubscriptionView: SubscriptionView
    };
});