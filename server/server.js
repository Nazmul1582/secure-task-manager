import app from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.PORT, () => {
  console.log(`API server listening on port ${env.PORT}`);
});
