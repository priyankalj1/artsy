const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/async");
const CustomError = require("../errors/custom-error");
const lang = require("../languages");
const { findUserById } = require("../models/auth");
const { getArtistById } = require("../models/artists");
const {
  createBooking,
  getBookingById,
  listBookingsForUser,
  updateBookingStatus,
} = require("../models/bookings");

const createNewBooking = asyncWrapper(async (req, res, next) => {
  const artist = await getArtistById(req.body.artist_id);
  if (!artist) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_ARTIST_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const customer = await findUserById(req.authuser.user_id);

  const booking = await createBooking({
    ...req.body,
    customer_user_id: req.authuser.user_id,
    client_name: customer?.name || req.body.client_name || null,
    amount: req.body.amount ?? artist.price ?? 0,
  });

  const full = await getBookingById(booking.booking_id);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Booking created successfully",
    data: { booking: full },
  });
});

const fetchMyBookings = asyncWrapper(async (req, res) => {
  const role = req.authuser.role || "user";
  const bookings = await listBookingsForUser(
    req.authuser.user_id,
    role,
    req.query.status
  );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Bookings fetched successfully",
    data: { bookings, count: bookings.length },
  });
});

const fetchBookingById = asyncWrapper(async (req, res, next) => {
  const booking = await getBookingById(req.params.id);
  if (!booking) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_BOOKING_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Booking fetched successfully",
    data: { booking },
  });
});

const patchBookingStatus = asyncWrapper(async (req, res, next) => {
  const existing = await getBookingById(req.params.id);
  if (!existing) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_BOOKING_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  await updateBookingStatus(req.params.id, req.body.status);
  const booking = await getBookingById(req.params.id);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Booking status updated",
    data: { booking },
  });
});

module.exports = {
  createNewBooking,
  fetchMyBookings,
  fetchBookingById,
  patchBookingStatus,
};
