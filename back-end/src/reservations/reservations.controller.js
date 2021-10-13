const service = require("./reservations.service");
/**
 * List handler for reservation resources
 */
async function list(req, res) {
  res.json({
    data: [],
  });
}

async function create(req, res) {
  const reservation = {first_name, last_name, mobile_number, reservation_date, reservation_time, people}=  req.body.data;
  const data = await service.create(reservation)
  res.json({ data });
}

module.exports = {
  list,
  create,
};
