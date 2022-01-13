const {
  NO_ERROR,
  INVALID_ENUM,
  INVALID_VALUE,
  INVALID_OPERATION,
  INVALID_FRAMEBUFFER_OPERATION,
  OUT_OF_MEMORY,
  CONTEXT_LOST_WEBGL,
} = WebGL2RenderingContext;

const WEBGL_ERRORS: Record<number, string> = {
  [NO_ERROR]: "No error.",
  [INVALID_ENUM]:
    "An unacceptable value has been specified for an enumerated argument.",
  [INVALID_VALUE]: "A numeric argument is out of range.",
  [INVALID_OPERATION]:
    "The specified command is not allowed for the current state.",
  [INVALID_FRAMEBUFFER_OPERATION]:
    "The currently bound framebuffer is not framebuffer complete when trying to render to or to read from it.",
  [OUT_OF_MEMORY]: "Not enough memory is left to execute the command.",
  [CONTEXT_LOST_WEBGL]: "Not enough memory is left to execute the command.",
};

export const getWebGLErrorString = (errorCode: number): string =>
  WEBGL_ERRORS[errorCode] || "unknown WebGL error.";
