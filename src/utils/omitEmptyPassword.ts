interface WithOptionalPassword {
  password?: string | null;
  confirmation?: string | null;
}

/**
 * Edit forms leave the password blank to keep the current one. A cleared field is
 * "" and Laravel turns it into null, which `sometimes|string` rejects, so an empty
 * password (and its panel-only confirmation) must not be sent at all.
 */
export const omitEmptyPassword = <T extends WithOptionalPassword>(form: T): T => {
  if (form.password) return form;
  const { password: _password, confirmation: _confirmation, ...rest } = form;
  return rest as T;
};
