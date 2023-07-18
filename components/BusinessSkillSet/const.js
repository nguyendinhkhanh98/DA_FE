export const mapColorTag = function(text) {
  switch (text) {
    case "new":
      return "#4dbd74";
    case "working":
      return "#ffc107";
    case "done":
      return "#C3C3C3";
  }
};

export const mapColorScoreTag = function(text) {
  switch (text) {
    case "bad":
      return "#C3C3C3";
    case "medium":
      return "#ffc107";
    case "good":
      return "#4dbd74";
  }
};
