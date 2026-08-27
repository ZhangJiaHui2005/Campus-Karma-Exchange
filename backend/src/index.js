import app from './app.js';
import { startMembershipExpiryJob } from './jobs/membershipExpiryJob.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startMembershipExpiryJob();
});
