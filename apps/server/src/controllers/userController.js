import { findUsersByUsername } from '../services/userService.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ status: 'success', users: [] });
    }

    const users = await findUsersByUsername(q.trim(), req.user.id);
    res.json({ status: 'success', users });
  } catch (err) {
    next(err);
  }
};
