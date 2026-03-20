var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
let inventorySchema = require("../schemas/inventories");
let productSchema = require("../schemas/products");

async function getInventoryByProductId(productId) {
  return await inventorySchema.findOne({ product: productId }).populate({
    path: "product",
    populate: {
      path: "category",
      select: "name images",
    },
  });
}

function parseQuantity(quantity) {
  return Number(quantity);
}

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

router.get("/", async function (req, res, next) {
  let data = await inventorySchema.find({}).populate({
    path: "product",
    populate: {
      path: "category",
      select: "name images",
    },
  });
  let result = data.filter(function (e) {
    return e.product && !e.product.isDeleted;
  });
  res.send(result);
});

router.get("/:id", async function (req, res, next) {
  try {
    let result = await inventorySchema.findById(req.params.id).populate({
      path: "product",
      populate: {
        path: "category",
        select: "name images",
      },
    });

    if (!result || !result.product || result.product.isDeleted) {
      return res.status(404).send({
        message: "INVENTORY NOT FOUND",
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(404).send({
      message: "INVENTORY NOT FOUND",
    });
  }
});

router.post("/add-stock", async function (req, res, next) {
  try {
    let productId = req.body.product;
    let quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId) || !isPositiveNumber(quantity)) {
      return res.status(400).send({
        message: "PRODUCT OR QUANTITY IS INVALID",
      });
    }

    let product = await productSchema.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).send({
        message: "PRODUCT NOT FOUND",
      });
    }

    let inventory = await getInventoryByProductId(productId);
    if (!inventory) {
      return res.status(404).send({
        message: "INVENTORY NOT FOUND",
      });
    }

    inventory.stock += quantity;
    await inventory.save();
    await inventory.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name images",
      },
    });

    res.status(200).send(inventory);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

router.post("/remove-stock", async function (req, res, next) {
  try {
    let productId = req.body.product;
    let quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId) || !isPositiveNumber(quantity)) {
      return res.status(400).send({
        message: "PRODUCT OR QUANTITY IS INVALID",
      });
    }

    let product = await productSchema.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).send({
        message: "PRODUCT NOT FOUND",
      });
    }

    let inventory = await getInventoryByProductId(productId);
    if (!inventory) {
      return res.status(404).send({
        message: "INVENTORY NOT FOUND",
      });
    }

    if (inventory.stock < quantity) {
      return res.status(400).send({
        message: "STOCK IS NOT ENOUGH",
      });
    }

    inventory.stock -= quantity;
    await inventory.save();
    await inventory.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name images",
      },
    });

    res.status(200).send(inventory);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

router.post("/reservation", async function (req, res, next) {
  try {
    let productId = req.body.product;
    let quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId) || !isPositiveNumber(quantity)) {
      return res.status(400).send({
        message: "PRODUCT OR QUANTITY IS INVALID",
      });
    }

    let product = await productSchema.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).send({
        message: "PRODUCT NOT FOUND",
      });
    }

    let inventory = await getInventoryByProductId(productId);
    if (!inventory) {
      return res.status(404).send({
        message: "INVENTORY NOT FOUND",
      });
    }

    if (inventory.stock < quantity) {
      return res.status(400).send({
        message: "STOCK IS NOT ENOUGH",
      });
    }

    inventory.stock -= quantity;
    inventory.reserved += quantity;
    await inventory.save();
    await inventory.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name images",
      },
    });

    res.status(200).send(inventory);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

router.post("/sold", async function (req, res, next) {
  try {
    let productId = req.body.product;
    let quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId) || !isPositiveNumber(quantity)) {
      return res.status(400).send({
        message: "PRODUCT OR QUANTITY IS INVALID",
      });
    }

    let product = await productSchema.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).send({
        message: "PRODUCT NOT FOUND",
      });
    }

    let inventory = await getInventoryByProductId(productId);
    if (!inventory) {
      return res.status(404).send({
        message: "INVENTORY NOT FOUND",
      });
    }

    if (inventory.reserved < quantity) {
      return res.status(400).send({
        message: "RESERVED IS NOT ENOUGH",
      });
    }

    inventory.reserved -= quantity;
    inventory.soldCount += quantity;
    await inventory.save();
    await inventory.populate({
      path: "product",
      populate: {
        path: "category",
        select: "name images",
      },
    });

    res.status(200).send(inventory);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

module.exports = router;
