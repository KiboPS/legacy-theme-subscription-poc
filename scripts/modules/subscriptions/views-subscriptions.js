define(['modules/api', 'modules/jquery-mozu', 'modules/backbone-mozu'], function(api, $, Backbone) {
    var SubscriptionsView = Backbone.MozuView.extend({
        templateName: "modules/my-account/subscriptions/myaccount-subscriptions",
        additionalEvents: { 
            "click [data-mz-subscription]": "showDetail",
            "focus .focusWrap": "shiftFocus",
            "focus .focusWrapSubscription": "shiftFocusSubscription"
            
        },
        render: function() {
            var self = this;
            self.subscriptionViews = [];
            Backbone.MozuView.prototype.render.apply(this, arguments);
            console.log(this.$el.find('[data-subscription-id]'));
            $.each(this.$el.find('[data-subscription-id]'), function(index, val) {
                console.log(this);
                var subscriptionId = $(this).data('subscriptionId');
                var subscription = self.model.get('items').get(subscriptionId);
                var subscriptionView = new SubscriptionView({
                    el: this,
                    model: subscription
                });
                subscriptionView.render();
                self.subscriptionViews.push(subscriptionView);
            });
        }
    });

    var SubscriptionView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/subscriptions/detail',
        initialize: function() {
            var self = this;
            this.listenTo(this.model, 'change', this.render, this);
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            // $("select:not(.ignore)").niceSelect();
            this.showDate();
        },
        skip: function() {
            this.model.skip();
        },
        orderNow: function() {
            this.model.orderNow();
        }
    });

    return {
        SubscriptionsView: SubscriptionsView,
        SubscriptionView: SubscriptionView
    };
});