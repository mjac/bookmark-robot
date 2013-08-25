$(function () {
	$("#demo1").jstree({ 
		"json_data" : {
			"data" : [
				{ 
					"data" : "A node", 
					"metadata" : { id : 23 },
					"children" : [ "Child 1", "A Child 2" ]
				},
				{ 
					"attr" : { "id" : "li.node.id1" }, 
					"data" : { 
						"title" : "Long format demo", 
						"attr" : { "href" : "#" } 
					} 
				}
			]
		},
		"plugins" : [ "themes", "json_data", "ui" ]
	}).bind("select_node.jstree", function (e, data) { alert(jQuery.data(data.rslt.obj[0], "id")); });
});
