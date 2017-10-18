export const MESSAGE = {
  RTC: {
    BAD_WEBSOCKET_CREATION_CALLBACK: "The websocket creation function you supplied did not return a valid websocket object.",
    ERROR_CREATING_WEBSOCKET: "The callback you supplied for websocket creation threw an error. You might want to call it yourself and debug it to see what's wrong.",
    NO_WESBSOCKET_PRESENT: "The RTC Module seems to be missing a valid websocket object. Did you properly initialize the RTC Module by calling the init method?",
    NOT_OPEN_ERROR: "not opened",
    NOT_OPEN_MESSAGE: "The connection seems to be closed. Did you properly initialize the RTC Module by calling the init method? Or maybe you terminated the RTC Module early?",
  },
  QUERY: {
    MUST_PROVIDE_SORTING_FIELD: "A sorting field must be provided."
  },
  TokenManager: {
    TOKEN_NOT_AVAILABLE: "You need to log in before you can access the token.",
  },
};
