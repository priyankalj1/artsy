const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/async");
const CustomError = require("../errors/custom-error");
const lang = require("../languages");
const { updateUser, findUserById } = require("../models/auth");
const {
  createCustomerProfile,
  getCustomerByUserId,
  updateCustomerProfile,
} = require("../models/users");

const onboardCustomer = asyncWrapper(async (req, res, next) => {
  const userId = req.authuser.user_id;
  const user = await findUserById(userId);

  if (!user) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const payload = {
    name: String(req.body.name || "").trim(),
    interests: req.body.interests,
    location: String(req.body.location || "").trim(),
  };

  let customer = await getCustomerByUserId(userId);
  if (customer) {
    customer = await updateCustomerProfile(userId, payload);
  } else {
    customer = await createCustomerProfile(userId, payload);
  }

  const updatedUser = await updateUser(userId, {
    name: payload.name,
    role: "user",
    is_onboarded: true,
    onboarding_step: "complete",
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Customer onboarded successfully",
    data: {
      user: updatedUser,
      customer,
    },
  });
});

const getMyCustomerProfile = asyncWrapper(async (req, res, next) => {
  const customer = await getCustomerByUserId(req.authuser.user_id);
  if (!customer) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Customer profile fetched",
    data: { customer },
  });
});

module.exports = {
  onboardCustomer,
  getMyCustomerProfile,
};
