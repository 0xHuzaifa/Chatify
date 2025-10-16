import ApiError from "../../utils/ApiError";

const validateGroupName = (name) => {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "Group name must be a non-empty string");
  }
  const trimmedName = name.trim();
  if (!/^[a-zA-Z0-9]/.test(trimmedName)) {
    throw new ApiError(400, "Group name must start with a letter or number");
  }
  return trimmedName;
};

export default validateGroupName;
