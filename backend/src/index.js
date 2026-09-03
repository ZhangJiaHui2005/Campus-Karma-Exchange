import app from "./app.js";
import { startMembershipExpiryJob } from "./jobs/membershipExpiryJob.js";
import { startPaymentExpiryJob } from "./jobs/paymentExpiryJob.js";
import { startPaymentArchiveJob } from "./jobs/paymentArchiveJob.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startMembershipExpiryJob();
  startPaymentExpiryJob();
  startPaymentArchiveJob();
});
