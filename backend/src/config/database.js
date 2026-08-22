export const development = {
  url: process.env.DATABASE_URL || 'postgres://localhost:5432/campus_karma',
};

export const production = {
  url: process.env.DATABASE_URL,
};
