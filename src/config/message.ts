// tslint:disable:max-line-length
export const MESSAGE = {
  CORE: {
    BACKEND_ERROR: "There was an error on the back-end as a result of your request:",
  },
  QUERY: {
    MUST_PROVIDE_SORTING_FIELD: "A sorting field must be provided.",
  },
  RTC: {
    BAD_MESSAGE: "The message obtained from server can't be parsed",
    BAD_EVENT_SUBSCRIPTION_TYPE: "One or more of the given event subscription types are invalid",
    BAD_WEBSOCKET_CREATION_CALLBACK: "The websocket creation function you supplied did not return a valid websocket object.",
    CONNECTION_CLOSED: "The connection to the Jexia real-time service was closed. Message code:",
    CONNECTION_FAILED: "We could not establish a connection to the Jexia real-time service. We'll try again in 10 seconds",
    ERROR_CREATING_WEBSOCKET: "The callback you supplied for websocket creation threw an error. You might want to call it yourself and debug it to see what's wrong.",
    EXCEPTION_IN_CLIENT_CALLBACK: "There was an exception thrown in the callback you defined for real-time messages. The original error is: ",
    NOT_OPEN_ERROR: "not opened",
    NOT_OPEN_MESSAGE: "The connection seems to be closed. Did you properly initialize the RTC Module by calling the init method? Or maybe you terminated the RTC Module early?",
    NO_WESBSOCKET_PRESENT: "The RTC Module seems to be missing a valid websocket object. Did you properly initialize the RTC Module by calling the init method?",
    UMS_ERROR: "You did set the 'key' & 'secret' via jexiaClient().init() while you are using ums. In this case you can omit those keys.",
  },
  TOKEN_MANAGER: {
    TOKEN_NOT_AVAILABLE: "You need to log in before you can access the token.",
    ALIAS_NOT_FOUND: "No tokens found for this alias or DEFAULT alias.",
  },
  FILESET: {
    UPLOADING_FILE_ERROR: "Couldn't upload a file: ",
  },
};
