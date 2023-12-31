import Food from "../models/schemas/food.model";
import User from "../models/schemas/user.model";
import { initializeApp } from "firebase/app";
import config from "../../firebase.config";
const fs = require('fs');

import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { Order } from "../models/schemas/order.model";
import convertJsonToExcel from "../services/exportFIle";

initializeApp(config.firebaseConfig);
const storage = getStorage();

class AdminController {
  static async showAdminPage(req: any, res: any) {
    res.redirect("/admin/food");
  }

  static async showUserList(req: any, res: any) {
    const users = await User.find();
    if (users) {
      res.render("adminViews/adminUserList", { data: users });
    } else {
      res.redirect("/404");
    }
  }

  static async showUserEdit(req: any, res: any) {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      res.render("adminViews/adminUserEdit", { data: user });
    } else {
      res.redirect("/404");
    }
  }

  static async updateUser(req: any, res: any) {
    try {
      const user = await User.findOne({ _id: req.params.id }).catch((err) => {
        console.log(err);
        res.redirect("/404");
      });
      if (user) {
        user.name = req.body.signinname;
        user.fullName = req.body.username;
        user.password = req.body.password;
        user.className = req.body.userclass;
        await user.save();
        res.redirect("/admin/user");
      } else {
        res.redirect("/404");
      }
    } catch (err) {
      res.redirect("/404");
      console.log(err.message);
    }
  }

  static async deleteUser(req: any, res: any) {
    const user = User.findOne({ _id: req.params.id });
    if (user) {
      await User.findByIdAndDelete({ _id: req.params.id });
      res.redirect("/admin/user");
    } else {
      res.redirect("/admin/user");
    }
  }

  static async showCreateUser(req: any, res: any) {
    res.render("adminViews/adminCreateUser", { alert: null });
  }

  static async createUser(req: any, res: any) {
    try {
      const user = await User.findOne({ name: req.body.signinname });
      if (user) {
        const alert = `Đã tồn tại người dùng với tên ${user.name} vui lòng chọn tên đăng nhập khác!`;
        res.render("adminViews/adminCreateUser", { alert: alert });
      } else {
        const newUser = new User({
          name: req.body.signinname,
          fullName: req.body.username,
          password: req.body.password,
          className: req.body.userclass,
        });
        await newUser.save();
        res.redirect("/admin");
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  static async getCreatePage(req: any, res: any) {
    try {
      res.render("adminViews/adminCreateFood");
    } catch (err) {
      console.log(err.message);
    }
  }

  static async createFood(req: any, res: any) {
    try {
      const storageRef = ref(storage, `files/${req.file.originalname}`);
      const metadata = { contentType: req.file.mimetype };
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      const downloadURL = await getDownloadURL(snapshot.ref);
      // LẤY ĐƯỢC ẢNH FIREBASE
      const food = new Food({
        name: req.body.name,
        type: req.body.type,
        des: req.body.des,
        imageUrl: downloadURL,
      });
      await food.save();
      res.redirect("/admin/food");
    } catch (err) {
      console.log(err.message);
    }
  }

  static async showFoodList(req: any, res: any) {
    const foods = await Food.find();
    const foodStatus = await Food.find({ status: true });
    let limit = 10;
    const totalPages = Math.ceil(foods.length / limit);
    let check;
    if (foodStatus.length === 0) {
      check = false;
    } else {
      check = true;
    }

    const data = await Food.find().limit(10);

    res.render("adminViews/adminFoodList", {
      data: data,
      check: check,
      pages: totalPages,
    });
  }

  static async pagination(req: any, res: any) {
    const pageId = req.params.id;
    let limit = 10;
    const skip = (pageId - 1) * limit;
    const foods = await Food.find().limit(limit).skip(skip);
    return res.json(foods);
  }

  static async showUpdateFood(req: any, res: any) {
    const foodId = req.params.id;
    const food = await Food.findOne({ _id: foodId });
    if (food) {
      res.render("adminViews/adminFoodUpdate", { data: food });
    } else {
      res.render("404");
    }
  }

  static async updateFood(req: any, res: any) {
    if (req.file) {
      const storageRef = ref(storage, `files/${req.file.originalname}`);
      const metadata = { contentType: req.file.mimetype };
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      const downloadURL = await getDownloadURL(snapshot.ref);
      const foodId = req.params.id;
      const food = await Food.findOne({ _id: foodId });
      food.imageUrl = downloadURL;
      food.name = req.body.name;
      food.type = req.body.type;
      food.des = req.body.des;
      await food.save();
    } else {
      const foodId = req.params.id;
      const food = await Food.findOne({ _id: foodId });
      food.name = req.body.name;
      food.type = req.body.type;
      food.des = req.body.des;
      await food.save();
    }
    res.redirect("/admin/food");
  }

  static async deleteFood(req: any, res: any) {
    const food = await Food.findByIdAndDelete({ _id: req.params.id });
    if (food) {
      res.redirect("/admin/food");
    } else {
      res.render("404");
    }
  }

  static async updateStatus(req: any, res: any) {
    const food = await Food.findOne({ _id: req.body.id });
    await food.updateOne({ $set: { status: req.body.state } });
  }

  static async closeOrder(req: any, res: any) {
    const food = await Food.find();
    if (food) {
      await Food.updateMany({}, { $set: { status: req.body.state } });
      // await Order.updateMany({createAt: { $gte: startOfDay, $lte: endOfDay }}, { $set: { status: "done" } });
      res.redirect("/admin/food");
    } else {
      res.render("404");
    }
  }

  static async showListOrder(req: any, res: any) {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );
      // const orders = await Order.find({createAt: { $gte: startOfDay, $lte: endOfDay }, status: "success"}).populate('User');
      const orders = await Order.find({
        createAt: { $gte: startOfDay, $lte: endOfDay },
        status: "success",
      })
        .populate("userID")
        .populate("foods.food");

      res.render("adminViews/adminOrdersList", { data: orders });
    } catch (err) {
      console.log(err.message);
    }
  }

  static async exportFile(req: any, res: any){
    await convertJsonToExcel(req,res)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "demo.xlsx");
    await res.download('./exportExcel.xlsx');
  }
}

export default AdminController;
