import express from "express";
import { productCtrl } from "../controllers/productCtrl.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/products")
  .get(productCtrl.getProducts)
  .post(productCtrl.createProduct);

router
  .route("/products/:id")
  .delete(productCtrl.deleteProduct)
  .put(productCtrl.updateProduct);

export default router;
