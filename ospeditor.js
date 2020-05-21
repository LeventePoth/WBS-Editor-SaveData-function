//todo:
//OK 1. wrap
//2. PAN - moving
//OK 3. insert  left & right
//OK 4. colors
//OK 5. layout variations?
//OK project ID from URL
//OK session ID from cookie
//OK root element: if not exists, create
//OK fix: new code -> node info!
var root;

function ospeditor(sessionID,xogurl){
function getParameterByName(name, url) {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var key_svg_path = "M15 6a1.54 1.54 0 0 1-1.5-1.5 1.5 1.5 0 0 1 3 0A1.54 1.54 0 0 1 15 6zm-1.5-5A5.55 5.55 0 0 0 8 6.5a6.81 6.81 0 0 0 .7 2.8L1 17v2h4v-2h2v-2h2l3.2-3.2a5.85 5.85 0 0 0 1.3.2A5.55 5.55 0 0 0 19 6.5 5.55 5.55 0 0 0 13.5 1z";

var xi = 0; //ID generator
duration = 550,
rectW = 130, //inner box width // node mérete
rectH = 70, //inner box height
nodeW = 180, //110 //distance between nodes // node virtuális mérete, a vonal határokon túl
nodeH = 90; //vertical distance between nodes
extrW = 15; //right extension block // az oldalsó függőleges elem a node-on
extrH = rectH; //right extension block
extlW = 15; //left extension block
extlH = rectH; //left extension height
var layout = 1; //varieties: 0,1: 0: normal tree, 1: modified tree.
var showDetails = "simple" //options are: simple,schedule,baseline,costs
var showKeyOnly = false; //key only is a filter

/*
//Original values:
duration = 550,
rectW = 100,
rectH = 50,
nodeW = 110, //110
nodeH = 70;
*/
var root_investment_code = null; //"pma_bau1"; //"PMA-201601200012";

//var root; // ez kell
var deletedNodes = []; //was existing if code is available. it was a deleted new node if code is not available.. // ez is kell
var postNodes = []; //Levi
var maxcode = 0;


//get Inv id from URL:




//comment for production:
/*
var root_flat=[{"_internalId":"0","active":"1","seq":"0","name":"Project","parentTask_code":null,"saved":1}}];
maxcode = Math.max.apply(Math, root_flat.map(function (o) {
				return o._internalId;
			}));
root = unflatten(root_flat);
drawTree();
*/
function preprocess_array(array){
	array.forEach(function(item){
		item.status_id=0;
		if(item["status"]!= undefined){
			if(item.status["id"]!=undefined){
				item.status_id=item.status.id;
			}
		}
	});
	function compare(a, b) {
		const sorta = a.wbsSort;
		const sortb = b.wbsSort;
	  
		return sorta-sortb;
	  }
	array.sort(compare);
}
var inv_param = getParameterByName("id"); // ez az ID amit beleírtam a query stringbe
getTaskDataFromServer(inv_param,sessionID,function(data_array){ // ez itt maga a get_data_js callback()-je a hozzá készített végső array
	preprocess_array(data_array);
	root = unflatten(data_array);
	maxcode = Math.max.apply(Math, data_array.map(function (o) {
				if(o.isProject) return 0;
				return o._internalId;
			}));
	xi = Math.max.apply(Math, data_array.map(function (o) {
				return o.id;
			}));
	drawTree();
},function(){console.log("error occured");});
//uncomment for production:
/*queryData(function (d) {

	var root_flat = toData(d);
	console.log("---data---");
	console.log(JSON.stringify(root_flat));
	console.log("---end of data---");
	maxcode = Math.max.apply(Math, root_flat.map(function (o) {
				return o._internalId;
			}))
		root = unflatten(root_flat);
	drawTree();
});*/

function updateHCoding(d, p, j) {
	if (!p) {
		//this is a root element:
		d.hcode = "1";
	} else {
		d.hcode = p.hcode + "." + (j + 1);
	}
	var ch = d.children ? d.children : d._children;
	if (ch != null) {
		for (var i = 0; i < ch.length; i++) {
			updateHCoding(ch[i], d, i);
		}
	}

}
function deleteNode(d) {
	d.active = 0;
	if (d.saved == 1) {
		deletedNodes.push(d);
	}
	if (d._children) {
		for (var i in d._children) {
			deleteNode(d._children[i]);
		}
	}
	if (d.children) {
		for (var i in d.children) {
			deleteNode(d.children[i]);
		}
	}
}

function postNode(d) { //Levi
	d.active = 1;
	if (d.saved == 0) {
		postNodes.push(d);
	}
	if (d._children) {
		for (var i in d._children) {
			postNode(d._children[i]);
		}
	}
	if (d.children) {
		for (var i in d.children) {
			postNode(d.children[i]);
		}
	}
}

function drawTree() {

	$('#switch_tree').click(function () {
		layout = 0;
		update(root);
	});
	$('#switch_mod_tree').click(function () {
		layout = 1;
		update(root);
	});
	$('#save').click(function () {
		save();
	});
	$('#collapse_all').click(function () {
		if(root){
			visitall(root,null,function(n,p){
				if(n.children){
					n._children=n.children;
					n.children=null;
				}
			});
			if(root.children){
					root._children=root.children;
					root.children=null;
			}
			update(root);
		}
		
	});
	$('#expand_all').click(function () {
		if(root){
			visitall(root,null,function(n,p){
				if(n._children){
					n.children=n._children;
					n._children=null;
				}
			});
			if(root._children){
					root.children=root._children;
					root._children=null;
			}
			update(root);
		}
	});

	var margin = {
		top : 20,
		right : 120,
		bottom : 20,
		left : 120
	},
	width = 960 - margin.right - margin.left,
	height = 800 - margin.top - margin.bottom;
	var menu = [{
			title : 'Add Node',
			action : function (elm, d, i) {
				//console.log('Add Node clicked!');
				//console.log(d);
				var newnode = {
					_internalId : ++maxcode, //TODO: BUG!
					saved : 0,
					name : "New Node",
					code: null,
					children : [],
					_children : null,
					parent : null, //add details here.
					startDate: d.startDate, //default data
					finishDate: d.finishDate, //defaults
					parentTask: d._internalId,
					isMilestone: false,
					isKey: false,
					status: {id:0},
					baselineStartDate: null,
					baselineFinishDate: null,
					hasAssignments: false,
					percentComplete: 0,
					isSubProject: false,
					hasSubtasks: false,
					isTask: true,
					id: ++xi
					
				};
				insert(newnode, d); //d: parent Node, "drop newnode into d as if it were existing already" (wbssort!)
				
				postNode(newnode);

				expand(d);
				updatTextNodes();
				update(d);
				//newnode will get an id..
				editNode(newnode, document.getElementById("text" + newnode.id));
				console.log(newnode); //Levi
				console.log(d); //Levi
			}
		}, {
			title : 'Delete Node',
			action : function (elm, d, i) {
				//console.log('Delete Node clicked!');
				//console.log(d);
				if (d == root) {
					return;
				}
				var result = confirm("Want to delete?");
				if (result) {
					//console.log("deleting element...");
					//Logic to delete the item
					deleteNode(d);
					var index = d.parent.children.indexOf(d);
					if (index > -1) {
						d.parent.children.splice(index, 1);
					}
					updatTextNodes();
					update(d.parent);

				}
			}
		}
	]
	d3.contextMenu = function (menu, openCallback) {

		// create the div element that will hold the context menu
		d3.select("body").selectAll('.d3-context-menu').data([1])
		.enter()
		.append('div')
		.attr('class', 'd3-context-menu');

		// close menu
		d3.select('body').on('click.d3-context-menu', function () {
			d3.select('.d3-context-menu').style('display', 'none');
		});

		// this gets executed when a contextmenu event occurs
		return function (data, index) {
			var elm = this;

			d3.selectAll('.d3-context-menu').html('');
			var list = d3.selectAll('.d3-context-menu').append('ul');
			list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function (d) {
				return d.title;
			})
			.on('click', function (d, i) {
				d.action(elm, data, index);
				d3.select('.d3-context-menu').style('display', 'none');
			});

			// the openCallback allows an action to fire before the menu is displayed
			// an example usage would be closing a tooltip
			if (openCallback)
				openCallback(data, index);

			// display context menu
			d3.select('.d3-context-menu')
			.style('left', (d3.event.pageX - 2) + 'px')
			.style('top', (d3.event.pageY - 2) + 'px')
			.style('display', 'block');

			d3.event.preventDefault();
		};
	};

	var selectedNode = null;
	var selectedNodeReorder = null;
	var draggingNode = null;
	var tree = d3.layout.tree().nodeSize([nodeW, nodeH]);
	tree.separation(separation);
	function separation(a, b) {
		return a.parent == b.parent ? 1 : 1.2;
	}
	var diagonal = elbow;
	/*var diagonal = d3.svg.diagonal()
	.projection(function (d) {
	return [d.x + rectW / 2, d.y + rectH * 3 / 4];
	})
	 */
	var dragStarted = null;
	var dragOrigCoords = {
		x : null,
		y : null
	};
	var dragListener = d3.behavior.drag()
		.on("dragstart", function (d) {
			d3.select(this).moveToFront();

			//console.log("dragstart");
			if (d == root) {
				return;
			}
			nodes = tree.nodes(d);
			d3.event.sourceEvent.stopPropagation();

			dragOrigCoords.x = d.x0;
			dragOrigCoords.y = d.y0;
		})
		.on("drag", function (d) {

			if (d == root) {
				return;
			}
			var domNode = this;
			var svgGroup = svg;
			draggingNode = d;

			if ((!dragStarted) && ((Math.abs(d.x0 - dragOrigCoords.x) > 10) || (Math.abs(d.y0 - dragOrigCoords.y) > 10))) {

				//console.log("drag starts now...");
				//initiate drag...
				d3.select(this).attr('pointer-events', 'none');

				d3.selectAll('.ghostCircle')
				.attr('class', 'ghostCircle show')
				.attr('pointer-events', 'mouseover');
				d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
				d3.select(domNode).attr('class', 'node activeDrag');

				// if nodes has children, remove the links and nodes
				if (nodes.length > 1) {
					// remove link paths
					links = tree.links(nodes);
					nodePaths = svgGroup.selectAll("path.link")
						.data(links, function (d) {
							return d.target.id;
						}).remove();
					// remove child nodes
					nodesExit = svgGroup.selectAll("g.node")
						.data(nodes, function (d) {
							return d.id;
						}).filter(function (d, i) {
							if (d.id == draggingNode.id) {
								return false;
							}
							return true;
						}).remove();
				}

				// remove parent link
				parentLink = tree.links(tree.nodes(draggingNode.parent));
				svgGroup.selectAll('path.link').filter(function (d, i) {
					if (d.target.id == draggingNode.id) {
						return true;
					}
					return false;
				}).remove();

				dragStarted = true;

			}

			d.x0 += d3.event.dx;
			d.y0 += d3.event.dy;

			var node = d3.select(this);
			node.attr("transform", "translate(" + d.x0 + "," + d.y0 + ")");

		})
		.on("dragend", function (d) {
			dragStarted = null;
			if (d == root) {
				return;
			}
			d3.select(this).attr('pointer-events', null);

			domNode = this;
			//console.log("dragend");
			//draggingNode=d;
			if (selectedNode) {
				//console.log("insert");
				insert(draggingNode, selectedNode);
				expand(selectedNode);
			} else if (selectedNodeReorder) {
				//console.log("reorder");
				//check if it belongs to the same parent.
				
				if (draggingNode && selectedNodeReorder.parent === draggingNode.parent) {
					after(draggingNode, selectedNodeReorder);
				} else if(draggingNode){
					insert(draggingNode, selectedNodeReorder.parent);
					draggingNode.parent = selectedNodeReorder.parent;
					after(draggingNode, selectedNodeReorder);
				}

			}

			selectedNode = null;
			d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
			d3.select(domNode).attr('class', 'node');
			// now restore the mouseover event or we won't be able to drag a 2nd time
			//d3.select(domNode).select('.ghostCircle').attr('pointer-events', null);
			d3.selectAll('.ghostCircle').attr('pointer-events', 'none');
			d3.select(domNode).attr('pointer-events', null);
			//updateTempConnector();
			if (draggingNode !== null) {
				//console.log("update tree after dragging");
				update(draggingNode);
				updatTextNodes();
				//centerNode(draggingNode);
				draggingNode = null;
			}
		})

		var svg = d3.select("#body").append("svg").attr("width", "100%").attr("height", "100%")
		.call(zm = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", redraw)).on("dblclick.zoom", null).append("g")
		.attr("transform", "translate(" + 350 + "," + 20 + ")");
	//d3.behavior.zoom.dblclick = function () {};
	//necessary so that zoom knows where to zoom and unzoom from
	zm.translate([350, 20]);

	root.x0 = 0;
	root.y0 = height / 2;

	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}
	function expandAll(d) {
		if (d._children) {
			d.children = d._children;
			d.children.forEach(expand);
			d._children = null;
		}
	}
	function expand(d) {
		if (d._children) {
			d.children = d._children;
			d._children = null;
		}
	}

	if (root.children) {
		root.children.forEach(collapse);
	}
	update(root);

	d3.select("#body").style("height", "800px");

	function selectColor(d) {
		switch (d.depth) {
		case 0:
			return d._children ? "#787878" : "#AAAAAA";
			break;
		case 1:
			return d._children ? "#8080CF" : "#B0B0FF";
			break;
		default:
			return d._children ? "lightsteelblue" : "#fff";
		}
	}

	function hoverRight(node) {
		if(node===root || node.parent===root){
			selectedNodeReorder = node;
			selectedNode=null;
		} else if (layout == 0) {
			selectedNodeReorder = node;
			selectedNode=null;
		} else if (layout == 1) {
			selectedNode = node;
			selectedNodeReorder=null;
		}
	}
	function hoverRightOut(node) {
		if(node===root || node.parent===root){
			selectedNodeReorder = null;
		} else if (layout == 0) {
			selectedNodeReorder = null;
		} else if (layout == 1) {
			selectedNode = null;
		}
	}

	function hoverUnder(node) {
		if(node===root || node.parent===root){
			selectedNode = node;
			selectedNodeReorder=null;
		} else if (layout == 0) {
			selectedNode = node;
			selectedNodeReorder=null;
		} else if (layout == 1) {
			selectedNodeReorder = node;
			selectedNode=null;
		}
	}

	function hoverUnderOut(node) {
		if(node===root || node.parent===root){
			selectedNode = null;
		} else if (layout == 0) {
			selectedNode = null;
		} else if (layout == 1) {
			selectedNodeReorder = null;
		}
	}
	function hoverIn(node) {}

	function hoverUnderOut(node) {}

	function update(source) {
		updateHCoding(root, null, 0);
		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(),
		links = tree.links(nodes);

		// RECALC node layout!!
		if (layout == 1) {
			recalcLayout(root, nodes);
		}

		// Update the nodes…
		var node = svg.selectAll("g.node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++xi);
			});
		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function (d) {

				return "translate(" + source.x0 + "," + source.y0 + ")";

			})
			.call(dragListener);
		//    .on("click", click);

		//Print box
		nodeEnter.append("rect")
		.attr("width", rectW+extrW)
		.attr("height", rectH)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.style("fill", function (d) {
			return selectColor(d);
		})
		.on("dblclick", click)
		.on('contextmenu', d3.contextMenu(menu));

		
		//Print data stripes
		nodeEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",extlW+rectW).attr("x2",extlW+rectW).attr("y1",0).attr("y2",rectH);
		nodeEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",extlW).attr("x2",extlW).attr("y1",0).attr("y2",rectH);
		nodeEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",extlW+0).attr("x2",extlW+rectW+extrW).attr("y1",rectH/2).attr("y2",rectH/2);
		nodeEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",extlW+0).attr("x2",extlW+rectW).attr("y1",rectH*3/4).attr("y2",rectH*3/4);
		
		
		//Print dates
		//Start-Finish only for non-milestones:
		//nodeEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",rectW/2).attr("x2",rectW/2).attr("y1",rectH*3/4).attr("y2",rectH);
		var tasksEnter = nodeEnter.filter(function(d){return d["isMilestone"]!=true;});		
		tasksEnter.append("line").style("stroke","black").style("stroke-width",1).attr("x1",extlW+rectW/2).attr("x2",extlW+rectW/2).attr("y1",rectH*3/4).attr("y2",rectH);
		tasksEnter.append("text")
		.attr("id", function (d) {
			return "start" + d.id;
		})
		.attr("class", "nodestart") //add classification: nodestart
		.attr("x", extlW+rectW/4)
		.attr("y", rectH)
		.attr("dy", "-0.4em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return formatDate(d.startDate);
		});
		
		tasksEnter.append("text")
		.attr("id", function (d) {
			return "finish" + d.id;
		})
		.attr("class", "nodefinish") //add classification: nodestart
		.attr("x", extlW+rectW*3/4)
		.attr("y", rectH)
		.attr("dy", "-0.4em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return formatDate(d.finishDate);
		});
		
		var milestoneEnter = nodeEnter.filter(function(d){return d["isMilestone"]==true;});		
		milestoneEnter.append("text")
		.attr("id", function (d) {
			return "start" + d.id;
		})
		.attr("class", "nodefinish") //add classification: nodestart
		.attr("x", extlW+rectW/2)
		.attr("y", rectH)
		.attr("dy", "-0.4em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return formatDate(d.finishDate);
		});
		
		//Print Symbols:
		// Print milestone symbol
		var dim=extrW-3;
		var diamondpath = "M " + dim / 2 + " 0 L " + dim + " " + dim / 2 + " L " + dim / 2 + " " + dim + " L 0 " + dim / 2 + " L " + dim / 2 + " 0";
			
		milestoneEnter.append("path")
		.attr("d", diamondpath)
		.attr("transform", "translate("+(extlW+rectW+(extrW-dim)/2)+","+(rectH*3/4+(rectH/4-dim)/2)+")")    
		.style("fill", "#222222");
		//print key symbol
		nodeEnter.filter(function(d){return d["isKey"]==true;}).append("path")
		.attr("d", key_svg_path)
		.attr("transform", "translate("+(extlW+rectW+(extrW-dim)/2)+","+(rectH*2/4+(rectH/4-dim)/2)+")"+" scale("+dim/20+")" )		
		.style("fill", "#222222");
		
		
		//print owner: 
		//taskOwner
		nodeEnter.append("text")
		.attr("id", function (d) {
			return "owner" + d.id;
		})
		.attr("class", "nodeowner") //add classification: nodestart
		.attr("x", extlW+rectW/2)
		.attr("y", rectH*3/4)
		.attr("dy", "-0.5em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			var result="-";
			if(d.taskOwner && d.taskOwner.displayValue){
			result=d.taskOwner.displayValue;
			}				
				
			return result;
		});
		
		//print Task Code
		nodeEnter.append("text")
		.attr("id", function (d) {
			return "pct" + d.id;
		})
		.attr("class", "nodecode") //add classification: nodestart
		.attr("x", -rectH/2)
		.attr("y", extlW)
		.attr("dy", "-0.5em")
		.attr("transform","rotate(-90)")
		.attr("text-anchor", "middle")
		.text(function (d) {
			var result="new "+d.id;
			if(d.code){
			result=d.code;
			}				
			return result;
		});
		//print % Complete or "Done"
		nodeEnter.append("text")
		.attr("id", function (d) {
			return "pct" + d.id;
		})
		.attr("class", "nodepct") //add classification: nodestart
		.attr("x", -rectH/4)
		.attr("y", extlW+rectW+extrW)
		.attr("dy", "-0.5em")
		.attr("transform","rotate(-90)")
		.attr("text-anchor", "middle")
		.text(function (d) {
			var result="0%";
			if(d["percentComplete"] != undefined){
				result=(Math.round(d.percentComplete*100))+" %";
				/*if (d.percentComplete == 1 && d["isMilestone"]==true){
					result = "done";
				}
				if (d.percentComplete != 1 && d["isMilestone"]==true){
					result = "";
				}*/
			}
			return result;
		});
		//Print Progress crosses
		nodeEnter.filter(function(d){console.log(d);return d.status_id>=1}).append("line").style("stroke","#444444").style("stroke-width",1).attr("x1",extlW+0).attr("x2",extlW+rectW).attr("y1",rectH/2).attr("y2",0);
		nodeEnter.filter(function(d){return d.status_id>=2}).append("line").style("stroke","#444444").style("stroke-width",1).attr("x1",extlW+0).attr("x2",extlW+rectW).attr("y1",0).attr("y2",rectH/2);
		
		//Print status color //TODO: Data is needed.
		
		/*tasksEnter.append("text")
		.attr("id", function (d) {
			return "finish" + d.id;
		})
		.attr("class", "nodefinish") //add classification: nodestart
		.attr("x", rectW*3/4)
		.attr("y", rectH)
		.attr("dy", "-0.4em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return formatDate(d.finishDate);
		});
		*/
		//.call(wrap, rectW)
		//.call(make_editable)
		//return y;
		
		//nodeEnter.append("text").call()
		
		//Print Content
		nodeEnter.append("text").call(drawNodeText);
		/*nodeEnter.append("text")
		.attr("id", function (d) {
			return "text" + d.id;
		})
		.attr("class", "nodetext")
		.attr("x", rectW / 2)
		.attr("y", rectH / 2)
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return "[" + d.hcode + "] " + d.name+" "+d.startDate;
		})
		*/
		
