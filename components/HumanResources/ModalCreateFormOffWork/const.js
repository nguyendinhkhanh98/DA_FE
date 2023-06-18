const DEFAULT_REQUIRED = "Field is required";

const validateNonValue = (rule, value, callback) => {
  if (value) return callback();
  else return callback(new Error(DEFAULT_REQUIRED));
};

export const rules = {
  manager: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
  reason: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
  session_in_day: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
  time_to_office_late: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
  time_leave_office_early: [
    { validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }
  ],
  time_work_compensate: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
  request_type: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }]
};

export const optionsRequestType = [
  { key: "off_work", value: "Off work" },
  { key: "go_to_office_late", value: "Go to office late" },
  { key: "leave_office_early", value: "Leave office early" },
  { key: "forgot_to_scan_finger", value: "Forgot to scan finger" },
  { key: "working_outside_office", value: "Working outside office" }
];

export const sessionInDay = ["morning", "afternoon", "all_day"];
