const KpiEdge = require("../schmas/kpiEdge");
const KpiNode = require("../schmas/kpiNode");
const {isNullOrEmpty} = require("../utils");

// TODO: createGraph for creating a new canvas of nodes and edges.

exports.upsertNodes = async (req, res) => {
    try {
        const newKpiNode = new KpiNode(req.body);
        const savedKpiNode = await newKpiNode.save();
        res.status(201).json(savedKpiNode);
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
};

exports.upsertEdges = async (req, res) => {
    try {
        const newKpiEdge = new KpiEdge(req.body);
        const savedKpiEdge = await newKpiEdge.save();
        res.status(201).json(savedKpiEdge);
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
};

/**
 * get groupId as QueryString and return nodes and edges of the group.
 * @param req groupId as QueryString
 * @param res json to have "nodes", "edges" body.
 * @returns {Promise<void>}
 */
exports.getNodeAndEdge = async (req, res) => {
    const groupId = req.query.id;

    try {
        // get all records of KpiNodes of nodeId and KpiElement item should be populated by its elementId.
        const kpiNodes = await KpiNode.find({groupId: groupId}).populate('data.elementId').exec();
        const kpiEdges = await KpiEdge.find({groupId: groupId}).exec();

        res.json({
            nodes: kpiNodes,
            edges: kpiEdges,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getNodeById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId))
        res.status(400).json({error: "invalid id"});

    // Find the resource with the matching ID
    const resource = await KpiNode.findById(resourceId);

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({error: "Resource not found"});
    } else {
        // Return the resource as the response
        res.json(resource);
    }
};
