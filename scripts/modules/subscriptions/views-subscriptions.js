define(['modules/jquery-mozu', 'modules/backbone-mozu', 'modules/editable-view', 'modules/preserve-element-through-render'], function($, Backbone, EditableView, preserveElement) {
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
            var forms = ['actions', 'items', 'nextOrderDate', 'frequency', 'payment', 'shipping'];
            forms.forEach(function(form) {
                var functionName = 'edit' + form.charAt(0).toUpperCase() + form.substring(1);
                self[functionName] = function() {
                    self.beginEdit(form);
                };
            });
            this.listenTo(this.model, 'change', this.render, this);
        },
        render: function() {
            preserveElement(this, ['.mz-itemlisting-thumb', '.mz-itemlisting-thumb-img'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
        },
        getRenderContext: function() {
            var context = EditableView.prototype.getRenderContext.apply(this, context);
            context.isEditing = this.isEditing;
            return context;
        },
        constructor: function() {
            EditableView.apply(this, arguments);
            this.editing = {};
            this.isEditing = false;
            this.invalidFields = {};
        },
        beginEdit: function(section) {
            this.editing = {};
            this.editing[section] = true;
            this.isEditing = true;
            this.render();
        },
        cancelEdit: function() {
            this.editing = {};
            this.isEditing = false;
            this.render();
        },
        updateNextOrderDate: function(e) {
            e.preventDefault();
            var self = this;
            var input = self.$el.find('input#subscription-nextorderdate');
            var propsToUpdate = {};
            propsToUpdate.nextOrderDate = input.val() + 'T00:00:00.001Z';;

            this.model.updateNextOrderDate(propsToUpdate).then(function(res) {
                self.cancelEdit();
            });
        },
        updateFrequency: function(e) {
            e.preventDefault();
            var self = this;
            var unit = self.$el.find('select#subscription-frequency-unit');
            var value = self.$el.find('select#subscription-frequency-value');
            var frequency = {
                unit: unit.val(),
                value: value.val()
            };
            // this.editing.frequency = false;
            // this.isEditing = false;
            this.model.updateFrequency(frequency).then(function(res) {
                self.cancelEdit();
            });
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
        },
        addItem: function(e) {
            // e.preventDefault();
            var self = this;
            var product = self.$el.find('#add-item-input').val();
            var quantity = self.$el.find('#item-quantity').val();
            self.model.addItem(product, quantity);

        }
    });

    return {
        SubscriptionsView: SubscriptionsView,
        SubscriptionView: SubscriptionView
    };
});