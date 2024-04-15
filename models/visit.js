const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
	ipAddress: String,
	page: String,
	visitDate: Date
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;