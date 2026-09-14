// ============================================================================
// Stations 2, 3 and 4 live here.
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//   login(body)    -> { accessToken, tokenType: 'Bearer', expiresIn }
//   getCurrentUser(actor) -> { id, email, role }
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

const ALLOWED_REGISTER_FIELDS = ['email', 'password'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function register(body) {
  const input = body ?? {};

  // Allowlist: only email and password may arrive. Everything else is a
  // server-controlled field and is rejected explicitly, never ignored.
  const unexpected = Object.keys(input)
    .filter((field) => !ALLOWED_REGISTER_FIELDS.includes(field));
  if (unexpected.length) {
    throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
      `The field(s) ${unexpected.join(', ')} are controlled by the server.`);
  }

  const { email, password } = input;
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError('contract', 'INVALID_EMAIL', 'A valid email is required.');
  }
  // Normalize BEFORE storing: one canonical form, spaces stripped, lower case.
  const normalizedEmail = email.trim().toLowerCase();

  if (typeof password !== 'string' ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError('contract', 'INVALID_PASSWORD',
      `The password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`);
  }

  const stored = await findByEmail(normalizedEmail);
  if (stored) {
    // Generic on purpose: never confirm that an email is already registered.
    throw new AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
      'The account cannot be created with the supplied information.');
  }

  // Only the derived hash is ever persisted — never what the user typed.
  const passwordHash = await hashPassword(password);

  try {
    const row = await insertUser({ email: normalizedEmail, passwordHash });
    return mapUserRow(row);
  } catch (error) {
    // The UNIQUE constraint is the last line of defense against duplicates
    // (for example two registrations racing for the same email).
    if (error?.code === '23505') {
      throw new AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
        'The account cannot be created with the supplied information.');
    }
    throw error;
  }
}

export async function login(body) {
  const { email, password } = body ?? {};
  const generic = () => new AppError('auth', 'INVALID_CREDENTIALS',
    'Email or password is incorrect.');

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw generic();
  }

  const row = await findByEmail(email.trim().toLowerCase());
  if (!row) throw generic();

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) throw generic();

  const accessToken = await issueToken({ id: row.id, role: row.role });
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: TOKEN_TTL_SECONDS
  };
}

export async function getCurrentUser(actor) {
  const row = await findById(actor.userId);
  if (!row) {
    // The identity the token described no longer exists: re-authenticate.
    throw new AppError('auth', 'INVALID_TOKEN', 'The provided token is invalid.');
  }
  const user = mapUserRow(row);
  // The contract for /auth/me is exactly id, email and role — nothing else.
  return { id: user.id, email: user.email, role: user.role };
}