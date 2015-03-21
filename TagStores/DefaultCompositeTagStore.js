define([
    'TagStores/CompositeTagStore',
    'TagStores/UrlTagStore',
    'TagStores/TitleTagStore'
], function (
    compositeTagStoreConstructor,
    urlTagStore,
    titleTagStore
) {
    var compositeTagStore = new compositeTagStoreConstructor();
        
    compositeTagStore.AddTagStore(urlTagStore);
    
    return compositeTagStore;
});
