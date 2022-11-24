export const initialBoard = {
  columns: {
    "To do": { id: "To do" },
    "In Progress": { id: "In Progress" },
    Done: { id: "Done" },
  },
  tasks: {
    1: { id: 1, title: "Take out the garbage" },
    2: { id: 2, title: "Watch my favorite show" },
    3: { id: 3, title: "Charge my phone" },
    4: { id: 4, title: "Cook dinner" },
    5: { id: 5, title: "Do the dishes" },
    6: { id: 6, title: "Take a shower" },
    7: { id: 7, title: "Go to bed" },
  },
};

export const initialShape = {
  "To do": [1, 2, 3, 4],
  "In Progress": [5, 6, 7],
  Done: [],
};
