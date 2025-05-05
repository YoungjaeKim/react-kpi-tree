const KpiEdge = require("../schmas/kpiEdge");
const KpiNode = require("../schmas/kpiNode");
const KpiGroup = require("../schmas/kpiGroup");
const KpiElement = require("../schmas/kpiElement");
const {isNullOrEmpty} = require("../utils");

exports.createGroup = async (req, res) => {
    try {
        const newKpiGroup = new KpiGroup(req.body);
        const savedKpiGroup = await newKpiGroup.save();
        res.status(201).json(savedKpiGroup);
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
}

exports.upsertNode = async (req, res) => {
    // check elementId is empty
    if (isNullOrEmpty(req.body.elementId)) {
        // create Element first
        const newKpiElement = new KpiElement({
            kpiValue: req.body.elementValue,
            kpiValueType: req.body.elementValueType,
            isActive: req.body.elementIsActive,
            expression: req.body.elementExpression,
            lastUpdatedDateTime: Date.now()
        });
        const savedKpiElement = await newKpiElement.save();
        req.body.elementId = savedKpiElement._id;
    }
    try {
        const newKpiNode = new KpiNode({
            position: req.body.position,
            groupId: req.body.groupId,
            title: req.body.title,
            description: req.body.description,
            label: req.body.label,
            elementId: req.body.elementId
        });
        const savedKpiNode = await newKpiNode.save();
        res.status(201).json({...savedKpiNode.toObject(), id: savedKpiNode._id, _id: undefined}); // change _id to id.
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
};

exports.upsertEdge = async (req, res) => {
    console.error("upsertEdge called")
    if (isNullOrEmpty(req.body.id)) {
        try {
            const newKpiEdge = new KpiEdge(req.body);
            const savedKpiEdge = await newKpiEdge.save();
            res.status(201).json(savedKpiEdge);
        } catch (err) {
            console.error('Failed to save document:', err);
            res.status(500).send('Failed to save document');
        }
    } else {
        // update record and return 200
        const kpiEdge = await KpiEdge.findById(req.body.id);
        if (!kpiEdge) {
            res.status(404).json({error: "Resource not found"});
            return;
        }
        kpiEdge.source = req.body.source;
        kpiEdge.target = req.body.target;
        kpiEdge.groupId = req.body.groupId;
        kpiEdge.save();
        res.status(200).json(kpiEdge);
    }

};

/**
 * get groupId as QueryString and return nodes and edges of the group.
 * @param req groupId as QueryString
 * @param res json to have "nodes", "edges" body.
 * @returns {Promise<void>}
 */
exports.getNodeAndEdge = async (req, res) => {
    const groupId = req.query.groupId;

    if (isNullOrEmpty(groupId)) {
        res.status(404).json({error: "groupId is required"});
        return;
    }

    try {
        // get KpiNodes by groupId and populate KpiElement by elementId.
        const kpiNodes = await KpiNode.find({groupId: groupId}).populate('elementId').exec();
        const kpiEdges = await KpiEdge.find({groupId: groupId}).exec();

        res.json({
            nodes: kpiNodes.map((node) => {
                const nodeObject = node.toObject();
                nodeObject.id = nodeObject._id;
                delete nodeObject._id;
                return nodeObject;
            }),
            edges: kpiEdges.map((edge) => {
                const edgeObject = edge.toObject();
                edgeObject.id = edgeObject._id;
                delete edgeObject._id;
                return edgeObject;
            }),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error at getNodeAndEdge'});
    }
};

exports.getNodeById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId))
        res.status(400).json({error: "invalid id"});

    // Find the resource with the matching ID
    const resource = await KpiNode.findById(resourceId).populate('elementId');

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({error: "Resource not found"});
    } else {
        // Return the resource as the response
        res.json(resource);
    }
};
