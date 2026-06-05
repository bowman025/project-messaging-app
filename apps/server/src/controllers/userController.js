import { findUsersByUsername, updateUser } from '../services/userService.js';
import { updateProfileSchema } from '@project-messaging-app/zod-schemas/user';
import { AppError } from '../utils/AppError.js';
import cloudinary from '../config/cloudinary.js';
import { extractPublicId } from '../utils/cloudinaryUtils.js';

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

export const getProfile = (req, res) => {
  const { _passwordHash, ...user } = req.user;
  res.json({ status: 'success', user });
};

export const patchProfile = async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const { username, avatarUrl, bio } = parsed.data;

    if (username && username !== req.user.username) {
      const existing = await findUsersByUsername(username, req.user.id);
      const exact = existing.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (exact) throw new AppError('Username already taken', 409);
    }

    if (avatarUrl && req.user.avatarUrl && avatarUrl !== req.user.avatarUrl) {
      const publicId = extractPublicId(req.user.avatarUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (_err) {
          console.error('Failed to delete old avatar from Cloudinary:', publicId);
        }
      }
    }

    const user = await updateUser(req.user.id, {
      ...(username && { username }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bio !== undefined && { bio }),
    });

    const { passwordHash: _passwordHash, ...rest } = user;
    res.json({ status: 'success', user: rest });
  } catch (err) {
    next(err);
  }
};
