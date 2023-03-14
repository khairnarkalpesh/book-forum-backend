const express = require("express");
const router = express.Router();
const { isAuthenticatedAdmin, authorizeRoles } = require("../middleware/authAdmin");

const {
  registerAdmin,
  loginAdmin,
  logout,
  forgotPassword,
  resetPassword,
  getAdminDetails,
  updatePassword,
  updateProfile,
  getAllAdmins,
  getSingleAdmin,
  updateAdminRole,
  deleteAdmin,
  addSearch,
  deleteSearchHistory,
  deleteSearchRecord,
  deleteUser,
  updateUserRole,
  getSingleUser,
  getAllUsers
} = require("../controllers/adminController");

router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/password/forgot").post(forgotPassword);
router.route("/admin/password/reset").put(resetPassword);
router.route("/admin/logout").get(logout);
router.route("/admin/me").get(isAuthenticatedAdmin, getAdminDetails);
router.route("/admin/password/update").put(isAuthenticatedAdmin, updatePassword);
router.route("/admin/me/update").put(isAuthenticatedAdmin, updateProfile);
// router.route("/admin/getallAdmins").get(isAuthenticatedAdmin, authorizeRoles("admin"), getAllAdmins);
router
  .route("/admins/")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getAllAdmins);
router
  .route("/admin/:id")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getSingleAdmin)
  .put(isAuthenticatedAdmin, authorizeRoles("admin"), updateAdminRole)

router
  .route("/getAllUsers/")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedAdmin, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedAdmin, authorizeRoles("admin"), deleteUser);

// .delete(isAuthenticatedAdmin, authorizeRoles("admin"), deleteAdmin);

router.route("/admin/search").patch(isAuthenticatedAdmin, addSearch).delete(isAuthenticatedAdmin, deleteSearchHistory);
router.delete('/admin/search/:id', isAuthenticatedAdmin, deleteSearchRecord)
module.exports = router;