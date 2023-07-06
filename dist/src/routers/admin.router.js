"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const app_1 = require("firebase/app");
const firebase_config_1 = __importDefault(require("../../firebase.config"));
const storage_1 = require("firebase/storage");
(0, app_1.initializeApp)(firebase_config_1.default.firebaseConfig);
const storage = (0, storage_1.getStorage)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
const adminRouter = (0, express_1.Router)();
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
adminRouter.get("/admin", admin_controller_1.default.showAdminPage);
adminRouter.get("/admin/user/create", admin_controller_1.default.showCreateUser);
adminRouter.get("/admin/create", admin_controller_1.default.getCreatePage);
adminRouter.post("/admin/create", upload.single("picture"), admin_controller_1.default.createFood);
adminRouter.get("/admin/food", admin_controller_1.default.showFoodList);
adminRouter.get("/admin/food/edit/:id", admin_controller_1.default.showUpdateFood);
adminRouter.post("/admin/food/edit/:id", upload.single("picture"), admin_controller_1.default.updateFood);
exports.default = adminRouter;
//# sourceMappingURL=admin.router.js.map