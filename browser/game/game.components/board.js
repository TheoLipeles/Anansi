var NodeFactory = require("./node");
var fieldOptions = require('../../settings.js').fieldOptions;
var wiggle = require("../../settings.js").wiggle;
"use strict";

function makeField(options) {
    var product = NodeFactory(options);
    return {
        bases: {
            host: product.base1.id,
            client: product.base2.id
        },
        nodes: product.nodes,
        numNodes: product.nodes.length,
        width: options.width,
        height: options.height
    };
}

function withinRange(node1, node2, radii) {
    var dist = Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
    return dist < radii.outer && dist > radii.inner;
}


function connectField(field, radii) {
    var edges = [],
        potentialConnections,
        nodeIndex, nextNodeIndex, currentNode, nextNode,
        edge,
        tryToConnect = function(node) {
            var nodeid = node.id;
            if (currentNode.id === field.bases.host || currentNode.id === field.bases.client || Math.random() < 0.5) {
                edge = {
                    id: Math.random().toString().slice(2),
                    source: currentNode.id,
                    target: nodeid,
                    type: "gameEdge"
                };
                currentNode.links.push(nodeid);
                node.links.push(currentNode.id);
                edges.push(edge);
            }
        };

    for (nodeIndex = 0; nodeIndex < field.numNodes; nodeIndex++) {
        currentNode = field.nodes[nodeIndex];
        potentialConnections = [];
        for (nextNodeIndex = nodeIndex + 1; nextNodeIndex < field.numNodes; nextNodeIndex++) {
            nextNode = field.nodes[nextNodeIndex];
            if (withinRange(currentNode, nextNode, radii)) {
                potentialConnections.push(nextNode);
            }
        }
        potentialConnections.forEach(tryToConnect);
    }

    field.edges = edges;
}

function wiggleNodes(field, factors) {
    factors = factors || 20;
    var nodes = field.nodes,
        xfactor = typeof factors === "object" ? factors.x : factors,
        yfactor = typeof factors === "object" ? factors.y : factors;
    nodes.forEach(function(node) {
        if (node) {
            node.x = node.x + (Math.random() - 0.5) * xfactor;
            node.y = node.y + (Math.random() - 0.5) * yfactor;
        }
    });
}

//Checks if the bases are connected 
function checkField(field) {
    var connected = [field.bases.host],
        nodes = field.nodes,
        nextCheck,
        check = [field.bases.host],
        checkConnected = (linkid) => {
            if (!connected.includes(linkid)) {
                connected.push(linkid);
                check.push(linkid);
            }
        },
        findNode = (node) => nextCheck === node.id,
        links;

    while (check.length !== 0) {
        nextCheck = check.shift();
        links = nodes.find(findNode).links;
        links.forEach(checkConnected);
    }

    //Filter out isolated nodes
    field.nodes = field.nodes.filter((node) => connected.includes(node.id));
    //Filter out the edges that attach isolated nodes
    field.edges = field.edges.filter((edge) => connected.includes(edge.source) && connected.includes(edge.target));
    field.numNodes = field.nodes.length;
    //Check if the two bases are connected
    return connected.includes(field.bases.client) ? field : false;
}

function makeGraph(options, radii) {
    var field = makeField(options);
    connectField(field, radii);
    wiggleNodes(field, wiggle);
    return checkField(field) || makeGraph(options, radii);
}

//Board notes
//withinRange({inner: 15, outer:30-33}) decent setting, stringy, lots of dead ends
//still need clipping of dense nodes


module.exports = {
    generate: function() {
        return makeGraph(fieldOptions, {
            inner: 0,
            outer: (fieldOptions.spacing * 2 + 3)
        });
    }
};