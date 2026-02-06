const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

const models = {};

// Initializer function to inject models
router.initModels = (loadedModels) => {
    Object.assign(models, loadedModels);
};

// Middleware to resolve model
const resolveModel = (req, res, next) => {
    const modelName = req.params.model;
    const Model = models[modelName];
    if (!Model) {
        return res.status(404).json({ error: `Model ${modelName} not found` });
    }
    req.Model = Model;
    next();
};

// ====== ROUTES ======

// GET archived items
router.get('/:model/archived', resolveModel, async (req, res) => {
    try {
        const items = await req.Model.find({ isDeleted: true }).sort({ deletedAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all active items
router.get('/:model', resolveModel, async (req, res) => {
    try {
        const items = await req.Model.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET one
router.get('/:model/:id', resolveModel, async (req, res) => {
    try {
        const item = await req.Model.findOne({ _id: req.params.id, isDeleted: false });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Create
router.post('/:model', resolveModel, async (req, res) => {
    try {
        const newItem = new req.Model(req.body);
        const savedItem = await newItem.save();

        await AuditLog.create({
            entity: req.params.model,
            entityId: savedItem._id,
            action: 'CREATE',
            changes: req.body
        });

        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST Restore
router.post('/:model/:id/restore', resolveModel, async (req, res) => {
    try {
        const item = await req.Model.findByIdAndUpdate(
            req.params.id,
            { isDeleted: false, deletedAt: null },
            { new: true }
        );

        if (!item) return res.status(404).json({ error: 'Item not found' });

        await AuditLog.create({
            entity: req.params.model,
            entityId: item._id,
            action: 'RESTORE',
            changes: { restoredAt: new Date() }
        });

        res.json({ message: 'Item restored', item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Update
router.put('/:model/:id', resolveModel, async (req, res) => {
    try {
        const originalItem = await req.Model.findOne({ _id: req.params.id });
        if (!originalItem) return res.status(404).json({ error: 'Item not found' });

        const updatedItem = await req.Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

        await AuditLog.create({
            entity: req.params.model,
            entityId: updatedItem._id,
            action: 'UPDATE',
            changes: { before: originalItem.toObject(), after: req.body }
        });

        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE Permanent
router.delete('/:model/:id/permanent', resolveModel, async (req, res) => {
    try {
        const item = await req.Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        await AuditLog.create({
            entity: req.params.model,
            entityId: item._id,
            action: 'DELETE',
            changes: { permanentlyDeleted: true }
        });

        res.json({ message: 'Item permanently deleted', id: item._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Soft Delete
router.delete('/:model/:id', resolveModel, async (req, res) => {
    try {
        const item = await req.Model.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!item) return res.status(404).json({ error: 'Item not found' });

        await AuditLog.create({
            entity: req.params.model,
            entityId: item._id,
            action: 'SOFT_DELETE',
            changes: { deletedAt: item.deletedAt }
        });

        res.json({ message: 'Item soft deleted', id: item._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;