//		.call(wrap, rectW)
//		.call(make_editable)
//		.on('contextmenu', d3.contextMenu(menu));
		//.on("dblclick", click);

		//ghost rectangles:
		nodeEnter.append("rect")
		.attr("x", rectW)
		.attr("width", 2 * (nodeW - rectW))
		.attr("height", rectH)
		.attr("stroke", "none")
		.attr("class", "ghostCircle")
		.attr("opacity", 0.0)
		.style("fill", "red")
		.attr('pointer-events', 'none')
		.on("mouseover", function (d) {
			//console.log("select Reorder");
			//move this module left, the next one right by 30px...
			if (d == root) {
				return;
			}
			hoverRight(d);

			d3.select(this.parentNode).transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + (d.x0 - 30) + "," + d.y0 + ")";
			});
			d3.select(this).attr("width", 2 * (nodeW - rectW) + 30);
		})
		.on("mouseout", function (d) {
			//console.log("unselect Reorder");
			//move this module left, the next one right by 10px...
			//d.x0 += 30

			hoverRightOut(d);
			d3.select(this.parentNode).transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + (d.x0) + "," + d.y0 + ")";
			});
			d3.select(this).attr("width", 2 * (nodeW - rectW));
		});

		nodeEnter.append("rect")
		.attr("y", rectH / 2)
		.attr("height", 0.8 * (rectH))
		.attr("width", extlW+extrW+rectW)
		.attr("stroke", "none")
		.style("fill", "red")
		.attr("class", "ghostCircle")
		.attr("opacity", 0.0)
		.attr('pointer-events', 'none')
		.on("mouseover", function (node) {
			hoverUnder(node);
			//update temporal connector
			d3.select(this.parentNode).transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + (d.x0) + "," + (d.y0 - 15) + ")";
			});
			d3.select(this).attr("height", 0.8 * (rectH) + 15);
			//console.log("selected.");
		})
		.on("mouseout", function (node) {
			hoverUnderOut(node);
			//update temporal connector
			d3.select(this.parentNode).transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + (d.x0) + "," + (d.y0) + ")";
			});
			d3.select(this).attr("height", 0.8 * (rectH));
			//console.log("unselected.");
		})

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

		nodeUpdate.select("rect")
		.attr("width", extlW+rectW+extrW)
		.attr("height", rectH)
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.style("fill", function (d) {
			return selectColor(d);
		});

		nodeUpdate.select("text")
		.style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.x + "," + source.y + ")";
			})
			.remove();

		nodeExit.select("rect")
		.attr("width", extlW+rectW+extrW)
		.attr("height", rectH)
		//.attr("width", bbox.getBBox().width)""
		//.attr("height", bbox.getBBox().height)
		.attr("stroke", "black")
		.attr("stroke-width", 1);

		nodeExit.select("text");

		// Update the links…
		var link = svg.selectAll("path.link")
			.data(links, function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("x", rectW / 2)
		.attr("y", rectH / 2)
		.attr("d", function (d) {
			var o = {
				x : source.x0,
				y : source.y0
			};

			return diagonal({
				source : o,
				target : o
			});
		});

		// Transition links to their new position.
		link.transition()
		.duration(duration)
		.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
		.duration(duration)
		.attr("d", function (d) {
			var o = {
				x : source.x,
				y : source.y
			};
			return diagonal({
				source : o,
				target : o
			});
		})
		.remove();

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}


	function drawNodeText(x){ //x is a text node
		var y= x
		.attr("id", function (d) {
			return "text" + d.id;
		})
		.attr("class", function(d){
			var result="nodetext";
			if(d["isMilestone"]==true){
				result = result + " milestone";
			}
			return result;
		}) //add classification: nodetext
		.attr("fill",function(d){
			var result="black";
			if(d["isMilestone"]==true){
				result = "red";
			}
			return result;
		})
		.attr("x", extlW+(rectW / 2))
		//.attr("y", rectH / 2)
		.attr("y", ".70em")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			var txtresult="";
			return "[" + d.hcode + "] " + d.name;
		})
		.call(wrap, rectW)
		.call(make_editable);
		return y;
	}
	// Toggle children on click.
	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	//Redraw for zoom
	function redraw() {
		//console.log("here", d3.event.translate, d3.event.scale);
		svg.attr("transform",
			"translate(" + d3.event.translate + ")"
			 + " scale(" + d3.event.scale + ")");
	}
	function elbow(d, i) {
		
		//check layout:
		if((layout==0)||((layout==1) && d.source.depth==0)){
			
			/*  return "M" + (d.target.x+rectW/2) + "," + (d.target.y+rectH/2)
			+ "V" + (d.source.y+rectH/2) + "H" + (d.source.x+rectW/2);
			 */
			var sx = d.source.x + extlW+rectW / 2;
			var sy = d.source.y + rectH / 2;
			var tx = d.target.x + extlW+rectW / 2;
			var ty = d.target.y + rectH / 2;

			return "M" + sx + "," + sy
			 + "V" + (sy + ty) / 2 + "H" + tx + "V" + ty;
		 } else if(layout==1){
			var sx = d.source.x+extlW+5;
			var sy = d.source.y + rectH / 2;
			var tx = d.target.x + extlW+rectW / 2;
			var ty = d.target.y + rectH / 2;

			return "M" + sx + "," + sy
			 + "V" + ty + "H" + tx;
		 }
		 
	}
	d3.selection.prototype.moveToFront = function () {
		return this.each(function () {
			this.parentNode.appendChild(this);
		});
	};

	function insert(dNode, pNode) {
		//console.log("insert called");
		//dNode: dragging node
		//pNode: parent node
		//function: insert dNode into pNode

		//remove dNode from its parent:
		if (pNode == null) {
			return;
		} //sanity check.
		if (pNode === dNode.parent) {
			return;
		} //its already in it..
		//inserting dNode into pNode - last place:
		if (dNode.parent) {
			var index = dNode.parent.children.indexOf(dNode);
			if (index > -1) {
				dNode.parent.children.splice(index, 1);
			}
		}
		if (typeof pNode.children !== 'undefined' || typeof pNode._children !== 'undefined') {
			if (typeof pNode.children !== 'undefined') {
				pNode.children.push(dNode);
			} else {
				if (pNode._children == null) {
					pNode._children = [];
				}
				pNode._children.push(dNode);
			}
		} else {
			pNode.children = [];
			pNode.children.push(dNode);
		}
	}

	function after(dNode, rNode) {
		//console.log("after called");
		if (dNode.parent != rNode.parent) {
			return;
		}
		var array = dNode.parent.children;
		var di = array.indexOf(dNode);
		array.splice(di, 1);
		var ri = array.indexOf(rNode);
		array.splice(ri + 1, 0, dNode);
	}
	function make_editable(d) {
		var i = "name";
		this.on("dblclick", function (d) {
			editNode(d, this);
		});
	}

	function editNode(d, htmlItem) {
		var i = "name";
		var t = htmlItem;
		//console.log("text coord: " + d.x + "," + d.y );
		var p = htmlItem.parentNode;
		console.log(p.getBoundingClientRect());
		var abs_position=p.getBoundingClientRect();
		
		var el = d3.select(htmlItem);
		var p_el = d3.select(p);
		//create a floating textarea for IE.
		var frm = p_el.append("foreignObject");
		var inp = frm
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", rectW+extrW+extlW)
			.attr("height", rectH+1)
			.append("xhtml:form")
			.append("xhtml:textarea")
			.attr("xmlns","http://www.w3.org/2000/xmlns/")
			//.attr("type", "textarea")
			.attr("id", "enterText")
//			.attr("width", 60)
//			.attr("height", 40)
			.attr("autofocus", "autofocus")
			.attr("style", "text-align: center;font: 10px sans-serif;" + "width: " + (rectW+extlW+extrW) + "px;" + "height: " + rectH + "px;")
			//.attr()
			.text(function () {
				// nasty spot to place this call, but here we are sure that the <input> tag is available
				// and is handily pointed at by 'this':
				this.focus();
				return d[i];
			})
			//.attr("style", "width: " + rectW + ";" + "height: " + rectH + ";")
			.on("blur", function () {
				//console.log("blur", this, arguments);

				var txt = inp.node().value;

				d[i] = txt;
				
				/*el
				.text(function (d) {
					return "[" + d.hcode + "] " + d[i];
				})
				.call(wrap, rectW);
				*/
				el.call(drawNodeText);
				
				var fobj = p_el.select("foreignObject");
				if (fobj) {
					fobj.remove();
				}
			})
			/*		.on("keypress", function () {
			//console.log("keypress", this, arguments);

			// IE fix
			if (!d3.event)
			d3.event = window.event;

			var e = d3.event;
			if (e.keyCode == 13) {
			if (typeof(e.cancelBubble) !== 'undefined') // IE
			e.cancelBubble = true;
			if (e.stopPropagation)
			e.stopPropagation();
			e.preventDefault();

			var txt = inp.node().value;

			d[i] = txt;
			el
			.text(function (d) {
			return "["+d.hcode+"] "+d[i];
			}).call(wrap,rectW);
			// odd. Should work in Safari, but the debugger crashes on this instead.
			// Anyway, it SHOULD be here and it doesn't hurt otherwise.
			var fobj=p_el.select("foreignObject");
			if (fobj){
			fobj.remove();
			}
			}
			})*/
			.on("focus", function () {
				var temp_value = this.value;
				this.value = '';
				this.value = temp_value;
			});
			//inp.node().setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns","http://www.w3.org/2000/xmlns/");
		//$(htmlItem).trigger('focus');
		console.log(inp.node());
		
		
	}

