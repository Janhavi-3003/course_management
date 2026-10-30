const Certificate = require("../models/Certificate");
const ser = require("../utils/serialize");

async function getMyCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find({ student: req.user.sub })
      .populate("course", "title instructor")
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ certificates: ser(certificates) });
  } catch (error) {
    next(error);
  }
}

async function getCertificateForCourse(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ student: req.user.sub, course: req.params.courseId })
      .populate("course", "title instructor duration")
      .populate("student", "name")
      .lean();
    if (!certificate) return res.status(404).json({ message: "Certificate not found. Complete the course to earn it." });
    res.json({ certificate: ser(certificate) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyCertificates, getCertificateForCourse };
