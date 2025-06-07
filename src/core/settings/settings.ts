export const SETTINGS = {
  PORT: process.env.PORT || 5003,
  MONGO_URL:
    process.env.MONGO_URL ||
    'mongodb+srv://ivandolgikh1199:7T0SLzA3h9MoJ38p@cluster0.rmvfr1r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  DB_NAME: process.env.DB_NAME || 'ed-back-blog-platform',
};