function updatTextNodes() {
	updateHCoding(root, null, 0);
	var textNodes = d3.selectAll(".nodetext");
	textNodes.call(drawNodeText);
	
	/*textNodes.text(function (d) {
		return "[" + d.hcode + "] " + d.name +" "+ d.startDate;
	}).call(wrap, rectW);
	*/
}
function callbackReadTask(task){
//TODO:
}

var postNodesToSend = postNodes;

function save(){
var dataToSend = flatten(root);
console.log(dataToSend);
//var akármi = "akármi";
console.log(deletedNodes);
console.log(postNodes);
//console.log(root);
saveDataToServer(sessionID,dataToSend,callbackReadTask,deletedNodes, postNodes, function(callback){console.log("success save");},function(err_msg){console.log("error occured save",err_msg);});
//deletedNodes.length = 0;
//postNodes.length = 0;	
}
}


/*function save() {
	var dataToSend = flatten(root);
	console.log("data to send: ", JSON.stringify(dataToSend));
	saveData(deletedNodes, function (response) {
		deletedNodes = [];
		saveData(dataToSend, function (response) {
			alert("Saved successfully");
		});
	});

}*/

function unflatten(nodes) {
	var map = {},
	node,
	roots = [];
	for (var i = 0; i < nodes.length; i += 1) {
		node = nodes[i];
		//node.children = [];
		map[node._internalId] = i; // use map to look-up the parents
	}
	for (var i = 0; i < nodes.length; i += 1) {
		node = nodes[i];
		if (node.parentTask) {
			var m = map[node.parentTask];
			var x = nodes[m];
			if (!x.children) {
				x.children = new Array();
			}
			x.children.push(node);
		} else {
			roots.push(node);
		}
	}
	return roots[0];
}

