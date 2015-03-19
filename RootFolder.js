define(['Folder'], function (folderConstructor) {
    function RootFolder()
    {
        folderConstructor.call(this, 'Root');
    }

    RootFolder.prototype = Object.create(folderConstructor.prototype);
    RootFolder.prototype.constructor = RootFolder;
    
    return RootFolder;
});