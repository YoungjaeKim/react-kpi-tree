const KpiEdge = require("../schmas/kpiEdge");
const KpiNode = require("../schmas/kpiNode");
const KpiGroup = require("../schmas/kpiGroup");
const KpiElement = require("../schmas/kpiElement");
const { isNullOrEmpty } = require("../utils");

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
    if (isNullOrEmpty(req.body.id)) { // create
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
                elementId: req.body.elementId,
                hidden: req.body.hidden
            });
            const savedKpiNode = await newKpiNode.save();
            // Populate the elementId before sending response
            const populatedNode = await KpiNode.findById(savedKpiNode._id).populate('elementId');
            res.status(201).json({ ...populatedNode.toObject(), id: populatedNode._id, _id: undefined }); // change _id to id.
        } catch (err) {
            console.error('Failed to save document:', err);
            res.status(500).send('Failed to save document');
        }
    } else { // update
        try {
            const kpiNode = await KpiNode.findById(req.body.id);
            if (!kpiNode) {
                res.status(404).json({ error: `Node resource id '${req.body.id}' not found` });
                return;
            }
            kpiNode.position = req.body.position !== undefined ? req.body.position : kpiNode.position;
            kpiNode.groupId = req.body.groupId || kpiNode.groupId;
            kpiNode.title = req.body.title || kpiNode.title;
            kpiNode.description = req.body.description || kpiNode.description;
            kpiNode.label = req.body.label !== undefined ? req.body.label : kpiNode.label;
            kpiNode.elementId = req.body.elementId || kpiNode.elementId;
            kpiNode.hidden = req.body.hidden !== undefined ? req.body.hidden : kpiNode.hidden;

            const savedKpiNode = await kpiNode.save();
            // Populate the elementId before sending response
            const populatedNode = await KpiNode.findById(savedKpiNode._id).populate('elementId');
            res.status(200).json({ ...populatedNode.toObject(), id: populatedNode._id, _id: undefined });
        } catch (err) {
            console.error('Failed to update document:', err);
            res.status(500).send('Failed to update document');
        }
    }
};

exports.upsertEdge = async (req, res) => {
    if (isNullOrEmpty(req.body.id)) {
        try {
            const newKpiEdge = new KpiEdge(req.body);
            const savedKpiEdge = await newKpiEdge.save();
            res.status(201).json(savedKpiEdge);
        } catch (err) {
            console.error('Failed to save document:', err);
            res.status(500).send('Failed to save Edge document');
        }
    } else {
        // update record and return 200
        const kpiEdge = await KpiEdge.findById(req.body.id);
        if (!kpiEdge) {
            res.status(404).json({ error: `Edge resource id '${req.body.id}' not found` });
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
        res.status(404).json({ error: "groupId is required" });
        return;
    }

    try {
        // get KpiNodes by groupId and populate KpiElement by elementId.
        const kpiNodes = await KpiNode.find({ groupId: groupId }).populate('elementId').exec();
        const kpiEdges = await KpiEdge.find({ groupId: groupId }).exec();

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
        res.status(500).json({ error: 'Server error at getNodeAndEdge' });
    }
};

exports.getNodeById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId))
        res.status(400).json({ error: "invalid id" });

    // Find the resource with the matching ID
    const resource = await KpiNode.findById(resourceId).populate('elementId');

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({ error: "Resource not found" });
    } else {
        // Return the resource as the response
        res.json(resource);
    }
};

exports.getNodes = async (req, res) => {
    const groupId = req.query.groupId;
    const hidden = req.query.hidden;

    if (isNullOrEmpty(groupId)) {
        res.status(404).json({ error: "groupId is required" });
        return;
    }

    try {
        // Build the query object
        const query = { groupId: groupId };
        if (hidden !== undefined) {
            query.hidden = hidden.toLowerCase() === 'true';
        }

        // Find KpiNodes based on the query and populate KpiElement by elementId
        const kpiNodes = await KpiNode.find(query).populate('elementId').exec();

        res.json({
            nodes: kpiNodes.map((node) => {
                const nodeObject = node.toObject();
                nodeObject.id = nodeObject._id;
                delete nodeObject._id;
                return nodeObject;
            }),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error at getNodes' });
    }
};

exports.deleteEdge = async (req, res) => {
    const edgeId = req.params.id;
    
    if (isNullOrEmpty(edgeId)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    try {
        const deletedEdge = await KpiEdge.findByIdAndDelete(edgeId);
        if (!deletedEdge) {
            res.status(404).json({ error: "Edge not found" });
            return;
        }
        res.status(200).json({ message: "Edge deleted successfully" });
    } catch (err) {
        console.error('Failed to delete edge:', err);
        res.status(500).json({ error: 'Server error at deleteEdge' });
    }
};

