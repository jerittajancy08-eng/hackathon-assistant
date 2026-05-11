const Hackathon = require('../models/Hackathon');

async function getAllHackathons(req, res, next) {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const hackathons = await Hackathon.find()
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments();

    return res.status(200).json({
      hackathons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getHackathonById(req, res, next) {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id).populate('registeredUsers', 'name email');

    if (!hackathon) {
      return res.status(404).json({ error: 'Not found', message: 'Hackathon not found.' });
    }

    return res.status(200).json({ hackathon });
  } catch (error) {
    next(error);
  }
}

async function searchHackathons(req, res, next) {
  try {
    const { query = '', domain, isOnline, beginnerFriendly, page = 1, limit = 12 } = req.query;
    const filters = {};

    // Text search by title, description, or tags
    if (query.trim()) {
      filters.$text = { $search: query };
    }

    // Filter by domain
    if (domain && domain !== 'all') {
      filters.domain = domain;
    }

    // Filter by online/offline
    if (isOnline !== undefined && isOnline !== 'all') {
      filters.isOnline = isOnline === 'true';
    }

    // Filter by beginner friendly
    if (beginnerFriendly !== undefined && beginnerFriendly !== 'all') {
      filters.beginnerFriendly = beginnerFriendly === 'true';
    }

    const skip = (page - 1) * limit;

    const hackathons = await Hackathon.find(filters)
      .sort(query.trim() ? { score: { $meta: 'textScore' } } : { startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments(filters);

    return res.status(200).json({
      hackathons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createHackathon(req, res, next) {
  try {
    const { title, description, domain, tags, teamSize, experienceLevel, isOnline, beginnerFriendly, location, startDate, endDate, url } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing fields', message: 'Title and description are required.' });
    }

    const hackathon = await Hackathon.create({
      title,
      description,
      domain,
      tags,
      teamSize,
      experienceLevel,
      isOnline,
      beginnerFriendly,
      location,
      startDate,
      endDate,
      url,
    });

    return res.status(201).json({ hackathon });
  } catch (error) {
    next(error);
  }
}

async function updateHackathon(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const hackathon = await Hackathon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!hackathon) {
      return res.status(404).json({ error: 'Not found', message: 'Hackathon not found.' });
    }

    return res.status(200).json({ hackathon });
  } catch (error) {
    next(error);
  }
}

async function deleteHackathon(req, res, next) {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findByIdAndDelete(id);

    if (!hackathon) {
      return res.status(404).json({ error: 'Not found', message: 'Hackathon not found.' });
    }

    return res.status(200).json({ message: 'Hackathon deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getFilterOptions(req, res, next) {
  try {
    const domains = await Hackathon.distinct('domain');
    const experienceLevels = await Hackathon.distinct('experienceLevel');

    return res.status(200).json({
      domains: domains.sort(),
      experienceLevels,
      locationTypes: ['Online', 'Offline', 'Hybrid'],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllHackathons, getHackathonById, searchHackathons, createHackathon, updateHackathon, deleteHackathon, getFilterOptions };
