/**
 * Creates an interface object to the Mozu store's Web APIs. It pulls in the Mozu
 * JavaScript SDK and initializes it with the current store's context values
 * (tenant, catalog and store IDs, and authorization tickets).
 */

define(['sdk', 'jquery', 'hyprlive', 'modules/subscriptions/sdk'], function (Mozu, $, Hypr, Subscriptions) { 
    var apiConfig = require.mozuData('apicontext');
    apiConfig.urls.subscriptionService = '/api/commerce/subscriptions/';
    Mozu.setServiceUrls(apiConfig.urls);
    var api = Mozu.Store(apiConfig.headers).api();

    // creates and sets subscription api configurations on the sdk object.
    Subscriptions.configure.apply(Mozu);

    var oldGetAvailableActionsFor = api.getAvailableActionsFor;
    // overrides the getAvailableActionsFor function so that backboneMozuModel can correctly build functions for subscription types.
    // if not one of the new types, calls the original getAvailableActionsFor function.
    api.getAvailableActionsFor = function(type) {
        if(type === 'subscription') {
            return Subscriptions.getSubscriptionActions();
        } else if (type === 'subscriptions') {
            return Subscriptions.getSubscriptionsActions();
        } else {
            return oldGetAvailableActionsFor(type);
        }
    };

    var extendedPropertyParameters = Hypr.getThemeSetting('extendedPropertyParameters');
    if (extendedPropertyParameters && Hypr.getThemeSetting('extendedPropertiesEnabled')) {
        api.setAffiliateTrackingParameters(extendedPropertyParameters.split(','));
    }

    if (Hypr.getThemeSetting('useDebugScripts') || require.mozuData('pagecontext').isDebugMode) {
        api.on('error', function (badPromise, xhr, requestConf) {
            var e = "Error communicating with Mozu web services";
            if (requestConf && requestConf.url) e += (" at " + requestConf.url);
            var correlation = xhr && xhr.getResponseHeader && xhr.getResponseHeader('x-vol-correlation');
            if (correlation) e += " --- Correlation ID: " + correlation;
            //if (window && window.console) window.console.error(e, badPromise, xhr);
        });
    }
    return api;
});
