define(['Bookmark', 'MultipleAsyncRequest'], function (bookmarkConstructor, requestConstructor) {
    function BookmarkTableView(tableNode, bookmarkStore, tagStore)
    {
        this.tableNode = tableNode;
        this.tableBody = tableNode.find('tbody');

        this.bookmarkStore = bookmarkStore;
        this.tagStore = tagStore;
        this.bookmarkList = [];
    }

    BookmarkTableView.prototype = {
        UpdateTree: function()
        {
            function readTree(bookmarkTree, hierarchy, bookmarks) {
                if ('children' in bookmarkTree) {
                    var subHierarchy = hierarchy.concat([bookmarkTree.title]);
                    readTree(bookmarkTree.children, subHierarchy, bookmarks);
                } else if ($.isArray(bookmarkTree)) {
                    for (localIdx in bookmarkTree) {
                        var folder = bookmarkTree[localIdx];
                        readTree(folder, hierarchy, bookmarks);
                    }
                } else {
                    var newBookmark = new bookmarkConstructor(bookmarkTree.title, bookmarkTree.url);

                    var onlyHttp = true;

                    if (!onlyHttp || /^http/.test(newBookmark.url) && !/(\/\/localhost|\.pdf$)/.test(newBookmark.url)) {
                        bookmarks.push(newBookmark);
                    }
                }
            }

            this.bookmarkStore.GetBookmarkTree(function (bookmarkTree)
            {
                this.bookmarkList = [];
                readTree(bookmarkTree[0].children, [], this.bookmarkList);
                
                this.AddTags(function () {
                    this.WriteTree();
                }.bind(this));
            }.bind(this));
        },

        WriteTree: function() {
            this.tableBody.empty();

            for (bookmarkIdx in this.bookmarkList) {
                var bookmark = this.bookmarkList[bookmarkIdx];

                var bookmarkRow = this.tableBody.append('<tr data-id="' + bookmarkIdx + 
                    '"><td class="select"><input type="checkbox" value="' + bookmarkIdx + 
                    '" /></td><td class="title"><a>' + bookmark.title + 
                    '</a></td><td class="tags">' + bookmark.tags + 
                    '</td><td class="url"><a>' + bookmark.url + 
                    '</a></td></tr>');
            }
        },
        
        AddTags: function (callback) {
            var request = new requestConstructor();
            
            var tagStore = this.tagStore;
            
            this.bookmarkList.forEach(function (bookmark) {
                request.AddRequest(function (requestCallback) {
                    tagStore.RequestTags(bookmark, function (bookmarkUrl, tags) {
                        bookmark.tags = tags;
                        requestCallback();
                    });
                });
            });
            
            request.SetFinalCallback(callback);
            
            request.Execute();
        },

        UpdateTable: function(bookmark) {
            var rowNode = getRow(bookmark);

            var hasNewTitle = bookmark.hasNewTitle()
            var titleNode = rowNode.find('td.title a');

            titleNode.text(hasNewTitle ? bookmark.liveTitle : bookmark.title);

            titleNode.toggleClass('new', hasNewTitle);

            rowNode.toggleClass('found', bookmark.found === true);
            rowNode.toggleClass('failed', bookmark.found === false);
            rowNode.toggleClass('loading', bookmark.loading);
        },

        GetRow: function(bookmark) {
            return getRowIdx(this.bookmarkList.indexOf(bookmark));
        },

        GetRowIdx: function(bookmarkIdx) {
            return this.tableBody.find('tr[data-id=' + bookmarkIdx + "]");
        },

        PerformAction: function(fn) {
            this.tableNode.find('input[type=checkbox]:checked').each(function (idx, input) {
                fn(idx, this.bookmarkList[$(input).val()]);
            }.bind(this));
        },

        Select: function(fn) {
            this.tableBody.find('tr').each(function (rowIdx, row) {
                var rowNode = $(row);
                var idx = rowNode.data('id');
                var bookmark = this.bookmarkList[idx];

                if (bookmark === null) {
                    return;
                }

                var isMatch = fn(idx, bookmark, rowNode);

                rowNode.find('input[type=checkbox]').prop('checked', isMatch);
                rowNode.toggleClass('selected', isMatch);
            }.bind(this));
        },

        AttachEvents: function()
        {
            this.tableBody.delegate('tr', 'click', function (ev) {
                ev.preventDefault();

                var inputNode = $(this).find('input[type=checkbox]');

                var check = !inputNode.attr('checked');

                inputNode.attr('checked', check);
                $(this).toggleClass('selected', check);
            });

            this.tableBody.delegate('td.url a', 'click', function (ev) {
                ev.stopPropagation();
                window.open($(this).text());
            });

            this.tableBody.delegate('input[type=checkbox]', 'click', function (ev) {
                ev.stopPropagation();
                $(this).closest('tr').toggleClass('selected', $(this).attr('checked'));
            });
        }
    };
    
    return BookmarkTableView;
});