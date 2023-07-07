"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
userRouter.get("/login", user_controller_1.default.showLoginForm);
userRouter.post("/login", user_controller_1.default.getUserInfo);
userRouter.get('/user', user_controller_1.default.showUserPage);
userRouter.get('/cart', user_controller_1.default.showCart);
exports.default = userRouter;
//# sourceMappingURL=user.router.js.map