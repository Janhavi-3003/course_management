const Activity = require("../models/Activity");
const ser = require("../utils/serialize");
const { ymd } = require("../utils/dates");

async function getMyActivity(req, res, next) {
  try {
    const days = Math.min(90, Math.max(1, Number.parseInt(req.query.days, 10) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await Activity.find({ student: req.user.sub, date: { $gte: ymd(since) } })
      .select("date hours")
      .sort({ date: 1 })
      .lean();
    res.json({ activity: ser(rows).map(({ date, hours }) => ({ date, hours })) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyActivity };
