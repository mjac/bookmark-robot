define([
	'Bookmark',
	'MultipleAsyncRequest',
	'BookmarkTreeReader',
	'RootFolder',
	'PropertySort'
], function (
	bookmarkConstructor,
	requestConstructor,
	bookmarkTreeReader,
	rootFolderConstructor,
	propertySort
) {
    function BookmarkTableView(tableNode, bookmarkStore, tagStore)
    {
        this.tableNode = tableNode;
        this.tableBody = tableNode.find('tbody');

        this.bookmarkStore = bookmarkStore;
        this.tagStore = tagStore;
        this.bookmarkList = [];
        this.bookmarkMap = {};
    }

    BookmarkTableView.prototype = {
        UpdateTree: function()
        {
            this.bookmarkStore.GetBookmarkTree(function (bookmarkTree)
            {
				var folder = new rootFolderConstructor();
                bookmarkTreeReader.readTree(bookmarkTree[0].children, folder);

				this.bookmarkList = folder.GetAllBookmarks();
				this.bookmarkList.sort(propertySort('title'));

				this.bookmarkList.forEach(function (bookmark, index) {
					this.bookmarkMap[bookmark.id] = index;
				}.bind(this));

				this.WriteTree();
            }.bind(this));
        },

        WriteTree: function() {
            this.tableBody.empty();

            for (bookmarkIdx in this.bookmarkList) {
                var bookmark = this.bookmarkList[bookmarkIdx];

                var bookmarkRow = this.tableBody.append('<tr data-id="' + bookmarkIdx + 
                    '"><td class="select"><input type="checkbox" value="' + bookmarkIdx + 
                    '" /></td><td class="title"><a>' + bookmark.title + 
                    '</a></td><td class="url"><a>' + bookmark.url + 
                    '</a></td></tr>');
            }
        },

        UpdateTable: function (bookmarkUpdate, bookmark) {
            var rowNode = this.GetRow(bookmarkUpdate.id);

            rowNode.toggleClass('found', bookmarkUpdate.success);
            rowNode.toggleClass('failed', !bookmarkUpdate.success || !bookmarkUpdate.title);
            rowNode.toggleClass('loading', false);

			var titleNode = rowNode.find('td.title a');

			if (bookmarkUpdate.success) {
				var hasNewTitle = bookmarkUpdate.title !== bookmark.title;
				titleNode.toggleClass('new', hasNewTitle);

				if (bookmarkUpdate.title) {
					titleNode.text(bookmarkUpdate.title);
				} else {
					titleNode.text('Title not found, was: ' + bookmark.title);
				}
			} else {
				titleNode.text(bookmark.title + ' (' + bookmarkUpdate.statusCode + ')');
			}
        },

        GetRow: function(bookmarkId) {
            return this.GetRowIdx(this.bookmarkMap[bookmarkId]);
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