flatten = function (data) {
	//TODO: create CODE for all!!
	//generate new CODEs:
	//var newcode=maxid+1;
	var result = [];
	var seq_counter = 0;

	function recurse(cur, p) {
		var c = cur._internalId;
		if (c == null || c == undefined) {
			c = null;
		}
		var record = {
			code : c,
			name : cur.name,
			seq : seq_counter++,
			active : 1
		};
		if (p) {
			record.parentTask = p._internalId;
			record.parentTask = p._internalId;
			record.inv_code = root_investment_code;
		} else {
			record.parentTask = cur._internalId ? cur._internalId : null;
			record.inv_code = root_investment_code;
		}
		cur.saved = 1;
		result.push(record);
		if (cur.children) {
			for (var i = 0; i < cur.children.length; i++) {
				recurse(cur.children[i], cur);
			}
		}
		if (cur._children) {
			for (var i = 0; i < cur._children.length; i++) {
				recurse(cur._children[i], cur);
			}
		}
	}
	recurse(data, null);
	//var m=result.map(function (d){ return d._internalId;})


	return result;
}


function wrap(text, width) {
	text.each(function () {
		var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1, // ems
		y = text.attr("y") ? text.attr("y") : 0,
		x = text.attr("x") ? text.attr("x") : 0,
		dy = text.attr("dy") ? parseFloat(text.attr("dy")) : 0.0,
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}

function visit(n, p, func) {
	if (n.children) {
		for (var i = 0; i < n.children.length; i++) {
			func(n.children[i], n);
			visit(n.children[i], n, func);
		}
	}
}
function visitall(n, p, func) {
	ch=n.children?n.children:n._children;
	if (ch) {
		for (var i = 0; i < ch.length; i++) {
			func(ch[i], n);
			visit(ch[i], n, func);
		}
	}
}
var gap = 30;
function recalcLayout(root, nodes) { //root position is already calculated!!
	//get max depth for depth=1 layer.
	var d1 = nodes.filter(function (d) {
			return (d.depth == 1);
		}).reverse();
	var sum_maxdepth = 0;
	for (var i = 0; i < d1.length; i++) {
		//get maxlength on each layer;
		var maxdepth = 1;
		visit(d1[i], null, function (n, p) {
			maxdepth = maxdepth < n.depth ? n.depth : maxdepth;
		}); //going recursively
		d1[i].maxdepth = maxdepth - 1;
		sum_maxdepth = sum_maxdepth + d1[i].maxdepth;
	}
	//console.log("sum_maxdepth: "+sum_maxdepth);
	var length = sum_maxdepth * gap + (d1.length - 1) * nodeW;
	//get new positions for 1st level nodes:
	var offset = 0;
	for (var i = 0; i < d1.length; i++) {
		var n = d1[i];
		n.x = n.parent.x - (length / 2) + nodeW * i + offset;
		offset += n.maxdepth * gap;
		//new positions for all their child nodes:
		var y = n.y;
		visit(n, null, function (d, p) {
			d.x = p.x + gap;
			y += nodeH;
			d.y = y;
		});
	}

}
}

function formatDate(date){
	var d = new Date(date);
	return d.toLocaleDateString('de-DE');
}	
